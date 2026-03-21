# Implementation Plan: 맞춤형 이메일 자동화 시스템 구축 (Confirmed)

## ## Requirements Restatement (요구사항 재정의)
- **데이터 입력**: 다양한 형식의 CSV 파일 업로드 지원 및 컬럼 자동 인식.
- **맞춤형 렌더링**: `Jinja2` 템플릿을 사용하여 `{{ 이름 }}`, `{{ 포인트 }}` 등 데이터를 이메일에 실시간 반영.
- **안정적 발송**: Gmail SMTP 연동 및 최신 이메일 표준(`EmailMessage`) 준수.
- **관리 및 추적**: SQLite DB를 통한 수신자 관리 및 한국 시간(KST) 기반 발송 로그 기록.
- **사용자 경험**: Streamlit 기반의 직관적인 관리 대시보드 제공.

## ## Implementation Phases (단계별 계획)

### ### Phase 1: 기반 데이터 및 저장소 (DB Manager)
- `db_manager.py`를 통해 수신자 정보를 영구 저장하고 중복 방지 로직 적용.
- 발송 로그 테이블을 구축하여 성공/실패 여부를 KST 시간으로 기록.

### ### Phase 2: 개인화 템플릿 엔진 (Template Engine)
- `template_engine.py`에서 `Jinja2`를 활용해 CSV 컬럼 기반의 변수 치환 로직 구현.
- 사용자가 실시간으로 렌더링 결과를 볼 수 있는 미리보기 기능 제공.

### ### Phase 3: 신뢰성 있는 메일링 시스템 (Mailer)
- `mailer.py` 구성 및 `EmailMessage(policy=SMTP)` 적용으로 인코딩 오류 방지.
- 발송 전 이메일 주소 형식(@ 포함 등) 유효성 검사 추가.
- SMTP 인증 실패 및 수신 거부 등의 오류 메시지 친절하게 제공.

### ### Phase 4: 통합 대시보드 (Streamlit UI)
- `app.py`를 통해 파일 업로드, 템플릿 편집, 발송 제어 UI 통합.
- **스마트 컬럼 감지**: '이메일' 관련 컬럼을 자동 감지하여 기본값으로 설정.
- 발송 통계 시각화 및 결과 데이터(CSV) 다운로드 기능.

## ## Dependencies (주요 라이브러리)
- `streamlit`: 대시보드 구축
- `jinja2`: 템플릿 렌더링
- `pandas`: CSV 데이터 처리
- `plotly`: 통계 시각화
- `python-dotenv`: 환경 변수(.env) 관리

## ## Risks (리스크 분석)
- **HIGH (SMTP 인증)**: Gmail 앱 비밀번호 미설정 시 인증 실패 (사용자 가이드 제공 필수).
- **MEDIUM (스팸 차단)**: 대량 발송 시 스팸 차단 위험 (발송 간격 조절 기능으로 해결).
- **LOW (데이터 인코딩)**: CSV 파일의 한글 깨짐 (`utf-8-sig` 적용으로 해결).

## ## Estimated Complexity: MEDIUM
- 현재 핵심 모듈이 구현 완료되었으며, 통합 및 안정화에 약 1-2시간 소요 예상.

---
**CONFIRMED**: 2026-03-21 20:13 (KST)
