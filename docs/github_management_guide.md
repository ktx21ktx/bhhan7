# GitHub 연동 및 유지관리 가이드

이 문서는 **Mind Weather** 프로젝트의 GitHub 최초 연동 방법과 이후 코드 변경 사항을 관리(Push)하는 방법을 설명합니다.

---

## 1. 최초 설정: GitHub 원격 저장소 연동
로컬 프로젝트를 GitHub에 처음 연결할 때 수행하는 단계입니다.

### 1.1 Git 초기화 및 파일 준비
터미널에서 프로젝트 루트 폴더로 이동 후 아래 명령어를 실행합니다.
```bash
git init
git add .
git commit -m "초기 설정 및 배포 준비"
```

### 1.2 브랜치 설정 및 원격 연결
기본 브랜치 이름을 `main`으로 변경하고 GitHub 저장소 주소를 연결합니다.
```bash
git branch -M main
```

**[중요] 프로젝트 명 변경 시 대응**
GitHub에서 새 저장소를 생성할 때 정한 프로젝트 명(저장소 이름)에 따라 URL이 달라집니다. 아래 명령어의 URL 부분을 실제 주소로 바꿔서 입력하세요.
```bash
git remote add origin https://github.com/ktx21ktx/bhhan7.git
```
*예시 (프로젝트 명이 'my-new-app'인 경우):*
`git remote add origin https://github.com/ktx21ktx/my-new-app.git`

### 1.3 최초 푸시 (Push)
로컬 코드를 GitHub로 처음 업로드합니다.
```bash
git push -u origin main
```

---

## 2. 유지관리: 변경 사항 반영 및 업데이트
프로젝트를 수정할 때마다 GitHub에 최신 상태를 반영하는 방법입니다.

### 2.1 일상적인 업데이트 (Push)
수정된 내용을 GitHub에 반영할 때 순서대로 입력합니다.
```bash
git add .
git commit -m "수정 내용 설명"
git push origin main
```

### 2.2 연결된 저장소 주소 변경
이미 연동된 상태에서 GitHub 저장소 이름을 바꾸거나 다른 저장소로 옮기고 싶을 때 사용합니다.
```bash
git remote set-url origin <새로운-저장소-URL>
```

### 2.3 연동 상태 확인
현재 어떤 주소와 연결되어 있는지 확인합니다.
```bash
git remote -v
```

---
**🔗 현재 저장소:** [https://github.com/ktx21ktx/bhhan7.git](https://github.com/ktx21ktx/bhhan7.git)
