# P-JSL.github.io — Codex 실행용 개선 작업서

> 기준 코드: [`6e5276173068`](https://github.com/P-JSL/P-JSL.github.io/tree/6e5276173068132adb8ec667dc0079cf33b4d82e) · 보고서 정리: **2026-11-12(KST)**  
> 상태: **개선 설계/미구현**. 이 보고서 갱신은 실제 애플리케이션 수정이나 테스트 통과를 뜻하지 않습니다.  
> 범위: GitHub Pages 다운로드 포털·관리자·Release 통계

## 1. Codex 작업 운영 규칙

1. 우선순위 표에서 ID 한 개를 선택합니다. **항상 현재 브랜치의 최신 소스와 테스트를 먼저 열어** 실행 방식·기존 방어장치를 확인합니다. 아래 기준 커밋은 분석 기준이지 수정 대상 버전을 고정하는 지시가 아닙니다.
2. 현재 공개 API·파일 형식·관리자 동작·권한 모델·데이터 정합성을 유지합니다. 새로운 메서드·라이브러리·옵션이 필요하면 실제 의존성을 확인한 후 작성합니다.
3. **이미 구현**, **제안**, **확인된 불일치**를 엄격히 구분합니다. 확인된 불일치도 코드 수정 후 테스트하지 않았다면 계속 미해결입니다.
4. 변경 전 실패를 재현하는 테스트 또는 프로파일을 먼저 만들고, 최소 수정→회귀 검증→관련 소스만 커밋합니다. 네트워크/인증/데이터 삭제를 수반하는 실험은 승인된 테스트 환경에서만 수행합니다.
5. Codex 작업 완료 보고는 변경 파일, 기존/수정 동작, 수행한 명령과 결과, 미실행 테스트, 잔존 위험, 커밋 SHA를 포함해야 합니다. 요청하지 않은 릴리스/배포는 하지 않습니다.

## 2. 실제 구조 및 절대 유지할 계약

정적 웹페이지가 `site-pages.json`의 메뉴/다운로드 정보를 렌더링하고, 관리자는 브라우저 GitHub REST API로 설정을 저장합니다. 예약 GitHub Actions가 Release 자산의 다운로드 수를 스냅샷으로 집계합니다.

- 방문자 페이지는 정적 호스팅이며 독립 DB나 서버 최적화 대상을 가정하지 않습니다.
- 관리자 토큰은 브라우저 세션 내에서만 사용하고 저장하지 않으며, GitHub 콘텐츠 SHA 기반 동시 저장 충돌 검사를 유지합니다.
- Release 자산 `download_count`와 Pages `/downloads/` 직접 전송량은 다릅니다. 집계 불가(null)를 0으로 표기하지 않습니다.
- GitHub API 403/429/404 또는 미게시 상태를 정상 다운로드 가능으로 표시하지 않고, 최신 릴리스 식별을 정확하게 수행합니다.
- 관리자 UI의 블록/selector/IME 입력/키보드 포커스, 정적 페이지 링크/JSON 형식을 가능한 한 유지합니다.

## 3. 코드·다른 저장소 교차 확인 결과

- **확인된 불일치(P0):** `site-pages.json`의 번역기 메뉴는 Windows x86 및 x86 ZIP을 안내하지만 `Syousetu_Translate` 최신 `v0.3.5` 정식 Release는 `SyousetuTranslate-Web-v0.3.5-Windows-x64.zip`입니다.
- **확인된 불일치(P0):** `.github/workflows/download-stats.yml`의 `17 2 * * *`은 하루 1회(02:17 UTC)인데 `.github/scripts/collect_download_stats.py`는 'four times per day' 문구를 기록합니다.
- **기존 안전장치:** 관리자 저장 요청은 SHA를 포함하며 실패 시 사용자에게 재조회 안내를 표시합니다. 그러나 동시 편집 모든 경우의 무손실성이 테스트로 증명된 것은 아닙니다.

## 4. 우선순위 및 작업 목록

| ID | 우선 | 작업명 | 확인 상태 |
|---|---|---|---|
| P-01 | P0 | 번역기 Windows 다운로드 안내를 x64로 정합화 | 실제 두 저장소 교차 확인 |
| P-02 | P0 | 통계 수집 주기 메타데이터 정정 | 실제 workflow와 문자열 불일치 |
| P-03 | P1 | Release 다운로드 설정 자동 정합성 검사 | 신규 read-only CI 검사 |
| P-04 | P1 | 관리자 동시 저장 충돌과 편집 복원 검증 | 기존 SHA 검사 보호 확장 |
| P-05 | P1 | 관리자 PAT·ZIP 업로드 경계 검증 | 기존 권한 범위에 대한 실험 |
| P-06 | P1 | 통계의 마지막 성공 시각과 수집 범위 명시 | 현재 값의 의미 보존 |
| P-07 | P2 | 동일 Release API 요청의 중복 호출 공유 | 병목 계측 후 |
| P-08 | P2 | 관리자 입력별 전체 DOM 재구성 축소 | 실제 화면 지연 계측 후 |
| P-09 | P2 | 페이지 JSON 및 차트 재표시 비용 분리 | 데이터 갱신 정책 유지 |
| P-10 | P2 | 키보드 접근성 및 링크 상태 점검 | WCAG 관련 사용자 시험 |

**P0**는 우선 정합성을 바로잡을 영역, **P1**은 회귀·운영 품질, **P2**는 실측 후 채택할 최적화/사용성입니다. 모든 P0가 실제 보안 사고를 의미하지는 않습니다.

## 5. Codex 상세 실행 지시

### P-01 · 번역기 Windows 다운로드 안내를 x64로 정합화 (P0)

- **판정:** 실제 두 저장소 교차 확인
- **확인·수정 대상:** [`site-pages.json`](https://github.com/P-JSL/P-JSL.github.io/blob/6e5276173068132adb8ec667dc0079cf33b4d82e/site-pages.json), [`assets/site-pages.js`](https://github.com/P-JSL/P-JSL.github.io/blob/6e5276173068132adb8ec667dc0079cf33b4d82e/assets/site-pages.js)
- **작업 내용:** `tools-novel-rust`의 표시 플랫폼과 기본 ZIP 파일명을 x64로 수정합니다. `releaseTag=latest` + `assetPrefix` 로직에서 실제 `v0.3.5` 자산 하나만 선택되는지 확인합니다. 릴리스 파일명이 버전별로 변하는 경우도 검증합니다.
- **근거 및 관찰 사실:** `site-pages.json`의 `tools-novel-rust`는 `Windows x86`와 `SyousetuTranslate-Web-Windows-x86.zip`을 명시합니다(분석 기준 125~134행). 교차 확인한 `Syousetu_Translate`의 정식 Windows ZIP은 x64입니다.
- **적용 원리·수식 또는 불변식:** 일관성 조건 `표시 플랫폼 == 선택 자산 플랫폼 == 실제 릴리스 아키텍처`. assetPrefix로 동적 자산을 찾더라도 잘못된 텍스트가 자동 정정되지는 않습니다.
- **공식 문서·논문 출처:** [GitHub Releases API](https://docs.github.com/en/rest/releases/releases) — `assets[].name`과 공식 릴리스의 `tag_name`을 구분하여 검증합니다.
- **검증:** `python3 -m json.tool site-pages.json >/dev/null`
- **완료 기준:** 표시 플랫폼·선택된 자산·최종 GitHub URL이 모두 x64로 일치
- **중단·원복 조건:** 존재하지 않는 `SyousetuTranslate-Web-Windows-x64.zip` 고정 URL을 임의로 만들지 않음
- **이전 보고서 연결:** Q-P01, IMP-P05

### P-02 · 통계 수집 주기 메타데이터 정정 (P0)

- **판정:** 실제 workflow와 문자열 불일치
- **확인·수정 대상:** [`.github/workflows/download-stats.yml`](https://github.com/P-JSL/P-JSL.github.io/blob/6e5276173068132adb8ec667dc0079cf33b4d82e/.github/workflows/download-stats.yml), [`.github/scripts/collect_download_stats.py`](https://github.com/P-JSL/P-JSL.github.io/blob/6e5276173068132adb8ec667dc0079cf33b4d82e/.github/scripts/collect_download_stats.py)
- **작업 내용:** 예약 주기를 변경하지 않고 메타데이터의 'four times per day'를 실제 하루 1회로 바꿉니다. UTC 기준과 GitHub Actions 지연 가능성을 설명하고 기존 통계 구조·이전 스냅샷을 보존합니다.
- **근거 및 관찰 사실:** `.github/workflows/download-stats.yml` 12행의 `17 2 * * *`는 UTC 매일 한 번입니다. `.github/scripts/collect_download_stats.py` 207행에는 `four times per day`가 하드코딩돼 있습니다.
- **적용 원리·수식 또는 불변식:** cron `분 시 일 월 요일`: `17 2 * * *` → 하루 **1회**(UTC 02:17). `refresh` 문구는 실제 주기를 반영하지만 Actions의 실행 지연 가능성과 마지막 성공 시각은 따로 표현합니다.
- **공식 문서·논문 출처:** [GitHub Actions schedule](https://docs.github.com/en/actions/reference/workflows-and-actions/events-that-trigger-workflows#schedule) — 예약 시각과 실제 시작 시각은 다를 수 있습니다.
- **검증:** `python3 -m py_compile .github/scripts/collect_download_stats.py`
- **완료 기준:** 문구는 하루 한 번이며 통계 수집 시각과 생성 시각의 의미를 혼동하지 않음
- **중단·원복 조건:** 무료 API·Actions 비용 증가를 수반하는 cron 증설 금지
- **이전 보고서 연결:** Q-P02, IMP-P06

### P-03 · Release 다운로드 설정 자동 정합성 검사 (P1)

- **판정:** 신규 read-only CI 검사
- **확인·수정 대상:** [`site-pages.json`](https://github.com/P-JSL/P-JSL.github.io/blob/6e5276173068132adb8ec667dc0079cf33b4d82e/site-pages.json), [`assets/site-pages.js`](https://github.com/P-JSL/P-JSL.github.io/blob/6e5276173068132adb8ec667dc0079cf33b4d82e/assets/site-pages.js), [`.github/workflows/pages.yml`](https://github.com/P-JSL/P-JSL.github.io/blob/6e5276173068132adb8ec667dc0079cf33b4d82e/.github/workflows/pages.yml)
- **작업 내용:** 구성 JSON의 `releaseRepo`, `releaseTag`, `assetPrefix`, filename, architecture를 검사하고 최신 정식 Release 자산과 일치 여부를 진단하는 스크립트/테스트를 추가합니다. API 일시 실패는 '검증 필요'와 '실제 불일치'를 분리합니다.
- **근거 및 관찰 사실:** `site-pages.json`의 repo/tag/assetPrefix와 `assets/site-pages.js`의 Release 자산 선택 흐름, `.github/workflows/pages.yml`의 게시 경계를 결합한 예방 검사입니다.
- **적용 원리·수식 또는 불변식:** 검사 조건 `일치하는 후보의 개수 == 1`. `0개`는 부재/지연/403을 분리하고, `2개 이상`은 임의 첫 항목 선택을 방지합니다.
- **공식 문서·논문 출처:** [GitHub Releases API](https://docs.github.com/en/rest/releases/releases), [GitHub REST rate limits](https://docs.github.com/en/rest/using-the-rest-api/rate-limits-for-the-rest-api) — 403/429를 존재하지 않는 자산으로 확정하지 않습니다.
- **검증:** `node rust-lab/tests/smoke.mjs`
- **완료 기준:** 게시될 문구/링크의 실제 ZIP/EXE 자산 일치 여부를 재현 가능한 검사 결과로 확인
- **중단·원복 조건:** GitHub API 장애를 실제 파일 부재로 단정하거나 잘못된 파일을 대체 게시하지 않음
- **이전 보고서 연결:** IMP-P05, Q-P06, Q-P10

### P-04 · 관리자 동시 저장 충돌과 편집 복원 검증 (P1)

- **판정:** 기존 SHA 검사 보호 확장
- **확인·수정 대상:** [`admin/studio.js`](https://github.com/P-JSL/P-JSL.github.io/blob/6e5276173068132adb8ec667dc0079cf33b4d82e/admin/studio.js)
- **작업 내용:** 브라우저 2개가 동일 SHA에서 서로 다른 블록을 수정한 뒤 순차 저장하는 회귀를 추가합니다. 충돌 시 현재 사용자 편집 데이터를 보존하고 새로고침/재적용 흐름을 명시합니다.
- **근거 및 관찰 사실:** `admin/studio.js`의 `sha`는 초기 GET에서 읽어 `PUT ... sha:sha`로 저장합니다(기준 150행). 이는 GitHub 콘텐츠 API의 낙관적 충돌 관리입니다.
- **적용 원리·수식 또는 불변식:** 조건 `업데이트의 base_sha == 서버 최신 blob_sha`; 두 편집자가 동일 base에서 출발하면 두 번째는 자신의 편집 내용을 덮어쓰지 말고 충돌로 처리합니다.
- **공식 문서·논문 출처:** [GitHub Contents API — Create or update file](https://docs.github.com/en/rest/repos/contents#create-or-update-file-contents) — 업데이트 `sha` 필수, 409 Conflict 등 명시.
- **검증:** `node --check admin/studio.js`
- **완료 기준:** 나중에 저장한 사용자가 앞선 사용자의 변경을 덮어쓰지 않음, 사용자에게 원인·복구 절차 표시
- **중단·원복 조건:** 충돌을 우회하려고 새 SHA만 가져와 자동 무조건 덮어쓰기 금지
- **이전 보고서 연결:** IMP-P07, Q-P03, Q-P09

### P-05 · 관리자 PAT·ZIP 업로드 경계 검증 (P1)

- **판정:** 기존 권한 범위에 대한 실험
- **확인·수정 대상:** [`admin/studio.js`](https://github.com/P-JSL/P-JSL.github.io/blob/6e5276173068132adb8ec667dc0079cf33b4d82e/admin/studio.js), [`admin/index.html`](https://github.com/P-JSL/P-JSL.github.io/blob/6e5276173068132adb8ec667dc0079cf33b4d82e/admin/index.html)
- **작업 내용:** 만료/권한 부족 토큰, 25MiB 초과 ZIP, 손상 파일/실패 업로드, 브라우저 재접속을 테스트합니다. 공개 페이지에 토큰이 남지 않는지, 다운로드 게시 파일이 실제 업로드 성공 후에만 참조되는지 점검합니다.
- **근거 및 관찰 사실:** `admin/studio.js`는 토큰을 JS 변수에 두고 로그아웃 시 지우며, 업로드 파일 크기·API 실패 경로를 별도로 처리합니다. 이 작업은 해당 상태의 실패 주입 검증입니다.
- **적용 원리·수식 또는 불변식:** `파일 실제 크기 ≤ 현재 허용 업로드 상한`과 `게시 URI 활성화 ⇒ API 업로드 성공 ∧ 선택 자산 일치`. 자격증명 저장·반출은 0건이어야 합니다.
- **공식 문서·논문 출처:** [OWASP File Upload Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/File_Upload_Cheat_Sheet.html), [GitHub Token 보안](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/keeping-your-personal-access-tokens-secure) — 이름/확장자로 파일 구조 검증을 대체하지 않습니다.
- **검증:** `node --check admin/studio.js`
- **완료 기준:** 토큰이 스토리지/로그/URL에 저장되지 않고 오류 후 잘못된 파일 경로가 게시되지 않음
- **중단·원복 조건:** 토큰 자동 영구저장 또는 권한 확대를 편의 기능으로 도입 금지
- **이전 보고서 연결:** Q-P04, Q-P05

### P-06 · 통계의 마지막 성공 시각과 수집 범위 명시 (P1)

- **판정:** 현재 값의 의미 보존
- **확인·수정 대상:** [`assets/download-chart.js`](https://github.com/P-JSL/P-JSL.github.io/blob/6e5276173068132adb8ec667dc0079cf33b4d82e/assets/download-chart.js), [`.github/scripts/collect_download_stats.py`](https://github.com/P-JSL/P-JSL.github.io/blob/6e5276173068132adb8ec667dc0079cf33b4d82e/.github/scripts/collect_download_stats.py)
- **작업 내용:** 통계 스냅샷의 실제 captured_at/updated_at과 집계 대상 Release 자산만 안내합니다. Pages 직접 ZIP에 대해 집계 불가를 유지하고 오래된 스냅샷/미게시/실패 상태를 별도 표시합니다.
- **근거 및 관찰 사실:** `.github/scripts/collect_download_stats.py`가 생성하는 `counts`는 GitHub Release ZIP/EXE `download_count`입니다. Pages `/downloads` 직접 전송은 이 값에 포함되지 않습니다.
- **적용 원리·수식 또는 불변식:** `관측된 Release 다운로드수 = Σ(집계대상 자산의 download_count)`이며 `Pages 직접 다운로드수 = 미측정(null)`입니다. **null ≠ 0**. `last_successful_snapshot`을 브라우저 현재시각으로 대체하지 않습니다.
- **공식 문서·논문 출처:** [GitHub Releases API](https://docs.github.com/en/rest/releases/releases) — 자산의 `download_count`는 해당 GitHub Release asset 메트릭입니다.
- **검증:** `node --check assets/download-chart.js`
- **완료 기준:** 집계 불가가 0건으로 바뀌지 않고 오래된 수치가 실시간 값처럼 표기되지 않음
- **중단·원복 조건:** 미확인 다운로드 횟수 임의 생성 금지
- **이전 보고서 연결:** IMP-P03, IMP-P06, Q-P07

### P-07 · 동일 Release API 요청의 중복 호출 공유 (P2)

- **판정:** 병목 계측 후
- **확인·수정 대상:** [`assets/site-pages.js`](https://github.com/P-JSL/P-JSL.github.io/blob/6e5276173068132adb8ec667dc0079cf33b4d82e/assets/site-pages.js)
- **작업 내용:** 동일 저장소·동일 태그에 대한 동시에 발생하는 요청을 한 Promise로 합치는 프로토타입을 만듭니다. 실패/성공 캐시 TTL을 분리하고 페이지 초기 LCP 및 403/429 호출 수를 비교합니다.
- **근거 및 관찰 사실:** `assets/site-pages.js`의 동일 repo/tag에 대한 API 조회가 여러 다운로드 블록에서 반복되는지 Network로 확인하는 조건부 실험입니다.
- **적용 원리·수식 또는 불변식:** 기존 중복 요청 수 `k`개가 동일 입력·동시 실행일 때 요청 수는 최대 `k→1`; 호출 절감율 `(k−1)/k`. 병렬 요청이라면 페이지 전체 지연이 해당 비율만큼 줄지 않습니다.
- **공식 문서·논문 출처:** [GitHub API rate-limit](https://docs.github.com/en/rest/using-the-rest-api/rate-limits-for-the-rest-api), [Fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Window/fetch) — Promise 공유의 범위를 정확한 키와 만료 상태로 제한합니다.
- **검증:** `node --check assets/site-pages.js`
- **완료 기준:** 동일 API 요청 수가 줄되 데이터 최신성·다운로드 선택이 불변
- **중단·원복 조건:** 요청 수 감소를 페이지 총 시간의 동일 비율 개선으로 표기하지 않음
- **이전 보고서 연결:** IMP-P01

### P-08 · 관리자 입력별 전체 DOM 재구성 축소 (P2)

- **판정:** 실제 화면 지연 계측 후
- **확인·수정 대상:** [`admin/studio.js`](https://github.com/P-JSL/P-JSL.github.io/blob/6e5276173068132adb8ec667dc0079cf33b4d82e/admin/studio.js), [`admin/studio.css`](https://github.com/P-JSL/P-JSL.github.io/blob/6e5276173068132adb8ec667dc0079cf33b4d82e/admin/studio.css)
- **작업 내용:** 입력마다 canvas/preview 전체를 비우고 다시 만드는 경로를 프로파일링합니다. 변경된 블록만 갱신하고 1프레임당 렌더를 합치는 시제품을 실제 한글 IME 조합·focus·undo·drag/drop으로 확인합니다.
- **근거 및 관찰 사실:** `admin/studio.js`의 `inputField(...).oninput`에서 `change()`, `renderPreview()`, `renderCanvas()`가 연속 호출됩니다(기준 83행). UI 재생성 비용은 아직 측정하지 않았습니다.
- **적용 원리·수식 또는 불변식:** 입력 1회당 전체 블록 수 `B`를 재렌더하면 `O(B)` 요소 갱신; 변경된 일정 크기 블록만 갱신하면 후보 비용은 `O(1)`(해당 블록 DOM 크기 고정 시). 한글 IME·focus 복원은 결과 계약입니다.
- **공식 문서·논문 출처:** [requestAnimationFrame](https://developer.mozilla.org/en-US/docs/Web/API/Window/requestAnimationFrame), [InputEvent.isComposing](https://developer.mozilla.org/en-US/docs/Web/API/InputEvent/isComposing) — 조합 중 입력을 잃는 debounce는 허용하지 않습니다.
- **검증:** `node --check admin/studio.js`
- **완료 기준:** 20/60블록 입력 지연이 개선되며 입력 누락·포커스 이탈·미리보기 불일치 0건
- **중단·원복 조건:** 단순 debounce로 미저장 편집을 유실하거나 조합 중 문자열을 변경하지 않음
- **이전 보고서 연결:** IMP-P02

### P-09 · 페이지 JSON 및 차트 재표시 비용 분리 (P2)

- **판정:** 데이터 갱신 정책 유지
- **확인·수정 대상:** [`assets/site-pages.js`](https://github.com/P-JSL/P-JSL.github.io/blob/6e5276173068132adb8ec667dc0079cf33b4d82e/assets/site-pages.js), [`assets/download-chart.js`](https://github.com/P-JSL/P-JSL.github.io/blob/6e5276173068132adb8ec667dc0079cf33b4d82e/assets/download-chart.js)
- **작업 내용:** 동일 화면 생명주기에서 `site-pages.json` 중복 fetch가 실제 있는지 Network로 확인한 뒤 데이터 파싱/차트 렌더 비용을 분리합니다. 반복 차트 재구성에만 제한 캐시를 검토합니다.
- **근거 및 관찰 사실:** `assets/site-pages.js`의 JSON fetch·파싱과 `assets/download-chart.js`의 데이터 차트 렌더는 서로 다른 단계입니다. 실제 중복이 존재할 때만 캐시가 필요합니다.
- **적용 원리·수식 또는 불변식:** `T_navigation = T_network + T_JSON + T_DOM + T_paint`를 계측용으로 분리(실제 겹침은 Performance trace에서 확인). 저장 비용 `C_setup`보다 재사용 편익 `q×C_saved`가 클 때만 memoization을 사용합니다.
- **공식 문서·논문 출처:** [Performance API](https://developer.mozilla.org/en-US/docs/Web/API/Performance_API), [HTTP Semantics RFC 9110](https://www.rfc-editor.org/rfc/rfc9110.html) — 캐시가 최신성 계약을 바꾸지 않도록 합니다.
- **검증:** `node --check assets/site-pages.js`
- **완료 기준:** 같은 JSON 구조와 페이지 링크를 유지하면서 실제 중복 작업 감소 확인
- **중단·원복 조건:** 항상 최신이 필요한 관리자/공개 페이지에 만료 없는 캐시를 삽입하지 않음
- **이전 보고서 연결:** IMP-P04

### P-10 · 키보드 접근성 및 링크 상태 점검 (P2)

- **판정:** WCAG 관련 사용자 시험
- **확인·수정 대상:** [`assets/site-pages.js`](https://github.com/P-JSL/P-JSL.github.io/blob/6e5276173068132adb8ec667dc0079cf33b4d82e/assets/site-pages.js), [`assets/site-pages.css`](https://github.com/P-JSL/P-JSL.github.io/blob/6e5276173068132adb8ec667dc0079cf33b4d82e/assets/site-pages.css), [`admin/studio.js`](https://github.com/P-JSL/P-JSL.github.io/blob/6e5276173068132adb8ec667dc0079cf33b4d82e/admin/studio.js)
- **작업 내용:** 다운로드 버튼의 로딩·실패·활성 상태, 관리자 키보드 탐색, 화면낭독 알림, 좁은 화면의 레이아웃을 확인합니다. 실제 사용자 관찰과 자동화 가능한 DOM 검사 범위를 나눕니다.
- **근거 및 관찰 사실:** `assets/site-pages.js`와 관리자 화면의 동작·비활성화/오류 상태를 실제 키보드와 보조공학에서 확인해야 합니다. 정적 DOM 존재만으로 충족을 판단하지 않습니다.
- **적용 원리·수식 또는 불변식:** 중요 기능별 `마우스 이외 조작 경로 ≥ 1`; 성공·실패 상태 메시지는 포커스를 옮기지 않더라도 보조공학이 식별할 수 있어야 합니다.
- **공식 문서·논문 출처:** [WCAG 2.2 2.1.1 Keyboard](https://www.w3.org/WAI/WCAG22/Understanding/keyboard), [4.1.3 Status Messages](https://www.w3.org/WAI/WCAG22/Understanding/status-messages) — 위 기준에 따라 수동·자동 결과를 구분합니다.
- **검증:** `node --check assets/site-pages.js`
- **완료 기준:** 상태가 명확하게 전달되고 마우스 없이 주요 기능 접근 가능
- **중단·원복 조건:** 화면만 숨기고 기능을 사용할 수 없게 만드는 처리 금지
- **이전 보고서 연결:** Q-P08

## 6. 검증 명령(실행 순서)

```bash
python3 -m json.tool site-pages.json >/dev/null
python3 -m py_compile .github/scripts/collect_download_stats.py
node --check assets/site-pages.js
node --check assets/download-chart.js
node --check admin/studio.js
node rust-lab/tests/smoke.mjs
```

검증은 코드·테스트가 준비된 실행 환경에서 수행합니다. **파일을 변경하는 스크립트·실제 다운로드·외부 API 검증은 테스트 환경과 권한을 확인한 후에만 실행**합니다. Linux/Windows와 Docker/CI 등 환경 차이가 있는 테스트는 통과 여부를 분리해 기록합니다.

## 7. 기존 보고서의 불일치·중복 정리

- 이전 **IMP-*** 성능 과제와 **Q-*** 보안·운영 통제는 위 ID별로 병합했습니다. 기존 구현을 새로 만들라는 중복 지시는 제거했고, 필요한 회귀 보강만 남겼습니다.
- 100/1,000회 검토 이력은 실제 프로그램 반복 실행이 아니라 합성 부하·수학·규정 모델 검산입니다. 상세 시나리오와 학술 참고문헌은 과거 별도 증거 ZIP으로 보존하고, 이 문서에는 바로 코드 작업에 도움이 되는 근거와 검증 조건만 남겼습니다.
- 위 문서에서 '확인됨'은 **소스에서 동작 또는 설정을 확인**한 것이며, 전체 기능 테스트와 취약점 재현을 완료했다는 뜻이 아닙니다. 성능 속도 개선 배수는 현행 코드에 대한 추가 실측 없이는 예측하지 않습니다.
- 이력 항목을 의도적으로 누락하지 않도록 작업 지시 아래에 **기존 IMP 번호 연결**을 보존했습니다. 실험 과제는 기준선·결과 무결성·원복 경로를 먼저 확보합니다.

## 8. 추가 보안·위험·복구 보완 사항 — 소스 재검증 (2026-11-12)

이번 보완은 기존 **10개 작업을 대체하거나 수행 완료로 처리하지 않습니다**. 실제 소스에서 확인한 위험 경로와 테스트가 필요한 가정을 구분했으며, 공개된 취약점이나 악용 성공을 확인했다는 뜻이 아닙니다. 보안·무결성 작업은 실제 장애 재현→최소 수정→회귀 검증 순으로 진행하십시오.

### 8.1 재검증에서 추가로 확인한 위험과 경계

1. Pages용 최신 ZIP 별칭은 파일의 **마지막 Git 커밋 시각**으로 선택됩니다. 버전·검증 수준·출처가 최신이라는 보장은 다릅니다.
2. ZIP 분류는 압축 내부에 EXE가 있으면 데스크톱, 일정 형태의 manifest가 있으면 확장 프로그램으로 판단합니다. 아카이브의 실제 제품 정체성·내부 자산 범위는 별도 계약 검증이 필요합니다.
3. 관리자 API 요청의 HTTP 404는 공통적으로 `{missing:true}` 처리됩니다. **실제 파일 부재와 권한/리소스 은닉 404**는 진단상 구분되지 않을 수 있습니다.

### 8.2 추가 Codex 작업 목록

| 작업 ID | 우선순위 | 신규 보완 과제 | 증거 수준 |
|---|---|---|---|
| **P-11** | P1 | 최신 ZIP 별칭 선택 시 버전 역행 방지 | 최신 기준이 커밋시각인 점 확인, 실제 오배포 미검증 |
| **P-12** | P1 | 배포 ZIP의 제품 정체성·압축 해제 자원 제한 | 분류 조건 확인, 악성 파일 게시 사례 미확인 |
| **P-13** | P2 | 관리자 HTTP 404·403·409의 오류 분리 및 편집 보존 | 공통 404 처리 확인, 오진 사례 미재현 |

### 8.3 작업별 상세 근거·검증·원복 기준

### P-11 · 최신 ZIP 별칭 선택 시 버전 역행 방지 (P1)

- **확인 수준:** 최신 기준이 커밋시각인 점 확인, 실제 오배포 미검증
- **근거 소스:** [`.github/scripts/prepare_download.py` 19-29행](https://github.com/P-JSL/P-JSL.github.io/blob/89ddb382a5dc37a5f533e017da23423dc1907d80/.github/scripts/prepare_download.py#L19-L29)
- **추가 판단 근거:** `last_commit_time()`이 `git log -1 --format=%ct`를 반환하고 `main()`은 이를 기준으로 ZIP을 선택합니다. 이전 버전 파일을 더 늦게 커밋하면 'latest' 별칭이 역행할 수 있습니다.
- **Codex 구현·시험 지시:** 서로 다른 버전의 ZIP을 역순 시각으로 커밋한 가상 Git fixture를 준비하고, SemVer·Manifest 버전·릴리스 SHA·아키텍처/제품종류를 교차 검증합니다. 최신 정식 Release를 신뢰원으로 삼을지 별칭의 의미를 먼저 명시합니다.
- **수식·안전 불변식:** `published_latest_version >= previously_published_stable_version`(롤백을 명시적으로 승인하지 않은 경우). 파일 수정시각 또는 마지막 Git 커밋 시각이 버전 우선순위를 대체하지 않습니다.
- **검증 실행:** 신규 `unittest` fixture + `python3 .github/scripts/prepare_download.py`를 별도 작업 트리에서 시험
- **완료·합격 기준:** 이전 버전 재커밋으로 최신 별칭이 조용히 다운그레이드되지 않음, 수동 롤백 시에는 근거가 기록됨
- **위험·원복 조건:** 현행 사용자의 ZIP명·공개 URL을 무단 변경하지 않음
- **기존 작업 연결:** P-03 / P-06
- **공식 명세·기술 출처:** [원문 참고](https://docs.github.com/en/rest/releases/releases)

### P-12 · 배포 ZIP의 제품 정체성·압축 해제 자원 제한 (P1)

- **확인 수준:** 분류 조건 확인, 악성 파일 게시 사례 미확인
- **근거 소스:** [`.github/scripts/prepare_download.py` 31-67행](https://github.com/P-JSL/P-JSL.github.io/blob/89ddb382a5dc37a5f533e017da23423dc1907d80/.github/scripts/prepare_download.py#L31-L67)
- **추가 판단 근거:** `inspect_zip()`는 ZIP entry 경로와 암호화를 검사하지만 `.exe` 확장자가 하나라도 있으면 데스크톱으로 분류하며, 확장의 최소 manifest 속성만 검사합니다. 내부 총 해제 크기와 ZIP 구조 전체의 허용 목록은 별도 확인이 필요합니다.
- **Codex 구현·시험 지시:** 내부 `README.exe`만 포함한 ZIP, 확장/데스크톱 동시 포함, 중복 경로·대소문자 충돌, 너무 많은 entry, 매우 높은 압축률, ZIP64, 정상 두 제품 ZIP을 합성 fixture로 평가합니다. 실제 압축 해제는 격리된 임시 폴더에서만 진행합니다.
- **수식·안전 불변식:** `배포 승인 ⇒ 제품별 필수 경로·버전·정확한 종류 검사 성공 ∧ 위험 엔트리/합산 미압축 바이트가 정책 한도 내`; `.exe` 1개 존재는 데스크톱 정식 배포의 충분조건이 아닙니다.
- **검증 실행:** 신규 표준 라이브러리 `unittest` 테스트 + Pages 준비 스크립트 샌드박스 실행
- **완료·합격 기준:** 정상 두 제품을 계속 게시하면서 위조·모호한 ZIP은 별칭으로 노출하지 않음
- **위험·원복 조건:** 배포 없이 기존 다운로드 링크 구조를 깨뜨리는 확장 정책 금지
- **기존 작업 연결:** P-05 / P-03
- **공식 명세·기술 출처:** [원문 참고](https://cheatsheetseries.owasp.org/cheatsheets/File_Upload_Cheat_Sheet.html)

### P-13 · 관리자 HTTP 404·403·409의 오류 분리 및 편집 보존 (P2)

- **확인 수준:** 공통 404 처리 확인, 오진 사례 미재현
- **근거 소스:** [`admin/studio.js` 7-13행](https://github.com/P-JSL/P-JSL.github.io/blob/89ddb382a5dc37a5f533e017da23423dc1907d80/admin/studio.js#L7-L13)
- **추가 판단 근거:** `api()`에서 HTTP 404를 항상 `{missing:true}`로 반환하고 다른 오류는 예외를 던집니다. 저장소 권한 부족·비공개 자산 은닉으로 발생한 404와 실제 업로드 대상 부재를 혼동할 수 있습니다.
- **Codex 구현·시험 지시:** 권한 없는 토큰/실제 파일 부재/404·403·409·422·429 응답을 mock fetch로 재현합니다. ZIP 업로드의 GET 대상이 없을 때만 새 파일을 만들고 관리 문서의 GET/PUT에서는 편집 내용을 보존한 채 안내하도록 분기합니다.
- **수식·안전 불변식:** `404(repository/auth) ≠ 404(file_not_found)`이며, 사용자 저장 실패 시 `dirty == true`와 편집 스냅샷 보존. API 오류 메시지에 토큰 원문 포함 금지.
- **검증 실행:** `node --check admin/studio.js` + 새 mock-fetch UI 회귀 테스트
- **완료·합격 기준:** 권한 부족을 파일 부재로 안내하지 않고, 저장 실패 후 사용자가 편집 내용을 다시 확인 가능
- **위험·원복 조건:** 기존 GitHub SHA 충돌 방지 및 토큰 메모리 관리 유지
- **기존 작업 연결:** P-04 / P-05
- **공식 명세·기술 출처:** [원문 참고](https://docs.github.com/en/rest/using-the-rest-api/troubleshooting-the-rest-api)

### 8.4 보안 및 완료 판정 규칙

- **P0/P1/P2는 업무 우선순위입니다. CVSS 점수나 실제 침해사고 판정이 아닙니다.** 각 원인의 악용 가능성·권한·사용 환경은 테스트로 확인합니다.
- 실데이터·고객 문서 대신 합성 입력과 제한 권한의 임시 경로를 사용합니다. 전원 종료, 파일 교체, 계정 충돌 등 파괴적 장애 주입은 **운영 파일에 수행하지 않습니다**.
- **기존 보호·서비스 계약을 유지**하고 수정 대상 파일·함수 및 기존 호출자를 재확인합니다. 이미 구현된 안전 장치를 제거하거나 테스트만 통과하도록 약화하지 않습니다.
- 변경 전 실패 재현, 변경 후 정상·비정상 경계 테스트, OS별 차이, 부분 실패·롤백, 배포 영향, 테스트 실행 로그를 해당 작업 ID에 기록합니다. 실측/실행하지 않은 검사는 완료로 기록하지 않습니다.
- 위 출처는 방법론·플랫폼 동작의 근거이며 **해당 프로젝트에서 공격이 성공했음을 증명하지 않습니다**. 다른 시스템의 보안 사고·수치·논문 결과를 그대로 전이하지 않습니다.
