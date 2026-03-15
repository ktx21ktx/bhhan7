# 프로젝트 배포 및 연동 명령어 정리 (GitHub, Supabase, Vercel)

## 1. GitHub 연동 및 푸시 (GitHub)
현재 로컬 저장소는 아래 원격 저장소와 이미 연동되어 있습니다:
- **URL**: `https://github.com/ktx21ktx/bhhan7.git`

### 새로운 변경사항 푸시하기
1. **변경사항 확인**: `git status`
2. **모든 변경사항 스테이징**: `git add .`
3. **커밋 생성**: `git commit -m "린트 에러 수정 및 한국 시간(KST) 적용"`
4. **GitHub로 푸시**: `git push origin main`

### 처음부터 연동하는 경우 (프로젝트 명 변경 대비)
GitHub에서 생성한 실제 저장소 이름에 맞춰 URL을 변경해야 합니다.
```bash
# Git 저장소 초기화
git init

# 모든 변경사항 스테이징
git add .

# 커밋 생성
git commit -m "초기 설정 및 배포 준비"

# 기본 브랜치명 변경 (main)
git branch -M main

# 원격 저장소 연결 (URL에 실제 프로젝트 명 입력)
# 예: https://github.com/ktx21ktx/<실제-저장소-이름>.git
git remote add origin https://github.com/ktx21ktx/bhhan7.git

# GitHub로 푸시
git push -u origin main
```

### 연결된 저장소 주소 변경 (유지관리)
프로젝트 이름을 바꾸거나 다른 저장소로 옮길 때 사용합니다.
```bash
git remote set-url origin <새로운-저장소-URL>
```

## 2. Supabase 설정 (Supabase)
프로젝트 내에서 Supabase 기능(MCP 포함)을 사용하기 위한 로컬 설정 명령어입니다.
```bash
# Supabase 로그인
npx supabase login

# 기존 Supabase 프로젝트를 로컬 프로젝트에 연결
npx supabase link --project-ref <자신의-프로젝트-REF>

# TypeScript 타입 제네레이터 실행
npx supabase gen types typescript --project-id <자신의-프로젝트-REF> > types/supabase.ts
```

## 3. Vercel 배포 (Vercel)
```bash
# Vercel CLI 설치 (전역에 설치된 경우 생략 가능)
npm i -g vercel

# Vercel 로그인
vercel login

# Vercel 프로젝트와 현재 로컬 레포지토리 연결
vercel link

# Vercel에 설정된 환경 변수를 로컬 파일로 동기화 (예: .env.local)
vercel env pull .env.local

# Vercel에 Preview 배포 (개발/테스트 용도)
vercel

# Vercel에 Production 배포 (실제 라이브 서비스 용도)
vercel --prod
```
