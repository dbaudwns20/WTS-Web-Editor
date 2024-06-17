<p align="center">
  <img src="https://github.com/dbaudwns20/WTS-Web-Editor/assets/33855022/aa5db49c-302d-497f-bfe7-3e37b1c7929e" width="450" />
</p>

# 소개
WTS Web Editor는 게임 워크래프트3의 인게임 텍스트 파일을 손쉽게 번역할 수 있는 사용자 인터페이스를 제공하며, 번역된 파일을 다운로드할 수 있는 웹 페이지입니다. 

## 기술 스택
![next](https://img.shields.io/badge/Next.js-000?logo=nextdotjs&logoColor=fff&style=for-the-badge)
![react](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Vercel](https://img.shields.io/badge/vercel-%23000000.svg?style=for-the-badge&logo=vercel&logoColor=white)
![tailwind](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![ts](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![mongo](https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white)

## 사용된 라이브러리들

- [Next.js](https://nextjs.org/): React를 기반으로 한 서버사이드 렌더링 프레임워크
- [Vercel Blob](https://vercel.com/docs/storage/blobs): 외부 이미지 저장 및 호스팅 연계
- [Mongoose](https://mongoosejs.com/): MongoDB를 위한 ORM
- [next-intl](https://github.com/amannn/next-intl): Next.js 다국어 기능 제공 (한국어 / 영어)
- [perfect-scrollbar](https://github.com/mdbootstrap/perfect-scrollbar): 스크롤바 디자인
- [react-cropper](https://github.com/react-cropper/react-cropper): 이미지 크롭
- [react-hotkeys](https://github.com/greena13/react-hotkeys): 단축키 사용

# 프로젝트 설치 및 진행 가이드

### 필요사항

- Vercel Hobby Plan 계정
  - Vercel은 프론트엔드 프로젝트를 손쉽게 배포할 수 있는 클라우드 플랫폼입니다. [Vercel 홈페이지](https://vercel.com/)에서 무료로 가입할 수 있습니다.
- Vercel Blob Storage API 키 발급
  - Blob Storage는 파일 저장소로, API 키를 통해 접근할 수 있습니다. Vercel 대시보드에서 API 키를 생성하세요.
- MongoDB Atlas 개인 클러스터
  - MongoDB Atlas는 클라우드 기반의 NoSQL 데이터베이스 서비스입니다. [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)에서 개인 클러스터를 생성하세요.

### 환경 변수 설정

root 디렉토리에 `.env.local` 파일을 만들고 다음 값을 입력해야 합니다:

```plaintext
BLOB_READ_WRITE_TOKEN=""
MONGODB_DB=""
MONGODB_URI=""
```

- `BLOB_READ_WRITE_TOKEN`: Vercel Blob Storage API 키를 입력합니다.
- `MONGODB_DB`: MongoDB 데이터베이스 이름을 입력합니다.
- `MONGODB_URI`: MongoDB 클러스터의 URI를 입력합니다.

### 패키지 설치

프로젝트 디렉토리에서 다음 명령어를 실행하여 필요한 패키지를 설치합니다:

```bash
npm install
```

### 개발 서버 실행

다음 명령어를 실행하여 개발 서버를 시작합니다:

```bash
npm run dev
```

개발 서버가 시작되면, 웹 브라우저에서 `http://localhost:3000`을 열어 애플리케이션을 확인할 수 있습니다.

### 추가 설명

- **Vercel 설정**: 프로젝트를 Vercel에 배포하기 위해 Vercel CLI를 설치하고 로그인하세요. 그런 다음, `vercel` 명령어를 사용하여 프로젝트를 배포할 수 있습니다.
- **MongoDB 설정**: MongoDB Atlas에서 데이터베이스를 설정한 후, 사용자와 비밀번호를 생성하고, 네트워크 접근 설정을 통해 IP 화이트리스트를 구성하세요.
- **환경 변수 관리**: `.env.local` 파일을 통해 로컬 개발 환경에서 필요한 환경 변수를 관리합니다. 배포 환경에서는 Vercel의 환경 변수 설정을 사용하여 보안을 유지하세요.

#  기능
WTS 웹 에디터는 워크래프트 3 맵 파일 중 WTS 파일을 프로젝트 단위로 생성하여 관리할 수 있습니다. 생성된 프로젝트는 WTS 파일 내용으로 STRING 데이터를 생성합니다. 프로젝트 상세 페이지에서 STRING 목록과 편집기를 확인할 수 있습니다. 각 페이지에서 사용할 수 있는 기능은 다음과 같습니다.

### 메인 페이지
- **프로젝트 조회**: offset 8개 단위, 생성일자 역순으로 조회됩니다. 스크롤을 끝까지 내리면 추가 조회가 가능합니다.

- **다국어 지원**: 한국어, English 다국어를 지원합니다.

- **프로젝트 생성**: 다음 값을 입력 받아 프로젝트를 생성할 수 있습니다. __(* 표시는 필수값입니다.)__

  - 제목 *
  
  - 언어 (locale) *
  
  - 버전
  
  - 출처 URL
  
  - 이미지 (기본 이미지를 제공합니다.) *
  
  - WTS 파일 *

### 프로젝트 상세 페이지
- **프로젝트 정보**: 언어, 버전, 번역률, 마지막 수정 시간이 표시됩니다.

- **출처 URL 링크**: 출처 URL 값이 존재할 경우 새 탭으로 열 수 있습니다.

- **다운로드**: 작업된 STRING 데이터를 WTS 파일로 다운로드할 수 있습니다. 다운로드 유형에 따라 WTS 파일 내용이 결정됩니다.

  - **릴리즈**: 배포 목적으로 WTS 파일을 다운로드합니다. 번역 텍스트가 우선 반영되며, **번역되지 않은 STRING은 원문 텍스트로 입력됩니다.**
  
  - **디버그**: 릴리즈 유형과 동일하게 모든 STRING 데이터를 다운로드합니다. 각 텍스트 맨 앞에 STRING 숫자가 표시됩니다.
  
  - **업로드**: 번역 완료된 STRING 데이터만 다운로드합니다.
 
- **삭제**: 해당 프로젝트를 삭제합니다. 삭제한 데이터는 원복할 수 없습니다.

- **업로드**: 이미 작업된 WTS 파일을 업로드하여 기존 STRING의 번역 텍스트에 반영할 수 있습니다.

- **업데이트**: 프로젝트의 값을 업데이트할 수 있습니다. 새 WTS 파일을 업로드하여 기존 WTS STRING 데이터에 새로운 WTS 데이터를 반영할 수 있습니다. (* 표시는 필수값입니다.)

  - 제목 *
  
  - 언어 (locale) *
  
  - 버전
  
  - 출처 URL
  
  - 이미지 (기본 이미지를 제공합니다.) *
  
  - WTS 파일
  
    **새 WTS 파일을 업로드하여 업데이트하면 STRING 번호가 서로 일치하는 데이터를 찾아 다음 3가지 케이스로 처리합니다.**
    
      - 이전 STRING 데이터와 새 STRING이 둘 다 존재하는 경우: 이전 STRING 데이터의 원문 텍스트를 새 STRING 값으로 업데이트하고, 번역 완료된 상태라면 업데이트 상태로 갱신합니다.
      
      - 이전 STRING 데이터는 존재하나 새 STRING은 없는 경우: 이전 STRING 데이터를 삭제합니다.
      
      - 이전 STRING 데이터는 존재하지 않고 새 STRING은 존재하는 경우: 신규 STRING 데이터를 생성합니다.

### STRING
- **STRING 조회**: WTS 파일로 생성된 STRING 데이터를 조회할 수 있습니다. offset 10개 단위, STRING 번호순으로 조회됩니다. 스크롤을 끝까지 내리면 추가 조회가 가능합니다. 각 STRING의 상태와 주석 정보를 UI로 확인할 수 있습니다.

  - 상태 UI (작업되지 않은 STRING 경우 표시되지 않습니다.)
  
    - 번역 완료: STRING을 번역 완료한 경우 표시됩니다.
    
    - 작업 중: STRING을 임시 저장한 경우 표시됩니다.
    
    - 업데이트: 번역 완료된 STRING이 프로젝트 업데이트를 통해 원문 텍스트가 갱신될 경우 표시됩니다.

  - 주석 UI: WTS 파일 내 STRING 단위에서 `//`으로 시작되는 부분이 존재할 경우 주석 데이터로 취급되며 아이콘으로 표시됩니다. 상세 내용은 편집기에서 확인할 수 있습니다.

- **STRING 검색**: 키워드와 상태 검색을 제공합니다.

  - 키워드: 키워드와 STRING 숫자로 조회할 수 있습니다.
  
  - 상태: 미작업, 번역 완료, 작업 중, 업데이트 중 1개를 선택하여 조회할 수 있습니다.
  
- **STRING 이동**: 다른 STRING을 클릭하여 이동할 수 있습니다. 만약 STRING이 수정된 상황에서 저장되지 않은 상태라면 경고 창이 나타납니다.

  - 무시: 저장하지 않고 해당 STRING으로 이동합니다. 변경사항은 유지되지 않습니다.
  
  - 번역 완료: 작업된 번역 텍스트를 번역 완료 상태로 저장합니다.
  
  - 임시 저장: 해당 STRING이 번역 완료 상태가 아니라면 임시 저장합니다. 번역 완료된 상태라면 이 버튼은 노출되지 않습니다.

### 편집기

- **레이아웃**: 편집기의 레이아웃을 설정할 수 있습니다. (이 설정은 브라우저에 저장됩니다.)

  - STRING 목록 보기: STRING 목록 보이기 여부를 on/off 할 수 있습니다.
  
  - 편집기 모드: 편집기의 보기를 가로/세로로 설정할 수 있습니다.
  
- **설정**: 편집기 작업의 기능을 설정할 수 있습니다. (이 설정은 브라우저에 저장됩니다.)

  - 자동 이동: 번역 완료 처리되면 자동으로 다음 STRING으로 이동합니다.
  
  - 건너뛰기: STRING 이동 시 번역 완료된 대상은 건너뜁니다.
  
- **단축키**: 편집기에서 사용할 수 있는 단축키 목록을 보여줍니다.

  - 번역 완료: STRING을 번역 완료 처리합니다.
  
  - 임시 저장: STRING을 임시 저장합니다.
  
  - 검색 열기/닫기: 검색 조건 창을 열기/닫기 합니다. STRING 목록이 숨김 처리되어있을 경우 강제로 보여지게 됩니다.
  
  - 검색 조건 초기화: 검색 조건을 초기화합니다.
  
  - 다음 STRING으로 이동: 다음 STRING으로 이동합니다.
  
  - 이전 STRING으로 이동: 이전 STRING으로 이동합니다.
  
  - 초기화: 번역 텍스트의 값을 초기값으로 되돌립니다.
  
  - 동기화: 번역 텍스트를 원본 텍스트와 동기화합니다.
  
- **원본 텍스트**: 번역하려는 텍스트의 원본을 보여줍니다.

  - 주석: 주석값을 확인할 수 있습니다. 주석 데이터가 존재해야 이 기능이 노출됩니다.
  
  - 동기화: 원본 텍스트 값을 번역 텍스트에 반영합니다.
  
  - 복사: 원본 텍스트 값 전체를 클립보드에 복사합니다.
  
  - 미리보기: 워크래프트3 인게임 상태로 미리보기 할 수 있습니다. 미리보기 종료 버튼으로 해제할 수 있습니다.
  
- **번역 텍스트**: 번역 텍스트를 입력할 수 있습니다.

  - 임시 저장: 해당 STRING을 임시 저장합니다. 번역률에 계산되지 않습니다. "작업 중" 상태로 UI에 표시됩니다. 이미 "번역 완료" 상태라면 해당 기능은 노출되지 않습니다.
  
  - 초기화: 번역 텍스트의 값을 초기값으로 되돌립니다.
  
  - 미리보기: 워크래프트3 인게임 상태로 미리보기 할 수 있습니다. 미리보기 종료 버튼으로 해제할 수 있습니다.
  
- **이전 버튼**: 현재 STRING의 이전 대상으로 이동합니다. "건너뛰기" 설정의 영향을 받습니다. 이동 가능한 STRING이 없다면 비활성화됩니다.

- **다음 버튼**: 현재 STRING의 다음 대상으로 이동합니다. "건너뛰기" 설정의 영향을 받습니다. 이동 가능한 STRING이 없다면 비활성화됩니다.

- **번역 완료 버튼**: 현재 STRING을 번역 완료합니다. "번역 완료" 상태로 UI에 표시됩니다. "자동 이동" 설정의 영향을 받습니다.

#### * 임시 저장, 번역 완료 기능이 성공적으로 처리되면 해당 STRING 번호를 기록하여 다음 프로젝트 상세 페이지 방문 시 자동으로 현재 STRING으로 설정됩니다.

# 마치며
이 프로젝트는 무료 서비스 내에서 구현되었습니다. 사용량을 주의하고 각 플랫폼의 비용 정책이 변경될 수 있으므로 유의하시기 바랍니다.
