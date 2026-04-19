/**
 * 명함 관리 대장 스프레드시트 생성 스크립트
 *
 * - 시트(파일) 이름: '명함 관리 대장'
 * - 탭(시트) 이름: '명함 목록'
 * - 생성 위치: 지정된 구글 드라이브 폴더
 * - 동일한 이름의 파일이 폴더에 이미 있으면 중복 생성하지 않음
 * - 독립 실행형(Standalone) Apps Script에서 실행 가능
 *   (SpreadsheetApp.getUi() 호출 없음)
 */

var TARGET_FOLDER_ID = '1vTvCRA-Nf9nPZwgd_RvACc3T1P302nLt';
var SPREADSHEET_NAME = '명함 관리 대장';
var SHEET_NAME = '명함 목록';

var HEADERS = [
  '번호', '이름', '회사명', '직책/직급', '부서', '이메일',
  '휴대전화', '유선전화', '팩스', '주소', '웹사이트', '메모',
  '명함 이미지', '등록일', '메일 발송'
];

var COLUMN_WIDTHS = [
  50,   // A: 번호
  90,   // B: 이름
  150,  // C: 회사명
  100,  // D: 직책/직급
  100,  // E: 부서
  200,  // F: 이메일
  130,  // G: 휴대전화
  130,  // H: 유선전화
  130,  // I: 팩스
  250,  // J: 주소
  180,  // K: 웹사이트
  150,  // L: 메모
  80,   // M: 명함 이미지
  150,  // N: 등록일
  80    // O: 메일 발송
];

function createBusinessCardSheet() {
  var folder = DriveApp.getFolderById(TARGET_FOLDER_ID);

  var existing = folder.getFilesByName(SPREADSHEET_NAME);
  if (existing.hasNext()) {
    var existingFile = existing.next();
    Logger.log('이미 동일한 이름의 시트가 존재합니다: ' + existingFile.getUrl());
    return existingFile.getUrl();
  }

  var spreadsheet = SpreadsheetApp.create(SPREADSHEET_NAME);
  var spreadsheetFile = DriveApp.getFileById(spreadsheet.getId());

  spreadsheetFile.moveTo(folder);

  var sheet = spreadsheet.getSheets()[0];
  sheet.setName(SHEET_NAME);

  var headerRange = sheet.getRange(1, 1, 1, HEADERS.length);
  headerRange.setValues([HEADERS]);
  headerRange
    .setBackground('#1a73e8')
    .setFontColor('#ffffff')
    .setFontWeight('bold')
    .setHorizontalAlignment('center')
    .setVerticalAlignment('middle');

  sheet.setRowHeight(1, 36);

  for (var i = 0; i < COLUMN_WIDTHS.length; i++) {
    sheet.setColumnWidth(i + 1, COLUMN_WIDTHS[i]);
  }

  var maxRows = sheet.getMaxRows();
  sheet.getRange(1, 1, maxRows, 1).setHorizontalAlignment('center');                 // A열: 번호
  sheet.getRange(1, HEADERS.length, maxRows, 1).setHorizontalAlignment('center');    // O열: 메일 발송
  headerRange.setHorizontalAlignment('center');

  sheet.setFrozenRows(1);

  var filterRange = sheet.getRange(1, 1, sheet.getMaxRows(), HEADERS.length);
  if (sheet.getFilter()) {
    sheet.getFilter().remove();
  }
  filterRange.createFilter();

  Logger.log('명함 관리 대장 시트 생성 완료: ' + spreadsheet.getUrl());
  return spreadsheet.getUrl();
}
