# Vercel 배포 및 유지관리 가이드

이 문서는 **Mind Weather** 프로젝트의 최초 배포 과정과 배포 이후의 변경 사항 유지관리 방법을 설명합니다.

---

## 1. 최초 설정: 신규 프로젝트 배포
프로젝트를 Vercel에 처음 올릴 때 수행하는 단계입니다.

### 1.1 Vercel 접속 및 로그인
- [Vercel](https://vercel.com)에 접속하여 **Log In** > **Continue with GitHub**로 로그인합니다.

### 1.2 프로젝트 가져오기 (Import)
- 대시보드 우측 상단의 **Add New...** > **Project**를 선택합니다.
- 저장소 목록에서 `bhhan7`을 찾아 **Import**를 클릭합니다.

### 1.3 환경 변수(Environment Variables) 설정
앱 작동에 필수적인 다음 값들을 입력하고 **Add**를 누릅니다.

| Key | Value |
| :--- | :--- |
| `GEMINI_API_KEY` | `AIzaSyBJgvbP2rB9jQ4BU7wOKSUuAr6N3Hg_Flk` |
| `NEXT_PUBLIC_SUPABASE_URL` | `https://nlxwuieachzxjdbeepua.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5seHd1aWVhY2h6eGpkYmVlcHVhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIyNDM3MTAsImV4cCI6MjA4NzgxOTcxMH0._JR5pmFv6YhBLQk5TZizS4dlx_HP_J8ILnO91DFbr1k` |

### 1.4 최초 배포 실행
- 하단의 **Deploy** 버튼을 클릭하여 빌드를 시작합니다.

---

## 2. 유지관리: 변경 사항 업데이트
배포 이후 코드를 수정하거나 설정을 변경할 때 수행합니다.

### 2.1 자동 배포 (GitHub 연동)
코드를 수정하고 GitHub로 **Push**하면 Vercel이 자동으로 감지하여 업데이트를 진행합니다.
```bash
git add .
git commit -m "수정 내용 설명"
git push origin main
```

### 2.2 환경 변수 관리
- **Settings** > **Environment Variables** 탭에서 기존 값을 수정하거나 새로운 변수를 추가할 수 있습니다.
- 변경 사항 적용을 위해 필요한 경우 **Redeploy**를 수행합니다.

### 2.3 모니터링
- **Deployments**: 빌드 상태 및 버전 히스토리 확인
- **Logs**: 실시간 에러 및 실행 로그 확인

---
**🔗 서비스 주소:** [https://bhhan7-plv9.vercel.app](https://bhhan7-plv9.vercel.app)
