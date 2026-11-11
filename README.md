# P-JSL Download Hub

**P-JSL에서 배포하는 프로그램을 한곳에서 찾아 다운로드할 수 있는 GitHub Pages 사이트입니다.** Chrome 확장 프로그램, Windows 데스크톱 앱, 폴더 정리 도구, 로그 분석기, 웹소설 번역기 및 가챠 확률 계산기를 안내합니다.

- **공개 사이트:** https://p-jsl.github.io/
- **관리자 화면:** https://p-jsl.github.io/admin/
- **다운로드 통계:** 메인 페이지의 **프로그램 다운로드 현황**
- **사이트 소스:** [P-JSL/P-JSL.github.io](https://github.com/P-JSL/P-JSL.github.io)

사이트 방문자는 계정 없이 공개 페이지를 열 수 있습니다. 다만 실제 다운로드가 연결되는 GitHub 저장소 또는 릴리스의 공개 여부에 따라 로그인이나 접근 권한이 필요할 수 있습니다.

## 1. 프로그램 다운로드

메인 페이지에서 원하는 프로그램의 다운로드 항목을 선택합니다. 버전별 파일이 바뀌는 프로그램은 각 저장소의 **최신 정식 릴리스**를 기준으로 확인하는 것이 안전합니다.

| 프로그램 | 제공 내용 | 공식 다운로드 / 안내 |
| --- | --- | --- |
| **My Video App** | Chrome 확장 프로그램 및 Windows 데스크톱 미디어 다운로드 앱 | [myapps 최신 릴리스](https://github.com/P-JSL/myapps/releases/latest) |
| **Folder Organizer** | 파일 중복·유사 검사 및 폴더 정리 — Python/Rust Windows판 | [Folder Organizer 최신 릴리스](https://github.com/P-JSL/Folder_Organizer/releases/latest) |
| **JEUS Lens** | JEUS·Java 로그 분석, 오류 검색, SSH/SFTP 원격 로그 미리보기 — Go/Rust Windows판 | [JEUS Lens 최신 릴리스](https://github.com/P-JSL/JeusLogAnalyzer/releases/latest) |
| **Syousetu Translate** | 일본어 웹소설을 한국어로 번역하는 Windows 프로그램 | [Syousetu Translate 최신 릴리스](https://github.com/P-JSL/Syousetu_Translate/releases/latest) |
| **Gacha Pickup Calculator** | 스타레일·명조·스텔라 소라·이환의 목표 획득 확률 및 환급 계산 | [Gacha Calculator 최신 릴리스](https://github.com/P-JSL/gacha_pickup_calculator/releases/latest) |

**설치 전 확인:** ZIP은 전체 압축 해제하고, 각 프로그램 README에 있는 실행 파일명·필수 동반 폴더·지원 OS를 확인하세요. 저장소의 **Code → Download ZIP**은 일반적으로 소스 코드이며, Windows 실행 패키지와 다를 수 있습니다.

### Chrome 확장 프로그램

1. 사이트에서 Chrome 확장 ZIP을 다운로드하고 압축을 풉니다.
2. Chrome 주소창에 `chrome://extensions`를 입력합니다.
3. **개발자 모드**를 켜고 **압축 해제된 확장 프로그램 로드**를 선택합니다.
4. `manifest.json`이 있는 확장 폴더를 지정합니다.
5. 세부 저장·다운로드 설정은 [My Video App 안내](https://github.com/P-JSL/myapps#chrome-확장-설치)를 따릅니다.

**YouTube 다운로드는 Chrome 확장이 아닌 My Video App Windows 데스크톱 앱에서 지원합니다.** 지원 사이트, 영상 형식, 접근 제한을 각 프로그램 설명에서 확인하세요.

## 2. 사이트 관리자 사용 방법

관리자 화면은 웹페이지에서 GitHub API를 호출해 저장소의 페이지 구성 파일을 편집하는 도구입니다. **방문자용 계정 시스템이 아니라 GitHub 토큰 기반의 관리 기능**입니다.

### 관리자 인증

1. [GitHub Fine-grained personal access token 만들기](https://github.com/settings/personal-access-tokens/new)를 엽니다.
2. 저장소 범위를 **`P-JSL/P-JSL.github.io`**로 제한하고 **Contents: Read and write** 권한을 지정합니다.
3. [사이트 관리 콘솔](https://p-jsl.github.io/admin/)의 **Fine-grained GitHub Token**에 입력하고 **관리자 인증**을 누릅니다.
4. **사이트 관리** 화면이 열리면 페이지 편집 및 다운로드 관리를 진행합니다. 작업을 마쳤다면 **로그아웃**합니다.

토큰은 사이트의 브라우저 실행 메모리에만 유지하도록 구현되어 있으며, `localStorage`나 저장소 파일에 기록하지 않습니다. **공유 PC에서 사용하지 말고**, 필요한 저장소에만 권한을 허용하세요. GitHub 계정의 다른 저장소 권한을 제공할 필요는 없습니다.

### 메뉴·페이지·디자인 편집

1. **디자인 편집** 탭에서 기본 홈 또는 추가 메뉴를 선택합니다.
2. 페이지 이름·공개 여부·메뉴 순서를 정하고 필요한 블록을 배치합니다.
3. **히어로, 제목, 텍스트, 이미지, 카드, 목록, 다운로드, 다운로드 통계** 등의 블록을 추가할 수 있습니다.
4. 블록을 이동하거나 더블클릭해 글자를 수정하고, 우측 속성 영역에서 세부 내용을 조정합니다.
5. **사이트 디자인** 탭에서는 색상·너비·모서리 스타일 등을 변경합니다.
6. 변경 사항을 확인하고 **GitHub 저장/배포** 동작을 실행합니다. 변경 내용은 `site-pages.json`에 커밋되며 GitHub Pages 배포 후 공개됩니다.

기본 홈의 필수 다운로드 영역은 보호됩니다. 편집 중에는 실행 취소/다시 실행이 가능하지만, **GitHub에 저장하지 않은 변경은 배포되지 않습니다.**

### 다운로드 항목 연결

관리자는 다운로드 블록을 두 가지 방식으로 설정할 수 있습니다.

| 방식 | 적합한 파일 | 동작 |
| --- | --- | --- |
| **내부 `downloads/` 폴더** | 소형 공개 ZIP | 저장소에 올린 ZIP을 사이트 경로로 연결 |
| **GitHub Release** | 버전별 실행 파일 및 대용량 ZIP | 대상 저장소, 릴리스 태그(`latest` 또는 특정 버전), 파일명/접두사를 기준으로 연결 |

버전이 파일명에 들어가는 릴리스는 **최신 정식 Release의 실제 파일명을 확인하는 설정**을 이용할 수 있습니다. 등록한 파일이 실제 릴리스에 없으면 링크가 비활성화되거나 확인 실패 안내가 표시될 수 있습니다. 변경 후 공개 페이지에서 다운로드 링크를 반드시 확인하세요.

### ZIP 직접 업로드

1. 관리자 화면의 **다운로드 관리** 탭을 엽니다.
2. 파일명을 확인하고 ZIP을 선택합니다.
3. **25MiB 이하** ZIP만 `downloads/`에 직접 게시할 수 있습니다.
4. 업로드 확인 후 저장소에 커밋되고 사이트 배포가 진행됩니다.

**25MiB 초과 파일은 관리자 화면에서 직접 업로드할 수 없습니다.** GitHub Release에 게시하고 다운로드 블록을 그 파일로 연결하세요. 이 제한은 관리자 화면의 직접 업로드 제한이며 GitHub Release 파일의 전체 크기 제한을 의미하지 않습니다.

## 3. 다운로드 통계

메인 화면의 통계는 GitHub Release 자산의 **`download_count`**를 주기적으로 수집해 보여줍니다.

- GitHub Actions의 `download-stats.yml`은 **매일 02:17 UTC (한국시간 약 11:17)** 실행하도록 예약되어 있습니다. 실제 시작은 지연될 수 있습니다.
- 수집한 스냅샷은 `assets/download-stats.json` 및 `downloads/download-counts.json`에 저장됩니다.
- 통계 화면에서는 집계 가능한 릴리스 파일의 누적 다운로드와 **수집 시작 이후의 스냅샷 기반 추이**를 확인할 수 있습니다.
- **내부 `downloads/`의 직접 다운로드는 GitHub Release 다운로드 통계에 포함되지 않습니다.** 과거 일자별 다운로드를 소급해 복구할 수도 없습니다.

페이지를 열 때마다 다운로드 건수를 직접 증가시키는 방식이 아니며, 통계 수집은 GitHub Actions 작업에 의존합니다.

## 4. 사이트 구조 및 배포

| 경로 | 용도 |
| --- | --- |
| `index.html` | 메인 다운로드 페이지 |
| `admin/` | GitHub 토큰 기반 시각적 관리자 |
| `site-pages.json` | 메인/추가 페이지의 메뉴·블록·디자인 설정 |
| `assets/` | 공용 스타일·렌더링 스크립트·통계 파일 |
| `downloads/` | 사이트 내부 ZIP 및 통계 보조 파일 |
| `pages/` | 사이트 추가 페이지 |
| `.github/workflows/pages.yml` | GitHub Pages 게시 |
| `.github/workflows/download-stats.yml` | GitHub Release 다운로드 통계 수집 |

**배포 흐름:** 관리자에서 수정 → GitHub에 `site-pages.json` 커밋 → Pages 워크플로 수행 → 공개 사이트 갱신. 배포가 완료되기까지는 GitHub Actions/Pages 상태에 따라 차이가 발생할 수 있습니다.

관리자가 아닌 경우에도 공개 저장소의 파일과 워크플로는 GitHub에서 검토할 수 있지만, 사이트 내용을 변경하려면 적절한 저장소 쓰기 권한이 필요합니다.

## 5. 문제 해결

| 증상 | 확인 방법 |
| --- | --- |
| 다운로드 링크가 열리지 않음 | 연결된 저장소의 정식 Release가 게시되어 있는지, ZIP 파일명이 맞는지 확인 |
| 관리자 인증 실패 | 토큰 만료·저장소 선택·**Contents: Read and write** 권한 및 GitHub API 응답 확인 |
| 저장 실패 또는 충돌 | 다른 변경이 먼저 반영됐는지 확인하고 **GitHub 새로고침** 후 편집 내용을 다시 검토 |
| 페이지 수정이 보이지 않음 | [GitHub Actions](https://github.com/P-JSL/P-JSL.github.io/actions)에서 Pages 배포 상태 확인 |
| 25MiB 초과 ZIP 업로드 실패 | 대용량 파일은 GitHub Release에 게시한 뒤 링크 연결 |
| 다운로드 통계가 업데이트되지 않음 | `download-stats.yml` 실행 상태와 통계 JSON의 갱신 시각 확인 |
| 특정 프로그램 설치가 어려움 | 해당 프로그램 저장소의 README 및 Releases에서 지원 OS와 실행 방법 확인 |

## 6. 보안 및 이용 안내

이 사이트는 정적 GitHub Pages이며 **별도의 서버 측 계정/결제 시스템을 제공하지 않습니다.** 관리자 토큰은 브라우저에서 GitHub API 요청에 사용하므로, 신뢰할 수 있는 환경에서만 관리 기능을 사용하세요.

다운로드한 프로그램의 라이선스, 보안 정책 및 사용 제한은 **각 프로그램 저장소의 안내가 우선**합니다. 사이트에 파일이 표시되어도 접근 권한이 없는 비공개 릴리스나 제3자 콘텐츠를 이용할 권한이 자동으로 생기는 것은 아닙니다.
