# 지금까지 사용한 프롬프트 및 명령어 정리

이 문서는 `mind-weather` 프로젝트 과정에서 사용된 주요 프롬프트(채팅 요청)와 GitHub, Supabase, Vercel 작업을 위해 사용된 터미널 명령어들을 정리한 파일입니다.

---

## 🗣️ 주요 프롬프트 (채팅 요청) 목록

그동안 진행된 대화에서 요청하신 주요 프롬프트(목적)는 다음과 같습니다:

1. **"분석하여 실행해줘"**
   - 현재 다운로드된 프로젝트의 구조를 파악하고, 로컬 디버깅 환경(`npm run dev`)을 구동하기 위한 프롬프트였습니다.
   
2. **"마크다운 파일로 배포 명령어 목록 작성해줘" (Creating Deployment Command List)**
   - 프로젝트 코드를 형상 관리하고 서버스에 배포하기 위한 `git`, `supabase`, `vercel` 명령어들을 각각 정리하여 `.md` 파일(예: `deployment_commands.md`)로 만들어달라는 프롬프트였습니다.

3. **"Vercel 프론트엔드 배포 준비 및 배포" (Frontend Deployment To Vercel)**
   - 프론트엔드 UI를 확인할 수 있도록 API 연동 부분을 로컬 상태에 맞게 준비하고, 코드를 새 GitHub 저장소에 푸시한 뒤 Vercel 프로젝트에 배포하기 위한 일련의 작업을 요청하신 프롬프트입니다.

4. **"Gemini 이미지 생성 기능 연동" (Gemini Image Generation Integration)**
   - 앱 내 프롬프트 영역에서 작성한 내용에 기반하여 Gemini 3 Pro (Nano Banana 모델) API를 호출하고, 썸네일 이미지를 생성하여 표시/저장하는 기능을 구현하기 위한 프롬프트였습니다.

---

## 💻 필수 배포 작업 명령어 모음

아래는 프로젝트 관리와 배포를 위해 사용된 핵심 명령어들입니다. 

### 🟢 1. Git & GitHub 작업 명령어
소스코드 버전 관리와 원격 저장소 푸시를 위한 명령어입니다.

```bash
# 로컬 Git 저장소 초기화
git init

# 워크스페이스의 모든 변경사항을 스테이징(staging) 추가
git add .

# 변경사항에 대한 메시지와 함께 커밋 생성
git commit -m "초기 프로젝트 구조 및 파일 추가"

# 기본 브랜치 이름을 main으로 변경
git branch -M main

# 원격 GitHub 저장소 연결 주소 추가
git remote add origin <자신의-github-repo-url>

# GitHub 원격 저장소 main 브랜치로 소스 푸시
git push -u origin main
```

### 🔵 2. Supabase 작업 명령어
Supabase 백엔드 서비스(DB, Auth 등)와 로컬 환경을 연결하기 위한 명령어입니다.

```bash
# 브라우저를 통한 Supabase CLI 로그인
npx supabase login

# 생성한 Supabase 프로젝트를 현재 로컬 프로젝트와 연결 설정
npx supabase link --project-ref <자신의-프로젝트-REF>

# (선택) Supabase 스키마를 바탕으로 TypeScript 타입 추출 및 저장
npx supabase gen types typescript --project-id <자신의-프로젝트-REF> > types/supabase.ts
```

### 🔺 3. Vercel 배포 작업 명령어
서버리스 프론트엔드 배포 플랫폼인 Vercel 환경을 설정하고 코드를 배포하는 명령어입니다.

```bash
# Vercel CLI 도구를 전역(-g)으로 설치
npm i -g vercel

# Vercel 로그인
vercel login

# Vercel 관리자 페이지에 생성한 프로젝트와 현재 로컬 디렉토리를 연결
vercel link

# Vercel 플랫폼에 설정된 환경변수(.env) 파일을 로컬로 가져옴
vercel env pull .env.local

# Vercel에 변경사항을 미리보기(Preview) 상태로 배포
vercel

# Vercel에 변경사항을 실제 운영 서버(Production)로 최종 배포
vercel --prod
```
