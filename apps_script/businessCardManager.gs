/**
 * 명함 관리 대장 - 구글 시트 바인딩 Apps Script
 *
 * 기능:
 *  1. 커스텀 메뉴 (onOpen)
 *  2. 명함 스캔(Gemini OCR) + 시트 기록 + 이메일 자동 발송
 *  3. Gemini REST API 직접 호출로 명함 정보 추출
 *  4. 인사 메일 HTML 발송
 *  5. 선택 행 / 미발송 일괄 메일 발송
 *  6. 5분 주기 자동 스캔 트리거 등록/해제
 */

// ============================================================
// 설정값
// ============================================================
// ⚠️ Gemini API 키는 코드에 하드코딩하지 않고 스크립트 속성에 저장합니다.
//   Apps Script 편집기 → 프로젝트 설정 → 스크립트 속성에서
//   'GEMINI_API_KEY' 라는 키에 발급받은 API 키 값을 저장하세요.
//   (또는 아래 setGeminiApiKey_() 함수를 한 번 실행)
var CONFIG = {
  IMAGE_FOLDER_ID: '19E1231pNHNDaflHFo8-TfY_6Z-aVyFBo',
  PROCESSED_FOLDER_NAME: '명함_처리완료',
  GEMINI_MODEL: 'gemini-2.5-flash',
  SHEET_NAME: '명함 목록',
  SENDER_NAME: '마중물',
  TRIGGER_FUNCTION: 'scanAndProcessCards',
  TRIGGER_INTERVAL_MINUTES: 5
};

function getGeminiApiKey_() {
  var key = PropertiesService.getScriptProperties().getProperty('GEMINI_API_KEY');
  if (!key) {
    throw new Error(
      'Gemini API 키가 설정되지 않았습니다. ' +
      '스크립트 속성에 GEMINI_API_KEY 를 등록하세요.'
    );
  }
  return key;
}

/**
 * 최초 1회만 실행: Apps Script 편집기에서 아래 값을 본인 API 키로
 * 수정한 뒤 이 함수를 수동 실행하면 스크립트 속성에 저장됩니다.
 */
function setGeminiApiKey_() {
  var MY_KEY = 'PUT-YOUR-GEMINI-API-KEY-HERE';
  PropertiesService.getScriptProperties()
    .setProperty('GEMINI_API_KEY', MY_KEY);
}

// 열 인덱스(1-based)
var COL = {
  NO: 1,          // A
  NAME: 2,        // B
  COMPANY: 3,     // C
  POSITION: 4,    // D
  DEPARTMENT: 5,  // E
  EMAIL: 6,       // F
  MOBILE: 7,      // G
  PHONE: 8,       // H
  FAX: 9,         // I
  ADDRESS: 10,    // J
  WEBSITE: 11,    // K
  MEMO: 12,       // L
  IMAGE: 13,      // M
  REG_DATE: 14,   // N
  MAIL_SENT: 15   // O
};

// ============================================================
// 1. 커스텀 메뉴
// ============================================================
function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('📇 명함 관리')
    .addItem('🔍 지금 스캔 실행', 'scanAndProcessCards')
    .addSeparator()
    .addItem('📧 선택 행 메일 발송', 'sendMailForSelectedRow')
    .addItem('📧 미발송 건 일괄 발송', 'sendMailForAllUnsent')
    .addSeparator()
    .addItem('⏰ 자동 스캔 트리거 등록', 'registerAutoScanTrigger')
    .addItem('⏰ 자동 스캔 트리거 해제', 'unregisterAutoScanTrigger')
    .addSeparator()
    .addItem('🔌 Gemini API 연결 테스트', 'testGeminiConnection')
    .addItem('📊 상태 확인', 'showStatus')
    .addToUi();
}

// ============================================================
// 2. 메인 스캔 함수
// ============================================================
function scanAndProcessCards() {
  var sheet = getSheet_();
  var imageFolder = DriveApp.getFolderById(CONFIG.IMAGE_FOLDER_ID);
  var processedFolder = getOrCreateProcessedFolder_(imageFolder);

  var files = imageFolder.getFiles();
  var processedCount = 0;
  var failedCount = 0;

  while (files.hasNext()) {
    var file = files.next();
    var mimeType = file.getMimeType();

    if (!mimeType || mimeType.indexOf('image/') !== 0) {
      continue;
    }

    try {
      var info = extractCardInfo_(file);
      var rowIndex = appendCardRow_(sheet, info, file);

      if (info.email) {
        try {
          sendGreetingEmail_(info);
          sheet.getRange(rowIndex, COL.MAIL_SENT).setValue('O');
        } catch (mailErr) {
          Logger.log('메일 발송 실패(' + info.email + '): ' + mailErr);
        }
      }

      file.moveTo(processedFolder);
      processedCount++;
    } catch (e) {
      Logger.log('처리 실패(' + file.getName() + '): ' + e);
      failedCount++;
    }
  }

  SpreadsheetApp.flush();
  Logger.log('스캔 완료 - 성공: ' + processedCount + ', 실패: ' + failedCount);
}

function appendCardRow_(sheet, info, file) {
  var lastRow = sheet.getLastRow();
  var nextNo = Math.max(lastRow - 1 + 1, 1); // 헤더 제외 번호
  var newRow = lastRow + 1;

  var imageLink = '=HYPERLINK("' + file.getUrl() + '","🖼️ 보기")';
  var now = new Date();
  var regDate = Utilities.formatDate(
    now, Session.getScriptTimeZone(), 'yyyy-MM-dd HH:mm:ss'
  );

  var rowValues = [
    nextNo,
    info.name || '',
    info.company || '',
    info.position || '',
    info.department || '',
    info.email || '',
    info.mobile || '',
    info.phone || '',
    info.fax || '',
    info.address || '',
    info.website || '',
    info.memo || '',
    imageLink,
    regDate,
    ''
  ];

  sheet.getRange(newRow, 1, 1, rowValues.length).setValues([rowValues]);
  sheet.getRange(newRow, COL.IMAGE).setFormula(imageLink);
  sheet.getRange(newRow, COL.NO).setHorizontalAlignment('center');
  sheet.getRange(newRow, COL.MAIL_SENT).setHorizontalAlignment('center');

  return newRow;
}

// ============================================================
// 3. Gemini OCR
// ============================================================
function extractCardInfo_(file) {
  var blob = file.getBlob();
  var base64Data = Utilities.base64Encode(blob.getBytes());
  var mimeType = blob.getContentType() || 'image/jpeg';

  var prompt =
    '다음 명함 이미지에서 정보를 추출하여 JSON으로만 출력하세요.\n' +
    '규칙:\n' +
    '- JSON 객체만 출력하고 설명이나 코드 블록(```)은 사용하지 마세요.\n' +
    '- 빈 필드는 "" (빈 문자열)로 출력하세요.\n' +
    '- 전화번호는 명함에 표기된 원래 형식을 유지하세요.\n' +
    '필드:\n' +
    '{\n' +
    '  "name": "이름",\n' +
    '  "company": "회사명",\n' +
    '  "position": "직책/직급",\n' +
    '  "department": "부서",\n' +
    '  "email": "이메일",\n' +
    '  "mobile": "휴대전화",\n' +
    '  "phone": "유선전화",\n' +
    '  "fax": "팩스",\n' +
    '  "address": "주소",\n' +
    '  "website": "웹사이트",\n' +
    '  "memo": "메모(기타 특이사항)"\n' +
    '}';

  var endpoint =
    'https://generativelanguage.googleapis.com/v1beta/models/' +
    CONFIG.GEMINI_MODEL + ':generateContent?key=' + getGeminiApiKey_();

  var payload = {
    contents: [{
      parts: [
        { text: prompt },
        { inline_data: { mime_type: mimeType, data: base64Data } }
      ]
    }],
    generationConfig: {
      temperature: 0.1,
      responseMimeType: 'application/json'
    }
  };

  var response = UrlFetchApp.fetch(endpoint, {
    method: 'post',
    contentType: 'application/json',
    payload: JSON.stringify(payload),
    muteHttpExceptions: true
  });

  var code = response.getResponseCode();
  var body = response.getContentText();
  if (code < 200 || code >= 300) {
    throw new Error('Gemini API 오류(' + code + '): ' + body);
  }

  var json = JSON.parse(body);
  var text = '';
  if (json.candidates && json.candidates.length &&
      json.candidates[0].content && json.candidates[0].content.parts) {
    var parts = json.candidates[0].content.parts;
    for (var i = 0; i < parts.length; i++) {
      if (parts[i].text) text += parts[i].text;
    }
  }

  text = text.replace(/```json/gi, '').replace(/```/g, '').trim();

  var parsed;
  try {
    parsed = JSON.parse(text);
  } catch (e) {
    throw new Error('OCR 응답 JSON 파싱 실패: ' + text);
  }
  return parsed;
}

// ============================================================
// 4. 인사 메일 발송
// ============================================================
function sendGreetingEmail_(info) {
  if (!info.email) {
    throw new Error('이메일 주소가 없습니다.');
  }
  var subject = info.name + '님, 만나 뵙게 되어 반갑습니다';
  var html = buildGreetingHtml_(info);

  GmailApp.sendEmail(info.email, subject, '', {
    htmlBody: html,
    name: CONFIG.SENDER_NAME
  });
}

function buildGreetingHtml_(info) {
  var name = info.name || '';
  var company = info.company || '';
  var position = info.position || '';
  var sender = CONFIG.SENDER_NAME;

  return '' +
    '<div style="font-family: \'Apple SD Gothic Neo\', \'Malgun Gothic\', sans-serif;' +
    ' font-size: 15px; color: #222; line-height: 1.7;">' +
    '<p>' + name + '님 안녕하세요.</p>' +
    '<p>' + company + (position ? ' ' + position : '') + '님을<br>' +
    '만나 뵙게 되어 진심으로 반갑습니다.</p>' +
    '<p>받은 명함을 소중히 보관하였으며,<br>' +
    '앞으로 좋은 인연으로 이어지길 기대합니다.</p>' +
    '<p>언제든 편하게 연락 주시기 바랍니다.</p>' +
    '<br>' +
    '<p>감사합니다.<br><strong>' + sender + '</strong> 드림</p>' +
    '</div>';
}

// ============================================================
// 5. 수동 메일 발송
// ============================================================
function sendMailForSelectedRow() {
  var ui = SpreadsheetApp.getUi();
  var sheet = getSheet_();
  var range = sheet.getActiveRange();
  if (!range) {
    ui.alert('행을 먼저 선택해주세요.');
    return;
  }
  var row = range.getRow();
  if (row < 2) {
    ui.alert('헤더가 아닌 데이터 행을 선택해주세요.');
    return;
  }

  var info = readRowAsInfo_(sheet, row);
  if (!info.email) {
    ui.alert('선택한 행에 이메일이 없습니다.');
    return;
  }

  var sent = sheet.getRange(row, COL.MAIL_SENT).getValue();
  if (sent && String(sent).toUpperCase() === 'O') {
    var resp = ui.alert(
      '재발송 확인',
      '이미 메일이 발송된 건입니다. 다시 발송할까요?',
      ui.ButtonSet.YES_NO
    );
    if (resp !== ui.Button.YES) return;
  }

  try {
    sendGreetingEmail_(info);
    sheet.getRange(row, COL.MAIL_SENT).setValue('O');
    ui.alert(info.name + '님에게 메일을 발송했습니다.');
  } catch (e) {
    ui.alert('메일 발송 실패: ' + e);
  }
}

function sendMailForAllUnsent() {
  var ui = SpreadsheetApp.getUi();
  var sheet = getSheet_();
  var lastRow = sheet.getLastRow();
  if (lastRow < 2) {
    ui.alert('발송할 데이터가 없습니다.');
    return;
  }

  var data = sheet.getRange(2, 1, lastRow - 1, COL.MAIL_SENT).getValues();
  var sentCount = 0;
  var failCount = 0;

  for (var i = 0; i < data.length; i++) {
    var row = i + 2;
    var email = data[i][COL.EMAIL - 1];
    var flag = data[i][COL.MAIL_SENT - 1];
    if (!email) continue;
    if (flag && String(flag).toUpperCase() === 'O') continue;

    var info = {
      name: data[i][COL.NAME - 1],
      company: data[i][COL.COMPANY - 1],
      position: data[i][COL.POSITION - 1],
      email: email
    };
    try {
      sendGreetingEmail_(info);
      sheet.getRange(row, COL.MAIL_SENT).setValue('O');
      sentCount++;
    } catch (e) {
      Logger.log('일괄 발송 실패(row ' + row + '): ' + e);
      failCount++;
    }
  }

  SpreadsheetApp.flush();
  ui.alert('일괄 발송 완료 - 성공: ' + sentCount + ', 실패: ' + failCount);
}

function readRowAsInfo_(sheet, row) {
  var values = sheet.getRange(row, 1, 1, COL.MAIL_SENT).getValues()[0];
  return {
    name: values[COL.NAME - 1],
    company: values[COL.COMPANY - 1],
    position: values[COL.POSITION - 1],
    department: values[COL.DEPARTMENT - 1],
    email: values[COL.EMAIL - 1],
    mobile: values[COL.MOBILE - 1],
    phone: values[COL.PHONE - 1],
    fax: values[COL.FAX - 1],
    address: values[COL.ADDRESS - 1],
    website: values[COL.WEBSITE - 1],
    memo: values[COL.MEMO - 1]
  };
}

// ============================================================
// 6. 트리거 등록/해제
// ============================================================
function registerAutoScanTrigger() {
  var ui = SpreadsheetApp.getUi();
  var exists = ScriptApp.getProjectTriggers().some(function (t) {
    return t.getHandlerFunction() === CONFIG.TRIGGER_FUNCTION;
  });
  if (exists) {
    ui.alert('이미 자동 스캔 트리거가 등록되어 있습니다.');
    return;
  }
  ScriptApp.newTrigger(CONFIG.TRIGGER_FUNCTION)
    .timeBased()
    .everyMinutes(CONFIG.TRIGGER_INTERVAL_MINUTES)
    .create();
  ui.alert(CONFIG.TRIGGER_INTERVAL_MINUTES + '분 주기 자동 스캔 트리거를 등록했습니다.');
}

function unregisterAutoScanTrigger() {
  var ui = SpreadsheetApp.getUi();
  var removed = 0;
  ScriptApp.getProjectTriggers().forEach(function (t) {
    if (t.getHandlerFunction() === CONFIG.TRIGGER_FUNCTION) {
      ScriptApp.deleteTrigger(t);
      removed++;
    }
  });
  ui.alert(removed > 0
    ? removed + '개의 자동 스캔 트리거를 해제했습니다.'
    : '등록된 자동 스캔 트리거가 없습니다.');
}

// ============================================================
// 유틸리티 & 진단
// ============================================================
function testGeminiConnection() {
  var ui = SpreadsheetApp.getUi();
  var endpoint =
    'https://generativelanguage.googleapis.com/v1beta/models/' +
    CONFIG.GEMINI_MODEL + ':generateContent?key=' + getGeminiApiKey_();

  var payload = {
    contents: [{ parts: [{ text: 'ping' }] }],
    generationConfig: { temperature: 0.1 }
  };
  try {
    var res = UrlFetchApp.fetch(endpoint, {
      method: 'post',
      contentType: 'application/json',
      payload: JSON.stringify(payload),
      muteHttpExceptions: true
    });
    var code = res.getResponseCode();
    ui.alert(code === 200
      ? '✅ Gemini API 연결 성공 (' + CONFIG.GEMINI_MODEL + ')'
      : '❌ 연결 실패 (' + code + ')\n' + res.getContentText());
  } catch (e) {
    ui.alert('❌ 연결 오류: ' + e);
  }
}

function showStatus() {
  var ui = SpreadsheetApp.getUi();
  var sheet = getSheet_();
  var lastRow = sheet.getLastRow();
  var total = Math.max(lastRow - 1, 0);

  var sentCount = 0;
  if (total > 0) {
    var flags = sheet.getRange(2, COL.MAIL_SENT, total, 1).getValues();
    for (var i = 0; i < flags.length; i++) {
      if (flags[i][0] && String(flags[i][0]).toUpperCase() === 'O') sentCount++;
    }
  }

  var triggerOn = ScriptApp.getProjectTriggers().some(function (t) {
    return t.getHandlerFunction() === CONFIG.TRIGGER_FUNCTION;
  });

  ui.alert(
    '📊 상태\n\n' +
    '- 총 명함 수: ' + total + '\n' +
    '- 메일 발송 완료: ' + sentCount + '\n' +
    '- 미발송: ' + (total - sentCount) + '\n' +
    '- 자동 스캔 트리거: ' + (triggerOn ? '등록됨' : '해제됨')
  );
}

function getSheet_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(CONFIG.SHEET_NAME);
  if (!sheet) {
    throw new Error('시트 탭을 찾을 수 없습니다: ' + CONFIG.SHEET_NAME);
  }
  return sheet;
}

function getOrCreateProcessedFolder_(parentFolder) {
  var folders = parentFolder.getFoldersByName(CONFIG.PROCESSED_FOLDER_NAME);
  if (folders.hasNext()) return folders.next();
  return parentFolder.createFolder(CONFIG.PROCESSED_FOLDER_NAME);
}
