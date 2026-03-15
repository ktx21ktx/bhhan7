---
description: Git Push 및 Vercel 배포 자동화 프로세스
---

이 스크립트는 현재의 변경 사항을 깃허브에 푸시하고 Vercel에 프로덕션 배포를 수행합니다.

// turbo
1. 변경 사항 스테이징 및 커밋
   `git add .`
   `git commit -m "Automated deployment: update features and fix bugs"`

// turbo
2. 깃허브 원격 저장소에 푸시
   `git push`

// turbo
3. Vercel 프로덕션 배포 실행
   `vercel --prod`
