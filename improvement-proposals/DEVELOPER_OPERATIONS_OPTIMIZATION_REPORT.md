# 6. P-JSL.github.io — 다운로드 포털·관리자·통계

**저장소:** [P-JSL/P-JSL.github.io](https://github.com/P-JSL/P-JSL.github.io)  
**소스 분석 기준:** `main` / [`8b3ac9e473daec0ff304032351452331879c1c0c`](https://github.com/P-JSL/P-JSL.github.io/commit/8b3ac9e473daec0ff304032351452331879c1c0c)  
**보고서 작성일:** 2026-11-11 (KST)  
**대상:** 개발자 · 운영자 · 릴리스 담당자  
**개선 후보:** 4개 (우선순위·수정 위치·구현·검증·원복 기준 포함)  
**상태:** 분석·구현 제안만 작성. 실제 소스 최적화·동적 성능 측정·프로그램 배포는 수행하지 않음.  
> 문서 내 장·절 번호는 원래 6개 저장소 통합 보고서의 번호를 보존한 것입니다. 코드 근거 링크는 작성 시점의 커밋으로 고정했습니다.

## 6.1 실행 구조와 권한 경계

이 저장소는 **정적 GitHub Pages**입니다. 프로그램을 실행하는 웹 서버가 아니라 HTML/JS·JSON 및 파일을 게시합니다. 관리자 화면은 브라우저에서 **GitHub REST API**를 직접 호출해 `site-pages.json`을 커밋합니다. GitHub Actions가 Pages를 배포하고 다운로드 통계 스냅샷을 수집합니다.

```text
index.html / pages/*
  → assets/site-pages.js  → site-pages.json (페이지·블록·다운로드 링크 렌더)
  → assets/download-chart.js → assets/download-stats.json (누적·기간별 스냅샷)

admin/index.html → admin/studio.js (브라우저 메모리의 관리자 토큰)
  → GitHub API GET/PUT /repos/P-JSL/P-JSL.github.io/contents/site-pages.json
  → main 커밋
  → .github/workflows/pages.yml (정적 사이트 빌드·게시)

.github/workflows/download-stats.yml (주기적 실행)
  → .github/scripts/collect_download_stats.py (공개 릴리스 download_count 집계)
  → assets/download-stats.json / downloads/download-counts.json 커밋
  → Pages 재배포
```

[admin/studio.js](https://github.com/P-JSL/P-JSL.github.io/blob/8b3ac9e473daec0ff304032351452331879c1c0c/admin/studio.js#L3)의 `ROOT`·`PAGES`는 수정 대상 저장소와 JSON 경로를 정합니다. [admin/studio.js](https://github.com/P-JSL/P-JSL.github.io/blob/8b3ac9e473daec0ff304032351452331879c1c0c/admin/studio.js#L18)에서 토큰을 입력받고, [admin/studio.js](https://github.com/P-JSL/P-JSL.github.io/blob/8b3ac9e473daec0ff304032351452331879c1c0c/admin/studio.js#L142)의 `save()`에서 최신 SHA를 포함해 PUT으로 변경합니다. **동시에 다른 관리자가 먼저 저장했으면 SHA 충돌로 실패할 수 있어**, 다시 읽고 내용을 비교해야 합니다. 이것은 무조건 덮어쓰지 않게 하는 긍정적인 동작입니다.

관리자 토큰은 JS 변수에만 저장하고 입력 필드에서 제거합니다. 그러나 사용자 브라우저가 손상된 상태까지 격리하는 구현은 아닙니다. GitHub 저장소 권한을 최소화하고 공유 PC 사용을 피해야 합니다. `admin/app.js`, `admin/cms.js` 등 과거 관리자 코드도 저장소에 있지만 현재 `admin/index.html`은 **`admin/studio.js`를 로드**합니다. 과거 코드의 존재만으로 실제 동작에 참여한다고 판단하면 안 됩니다.

## 6.2 데이터·배포 경로

| 파일 / 코드 | 역할 | 운영상 확인 사항 |
|---|---|---|
| [site-pages.json](https://github.com/P-JSL/P-JSL.github.io/blob/8b3ac9e473daec0ff304032351452331879c1c0c/site-pages.json) | 메뉴·메인 블록·다운로드 소스·테마의 운영 데이터 | 리뷰 전 JSON 백업, 데이터 스키마와 링크 유효성 |
| [assets/site-pages.js](https://github.com/P-JSL/P-JSL.github.io/blob/8b3ac9e473daec0ff304032351452331879c1c0c/assets/site-pages.js#L51) | 블록 검증 및 사용자 화면 렌더링 | 타입/슬러그/URL 제약, 스크립트 실행 방지 |
| [assets/site-pages.js](https://github.com/P-JSL/P-JSL.github.io/blob/8b3ac9e473daec0ff304032351452331879c1c0c/assets/site-pages.js#L180) | Release/내부 파일 다운로드 블록 렌더 | 실제 릴리스 파일명·태그 존재 여부 |
| [admin/studio.js](https://github.com/P-JSL/P-JSL.github.io/blob/8b3ac9e473daec0ff304032351452331879c1c0c/admin/studio.js#L156) | 관리자 ZIP 직접 업로드 | **25MiB** 이하, 공개 폴더·SHA·새 커밋 확인 |
| [.github/scripts/prepare_download.py](https://github.com/P-JSL/P-JSL.github.io/blob/8b3ac9e473daec0ff304032351452331879c1c0c/.github/scripts/prepare_download.py#L1) | 다운로드 ZIP 별칭·파일 검증 | 정적 배포가 소스 ZIP과 실행 패키지를 혼동하지 않는지 |
| [.github/workflows/pages.yml](https://github.com/P-JSL/P-JSL.github.io/blob/8b3ac9e473daec0ff304032351452331879c1c0c/.github/workflows/pages.yml#L41) | Pages 배포 전 파일 준비·게시 | 실패 시 Actions의 단계별 로그 |
| [.github/scripts/collect_download_stats.py](https://github.com/P-JSL/P-JSL.github.io/blob/8b3ac9e473daec0ff304032351452331879c1c0c/.github/scripts/collect_download_stats.py#L72) | GitHub Releases의 `assets[].download_count` 집계 | **Pages 내부 직접 다운로드는 집계되지 않음** |
| [assets/download-chart.js](https://github.com/P-JSL/P-JSL.github.io/blob/8b3ac9e473daec0ff304032351452331879c1c0c/assets/download-chart.js#L175) | 스냅샷 읽기·그래프 생성 | JSON 스키마·날짜·결측과 0을 구분 |
| [rust-lab/app.js](https://github.com/P-JSL/P-JSL.github.io/blob/8b3ac9e473daec0ff304032351452331879c1c0c/rust-lab/app.js#L12) | Rust 학습 페이지의 완료/임시답 저장 | `localStorage`에 저장되는 브라우저별 학습 상태 |

### 사이트 설정에서 확인된 정합성 문제

1. **웹소설 번역기 표기:** [site-pages.json](https://github.com/P-JSL/P-JSL.github.io/blob/8b3ac9e473daec0ff304032351452331879c1c0c/site-pages.json)의 `tools-novel-rust` 블록에는 `Windows x86` 안내와 `SyousetuTranslate-Web-Windows-x86.zip` 기본 파일명이 남아 있습니다. 반면 최신 정식 배포 자산은 **`SyousetuTranslate-Web-v0.3.5-Windows-x64.zip`**입니다. 렌더러가 최신 Release에서 접두사에 맞는 파일을 검색하더라도 **표시 문구는 여전히 부정확**합니다. 안내/기본 파일명과 검색 필터를 x64 기준으로 갱신한 후 사이트에서 실제 링크를 확인하세요.
2. **통계 수집 주기:** [.github/workflows/download-stats.yml](https://github.com/P-JSL/P-JSL.github.io/blob/8b3ac9e473daec0ff304032351452331879c1c0c/.github/workflows/download-stats.yml)은 `17 2 * * *`로 **하루 한 번 02:17 UTC**에 예약됩니다. [.github/scripts/collect_download_stats.py](https://github.com/P-JSL/P-JSL.github.io/blob/8b3ac9e473daec0ff304032351452331879c1c0c/.github/scripts/collect_download_stats.py#L202)가 생성하는 보조 메타데이터에는 **하루 네 번(four times per day)**이라고 기록하는 문구가 있습니다. 사용자에게 보여주는 주기와 실제 스케줄을 동일하게 맞춰야 합니다.
3. **학습 자료 버전:** [rust-lab/app.js](https://github.com/P-JSL/P-JSL.github.io/blob/8b3ac9e473daec0ff304032351452331879c1c0c/rust-lab/app.js#L27)의 시작 화면에는 `v0.2.4`가 원본 코드 기준으로 고정되어 있습니다. `gacha_pickup_calculator`의 최신 릴리스 v1.0.18과 **같은 의미의 버전이라고 오해되지 않도록** 학습 기준 소스 커밋·발행일을 병기하는 편이 좋습니다.

## 6.3 운영자 변경·배포 표준 절차

1. **변경 전:** 현재 공개 사이트에서 메뉴/다운로드/통계를 캡처 또는 기록하고 `site-pages.json`을 백업합니다. 브랜치와 다른 작업의 진행 상태를 확인합니다.
2. **권한:** GitHub Fine-grained PAT를 사이트 저장소 하나로 한정하고 **Contents read/write**만 허용합니다. 토큰을 이슈, 스크린샷, 소스, 로그에 남기지 않습니다.
3. **편집:** 관리자 UI에서 메뉴와 블록 수정 → 미리보기 → 저장. 저장은 `site-pages.json`에 실제 커밋됩니다. 동시 수정 충돌 시 수동으로 비교·병합합니다.
4. **파일:** 내부 ZIP 직접 업로드는 **25MiB 이하**. 대형 Windows 배포판은 각 프로그램의 Release로 게시하고 `releaseRepo`, `releaseTag`, `filename` 또는 `assetPrefix`를 확인합니다.
5. **배포:** [.github/workflows/pages.yml](https://github.com/P-JSL/P-JSL.github.io/blob/8b3ac9e473daec0ff304032351452331879c1c0c/.github/workflows/pages.yml)의 결과와 게시된 URL을 확인합니다. 홈페이지 문구뿐 아니라 **실제 ZIP 다운로드 링크와 SHA-256**이 맞는지 점검합니다.
6. **통계:** 예약 작업의 성공, `assets/download-stats.json`의 갱신 시각, 집계 범위, 이전 스냅샷과 급격한 변화(릴리스 파일 교체)를 확인합니다.
7. **롤백:** 문제 커밋에서 `site-pages.json`의 이전 정상 버전만 복원하고 다시 배포합니다. **다운로드 파일·통계 이력까지 무조건 초기화하지 않습니다.**

### 배포 실패 분류

| 증상 | 첫 확인 | 중단 조건 |
|---|---|---|
| 관리자 인증 401/403 | 토큰 만료, 선택 저장소, Contents 범위 | 권한을 늘리기 전에 요청 경로와 저장소 확인 |
| 저장 409/422 | 최신 SHA, JSON 스키마·동시 변경 | 다른 사람 변경을 덮어쓰지 말고 충돌 조정 |
| Pages 게시 실패 | Pages Actions, ZIP 별칭 준비, 파일 존재 | 잘못된 파일명으로 가짜 최신 링크 노출 금지 |
| 다운로드 404 | Release 태그·자산 파일명·공개 여부 | 사용자가 클릭 가능한 연결을 검증할 때까지 비활성화 유지 |
| 통계가 0/결측 | 수집 JSON, GitHub API 제한, 집계 대상 | 미측정 `null`을 0으로 간주하지 않기 |

### 개발자 권장 검사

정적 페이지 개발 시 JSON 파서/렌더러에 **잘못된 블록 타입, 외부 URL, 긴 문자열, 예약 슬러그, 잘못된 Release 응답, GitHub API 403/404/429, 동시 PUT 충돌**을 넣어 회귀 테스트합니다. 통계 수집기에는 **누적 카운트 감소(자산 삭제·재게시), 새 릴리스, API 지연, 결측** 시나리오를 추가합니다. 이번 조사에서 브라우저 실기·Actions를 실행하지 않았습니다.

---

## 6.4 프런트엔드·GitHub API·배포 효율 최적화 (추가)

**성능 성격:** 정적 페이지 초기 로딩·DOM 갱신·GitHub API 호출·Actions 갱신 지연. **LLM 모델 실행은 없습니다.** AI 모델 양자화/추론 최적화는 해당하지 않습니다.

### 6.4.1 기존 구조에서 확인된 효율화

- 서버 애플리케이션 없이 GitHub Pages 정적 HTML/JS와 공개 릴리스 API로 동작합니다. 서버 운영·DB 비용은 없지만 **GitHub API 의존성·요청 제한·네트워크 시간**이 남습니다.
- 공개 화면은 [assets/site-pages.js](https://github.com/P-JSL/P-JSL.github.io/blob/8b3ac9e473daec0ff304032351452331879c1c0c/assets/site-pages.js#L104)에서 페이지·블록의 유효성을 검사하며 DOM 노드를 생성하는 방식으로 콘텐츠를 출력합니다. 임의 사용자 HTML을 그대로 삽입하는 일반 CMS와는 경계가 다릅니다.
- [assets/download-chart.js](https://github.com/P-JSL/P-JSL.github.io/blob/8b3ac9e473daec0ff304032351452331879c1c0c/assets/download-chart.js#L175)는 통계를 별도 JSON에서 로딩하며 `statsMounted` 플래그로 중복 초기화를 제한합니다.
- 통계 집계는 [download-stats.yml](https://github.com/P-JSL/P-JSL.github.io/blob/8b3ac9e473daec0ff304032351452331879c1c0c/.github/workflows/download-stats.yml#L1)과 [collect_download_stats.py](https://github.com/P-JSL/P-JSL.github.io/blob/8b3ac9e473daec0ff304032351452331879c1c0c/.github/scripts/collect_download_stats.py#L72)가 방문자 클릭마다 쓰기를 수행하지 않고 정해진 주기에 스냅샷을 만드는 구조입니다.

### 6.4.2 개선 후보

| ID/우선 | 근거와 실제 비용 | 권장 조치 / 변경 제한 |
|---|---|---|
| **P-P1** | `download` 블록의 `releaseTag=latest`·`assetPrefix` 경로는 [site-pages.js L180-L231](https://github.com/P-JSL/P-JSL.github.io/blob/8b3ac9e473daec0ff304032351452331879c1c0c/assets/site-pages.js#L180)에서 **블록마다** `releases/latest` API를 조회합니다. 같은 저장소의 Go/Rust 두 블록 등은 중복 요청할 수 있습니다. | 같은 저장소를 키로 한 **인플라이트 Promise/결과 캐시** 또는 Actions가 생성하는 `release-manifest.json` 1개로 공용화 검토. `latest`의 최신성·오류·프리릴리스 제외·자산 prefix 선택 의미를 유지해야 합니다. |
| **P-P1** | [admin/studio.js L83](https://github.com/P-JSL/P-JSL.github.io/blob/8b3ac9e473daec0ff304032351452331879c1c0c/admin/studio.js#L83)에서 블록 텍스트를 입력할 때 `renderPreview()`와 `renderCanvas()`를 모두 호출합니다. 블록이 많을수록 입력마다 DOM 재구성 비용이 발생할 수 있습니다. | 현재 편집 블록만 수정하거나 `requestAnimationFrame` 단위로 한 번만 렌더링하도록 통합. **저장되지 않은 변경, undo/redo, 선택 위치, 키보드 접근성**을 그대로 보존. |
| **P-P2** | [site-pages.js L415](https://github.com/P-JSL/P-JSL.github.io/blob/8b3ac9e473daec0ff304032351452331879c1c0c/assets/site-pages.js#L415)와 [L373](https://github.com/P-JSL/P-JSL.github.io/blob/8b3ac9e473daec0ff304032351452331879c1c0c/assets/site-pages.js#L373)에서 페이지 구성 데이터가 fetch됩니다. 화면별 경로에서 중복 다운로드 여부는 실제 네트워크 타임라인 확인이 필요합니다. | HTTP 캐시 헤더·ETag 또는 방문 세션 내 캐시 검토. 관리자가 공개한 페이지 변경이 과도하게 지연되지 않도록 만료 조건 설계. |
| **P-P2** | [collect_download_stats.py L72-L99](https://github.com/P-JSL/P-JSL.github.io/blob/8b3ac9e473daec0ff304032351452331879c1c0c/.github/scripts/collect_download_stats.py#L72)는 공개 Release 목록을 페이지별로 조회하고 전체 정식 릴리스 자산 다운로드를 합산합니다. 릴리스 수가 커질수록 API 호출이 늘어납니다. | 변경이 없는 저장소는 조건부 HTTP 캐시/스냅샷 재사용을 검토하되 **전체 누적 download_count 정합성**을 잃지 않도록 설계. 통계 기준 시각과 API 오류 시 stale 표시. |
| **P-P2** | [download-stats.yml](https://github.com/P-JSL/P-JSL.github.io/blob/8b3ac9e473daec0ff304032351452331879c1c0c/.github/workflows/download-stats.yml#L10)은 **하루 한 번** 예약인데, [collect_download_stats.py L205-L207](https://github.com/P-JSL/P-JSL.github.io/blob/8b3ac9e473daec0ff304032351452331879c1c0c/.github/scripts/collect_download_stats.py#L205)는 **하루 4회** 문구를 기록합니다. | 먼저 주기 문구를 실제 예약과 일치시키고 수집 `captured_at`을 화면에서 확인. 주기를 높이면 API 요청·Actions 사용량이 늘어나므로 운영 비용 정책을 먼저 확인. |
| **P-P3** | [prepare_download.py](https://github.com/P-JSL/P-JSL.github.io/blob/8b3ac9e473daec0ff304032351452331879c1c0c/.github/scripts/prepare_download.py#L75)는 ZIP 자산에 SHA-256 검증을 적용합니다. | 배포 때 큰 ZIP을 반복 다운로드/해시하는 비용을 캐시하면 빠를 수 있으나 **원본 자산명·크기·실제 해시가 바뀐 경우 캐시 무효화**가 필수입니다. |
| **P-P3** | `rust-lab/app.js`의 학습용 정적 자료에 고정 버전 표시가 있습니다. [rust-lab/app.js L27](https://github.com/P-JSL/P-JSL.github.io/blob/8b3ac9e473daec0ff304032351452331879c1c0c/rust-lab/app.js#L27) | 성능보다 문서 정확성: 앱 최신 버전과 학습 자료의 '고정 교육 기준 커밋'을 분리하여 혼동을 없앱니다. |

### 6.4.3 운영자 점검·성능 검증

1. Chrome DevTools **Network**에서 첫 페이지 로드, 같은 저장소의 반복 Release 조회 수, `site-pages.json`/통계 JSON 전송량, `DOMContentLoaded`, `LCP`, API `403/429`를 기록합니다. 모바일 저속 네트워크 및 캐시 없음/재방문 각각 시험합니다.
2. 관리자에서 10/30/60개 블록을 만들고 긴 한국어 텍스트를 입력해 **입력 이벤트 → 화면 반영 시간(p95)**, 저장/실행취소/미리보기의 UI 상태 일치 여부를 측정합니다.
3. 다운로드 링크는 실제 릴리스 자산으로 **끝까지 연결되는지**, `draft/prerelease` 제외와 릴리스 이름 변경 시 오류 표시가 정상인지 확인합니다.
4. 통계는 동일 날짜 중 여러 번 실행해도 **중복 누적되지 않는지**, 릴리스 자산 삭제·교체 시 음수 추이를 다운로드 횟수 감소라고 오표기하지 않는지 확인합니다.
5. [Pages Actions](https://github.com/P-JSL/P-JSL.github.io/actions)에서 빌드/업로드/배포 단계 시간을 별도 수집합니다. 최적화와 무관한 대기시간을 JS 코드 개선 효과로 주장하지 않습니다.

**수용 조건:** DOM 입력·디자인 편집·GitHub 커밋/배포의 기존 결과 유지, 토큰이 브라우저 저장소/콘솔·정적 자산으로 유출되지 않음, 오래된 릴리스 링크 미배포, 시각적 회귀 없음. **운영 우선 조치:** 중복 릴리스 API 요청 및 통계 주기 불일치는 구현·설정 비교상 명확한 검토 대상입니다.

## 6.5 다운로드 포털: API·DOM·배포 개선 구현안 (추가)

### IMP-P01 · 동일 Release API 요청 합치기 (P1)

- **위치:** `assets/site-pages.js`의 `latest` 다운로드 블록 렌더링 분기. [근거 L180-L231](https://github.com/P-JSL/P-JSL.github.io/blob/8b3ac9e473daec0ff304032351452331879c1c0c/assets/site-pages.js#L180).
- **원인:** 현재 파일별 블록이 각자 `GET /repos/{owner}/{repo}/releases/latest`를 호출하면 같은 저장소의 여러 다운로드 항목에서 API·네트워크 작업이 중복됩니다.
- **구현:** ① 블록별 `releaseRepo`/`releaseTag`를 정규화하고 `repo + tag`를 동일 요청의 키로 사용합니다. ② 페이지 렌더 스코프에 `Map<string, Promise<ReleaseResult>>`를 두고, 최초 호출만 `fetch`합니다. ③ 여러 블록은 **같은 Promise 결과**에서 각자의 `assetPrefix`/정확한 파일명을 독립 선택합니다. ④ 요청 실패 시 캐시 항목을 제거해 재시도할 수 있게 하고, 새로고침·페이지 재진입 시 최신성 정책을 적용합니다. ⑤ 실제 릴리스 자산이 없는 경우 기존 오류/비활성 안내를 유지합니다.
- **개념 예시(실제 함수명·키/인증 구조 확인 후 적용):**

```js
const pending = new Map();
function sharedRelease(key, fetchRelease) {
  if (!pending.has(key)) {
    const work = fetchRelease().catch(error => { pending.delete(key); throw error; });
    pending.set(key, work);
  }
  return pending.get(key);
}
```

- **주의:** `latest`와 특정 태그, 공개/권한 있는 API 응답을 **절대 같은 캐시 키로 혼합하지 않습니다**. API 요청 수 감소를 `DevTools Network`로 입증하고, 같은 저장소에서 서로 다른 asset prefix를 가진 두 블록이 올바르게 분기되는지 테스트합니다.

### IMP-P02 · 관리자 텍스트 입력 시 프레임당 렌더 1회 (P1)

- **위치:** `admin/studio.js`의 텍스트 입력 핸들러 및 `renderPreview()`/`renderCanvas()`. [근거 L83](https://github.com/P-JSL/P-JSL.github.io/blob/8b3ac9e473daec0ff304032351452331879c1c0c/admin/studio.js#L83).
- **구현:** ① 모델 상태 업데이트(문자 입력)를 **동기**로 처리하고, 실제 DOM 갱신은 `requestAnimationFrame()`에서 1회 실행하도록 예약 상태를 둡니다. ② 매 입력 전체 캔버스를 초기화하기보다는 선택된 블록의 미리보기/텍스트 노드만 갱신할 수 있는지 확인합니다. ③ 드래그/undo/redo/페이지 전환은 전체 렌더가 필요하므로 **부분 갱신과 전체 갱신을 구분**합니다. ④ `compositionstart/compositionend`를 포함한 한국어 IME 입력 중 커서·선택 범위를 보존합니다.
- **검증:** 관리자 블록 10/30/60/100개, 50~200자 한글을 빠르게 입력하고 `input → next paint p95`, 화면의 글자/포커스 손실, 초당 DOM 삭제·생성 노드 수를 비교합니다. 저장 전 변경 표시, GitHub 저장 후 동일 JSON, undo/redo 스냅샷과 HTML 이스케이프를 확인합니다.

### IMP-P03 · Release 통계 API 호출 줄이되 집계 정확성 유지 (P2)

- **위치:** `.github/scripts/collect_download_stats.py`, `.github/workflows/download-stats.yml`, `assets/download-chart.js`. [수집 근거 L72-L99](https://github.com/P-JSL/P-JSL.github.io/blob/8b3ac9e473daec0ff304032351452331879c1c0c/.github/scripts/collect_download_stats.py#L72), [예약 근거](https://github.com/P-JSL/P-JSL.github.io/blob/8b3ac9e473daec0ff304032351452331879c1c0c/.github/workflows/download-stats.yml#L10).
- **우선 P0 문서 정합성:** Actions의 실제 예약은 **하루 1회**인데 JSON 설명 문구에 **하루 4회**가 기재되는 부분을 먼저 바로잡습니다. 이 조치는 **성능 개선이 아니라 운영 정보의 정확성 개선**입니다.
- **성능 개선:** ① API 응답 상태/호출 횟수/페이지 수/갱신 시각을 기록합니다. ② GitHub의 `ETag`/조건부 GET을 이용한 304 응답을 검토하고, 직전 스냅샷을 **동일한 대상 저장소·기존 집계 스키마**에서만 재사용합니다. ③ 자산 삭제·릴리스 신규 추가·Release 비공개 전환 등 변경 시 안전하게 전체 재조회합니다. ④ 부분 실패 시 `captured_at`을 최신이라고 거짓 표시하지 말고 stale/failed 상태를 구분합니다.
- **중요한 금지:** 전체 릴리스의 `download_count` 누적을 최신 1개 릴리스만 조회하도록 바꾸면 집계 의미가 달라집니다. API 호출 비용만 줄이면서 동일 누적 수치를 보존하는 것이 목표입니다.

### IMP-P04 · 사이트 구성 JSON과 페이지 전환 최적화 (P2)

- **위치:** `assets/site-pages.js`, 정적 `site-pages.json`, `.github/scripts/prepare_download.py`.
- **방법:** 동일 페이지 이동 동안 동일 구성 JSON을 반복 fetch하는지를 Network으로 확인한 후에만 세션 단위 **in-flight 캐시** 도입. 정적 배포 변경 사항이 즉시 나타나야 하므로 브라우저 영구 캐시는 사용하지 않고 `visibilitychange`/새로고침에서 무효화 정책을 명시합니다. 큰 ZIP의 SHA 검증은 **안전성 요구사항**이므로 건너뛰지 않으며, 캐시를 쓴다면 `(asset id, size, SHA256)`이 모두 일치할 때만 재사용합니다.
- **검증:** cold/warm 방문, 모바일 낮은 대역폭, API 실패/403/429, draft/prerelease, 동일 prefix를 가진 자산 둘 이상, 관리자가 설정 변경한 직후/다시 방문한 화면. 정확한 최신 자산을 못 찾으면 **이전 자산을 정상 최신으로 위장하지 않는** 경로가 필요합니다.

### 포털 적용·원복 순서

1. 브라우저 Network와 Performance 측정만 먼저 수행합니다. GitHub API 호출 수/초기 페이지 표시 시간/LCP/관리자 입력 p95를 기록합니다.
2. **Release Promise 공유만 독립 커밋** → 다운로드 링크/같은 저장소 복수 블록/에러 폴백 검증.
3. **관리자 부분 렌더만 독립 커밋** → 텍스트 편집, 한글 IME, undo/redo, GitHub 커밋 재현.
4. 통계 주기 설명 정정 → 조건부 GET·스냅샷 캐시는 별도 적용 → 하루 1회 배포 결과 확인.
5. 문제가 있으면 해당 커밋만 되돌려 정적 사이트를 다시 배포합니다. 관리자 저장 내용(`site-pages.json`)을 덮어쓰는 원복은 금지.

**수용 조건:** 원래 페이지 블록/다운로드 URL/관리자 JSON이 동일하고, 토큰이 브라우저 저장소나 공개 JS에 남지 않으며, 수치로 입증 가능한 API 호출·렌더 감소가 있어야 합니다.


## 6.6 추가 보완 과제 — 게시 계약·통계 신선도·관리자 변경 안전성 (2026-11-11)

기존 IMP-P01~P04는 API·DOM 호출 비용 중심입니다. 실제 운영 품질을 위해 **잘못된 다운로드 안내 자동 탐지**, **통계 수치의 신선도 표현**, **동시 수정 충돌 복구 절차**를 독립 관리합니다.

### IMP-P05 · 구성 JSON의 Release 자산 정합성 CI 도입 (P1 운영)

- **확인 근거:** [site-pages.json](https://github.com/P-JSL/P-JSL.github.io/blob/8b3ac9e473daec0ff304032351452331879c1c0c/site-pages.json)의 tools-novel-rust 블록은 Windows x86 및 SyousetuTranslate-Web-Windows-x86.zip을 안내하지만, 분석 시 확인된 실제 정식 릴리스는 Windows x64 자산이었습니다. 최신 자산 prefix 해석은 [assets/site-pages.js L180-L200](https://github.com/P-JSL/P-JSL.github.io/blob/8b3ac9e473daec0ff304032351452331879c1c0c/assets/site-pages.js#L180-L200)에 구현되어 있어 단순 다운로드 실패와 **표시 메타데이터 오류**를 구분해야 합니다.
- **개선 절차:** ① site-pages.json의 releaseRepo·releaseTag·filename·assetPrefix를 읽는 read-only 검사 스크립트를 설계합니다. ② GitHub Releases API에서 정확히 1개의 최신 업로드 ZIP/EXE가 매칭되는지, 표시 architecture(x86/x64)와 파일명이 일치하는지 확인합니다. ③ API 403/429/일시 실패는 불일치 확정이 아닌 재검증 필요 상태로 처리합니다. ④ JSON 실제 수정은 보고서 변경과 별개 PR에서 진행합니다.
- **검증/원복:** [pages.yml L38-L43](https://github.com/P-JSL/P-JSL.github.io/blob/8b3ac9e473daec0ff304032351452331879c1c0c/.github/workflows/pages.yml#L38-L43)의 기존 Rust Lab 검사와 다운로드 ZIP 준비가 계속 성공해야 하며, Release가 아직 없는 제품은 명시된 미게시 상태로 표시합니다.

### IMP-P06 · 통계 스냅샷 마지막 갱신 시각과 집계 범위를 명시 (P2)

- **확인 근거:** [download-stats.yml L11-L13](https://github.com/P-JSL/P-JSL.github.io/blob/8b3ac9e473daec0ff304032351452331879c1c0c/.github/workflows/download-stats.yml#L11-L13)은 하루 1회 예약입니다. [collect_download_stats.py L102-L119, L145-L175](https://github.com/P-JSL/P-JSL.github.io/blob/8b3ac9e473daec0ff304032351452331879c1c0c/.github/scripts/collect_download_stats.py#L102-L119)는 누적 Release 자산 다운로드 수를 집계하고 실패 시 유효했던 일별 값을 보존합니다.
- **개선 절차:** 통계 화면에 **집계 출처: GitHub Releases**, 마지막 성공 스냅샷 시각, 일시 실패/미게시 상태 및 Pages /downloads 직링크가 포함되지 않는다는 설명을 동시에 노출합니다. 기준 시간은 스냅샷 원문 필드를 사용하고, 파일 수정 시간이나 브라우저 시각을 임의의 최종 성공 시각으로 사용하지 않습니다.
- **수용 조건:** API 장애/Actions 지연/미게시/캐시 상태에서 오래된 숫자를 실시간 수치처럼 표시하지 않으며, 24시간 이상 갱신 실패 시 운영자가 Actions와 최근 커밋을 확인하도록 합니다. 추가 API 실시간 폴링으로 무료 API 한도를 소모하지 않습니다.

### IMP-P07 · 관리자 덮어쓰기·동시 편집·대용량 ZIP 실패 리허설 (P2)

- **확인 근거:** [admin/studio.js L142-L167](https://github.com/P-JSL/P-JSL.github.io/blob/8b3ac9e473daec0ff304032351452331879c1c0c/admin/studio.js#L142-L167)는 site-pages.json의 SHA를 PUT에 넣어 경쟁 수정을 감지하며, ZIP 25 MiB 제한과 파일별 SHA를 사용합니다.
- **개선 절차:** 두 브라우저가 동시에 다른 블록을 편집하여 순차 저장할 때 두 번째 요청의 충돌 및 사용자 메시지를 검증합니다. 관리자가 재로그인·새로고침 후 변경 사항을 비교·재적용하는 절차를 문서화하고, 만료 토큰·403·409/422·네트워크 중단·업로드 25 MiB 경계를 테스트합니다. 충돌을 피하려고 최신 SHA만 새로 받아 **무조건 덮어쓰는 자동 재시도는 금지**합니다.
- **수용 조건:** 기존 메뉴·다운로드 링크·토큰 비저장 특성 유지, 분기 충돌 시 변경 소실 없음, ZIP 실패 후 불완전한 다운로드 별칭이 게시되지 않음.

## 6.7 정적 웹·GitHub API·DOM의 추가 속도 개선 여력 — 2단계 반복 검토 (2026-11-11)

### 추가 개선 후보 (정적 사이트 범위)

| 단계 | 실제 근거 | 적용 가능한 속도 최적화 | 현재 개선량 |
|---|---|---|---|
| 최신 Release 검색 | [assets/site-pages.js L180-L223](https://github.com/P-JSL/P-JSL.github.io/blob/8b3ac9e473daec0ff304032351452331879c1c0c/assets/site-pages.js#L180-L223) | 동일 저장소·동일 태그에 대한 동시 fetch를 **in-flight Promise 하나**로 공유, 403/404/429 실패·갱신 캐시 무효화 분리 | 동일 요청 3개를 하나로 합치면 호출 수만 **3→1**, 전체 페이지가 3배 빨라진다는 뜻 아님 |
| 페이지 데이터 | [assets/site-pages.js L374-L423](https://github.com/P-JSL/P-JSL.github.io/blob/8b3ac9e473daec0ff304032351452331879c1c0c/assets/site-pages.js#L374-L423) | 현재 lifecycle에서 동일 JSON 중복 fetch가 발생할 때만 공유·재파싱 제거 | 첫 방문의 네트워크 RTT·전송시간은 제거 불가 |
| 관리자 입력 | [admin/studio.js L59-L85](https://github.com/P-JSL/P-JSL.github.io/blob/8b3ac9e473daec0ff304032351452331879c1c0c/admin/studio.js#L59-L85) | 매 문자 입력 전체 canvas/preview replaceChildren 대신 변경된 블록을 선택적으로 렌더, frame당 1회로 묶기 | 블록 수 B가 클 때 전체 O(B) DOM 재생성 → 일정 크기 블록의 O(1) 갱신 가능; B≤60, 실제 절감 ms 미측정 |
| 차트 갱신 | [assets/download-chart.js L180-L244](https://github.com/P-JSL/P-JSL.github.io/blob/8b3ac9e473daec0ff304032351452331879c1c0c/assets/download-chart.js#L180-L244) | 동일 snapshot에 대한 반복 geometry/DOM 구성 회피 | 차트가 초기 critical path 밖이면 페이지 LCP 개선 거의 없음 |
| Actions 통계 | [.github/scripts/collect_download_stats.py](https://github.com/P-JSL/P-JSL.github.io/blob/8b3ac9e473daec0ff304032351452331879c1c0c/.github/scripts/collect_download_stats.py) | 이미 저장소별 Release 조회 공유 구현; conditional GET를 적용하기 전 호출/바이트 절감 실측 | CI 통계 시간과 방문자의 페이지 로드 시간은 다른 지표 |

**한계:** URL·정적 JSON 필수 다운로드는 **최소 1회 RTT + B/네트워크 대역폭**의 시간 하한이 있습니다. React로 옮기거나 Web Worker를 도입하는 것 자체는 추가 가속의 근거가 없습니다. Release URL이 바뀌는 동안 캐시가 오래된 ZIP을 최신처럼 표시하면 성능보다 정확성이 훼손됩니다.

**실험:** Chrome Network/Performance에서 cold/warm 5회, 4x CPU throttle, 모바일 대역폭, 관리 블록 1/20/60개 × 키 입력 100회. 측정값은 API 요청 수, 초기 표시/LCP, render long task, input p95, JS heap, DOM nodes를 별도로 기록합니다. **현행 대비 추가 성능 향상 배수: 미측정**.

### 논문·수학 모델에 따른 추가 개선 상한

**Amdahl:** 전체 기존 시간 중 최적화할 단계 비율 f, 해당 단계 가속 r이면 전체 S=1/(1−f+f/r). 가령 f=0.10/r=4 → S=1.081배(전체 시간 7.5% 단축), f=0.50/r=4 → 1.600배(37.5% 단축), f=0.80/r=4 → 2.500배(60% 단축). **위 수치는 측정 결과도 개선 약속도 아닌 계산 예시**입니다. 실측 f가 없으면 저장소 전체의 추가 가능 배수는 제시할 수 없습니다. 여러 단계 국소 개선 배수를 곱하면 안 됩니다.

**Roofline:** CPU 작업량뿐 아니라 메모리/디스크/네트워크 트래픽이 병목일 수 있습니다. **Little:** 안정된 작업계에서 동시 작업수 L=요청 도착률 λ×평균 체류시간 W이며, 작업자 수의 무조건적인 증가는 RAM·대기열과 p95를 악화시킬 수 있습니다. 최소 5회 동일 입력·동일 장비에서 E2E wall time·단계별 CPU·peak RSS·읽기/쓰기 bytes·처리량·p50/p95를 모두 관측합니다. 벤치마크 기록이 없는 개선률은 **미측정**입니다.

검증된 1차 문헌: [Amdahl (1967)](https://doi.org/10.1145/1465482.1465560), [Roofline (2009)](https://zenodo.org/records/1236156), [Little (1961)](https://doi.org/10.1287/opre.9.3.383), [Dean & Barroso (2013), The Tail at Scale](https://research.google/pubs/the-tail-at-scale/), [Google Benchmark Guide](https://google.github.io/benchmark/user_guide.html). 논문에 기재된 **다른 시스템의 가속 배수**는 이 프로그램에서 실현 가능한 개선치로 옮겨 적지 않습니다.

### 재검토 방법과 수행 범위

**1차 100회**는 기존 코드/벤치마크 기반 후보·명령·향상률 주장·복잡도 경계를 다른 입력 크기·작업자 수·병목 구성 조건으로 반복 검산한 **정적·수치 검토**입니다. **2차 100회**는 1차 문헌을 반영해 Amdahl, Roofline, Little 및 동일 성능 단위 기준을 서로 다른 모형 파라미터로 교차 검산한 **학술·수학적 정합성 검토**입니다. 이는 각 문서에 별도로 시행한 100+100 반복 라운드입니다. **200번의 독립적인 전 코드 정독, 실기 벤치마크 200회, 논문 전체 실험 재현을 의미하지 않습니다.** 실제 추가 개선율은 코드 수정 전후의 재현 가능한 성능 시험 없이는 확정할 수 없습니다.
