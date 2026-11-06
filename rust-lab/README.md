# Rust Learning Lab

**공개 URL:** https://p-jsl.github.io/rust-lab/

Java를 조금 알고 Rust가 처음인 사용자를 위해 제작한 무료 단계별 학습 사이트입니다. [gacha_pickup_calculator](https://github.com/P-JSL/gacha_pickup_calculator)의 실제 Rust 코드를 학습 대상으로 사용합니다.

## 기능

- 5개 과정, 31개 강의: Cargo · 변수 · 함수 · 소유권 · 참조 · enum · Result · 실제 확률 DP · 환급 Monte Carlo · egui GUI · 보안
- Java ↔ Rust 비교, 직접 코드 수정, 힌트, 참고 정답, 4지선다 퀴즈
- 브라우저 `localStorage`에 진행률과 실습 코드 저장 (외부 계정 불필요)
- 공식 Rust Playground로 실습 코드 전달해 실제 컴파일/실행
- GitHub Raw에서 코드 읽기, 원본 GitHub 링크로 연결
- 고정 성공확률을 가정한 교육용 누적 확률 및 표본 시뮬레이션

## 분석 기준 코드

대상 저장소 v0.2.4, 커밋:

`c25326c7a92b3f47715a55e2711ad7552e17e68f`

실제 소스를 읽은 뒤 `src/games.rs`, `src/lib.rs`, `src/feedback.rs`, `src/main.rs`, `src/dashboard_ui.rs`, `src/catalog.rs`, `src/security.rs`, `src/observations.rs`의 함수 위치와 학습 주제를 연결했습니다.

**원본 프로그램의 버전이 변경되어도 강의 내용이 자동으로 갱신되지는 않습니다.** 소스 탐험의 URL은 고정 커밋을 참조하므로, 최신 코드에 맞춘 강의 갱신은 관련 설명/행번호/실습을 함께 재검토해야 합니다.

## 실행

별도 빌드 도구는 필요 없습니다. 브라우저에서 `rust-lab/index.html`을 열거나 정적 웹서버에서 제공하세요.

```bash
python -m http.server 8000
# http://localhost:8000/rust-lab/
```

`file://` 환경에서는 GitHub Raw 원본 열람이 제한될 수 있습니다. 이 경우 파일별 GitHub 링크로 열람하세요.

## 자동 검사

GitHub Pages 워크플로에서 아래 명령으로 정적 스모크 테스트를 실행합니다.

```bash
node rust-lab/tests/smoke.mjs
```

강의 ID·그룹·문항·참고 답안·정규식 검사·소스 경로·정적 HTML/JS 파싱 상태를 검사합니다.

**구조 검사는 Rust 컴파일러가 아닙니다.** 일부 구문이 포함되어 있는지만 검사합니다. 실제 Rust 문법·동작·테스트는 Rust Playground 또는 로컬 Cargo로 검증해야 합니다. 또한 교육용 확률 실험실은 게임별 보증/천장/환급을 적용하지 않습니다.

## 유지보수

`lessons.js`의 각 항목에 `group`, `id`, `title`, `lead`, `points`, `java`, `rust`, `annotation`, `task`, `quiz`, `source`를 작성하면 학습 목차 및 페이지가 자동 생성됩니다.

기존 Pages의 다른 파일을 수정하지 않고 별도 `rust-lab/` 디렉터리로 분리했습니다. 로그인·유료 API·저장소 쓰기 권한·외부 서버 데이터베이스를 요구하지 않습니다.

## 학습 설계 참고

- [The Rust Programming Language](https://doc.rust-lang.org/book/)
- [한국어 Rust 학습서](https://doc.rust-kr.org/)
- [Rustlings](https://github.com/rust-lang/rustlings)
- [Rust by Example](https://doc.rust-lang.org/rust-by-example/)
- [Rust Playground](https://play.rust-lang.org/)

구성과 학습법은 참고하되 실제 강의와 문제는 분석 대상 프로젝트의 코드에 맞춰 새로 작성했습니다.
