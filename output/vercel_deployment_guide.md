# Vercel 배포 및 유지관리 가이드

이 문서는 'Mind Weather' 프로젝트의 **최초 배포 과정**과 배포 이후의 **변경 사항 유지관리** 방법을 분리하여 설명합니다.

---

## 1. [최초 설정] 신규 프로젝트 배포 프로세스
프로젝트를 Vercel에 처음 올릴 때 수행하는 단계입니다.

### 1.1 Vercel 접속 및 로그인
1. [Vercel 공식 홈페이지](https://vercel.com)에 접속합니다.
2. **Log In** 버튼을 클릭하고 **Continue with GitHub**를 선택하여 로그인합니다.

### 1.2 프로젝트 가져오기 (Import)
1. 대시보드 우측 상단의 **[Add New...]** > **Project**를 선택합니다.
2. 연결된 GitHub 계정의 저장소 목록에서 `bhhan7`을 찾아 **[Import]**를 클릭합니다.

### 1.3 초기 환경 변수(Environment Variables) 설정
앱 작동에 필수적인 다음 값들을 **Environment Variables** 섹션에 입력하고 **[Add]**를 누릅니다.

| Key | Value |
| :--- | :--- |
| `GEMINI_API_KEY` | `AIzaSyBJgvbP2rB9jQ4BU7wOKSUuAr6N3Hg_Flk` |
| `NEXT_PUBLIC_SUPABASE_URL` | `https://nlxwuieachzxjdbeepua.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5seHd1aWVhY2h6eGpkYmVlcHVhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIyNDM3MTAsImV4cCI6MjA4NzgxOTcxMH0._JR5pmFv6YhBLQk5TZizS4dlx_HP_J8ILnO91DFbr1k` |

### 1.4 최초 배포 실행
1. 하단의 **[Deploy]** 버튼을 클릭합니다.
2. 빌드가 완료되면 라이브 URL이 생성됩니다. (예: `https://bhhan7-plv9.vercel.app`)

---

## 2. [유지관리] 변경 사항 반영 및 업데이트
이미 배포된 이후, 코드를 수정하거나 설정을 변경할 때 수행하는 단계입니다.

### 2.1 코드 변경 내용 반영 (자동 배포)
Vercel은 GitHub와 연동되어 있으므로, 로컬에서 코드를 수정하고 **Push**만 하면 자동으로 업데이트됩니다.
1. 로컬 코드 수정 후 터미널 실행:
   ```bash
   git add .
   git commit -m "수정 내용 설명"
   git push origin main
   ```
2. **자동화**: Push 즉시 Vercel이 변경 사항을 감지하여 새로운 빌드를 시작하고 웹사이트에 자동 반영합니다.

### 2.2 환경 변수 수정 및 추가
API 키가 변경되거나 새로운 변수가 필요한 경우입니다.
1. Vercel 대시보드에서 프로젝트 선택 후 **Settings** > **Environment Variables** 탭으로 이동합니다.
2. 기존 값을 수정하거나 새로운 값을 추가합니다.
3. **주의**: 환경 변수 변경 후에는 이를 적용하기 위해 **Redeploy**가 필요할 수 있습니다. (Deployments 탭에서 최신 항목의 `Redeploy` 메뉴 클릭)

### 2.3 배포 상태 모니터링
*   **Deployments 탭**: 현재 진행 중인 빌드 상태나 과거 버전의 히스토리를 확인할 수 있습니다.
*   **Logs**: 앱 실행 중 발생하는 에러나 로그를 실시간으로 확인할 수 있습니다.

---
**🔗 현재 서비스 주소:** [https://bhhan7-plv9.vercel.app](https://bhhan7-plv9.vercel.app)
