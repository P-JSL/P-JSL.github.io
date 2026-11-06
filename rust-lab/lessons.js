/* Rust Learning Lab curriculum pinned to source commit. */
window.RUST_LAB_COURSE={
  "snapshot": "2026-11-06",
  "commit": "c25326c7a92b3f47715a55e2711ad7552e17e68f",
  "repo": "P-JSL/gacha_pickup_calculator",
  "groups": [
    {
      "id": "start",
      "name": "01. 시작과 기본 문법",
      "desc": "Java와 대조하며 Rust 첫걸음",
      "icon": "01"
    },
    {
      "id": "memory",
      "name": "02. 소유권과 데이터",
      "desc": "Rust만의 메모리 규칙",
      "icon": "02"
    },
    {
      "id": "syntax",
      "name": "03. Rust 실전 문법",
      "desc": "enum · Option · Result · 테스트",
      "icon": "03"
    },
    {
      "id": "engine",
      "name": "04. 확률 계산기 원본 분석",
      "desc": "실제 Rust 엔진 해부",
      "icon": "04"
    },
    {
      "id": "advanced",
      "name": "05. UI · 성능 · 검증",
      "desc": "프로젝트 전체 흐름 완성",
      "icon": "05"
    }
  ],
  "lessons": [
    {
      "group": "start",
      "id": "s01",
      "title": "프로젝트를 읽는 순서와 Cargo",
      "minutes": 9,
      "lead": "Java의 Maven·Gradle처럼 Cargo는 Rust의 빌드·의존성·테스트 도구입니다.",
      "points": [
        "Cargo.toml: 의존성·Rust 에디션·빌드 설정",
        "src/main.rs: 프로그램 진입점과 UI",
        "src/lib.rs: 확률 계산 라이브러리",
        "이 저장소는 Rust 2021·eframe/egui 기반 데스크톱 앱입니다."
      ],
      "java": "public static void main(String[] args) {\n    System.out.println(\"Hello\");\n}",
      "rust": "fn main() {\n    println!(\"Hello\");\n}",
      "annotation": "`fn`은 함수 선언, `println!`은 매크로입니다. Rust 패키지는 crate로 불리며, Cargo가 빌드와 테스트를 수행합니다.",
      "task": {
        "prompt": "Rust Lab을 출력하는 프로그램을 완성하세요.",
        "starter": "fn main() {\n    // TODO\n}",
        "answer": "fn main() {\n    println!(\"Rust Lab\");\n}",
        "rules": [
          {
            "label": "출력 매크로",
            "pattern": "println!\\s*\\(\\s*\"Rust Lab\""
          }
        ],
        "hint": "Java의 System.out.println 대신 println!을 씁니다."
      },
      "quiz": {
        "question": "Cargo.toml과 가장 가까운 Java 파일은?",
        "options": [
          "pom.xml / build.gradle",
          "index.html",
          "web.xml",
          "module-info.java"
        ],
        "correct": 0,
        "explanation": "의존성과 빌드를 설정한다는 점에서 비슷합니다."
      },
      "source": {
        "path": "Cargo.toml",
        "start": 1,
        "end": 17,
        "why": "버전 0.2.4와 eframe 의존성을 직접 확인하세요."
      },
      "warning": ""
    },
    {
      "group": "start",
      "id": "s02",
      "title": "let · mut · 타입 추론",
      "minutes": 10,
      "lead": "Rust에서 변수는 기본적으로 재할당할 수 없고 `mut`를 붙여야 변경할 수 있습니다.",
      "points": [
        "`let x = 1`은 불변 바인딩입니다.",
        "`let mut x = 1`은 변경 가능한 바인딩입니다.",
        "`usize`는 인덱스·횟수에 자주 쓰는 부호 없는 정수입니다."
      ],
      "java": "int pity = 0;\npity += 1;\nfinal int hard = 90;",
      "rust": "let mut pity: usize = 0;\npity += 1;\nlet hard: usize = 90;",
      "annotation": "Java에서 final을 추가하던 것과 달리, Rust는 변경 허용을 명시합니다.",
      "task": {
        "prompt": "pity를 3에서 4로 증가시키세요.",
        "starter": "fn main() {\n    let pity = 3;\n    // TODO\n    println!(\"{pity}\");\n}",
        "answer": "fn main() {\n    let mut pity = 3;\n    pity += 1;\n    println!(\"{pity}\");\n}",
        "rules": [
          {
            "label": "가변 바인딩",
            "pattern": "let\\s+mut\\s+pity"
          },
          {
            "label": "값 증가",
            "pattern": "pity\\s*\\+=\\s*1"
          }
        ],
        "hint": "let pity를 let mut pity로 변경하고 1을 더하세요."
      },
      "quiz": {
        "question": "`let n = 3; n += 1;`의 결과는?",
        "options": [
          "4 출력",
          "컴파일 오류",
          "자동 형변환",
          "런타임 NullPointerException"
        ],
        "correct": 1,
        "explanation": "기본 바인딩은 불변이므로 재할당할 수 없습니다."
      },
      "source": {
        "path": "src/lib.rs",
        "start": 336,
        "end": 349,
        "why": "acc와 mean의 `mut`를 확인하세요."
      },
      "warning": ""
    },
    {
      "group": "start",
      "id": "s03",
      "title": "usize · f64 · as 형변환",
      "minutes": 11,
      "lead": "가챠 엔진에서 '뽑기 횟수'는 usize, '확률'은 f64로 나타냅니다.",
      "points": [
        "`usize`는 플랫폼 크기의 부호 없는 정수입니다.",
        "`f64`는 배정밀도 부동소수점 수입니다.",
        "Rust는 다른 숫자 타입을 암묵적으로 섞지 않습니다.",
        "`as f64`처럼 의도적인 변환이 필요합니다."
      ],
      "java": "int draws = 5;\ndouble mean = (double) draws * 0.2;",
      "rust": "let draws: usize = 5;\nlet mean = draws as f64 * 0.2;",
      "annotation": "Distribution::new에서 `n as f64 * p`는 PMF로부터 평균 뽑기 횟수를 구합니다.",
      "task": {
        "prompt": "정수 횟수와 확률을 곱해 반환하세요.",
        "starter": "fn weighted(n: usize, p: f64) -> f64 {\n    // TODO\n}",
        "answer": "fn weighted(n: usize, p: f64) -> f64 {\n    n as f64 * p\n}",
        "rules": [
          {
            "label": "f64 변환",
            "pattern": "n\\s+as\\s+f64"
          },
          {
            "label": "곱셈",
            "pattern": "as\\s+f64\\s*\\*\\s*p"
          }
        ],
        "hint": "정수 n을 `n as f64`로 바꿉니다."
      },
      "quiz": {
        "question": "usize를 f64 변수에 바로 대입하면?",
        "options": [
          "언제나 성공",
          "타입 불일치 오류",
          "자동으로 null",
          "소수점만 버림"
        ],
        "correct": 1,
        "explanation": "Rust는 숫자 사이의 암묵적 타입 변환을 거의 하지 않습니다."
      },
      "source": {
        "path": "src/lib.rs",
        "start": 338,
        "end": 347,
        "why": "가중 평균 계산에서 as f64를 확인하세요."
      },
      "warning": ""
    },
    {
      "group": "start",
      "id": "s04",
      "title": "함수 · 반환식 · 세미콜론",
      "minutes": 12,
      "lead": "Rust 함수는 `fn name(arg: Type) -> Type`으로 선언하고 마지막 식으로 결과를 반환할 수 있습니다.",
      "points": [
        "함수 매개변수는 `이름: 타입`입니다.",
        "반환 타입은 `->` 뒤에 놓습니다.",
        "마지막 식에 세미콜론을 붙이지 않으면 반환값으로 사용됩니다.",
        "조기 반환은 `return` 키워드입니다."
      ],
      "java": "static int tickets(int currency) {\n    return currency / 160;\n}",
      "rust": "fn tickets(currency: usize) -> usize {\n    currency / 160\n}",
      "annotation": "프로젝트의 cost_per_pull, available_flexible 같은 짧은 메서드에서 자주 보입니다.",
      "task": {
        "prompt": "성옥 160개당 1뽑을 반환하세요.",
        "starter": "fn tickets(currency: usize) -> usize {\n    // TODO\n}",
        "answer": "fn tickets(currency: usize) -> usize {\n    currency / 160\n}",
        "rules": [
          {
            "label": "정수 나눗셈 반환",
            "pattern": "currency\\s*/\\s*160\\s*(?:\\n|\\r|})"
          }
        ],
        "hint": "마지막 줄에 `currency / 160`을 세미콜론 없이 넣으세요."
      },
      "quiz": {
        "question": "마지막 줄이 `a + b;`이면 일반적으로 반환되는 값은?",
        "options": [
          "a+b",
          "()`",
          "null",
          "a"
        ],
        "correct": 1,
        "explanation": "세미콜론이 붙은 문장은 unit `()`를 만듭니다."
      },
      "source": {
        "path": "src/games.rs",
        "start": 70,
        "end": 75,
        "why": "cost_per_pull의 짧은 반환식을 보세요."
      },
      "warning": ""
    },
    {
      "group": "start",
      "id": "s05",
      "title": "if · match · 범위",
      "minutes": 12,
      "lead": "Rust의 if는 값도 만들 수 있으며 enum 분기는 match로 표현합니다.",
      "points": [
        "if 조건은 반드시 bool입니다.",
        "if/else가 동일 타입의 값을 반환할 수 있습니다.",
        "`0..5`는 5를 제외, `0..=5`는 5를 포함합니다."
      ],
      "java": "int cost = stella ? 300 : 160;",
      "rust": "let stella = true;\nlet cost = if stella { 300 } else { 160 };",
      "annotation": "원본 프로젝트는 스텔라 소라만 1회 재화 300개, 나머지 게임은 160개를 기본 비용으로 사용합니다.",
      "task": {
        "prompt": "stella가 true면 300, false면 160을 반환하세요.",
        "starter": "fn cost(stella: bool) -> usize {\n    // TODO\n}",
        "answer": "fn cost(stella: bool) -> usize {\n    if stella { 300 } else { 160 }\n}",
        "rules": [
          {
            "label": "조건 분기",
            "pattern": "if\\s+stella"
          },
          {
            "label": "else 처리",
            "pattern": "else\\s*\\{\\s*160\\s*\\}"
          }
        ],
        "hint": "if를 표현식으로 만들면 return을 생략할 수 있습니다."
      },
      "quiz": {
        "question": "Rust의 if 조건은 어떤 타입인가요?",
        "options": [
          "usize",
          "f64",
          "bool",
          "&str"
        ],
        "correct": 2,
        "explanation": "Rust는 JavaScript처럼 숫자를 truthy/falsy로 바꾸지 않습니다."
      },
      "source": {
        "path": "src/games.rs",
        "start": 54,
        "end": 75,
        "why": "게임별 비용과 단순 조건 분기를 보세요."
      },
      "warning": ""
    },
    {
      "group": "start",
      "id": "s06",
      "title": "for · iter · enumerate",
      "minutes": 14,
      "lead": "Java의 인덱스 루프에 해당하는 Rust 반복과 이터레이터를 익힙니다.",
      "points": [
        "`.iter()`는 요소를 참조하여 반복합니다.",
        "`.enumerate()`는 인덱스와 요소를 함께 제공합니다.",
        "`for (i, &p)`에서 &p는 참조에서 값을 꺼내는 패턴입니다."
      ],
      "java": "for (int i=0; i<pmf.length; i++) {\n    mean += i * pmf[i];\n}",
      "rust": "for (n, &p) in pmf.iter().enumerate() {\n    mean += n as f64 * p;\n}",
      "annotation": "원본 Distribution::new는 위 형태로 CDF와 기대값을 누적합니다.",
      "task": {
        "prompt": "0부터 4까지 더하는 for 문을 작성하세요.",
        "starter": "fn main() {\n    let mut sum = 0;\n    // TODO\n    println!(\"{sum}\");\n}",
        "answer": "fn main() {\n    let mut sum = 0;\n    for n in 0..5 { sum += n; }\n    println!(\"{sum}\");\n}",
        "rules": [
          {
            "label": "0..5 범위",
            "pattern": "for\\s+n\\s+in\\s+0\\.\\.5"
          },
          {
            "label": "합계 누적",
            "pattern": "sum\\s*\\+=\\s*n"
          }
        ],
        "hint": "for n in 0..5는 n=0,1,2,3,4입니다."
      },
      "quiz": {
        "question": "`0..3`의 반복 횟수는?",
        "options": [
          "2",
          "3",
          "4",
          "무한"
        ],
        "correct": 1,
        "explanation": "시작 포함, 끝 미포함이므로 0·1·2 세 번입니다."
      },
      "source": {
        "path": "src/lib.rs",
        "start": 338,
        "end": 349,
        "why": "PMF 반복문을 읽으세요."
      },
      "warning": ""
    },
    {
      "group": "memory",
      "id": "m01",
      "title": "String과 &str",
      "minutes": 14,
      "lead": "Java String 한 종류를 생각하던 습관에서 벗어나 Rust의 소유 문자열과 문자열 참조를 구분합니다.",
      "points": [
        "`String`은 소유하는 문자열 버퍼입니다.",
        "`&str`는 문자열 데이터에 대한 빌린 뷰입니다.",
        "`to_owned()`는 참조된 문자열을 소유 String으로 만듭니다.",
        "UTF-8 문자열은 임의의 바이트 인덱싱을 허용하지 않습니다."
      ],
      "java": "String id = \"1511\";\nString copy = new String(id);",
      "rust": "let id: &str = \"1511\";\nlet owned: String = id.to_owned();",
      "annotation": "apply_catalog_choice 함수는 입력 id: &str를 받고, 저장할 때 id.to_owned()를 사용합니다.",
      "task": {
        "prompt": "&str을 소유 String으로 반환하세요.",
        "starter": "fn keep(id: &str) -> String {\n    // TODO\n}",
        "answer": "fn keep(id: &str) -> String {\n    id.to_owned()\n}",
        "rules": [
          {
            "label": "소유 문자열 생성",
            "pattern": "id\\.to_owned\\(\\)"
          }
        ],
        "hint": "to_owned()를 함수 마지막 식으로 둡니다."
      },
      "quiz": {
        "question": "값을 소유하는 변경 가능한 문자열 타입은?",
        "options": [
          "&str",
          "String",
          "char[]",
          "str"
        ],
        "correct": 1,
        "explanation": "String이 문자열 버퍼를 소유합니다."
      },
      "source": {
        "path": "src/main.rs",
        "start": 343,
        "end": 370,
        "why": "id.to_owned()가 사용되는 이유를 추적하세요."
      },
      "warning": ""
    },
    {
      "group": "memory",
      "id": "m02",
      "title": "소유권: move와 clone",
      "minutes": 18,
      "lead": "Rust는 GC에 의존하지 않고 소유권 규칙으로 메모리를 관리합니다.",
      "points": [
        "String 같은 Copy가 아닌 타입을 대입하면 일반적으로 소유권이 이동합니다.",
        "이동 후 이전 바인딩은 사용할 수 없습니다.",
        "clone()은 명시적으로 복제합니다.",
        "숫자와 bool 같은 Copy 타입은 일반 대입에서 복사됩니다."
      ],
      "java": "String a = \"HSR\";\nString b = a; // 동일 객체 참조",
      "rust": "let a = String::from(\"HSR\");\nlet b = a; // 이동\nprintln!(\"{b}\");",
      "annotation": "원본 재계산 요청은 setup.clone()을 사용해 GUI와 작업자가 독립된 입력 스냅샷을 갖도록 합니다.",
      "task": {
        "prompt": "a와 b를 모두 사용할 수 있게 수정하세요.",
        "starter": "fn main() {\n    let a = String::from(\"HSR\");\n    let b = a;\n    println!(\"{a} {b}\");\n}",
        "answer": "fn main() {\n    let a = String::from(\"HSR\");\n    let b = a.clone();\n    println!(\"{a} {b}\");\n}",
        "rules": [
          {
            "label": "명시적 복제",
            "pattern": "let\\s+b\\s*=\\s*a\\.clone\\(\\)"
          }
        ],
        "hint": "b = a는 move, b = a.clone()은 복제입니다."
      },
      "quiz": {
        "question": "String을 move한 뒤 이전 바인딩을 사용하면?",
        "options": [
          "대개 컴파일 오류",
          "자동 clone",
          "null 출력",
          "런타임 GC 발생"
        ],
        "correct": 0,
        "explanation": "소유권이 옮겨져 이전 바인딩이 무효해집니다."
      },
      "source": {
        "path": "src/main.rs",
        "start": 630,
        "end": 645,
        "why": "계산 작업용 setup.clone을 찾으세요."
      },
      "warning": ""
    },
    {
      "group": "memory",
      "id": "m03",
      "title": "&T · &mut T · 역참조",
      "minutes": 19,
      "lead": "참조는 소유권을 넘기지 않고 값에 접근하는 방법입니다.",
      "points": [
        "&T는 읽기 대여, &mut T는 변경 가능한 독점 대여입니다.",
        "가변 참조가 필요한 함수는 호출부에서도 &mut를 써야 합니다.",
        "`*value`는 참조가 가리키는 값을 사용합니다."
      ],
      "java": "static void increase(Counter c) { c.pity++; }",
      "rust": "fn increase(pity: &mut usize) {\n    *pity += 1;\n}",
      "annotation": "Wallet::pay(&mut self, dedicated_remaining: &mut usize)는 전용 티켓 잔량을 직접 줄입니다.",
      "task": {
        "prompt": "참조로 받은 pity를 1 증가시키세요.",
        "starter": "fn increase(pity: &mut usize) {\n    // TODO\n}",
        "answer": "fn increase(pity: &mut usize) {\n    *pity += 1;\n}",
        "rules": [
          {
            "label": "역참조하여 증가",
            "pattern": "\\*pity\\s*\\+=\\s*1"
          }
        ],
        "hint": "가변 참조의 실제 값을 수정할 때 *pity를 사용합니다."
      },
      "quiz": {
        "question": "숫자를 함수 내부에서 수정할 때 전달 방식은?",
        "options": [
          "&mut pity",
          "&pity",
          "clone(pity)",
          "String::new()"
        ],
        "correct": 0,
        "explanation": "가변 대여가 필요합니다."
      },
      "source": {
        "path": "src/feedback.rs",
        "start": 315,
        "end": 326,
        "why": "pay 함수와 dedicated_remaining 인자를 확인하세요."
      },
      "warning": ""
    },
    {
      "group": "memory",
      "id": "m04",
      "title": "struct · impl · self",
      "minutes": 17,
      "lead": "Java 클래스의 필드와 메서드가 Rust에서는 struct와 impl로 분리됩니다.",
      "points": [
        "struct는 데이터를 정의합니다.",
        "impl은 관련 함수와 메서드를 정의합니다.",
        "&self는 읽기 수신자, &mut self는 쓰기 수신자입니다."
      ],
      "java": "class Rate { double base;\n  double getBase() { return base; } }",
      "rust": "struct Rate { base: f64 }\nimpl Rate {\n    fn base(&self) -> f64 { self.base }\n}",
      "annotation": "RateSchedule에는 기본 확률(base), 확정 천장(hard), 소프트 천장 정책(soft)이 담깁니다.",
      "task": {
        "prompt": "구조체의 필드를 반환하는 메서드를 완성하세요.",
        "starter": "struct Rate { base: f64 }\nimpl Rate {\n    fn base(&self) -> f64 { /* TODO */ }\n}",
        "answer": "struct Rate { base: f64 }\nimpl Rate {\n    fn base(&self) -> f64 { self.base }\n}",
        "rules": [
          {
            "label": "자기 필드 접근",
            "pattern": "self\\.base"
          }
        ],
        "hint": "Java의 this.base는 Rust의 self.base입니다."
      },
      "quiz": {
        "question": "기존 인스턴스를 변경하지 않고 읽는 수신자는?",
        "options": [
          "self",
          "&self",
          "&mut self",
          "::self"
        ],
        "correct": 1,
        "explanation": "&self는 공유 읽기 대여입니다."
      },
      "source": {
        "path": "src/lib.rs",
        "start": 23,
        "end": 79,
        "why": "RateSchedule과 chance 구현을 연결하세요."
      },
      "warning": ""
    },
    {
      "group": "memory",
      "id": "m05",
      "title": "Vec · 슬라이스와 안전한 조회",
      "minutes": 15,
      "lead": "가변 길이 Vec은 Java ArrayList와 비슷하고 &[T]는 배열 일부에 대한 참조입니다.",
      "points": [
        "`vec![0.0; 3]`은 0.0을 세 개 만듭니다.",
        "push는 요소를 추가합니다.",
        "get(index)는 Option을 반환하므로 범위 벗어남을 처리할 수 있습니다."
      ],
      "java": "ArrayList<Double> a = new ArrayList<>();\na.add(1.0);",
      "rust": "let mut a = vec![0.0; 3];\na.push(1.0);\nlet first = a.get(0).copied().unwrap_or(0.0);",
      "annotation": "DP는 모든 상태의 확률을 Vec<f64>로 보관하고 매 회차 next.fill(0.0)으로 재사용합니다.",
      "task": {
        "prompt": "0.0 세 개를 가진 Vec을 만들고 1.0을 추가하세요.",
        "starter": "fn main() {\n    let mut mass = /* TODO */;\n    // TODO\n}",
        "answer": "fn main() {\n    let mut mass = vec![0.0; 3];\n    mass.push(1.0);\n}",
        "rules": [
          {
            "label": "벡터 초기화",
            "pattern": "vec!\\s*\\[\\s*0\\.0\\s*;\\s*3\\s*\\]"
          },
          {
            "label": "원소 추가",
            "pattern": "mass\\.push\\(1\\.0\\)"
          }
        ],
        "hint": "vec![value; count] 형식과 push를 조합하세요."
      },
      "quiz": {
        "question": "Vec 원소 조회 시 범위 오류를 Option으로 다루는 메서드는?",
        "options": [
          "push",
          "get",
          "swap",
          "fill"
        ],
        "correct": 1,
        "explanation": "get은 Some 또는 None을 반환합니다."
      },
      "source": {
        "path": "src/lib.rs",
        "start": 166,
        "end": 205,
        "why": "cur·next 배열의 생성과 fill을 보세요."
      },
      "warning": ""
    },
    {
      "group": "syntax",
      "id": "x01",
      "title": "enum · match와 모든 분기 처리",
      "minutes": 17,
      "lead": "Rust enum은 상태와 의미를 명시하고, match는 누락된 상태를 컴파일 단계에서 잡습니다.",
      "points": [
        "Game enum에는 네 게임 변형이 있습니다.",
        "match는 각 변형을 분기합니다.",
        "값을 보유하는 enum도 만들 수 있습니다."
      ],
      "java": "switch(game) { case HSR: return 160; default: return 300; }",
      "rust": "enum Game { Hsr, Stella }\nfn cost(g: Game)->usize {\n    match g { Game::Hsr=>160, Game::Stella=>300 }\n}",
      "annotation": "Game::ALL과 Game::label의 match를 읽으면 어떤 게임이 시스템에 있는지 알 수 있습니다.",
      "task": {
        "prompt": "두 게임의 기본 재화 비용을 구현하세요.",
        "starter": "enum Game { Hsr, Stella }\nfn cost(g: Game)->usize {\n    // TODO\n}",
        "answer": "enum Game { Hsr, Stella }\nfn cost(g: Game)->usize {\n    match g { Game::Hsr=>160, Game::Stella=>300 }\n}",
        "rules": [
          {
            "label": "match 사용",
            "pattern": "match\\s+g"
          },
          {
            "label": "스텔라 분기",
            "pattern": "Game::Stella\\s*=>\\s*300"
          }
        ],
        "hint": "match에서 각 enum 변형을 빠짐없이 작성하세요."
      },
      "quiz": {
        "question": "enum 분기를 하나 빠뜨린 match는?",
        "options": [
          "컴파일 오류",
          "자동으로 default",
          "null 반환",
          "항상 무시"
        ],
        "correct": 0,
        "explanation": "모든 경우를 처리해야 한다는 완전성을 검증합니다."
      },
      "source": {
        "path": "src/games.rs",
        "start": 7,
        "end": 34,
        "why": "Game enum과 label의 match를 읽으세요."
      },
      "warning": ""
    },
    {
      "group": "syntax",
      "id": "x02",
      "title": "Option · Some · None",
      "minutes": 18,
      "lead": "null을 타입에 숨기지 않고 '값이 없을 수 있음'을 명시하는 방식입니다.",
      "points": [
        "Option<T>는 Some(value) 또는 None입니다.",
        "unwrap_or(default)는 값이 없을 때 기본값을 돌려줍니다.",
        "Option의 ?는 None을 상위 호출자에게 전파합니다."
      ],
      "java": "Weapon w = map.get(id);\nif (w == null) return null;",
      "rust": "fn get(x: Option<usize>) -> usize {\n    x.unwrap_or(0)\n}",
      "annotation": "catalog::signature_weapon는 매핑이 없는 경우 None을 반환하여 임의 장비 연결을 차단합니다.",
      "task": {
        "prompt": "Option에서 값이 없으면 0을 반환하세요.",
        "starter": "fn safe(x: Option<usize>) -> usize {\n    // TODO\n}",
        "answer": "fn safe(x: Option<usize>) -> usize {\n    x.unwrap_or(0)\n}",
        "rules": [
          {
            "label": "안전한 기본값",
            "pattern": "x\\.unwrap_or\\(0\\)"
          }
        ],
        "hint": "Option의 unwrap_or를 사용하세요."
      },
      "quiz": {
        "question": "Option에서 값이 없을 때 사용하는 변형은?",
        "options": [
          "null",
          "Err",
          "None",
          "false"
        ],
        "correct": 2,
        "explanation": "없음을 None으로 명시합니다."
      },
      "source": {
        "path": "src/catalog.rs",
        "start": 180,
        "end": 202,
        "why": "signature_weapon의 ?와 Option 반환을 보세요."
      },
      "warning": ""
    },
    {
      "group": "syntax",
      "id": "x03",
      "title": "Result · Ok · Err · ?",
      "minutes": 18,
      "lead": "실패 가능성이 있는 연산은 Result<T,E>로 성공값과 오류를 구분합니다.",
      "points": [
        "Ok(value)는 성공, Err(error)는 실패입니다.",
        "?는 오류를 조기 전파합니다.",
        "Java의 예외 흐름과 비교해 코드 계약에 오류가 드러난다는 점을 기억하세요."
      ],
      "java": "if (n>15) throw new IllegalArgumentException(\"too many\");",
      "rust": "fn validate(n: usize)->Result<usize,String> {\n    if n>15 { return Err(\"too many\".into()); }\n    Ok(n)\n}",
      "annotation": "Banner::distribution은 목표 수가 범위를 벗어나면 Err를 반환합니다.",
      "task": {
        "prompt": "hard가 0이면 Err, 아니면 Ok(hard)를 반환하세요.",
        "starter": "fn check(hard: usize)->Result<usize,String>{\n    // TODO\n}",
        "answer": "fn check(hard: usize)->Result<usize,String>{\n    if hard == 0 { return Err(\"invalid\".into()); }\n    Ok(hard)\n}",
        "rules": [
          {
            "label": "실패값",
            "pattern": "Err\\s*\\("
          },
          {
            "label": "성공값",
            "pattern": "Ok\\s*\\(\\s*hard\\s*\\)"
          }
        ],
        "hint": "실패는 Err, 정상은 Ok를 사용합니다."
      },
      "quiz": {
        "question": "Result<T,E>의 변형은?",
        "options": [
          "Some/None",
          "Ok/Err",
          "Just/Nothing",
          "true/false"
        ],
        "correct": 1,
        "explanation": "반환형이 성공과 실패 가능성을 명시합니다."
      },
      "source": {
        "path": "src/lib.rs",
        "start": 153,
        "end": 166,
        "why": "distribution의 범위 검사와 Err를 찾으세요."
      },
      "warning": ""
    },
    {
      "group": "syntax",
      "id": "x04",
      "title": "이터레이터 · map · 클로저",
      "minutes": 18,
      "lead": "Rust 이터레이터는 Java Stream과 유사하지만 소유권/참조를 고려해야 합니다.",
      "points": [
        ".iter()는 요소를 빌려 순회합니다.",
        "map(|x| ...)에서 |x|는 클로저 인자입니다.",
        "collect()는 이터레이터를 Vec 등의 컨테이너로 모읍니다."
      ],
      "java": "IntStream.rangeClosed(1,3).map(n->n*2).toArray();",
      "rust": "let doubled: Vec<i32> = (1..=3)\n    .map(|n| n * 2).collect();",
      "annotation": "확률 엔진은 회차별 성공률을 한 번 계산하고 Vec으로 수집합니다.",
      "task": {
        "prompt": "1부터 3까지 두 배를 Vec으로 만드세요.",
        "starter": "fn main(){\n    let values: Vec<i32> = (1..=3)\n        // TODO\n        .collect();\n}",
        "answer": "fn main(){\n    let values: Vec<i32> = (1..=3)\n        .map(|n| n * 2)\n        .collect();\n}",
        "rules": [
          {
            "label": "map 클로저",
            "pattern": "\\.map\\s*\\(\\s*\\|n\\|\\s*n\\s*\\*\\s*2\\s*\\)"
          }
        ],
        "hint": "Java의 n -> n * 2와 비슷합니다."
      },
      "quiz": {
        "question": "`map(|n| n * 2)`의 |n|은?",
        "options": [
          "비트연산",
          "클로저 매개변수",
          "배열",
          "try-catch"
        ],
        "correct": 1,
        "explanation": "클로저의 매개변수를 |...| 사이에 정의합니다."
      },
      "source": {
        "path": "src/lib.rs",
        "start": 174,
        "end": 190,
        "why": "회차 확률을 미리 계산하는 .map을 찾으세요."
      },
      "warning": ""
    },
    {
      "group": "syntax",
      "id": "x05",
      "title": "테스트 · cargo test · assert",
      "minutes": 16,
      "lead": "수학 계산 프로그램은 경계값 테스트가 특히 중요합니다.",
      "points": [
        "#[test]가 테스트 함수를 지정합니다.",
        "assert_eq!는 결과 동등성을 검사합니다.",
        "`cargo test --all-targets`는 실행·라이브러리 타깃 테스트를 수행합니다.",
        "#[cfg(test)] 모듈은 테스트 빌드에서만 포함됩니다."
      ],
      "java": "@Test void testCost(){ assertEquals(300,cost(true)); }",
      "rust": "#[test]\nfn test_cost(){ assert_eq!(cost(true),300); }",
      "annotation": "원본 테스트에는 0개 목표, 픽업 실패 후 확정, 하드 천장, 분포 정규화 등의 사례가 있습니다.",
      "task": {
        "prompt": "0개 목표의 결과 PMF[0]이 1인지 테스트하세요.",
        "starter": "#[test]\nfn zero_goal(){\n    let pmf=vec![1.0_f64];\n    // TODO\n}",
        "answer": "#[test]\nfn zero_goal(){\n    let pmf=vec![1.0_f64];\n    assert_eq!(pmf[0],1.0);\n}",
        "rules": [
          {
            "label": "테스트 마커",
            "pattern": "#\\[test\\]"
          },
          {
            "label": "정확한 값 비교",
            "pattern": "assert_eq!\\s*\\(\\s*pmf\\[0\\]\\s*,\\s*1\\.0"
          }
        ],
        "hint": "assert_eq!(pmf[0], 1.0)를 사용합니다."
      },
      "quiz": {
        "question": "Rust의 일반적인 테스트 명령은?",
        "options": [
          "cargo test",
          "rust exec",
          "cargo test --no-run만",
          "rustc --test-only"
        ],
        "correct": 0,
        "explanation": "cargo test로 테스트를 실행합니다."
      },
      "source": {
        "path": "src/lib.rs",
        "start": 425,
        "end": 481,
        "why": "경계값 테스트의 전제와 기대값을 분석하세요."
      },
      "warning": ""
    },
    {
      "group": "engine",
      "id": "e01",
      "title": "GameSetup: 게임별 배너 규칙",
      "minutes": 20,
      "lead": "계산 모델이 어디서 생성되는지부터 추적합니다.",
      "points": [
        "Game enum은 4개 게임을 나타냅니다.",
        "GameSetup::new(Game)은 게임마다 캐릭터/장비 Banner를 만듭니다.",
        "RateSchedule과 BannerRule을 조합해 1회 확률·천장·픽업 보장을 나타냅니다.",
        "공식 모드와 커뮤니티 추정 모드는 구분됩니다."
      ],
      "java": "switch(game) { case HSR: return new Setup(90); ... }",
      "rust": "let setup = GameSetup::new(Game::StarRail);\nlet hard = setup.character.pity;",
      "annotation": "이 예시는 해당 프로젝트 타입을 참조하므로 독립 Rust Playground에는 그대로 복사해 실행할 수 없습니다.",
      "task": {
        "prompt": "게임별 기본 재화를 반환하는 독립 예제를 구현하세요.",
        "starter": "fn cost(is_stella: bool)->usize{\n    // TODO\n}",
        "answer": "fn cost(is_stella: bool)->usize{\n    if is_stella {300} else {160}\n}",
        "rules": [
          {
            "label": "게임 분기",
            "pattern": "if\\s+is_stella"
          },
          {
            "label": "스텔라 재화",
            "pattern": "300"
          }
        ],
        "hint": "stella면 300, 아니면 160으로 나누세요."
      },
      "quiz": {
        "question": "게임 선택 시 캐릭터/무기 배너 객체를 만드는 함수는?",
        "options": [
          "GameSetup::new",
          "Distribution::new",
          "Wallet::pay",
          "std::mem::swap"
        ],
        "correct": 0,
        "explanation": "게임별 기본 모델 생성 지점은 GameSetup::new입니다."
      },
      "source": {
        "path": "src/games.rs",
        "start": 105,
        "end": 150,
        "why": "StarRail/Wuwa/NTE/Stella의 분기를 비교하세요."
      },
      "warning": "게임 확률 규칙 중 미공개 조건은 커뮤니티 추정과 구분해야 합니다."
    },
    {
      "group": "engine",
      "id": "e02",
      "title": "재화 환산과 saturating_sub",
      "minutes": 19,
      "lead": "전용권·공용권·게임별 재화는 서로 무조건 교환 가능한 것이 아닙니다.",
      "points": [
        "available_flexible은 보유 공용권+완전한 1회분 재화만 계산합니다.",
        "Stella Sora의 300단위 Gold Disc는 잔여분을 보존합니다.",
        "saturating_sub는 무부호 정수 연산에서 0보다 작아질 때 0으로 멈춥니다."
      ],
      "java": "Math.max(0, required - owned);",
      "rust": "fn needed(required:usize,owned:usize)->usize{\n    required.saturating_sub(owned)\n}",
      "annotation": "프로젝트는 전용권 차감, 남은 부족 횟수, 환급 포인트 차감에 이 연산을 사용합니다.",
      "task": {
        "prompt": "전용권으로 충당하지 못하는 부족 횟수를 구하세요.",
        "starter": "fn needed(draws:usize, tickets:usize)->usize{\n    // TODO\n}",
        "answer": "fn needed(draws:usize, tickets:usize)->usize{\n    draws.saturating_sub(tickets)\n}",
        "rules": [
          {
            "label": "포화 뺄셈",
            "pattern": "draws\\.saturating_sub\\(tickets\\)"
          }
        ],
        "hint": "0 아래로 내려가지 않는 뺄셈을 사용하세요."
      },
      "quiz": {
        "question": "가챠 재화 159개, 비용 160개일 때 추가 뽑기 가능 횟수는?",
        "options": [
          "1회",
          "0회",
          "0.99375회",
          "2회"
        ],
        "correct": 1,
        "explanation": "1회를 완성하지 못한 잔여분은 즉시 뽑기 1회가 아닙니다."
      },
      "source": {
        "path": "src/games.rs",
        "start": 151,
        "end": 182,
        "why": "재화 잔여분과 부족량 처리 메서드를 읽으세요."
      },
      "warning": ""
    },
    {
      "group": "engine",
      "id": "e03",
      "title": "캐릭터와 전용 장비 연결",
      "minutes": 21,
      "lead": "선택한 캐릭터의 전용 무기·광추·아크·레코드가 어디서 연결되는지 찾습니다.",
      "points": [
        "signature_pairs.tsv는 명시적 캐릭터↔전용 장비 ID 연결표입니다.",
        "catalog::signature_weapon는 ID를 조회한 후 실제 카탈로그 장비인지 검증합니다.",
        "apply_catalog_choice는 캐릭터가 바뀌면 장비 ID도 함께 변경합니다.",
        "매핑이 없으면 이전 캐릭터의 장비를 비우는 것이 현재 정책입니다."
      ],
      "java": "String weaponId = signatures.get(characterId);\nselected = weaponId != null ? weaponId : \"\";",
      "rust": "*weapon = catalog::live_signature_weapon(game,id)\n    .map(|entry|entry.id.clone())\n    .unwrap_or_default();",
      "annotation": "Option.map과 unwrap_or_default를 통해 매핑이 없을 때 빈 String을 넣습니다. 단독 Playground 실행에는 catalog 모듈이 필요합니다.",
      "task": {
        "prompt": "매핑이 없으면 빈 String을 반환하세요.",
        "starter": "fn selected(weapon:Option<String>)->String{\n    // TODO\n}",
        "answer": "fn selected(weapon:Option<String>)->String{\n    weapon.unwrap_or_default()\n}",
        "rules": [
          {
            "label": "빈 String 기본값",
            "pattern": "weapon\\.unwrap_or_default\\(\\)"
          }
        ],
        "hint": "unwrap_or_default를 사용하세요."
      },
      "quiz": {
        "question": "매핑이 없는 캐릭터로 변경하면?",
        "options": [
          "기존 캐릭터 무기를 유지",
          "무작위 장비 자동 연결",
          "이전 장비 선택 초기화",
          "가장 비싼 무기 선택"
        ],
        "correct": 2,
        "explanation": "근거 없는 전용 장비 오매핑을 방지합니다."
      },
      "source": {
        "path": "src/main.rs",
        "start": 351,
        "end": 370,
        "why": "캐릭터 선택에서 weapon 갱신 코드를 확인하세요."
      },
      "warning": ""
    },
    {
      "group": "engine",
      "id": "e04",
      "title": "PMF · CDF · 기대값",
      "minutes": 25,
      "lead": "확률분포를 읽어야 그래프와 필요 뽑기 횟수를 해석할 수 있습니다.",
      "points": [
        "PMF[n]은 정확히 n회에서 목표를 처음 완료할 확률입니다.",
        "CDF[n]은 n회 이내 목표 달성 누적 확률입니다.",
        "기댓값 E[N]은 Σ n×PMF[n] 입니다.",
        "원본 Distribution::new가 이 세 값을 연결합니다."
      ],
      "java": "double acc=0; for(double p:pmf){acc+=p;cdf.add(acc);}",
      "rust": "let mut acc=0.0;\nfor &p in &pmf { acc+=p; cdf.push(acc); }",
      "annotation": "예제 PMF=[0,0.25,0.75]이면 CDF=[0,0.25,1]이고 평균은 1.75입니다. 교육용 예제이며 실제 배너 확률은 아닙니다.",
      "task": {
        "prompt": "PMF를 누적 CDF 배열로 바꾸세요.",
        "starter": "fn cdf(pmf:&[f64])->Vec<f64>{\n    let mut acc=0.0;\n    let mut out=Vec::new();\n    for &p in pmf { /* TODO */ }\n    out\n}",
        "answer": "fn cdf(pmf:&[f64])->Vec<f64>{\n    let mut acc=0.0;\n    let mut out=Vec::new();\n    for &p in pmf { acc+=p; out.push(acc); }\n    out\n}",
        "rules": [
          {
            "label": "누적 합",
            "pattern": "acc\\s*\\+=\\s*p"
          },
          {
            "label": "배열 입력",
            "pattern": "out\\.push\\(acc\\)"
          }
        ],
        "hint": "각 원소를 acc에 합산한 뒤 out에 넣습니다."
      },
      "quiz": {
        "question": "CDF[80]=0.6은 어떤 뜻인가요?",
        "options": [
          "정확히 80회째 60%",
          "80회 이내 목표 달성 60%",
          "평균 80회",
          "80회 이상 60%"
        ],
        "correct": 1,
        "explanation": "CDF는 그 횟수까지의 누적 성공 확률입니다."
      },
      "source": {
        "path": "src/lib.rs",
        "start": 331,
        "end": 374,
        "why": "Distribution::new/at/quantile을 읽으세요."
      },
      "warning": ""
    },
    {
      "group": "engine",
      "id": "e05",
      "title": "정확한 유한 상태 DP",
      "minutes": 30,
      "lead": "핵심 엔진이 모든 가능한 상태로 확률 질량을 전달하는 알고리즘입니다.",
      "points": [
        "상태=(현재 목표 획득 수, pity, 픽업 확정 여부)입니다.",
        "cur은 현재 회차 상태별 확률 질량, next는 다음 회차 상태를 가리킵니다.",
        "픽업 성공, 픽업 이탈(다음 확정), 희귀도 실패 세 가지로 전이합니다.",
        "같은 상태에 도달한 질량은 더하고, 회차마다 두 버퍼를 교체합니다."
      ],
      "java": "// Map<State, Double> cur; 각 상태의 질량 전파",
      "rust": "let success=mass*rate*featured;\nlet off=mass*rate-success;\nlet miss=mass*(1.0-rate);",
      "annotation": "전이되는 세 경우의 합계는 원래 mass와 같아야 합니다. 보증 상태일 때 featured=1.0으로 해석할 수 있습니다.",
      "task": {
        "prompt": "픽업 성공 질량을 계산하세요.",
        "starter": "fn success(mass:f64,rate:f64,featured:f64)->f64{\n    // TODO\n}",
        "answer": "fn success(mass:f64,rate:f64,featured:f64)->f64{\n    mass*rate*featured\n}",
        "rules": [
          {
            "label": "상태 질량과 확률의 곱",
            "pattern": "mass\\s*\\*\\s*rate\\s*\\*\\s*featured"
          }
        ],
        "hint": "전체 질량에 두 성공률을 곱하세요."
      },
      "quiz": {
        "question": "표준 배너 DP 상태에 들어가지 않는 것은?",
        "options": [
          "pity",
          "픽업 확정 여부",
          "목표 획득 수",
          "사용자 닉네임"
        ],
        "correct": 3,
        "explanation": "닉네임은 확률 전이에 영향을 주지 않습니다."
      },
      "source": {
        "path": "src/lib.rs",
        "start": 166,
        "end": 205,
        "why": "삼중 반복문과 next에 질량 누적하는 곳을 보세요."
      },
      "warning": "DP는 선택한 배너 규칙에 대해 결정론적이지만, 게임의 숨겨진 규칙까지 보증하는 것은 아닙니다."
    },
    {
      "group": "engine",
      "id": "e06",
      "title": "분포 합성: Convolution",
      "minutes": 22,
      "lead": "캐릭터·무기 성공까지 걸리는 독립 뽑기 횟수의 합계를 구합니다.",
      "points": [
        "캐릭터가 i회, 장비가 j회 필요한 결합 확률은 독립성 가정 아래 a[i]×b[j]입니다.",
        "전체 횟수는 i+j이므로 결과[i+j]에 질량을 더합니다.",
        "결과 길이는 len(a)+len(b)-1 입니다."
      ],
      "java": "for(int i=0;i<a.length;i++)\n for(int j=0;j<b.length;j++)out[i+j]+=a[i]*b[j];",
      "rust": "for(i,&a) in left.iter().enumerate(){\n for(j,&b) in right.iter().enumerate(){\n   out[i+j]+=a*b;\n }\n}",
      "annotation": "Distribution::combine은 0 질량을 건너뛰어 불필요한 곱셈을 줄입니다.",
      "task": {
        "prompt": "두 독립 사건이 함께 성공할 확률을 구하세요.",
        "starter": "fn both(a:f64,b:f64)->f64{\n    // TODO\n}",
        "answer": "fn both(a:f64,b:f64)->f64{\n    a*b\n}",
        "rules": [
          {
            "label": "독립 확률 곱",
            "pattern": "a\\s*\\*\\s*b"
          }
        ],
        "hint": "독립 사건의 결합 확률은 두 확률의 곱입니다."
      },
      "quiz": {
        "question": "길이 3, 4인 분포를 컨볼루션하면 결과 길이는?",
        "options": [
          "12",
          "7",
          "6",
          "4"
        ],
        "correct": 2,
        "explanation": "3+4-1=6입니다."
      },
      "source": {
        "path": "src/lib.rs",
        "start": 363,
        "end": 374,
        "why": "combine의 이중 반복문을 직접 추적하세요."
      },
      "warning": ""
    },
    {
      "group": "engine",
      "id": "e07",
      "title": "공용 재화 최적 배분",
      "minutes": 23,
      "lead": "적응적인 재화 사용과 고정된 배분을 구분합니다.",
      "points": [
        "캐릭터·무기 전용 티켓은 다른 종류에 옮길 수 없습니다.",
        "실제 필요량 Tc를 조건으로 성공확률을 누적하여 적응적 전략을 구합니다.",
        "best_fixed는 화면에 보여줄 고정 분배 예시를 찾는 별개 계산입니다."
      ],
      "java": "int need=Math.max(0,draws-dedicated);",
      "rust": "let need=draws.saturating_sub(dedicated);",
      "annotation": "optimal_allocation은 전용권과 유연한 공용 재화를 따로 받습니다. 고정 배분 예시의 확률을 적응적 전략의 확률과 동일시하면 안 됩니다.",
      "task": {
        "prompt": "전용권을 제외한 공용권 필요량을 구하세요.",
        "starter": "fn needed(draws:usize,dedicated:usize)->usize{\n    // TODO\n}",
        "answer": "fn needed(draws:usize,dedicated:usize)->usize{\n    draws.saturating_sub(dedicated)\n}",
        "rules": [
          {
            "label": "포화 뺄셈",
            "pattern": "draws\\.saturating_sub\\(dedicated\\)"
          }
        ],
        "hint": "필요 횟수가 보유 전용권보다 작아도 0을 반환해야 합니다."
      },
      "quiz": {
        "question": "실제 optimal_allocation이 구분하는 두 값은?",
        "options": [
          "성공률과 게임회사",
          "적응적 성공률과 표시용 고정 배분",
          "성공과 실패 로그",
          "이미지와 해시"
        ],
        "correct": 1,
        "explanation": "계산된 성공확률과 표시용 배분의 성격이 다릅니다."
      },
      "source": {
        "path": "src/lib.rs",
        "start": 376,
        "end": 423,
        "why": "조건부 합산과 best_fixed 루프를 구분하세요."
      },
      "warning": ""
    },
    {
      "group": "advanced",
      "id": "a01",
      "title": "환급 Wallet: 미래 포인트 금지",
      "minutes": 21,
      "lead": "뽑기 비용을 먼저 지불하고, 이후 발생한 환급을 다음 뽑기에 사용해야 합니다.",
      "points": [
        "Wallet은 포인트·비용·누적 뽑기·이미 지출한 포인트를 보관합니다.",
        "pay는 현재 회차 티켓을 지출하고, refund는 그 뒤 얻은 보상을 적립합니다.",
        "웨이브밴드 구입에 쓴 산호를 티켓으로 다시 사용하지 못하도록 차감합니다."
      ],
      "java": "wallet.pay();\nvar result=pull();\nwallet.refund(result.reward);",
      "rust": "wallet.pay(&mut dedicated);\n// 뽑기 수행\nwallet.refund(reward);",
      "annotation": "reconcile_funding은 재사용 가능한 환급 포인트에서 이미 지출한 포인트를 빼고 계산합니다.",
      "task": {
        "prompt": "이미 사용한 포인트를 제외하세요.",
        "starter": "fn available(points:usize,spent:usize)->usize{\n    // TODO\n}",
        "answer": "fn available(points:usize,spent:usize)->usize{\n    points.saturating_sub(spent)\n}",
        "rules": [
          {
            "label": "중복 사용 방지",
            "pattern": "points\\.saturating_sub\\(spent\\)"
          }
        ],
        "hint": "부족하면 0으로 멈춰야 합니다."
      },
      "quiz": {
        "question": "환급을 올바르게 적용하는 순서는?",
        "options": [
          "환급→과거 결제",
          "지불→뽑기→환급",
          "순서 무관",
          "환급을 두 번 사용"
        ],
        "correct": 1,
        "explanation": "미래에 얻은 재화를 이미 실행한 뽑기에 소급해 사용할 수 없습니다."
      },
      "source": {
        "path": "src/feedback.rs",
        "start": 292,
        "end": 351,
        "why": "pay/refund/reconcile_funding 흐름을 보세요."
      },
      "warning": ""
    },
    {
      "group": "advanced",
      "id": "a02",
      "title": "Monte Carlo와 난수",
      "minutes": 21,
      "lead": "환급 재투자 결과는 각 경로를 샘플링한 추정값입니다.",
      "points": [
        "정확한 DP는 상태 확률을 계산하고 Monte Carlo는 난수 표본을 반복합니다.",
        "SplitMix64는 재현 가능한 의사난수 생성기입니다.",
        "hits(p)는 uniform()<p로 성공을 결정합니다.",
        "표본 기반 값에는 표본오차가 존재합니다."
      ],
      "java": "boolean success=rng.nextDouble()<p;",
      "rust": "let success = rng.hits(p);",
      "annotation": "프로젝트 내부 SplitMix64는 public 함수가 아니므로 단독 코드 편집기 실행에 포함되지 않습니다. 원본과 연결해서 읽으세요.",
      "task": {
        "prompt": "난수 u와 확률 p로 성공 여부를 정하세요.",
        "starter": "fn hit(u:f64,p:f64)->bool{\n    // TODO\n}",
        "answer": "fn hit(u:f64,p:f64)->bool{\n    u<p\n}",
        "rules": [
          {
            "label": "확률 비교",
            "pattern": "u\\s*<\\s*p"
          }
        ],
        "hint": "0~1 난수가 p보다 작으면 성공입니다."
      },
      "quiz": {
        "question": "Monte Carlo 결과의 오차는?",
        "options": [
          "항상 0",
          "표본오차 가능",
          "언제나 100%",
          "컴파일과 관련 없음"
        ],
        "correct": 1,
        "explanation": "유한한 난수 표본으로 추정하므로 표본오차가 발생합니다."
      },
      "source": {
        "path": "src/feedback.rs",
        "start": 277,
        "end": 291,
        "why": "SplitMix64와 hits 구현을 해석하세요."
      },
      "warning": "정확 DP 확률과 MC 환급 추정치를 혼동해서는 안 됩니다."
    },
    {
      "group": "advanced",
      "id": "a03",
      "title": "egui 화면과 상태",
      "minutes": 23,
      "lead": "데스크톱 UI는 Rust eframe/egui의 immediate-mode로 그려집니다.",
      "points": [
        "Calculator는 게임 세션과 계산 결과를 보관합니다.",
        "eframe::App의 update가 프레임마다 UI를 그립니다.",
        "설정 변경 시 계산 요청이 일어나고 완료된 결과가 화면에 표시됩니다.",
        "웹 DOM/Java Swing과 위젯의 생명주기 관점이 다릅니다."
      ],
      "java": "button.addActionListener(e -> model.setValue(3));",
      "rust": "ui.horizontal(|ui| {\n    ui.label(\"현재 게임\");\n});",
      "annotation": "위 Rust 예시는 egui 의존성이 있어야 컴파일됩니다. 프로젝트 파일에서 실행 흐름을 읽는 목적입니다.",
      "task": {
        "prompt": "UI에 사용할 상태 값을 수정하는 함수를 만드세요.",
        "starter": "fn select(current:&mut usize,next:usize){\n    // TODO\n}",
        "answer": "fn select(current:&mut usize,next:usize){\n    *current=next;\n}",
        "rules": [
          {
            "label": "상태 갱신",
            "pattern": "\\*current\\s*=\\s*next"
          }
        ],
        "hint": "가변 참조로 실제 값을 바꾸세요."
      },
      "quiz": {
        "question": "egui의 UI 패러다임은?",
        "options": [
          "Immediate mode",
          "JSP",
          "DOM diff 필수",
          "Swing MVC만"
        ],
        "correct": 0,
        "explanation": "각 프레임의 상태를 기반으로 화면을 구성합니다."
      },
      "source": {
        "path": "src/main.rs",
        "start": 2125,
        "end": 2160,
        "why": "eframe::App 업데이트 진입부를 보세요."
      },
      "warning": ""
    },
    {
      "group": "advanced",
      "id": "a04",
      "title": "비동기 계산 결과 generation 검사",
      "minutes": 25,
      "lead": "이전 요청의 응답이 최신 입력 결과를 덮어쓰지 못하게 방지합니다.",
      "points": [
        "recalculate에서 generation을 증가시키고 작업을 보냅니다.",
        "poll_results는 응답 generation과 현재 값을 비교합니다.",
        "입력 변경이 대기 중이면 구버전 응답을 무시합니다.",
        "이는 결과 무효화이며 이미 실행 중인 작업을 자동으로 강제 종료하지는 않습니다."
      ],
      "java": "if(response.version != currentVersion) return;",
      "rust": "if response.generation != self.generation {\n    continue;\n}",
      "annotation": "원본은 pending_since.is_some()도 검사하여 입력값 변경 직후의 낡은 계산 결과를 피합니다.",
      "task": {
        "prompt": "받은 결과가 최신 버전인지 확인하세요.",
        "starter": "fn fresh(received:usize,current:usize)->bool{\n    // TODO\n}",
        "answer": "fn fresh(received:usize,current:usize)->bool{\n    received==current\n}",
        "rules": [
          {
            "label": "generation 일치 검사",
            "pattern": "received\\s*==\\s*current"
          }
        ],
        "hint": "두 세대 번호가 같아야 최신 결과입니다."
      },
      "quiz": {
        "question": "generation이 다른 응답을 받으면?",
        "options": [
          "화면 반영",
          "응답 무시",
          "무조건 오류 종료",
          "파일 삭제"
        ],
        "correct": 1,
        "explanation": "입력이 바뀐 뒤 과거 요청의 결과이기 때문입니다."
      },
      "source": {
        "path": "src/main.rs",
        "start": 630,
        "end": 688,
        "why": "recalculate → poll_results 흐름을 추적하세요."
      },
      "warning": ""
    },
    {
      "group": "advanced",
      "id": "a05",
      "title": "OnceLock · 인덱스 · 성능",
      "minutes": 20,
      "lead": "반복적으로 호출되는 캐릭터 조회에서 전체 목록 스캔을 피합니다.",
      "points": [
        "OnceLock은 단 한 번 초기화한 값을 안전하게 재사용합니다.",
        "카탈로그 인덱스는 HashMap<Game, Kind, ID> 구조로 접근합니다.",
        "UI가 다시 그려질 때마다 전체 TSV를 읽는 대신 ID 인덱스를 사용합니다.",
        "활성 카탈로그 갱신은 별도 경로이므로 정적 인덱스와 구분해야 합니다."
      ],
      "java": "static final Map<String,Item> INDEX = buildIndex();",
      "rust": "use std::sync::OnceLock;\nstatic N:OnceLock<usize>=OnceLock::new();\nfn n()->usize{*N.get_or_init(||42)}",
      "annotation": "원본 by_id의 초기 인덱스 구축과 live_by_id의 활성 데이터 조회를 나누어 보세요.",
      "task": {
        "prompt": "get_or_init로 정적 값을 초기화하세요.",
        "starter": "use std::sync::OnceLock;\nstatic N:OnceLock<usize>=OnceLock::new();\nfn read()->usize{\n    // TODO\n}",
        "answer": "use std::sync::OnceLock;\nstatic N:OnceLock<usize>=OnceLock::new();\nfn read()->usize{\n    *N.get_or_init(||42)\n}",
        "rules": [
          {
            "label": "지연 초기화",
            "pattern": "N\\.get_or_init\\(\\|\\|\\s*42\\)"
          }
        ],
        "hint": "정적 OnceLock의 get_or_init를 사용합니다."
      },
      "quiz": {
        "question": "카탈로그 인덱스를 한 번 구성하는 이유는?",
        "options": [
          "모든 캐릭터 무작위 선택",
          "반복 전체 검색 방지",
          "확률 증가",
          "그림 파일 압축"
        ],
        "correct": 1,
        "explanation": "반복 렌더링 중 전체 자료 탐색을 줄입니다."
      },
      "source": {
        "path": "src/catalog.rs",
        "start": 146,
        "end": 170,
        "why": "INDEX와 get_or_init, get ID 조회를 비교하세요."
      },
      "warning": ""
    },
    {
      "group": "advanced",
      "id": "a06",
      "title": "보안: CSV · 이미지 해시",
      "minutes": 20,
      "lead": "파일을 읽는 코드에는 입력 크기·경로·내용 검증이 필요합니다.",
      "points": [
        "프로젝트는 이미지 최대 512 KiB, CSV 최대 8 MiB 제한을 사용합니다.",
        "SHA-256으로 기대한 바이트 내용과 일치하는지 확인합니다.",
        "해시 일치가 원본의 의미적 정확성이나 완전한 안전성을 보장하지는 않습니다."
      ],
      "java": "if(size > 8*1024*1024) throw new IOException();",
      "rust": "fn allowed(size:u64)->bool{\n    size <= 8*1024*1024\n}",
      "annotation": "security.rs에서 파일 메타데이터를 검사하고 해시·경로·파일 유형을 확인하는 함수들을 살펴보세요.",
      "task": {
        "prompt": "CSV 8MiB 이하인지 확인하세요.",
        "starter": "fn allowed(size:u64)->bool{\n    // TODO\n}",
        "answer": "fn allowed(size:u64)->bool{\n    size <= 8*1024*1024\n}",
        "rules": [
          {
            "label": "크기 상한",
            "pattern": "size\\s*<=\\s*8\\s*\\*\\s*1024\\s*\\*\\s*1024"
          }
        ],
        "hint": "1MiB는 1024×1024 바이트입니다."
      },
      "quiz": {
        "question": "SHA-256 검증의 목적에 가장 가까운 것은?",
        "options": [
          "파일 무결성 비교",
          "이미지 인물 식별",
          "모든 악성 파일 탐지",
          "확률 분포 계산"
        ],
        "correct": 0,
        "explanation": "기대한 바이트 내용과 동일한지 확인합니다."
      },
      "source": {
        "path": "src/security.rs",
        "start": 15,
        "end": 120,
        "why": "해시·경로·크기 검사와 오류 반환을 읽으세요."
      },
      "warning": ""
    },
    {
      "group": "advanced",
      "id": "a07",
      "title": "CSV 관측 데이터와 우측 검열",
      "minutes": 24,
      "lead": "실제 가챠 로그에서 성공한 기록만 추리면 통계적 편향이 생길 수 있습니다.",
      "points": [
        "우측 검열은 아직 목표 사건이 일어나지 않은 채 관측이 끝난 경우입니다.",
        "성공 전의 사용자도 관측 기간 동안 위험집합에 기여합니다.",
        "원본 observations.rs는 검열을 고려한 생존분포와 모델을 비교합니다."
      ],
      "java": "// 완료 이벤트 없는 사람을 표본에서 버리면 편향 가능",
      "rust": "let survival = 1.0_f64;\nlet at_risk = 10.0;\nlet successes = 2.0;\nlet step = survival * (1.0 - successes / at_risk);",
      "annotation": "위 예에서 한 시점의 생존 비율은 0.8입니다. 전체 기간의 추정에는 각 시점의 위험집합을 순서대로 사용합니다.",
      "task": {
        "prompt": "단일 시점의 생존 비율을 계산하세요 (n>0 가정).",
        "starter": "fn step(n:f64,d:f64)->f64{\n    // TODO\n}",
        "answer": "fn step(n:f64,d:f64)->f64{\n    1.0-d/n\n}",
        "rules": [
          {
            "label": "비율 차감",
            "pattern": "1\\.0\\s*-\\s*d\\s*/\\s*n"
          }
        ],
        "hint": "해당 시점에서 아직 성공하지 않은 비율입니다."
      },
      "quiz": {
        "question": "완료된 뽑기 기록만 수집하면?",
        "options": [
          "항상 정확",
          "선택 편향 가능",
          "우측 검열 문제 없음",
          "모두 동일 데이터"
        ],
        "correct": 1,
        "explanation": "진행 중인 기록이 빠지면 추정치가 왜곡될 수 있습니다."
      },
      "source": {
        "path": "src/observations.rs",
        "start": 66,
        "end": 120,
        "why": "CSV 입력과 위험집합 데이터 검증을 보세요."
      },
      "warning": ""
    },
    {
      "group": "advanced",
      "id": "a08",
      "title": "종합 리뷰 · 경계 테스트",
      "minutes": 27,
      "lead": "이제 '이 함수가 무엇을 하는지'뿐 아니라 '언제 옳은지'를 확인합니다.",
      "points": [
        "0개 목표는 뽑기 0회에 성공확률 1이어야 합니다.",
        "CDF는 비감소하고 총 PMF는 정상화되어야 합니다.",
        "천장의 수학적 보증과 부동소수점 누적 오차를 구분합니다.",
        "테스트 통과가 공식 미공개 규칙까지 입증하지는 않습니다."
      ],
      "java": "assertEquals(1.0, pmf[0], 1e-12);",
      "rust": "#[test]\nfn zero_goal(){\n    let pmf=vec![1.0_f64];\n    assert_eq!(pmf[0],1.0);\n}",
      "annotation": "실제 테스트 0개 목표, 연속 픽업, 분포 정규화, 게임별 천장 등을 열어 전제/기댓값/반례를 작성해 보세요.",
      "task": {
        "prompt": "0개 목표의 PMF[0] 값이 1인지 확인하는 테스트를 만드세요.",
        "starter": "#[test]\nfn zero_goal(){\n    let pmf=vec![1.0_f64];\n    // TODO\n}",
        "answer": "#[test]\nfn zero_goal(){\n    let pmf=vec![1.0_f64];\n    assert_eq!(pmf[0],1.0);\n}",
        "rules": [
          {
            "label": "테스트 마커",
            "pattern": "#\\[test\\]"
          },
          {
            "label": "0회 확률 검사",
            "pattern": "assert_eq!\\s*\\(\\s*pmf\\[0\\]\\s*,\\s*1\\.0"
          }
        ],
        "hint": "assert_eq!(pmf[0], 1.0); 를 사용하세요."
      },
      "quiz": {
        "question": "테스트가 통과하면 무엇이 보증되나요?",
        "options": [
          "모든 미공개 게임 규칙",
          "작성한 테스트 조건의 실행 결과",
          "모든 배너의 미래 확률",
          "사용자 데이터의 무결성 전체"
        ],
        "correct": 1,
        "explanation": "테스트가 실제로 검사한 전제와 범위에 한정됩니다."
      },
      "source": {
        "path": "src/lib.rs",
        "start": 425,
        "end": 524,
        "why": "테스트 하나를 골라 조건/기댓값/반례를 적으세요."
      },
      "warning": ""
    }
  ],
  "files": [
    [
      "Cargo.toml",
      "프로젝트·라이브러리 설정",
      1,
      18
    ],
    [
      "src/games.rs",
      "네 게임의 데이터·재화·Banner 생성",
      7,
      183
    ],
    [
      "src/lib.rs",
      "확률 엔진, PMF/CDF, 분포 합성",
      17,
      423
    ],
    [
      "src/feedback.rs",
      "환급 Wallet과 Monte Carlo",
      277,
      658
    ],
    [
      "src/catalog.rs",
      "카탈로그와 서명 무기 연결",
      108,
      202
    ],
    [
      "src/main.rs",
      "메인 UI · 선택 · 계산 작업자",
      343,
      689
    ],
    [
      "src/dashboard_ui.rs",
      "Dashboard 패널과 그래프",
      172,
      300
    ],
    [
      "src/observations.rs",
      "실측 CSV·우측 검열",
      66,
      306
    ],
    [
      "src/runtime_updates.rs",
      "데이터 갱신과 검증",
      133,
      351
    ],
    [
      "src/security.rs",
      "이미지·CSV 입력 보안",
      15,
      120
    ],
    [
      "src/signature_pairs.tsv",
      "전용 장비 쌍 데이터",
      1,
      80
    ]
  ]
};
