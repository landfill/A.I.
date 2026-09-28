# A.I. 팝업북

스티븐 스필버그 감독의 영화 「A.I.」(2001)의 이야기를 열네 장면의 입체 팝업북으로 다시 엮은 비공식 헌정 작품입니다.
책장을 넘기면 종이 조각이 경첩처럼 일어서며 장면이 펼쳐지고, 한 여성 나레이터가 이야기를 읽어 줍니다.

**바로 보기:** https://landfill.github.io/A.I./

> An unofficial tribute pop-up book for Steven Spielberg's film *A.I.* (2001), told in fourteen paper scenes with a woman narrator. Korean and English are both available.

## 특징

- **입체 팝업북.** 장면마다 종이 조각이 책장 넘김에 맞춰 차례로 일어서고, 덮을 때는 다시 접혀 눕습니다. 오려낸 종이의 흰 단면, 종이 결, 그림자까지 표현했습니다.
- **빛과 분위기.** 장면마다 조명 색, 안개, 떠다니는 먼지·거품·눈·반딧불이 천천히 바뀝니다.
- **대사 없는 나레이션.** 등장인물의 대사는 한 줄도 없고, 모든 이야기를 여성 나레이터의 3인칭 서술로 풀었습니다. 문장은 영화 대사를 옮기지 않고 새로 썼습니다.
- **모든 그림과 음악을 코드로.** 이미지나 오디오 파일이 하나도 없습니다.
  - 그림: Canvas 2D로 그린 종이 조각을 Three.js 장면에 세웁니다.
  - 음악: Web Audio로 패드 화음, 오르골 선율, 잔향을 실시간 합성합니다. 장면마다 조성과 분위기가 바뀌고, 나레이션이 나오는 동안에는 음악이 작아집니다.
  - 효과음: 책장 넘기는 소리, 팝업이 일어서는 소리도 노이즈 합성으로 만듭니다.
- **한국어 / English.** 상단 지구본 버튼으로 전환합니다. 화면 글자, 책장에 인쇄된 문구, 표지, 나레이션 언어가 함께 바뀝니다.

## 열네 장면

| 장 | 한국어 | English |
|---|---|---|
| 1 | 물에 잠긴 세상 | The Drowned World |
| 2 | 하얀 빛 속의 아이 | The Boy in the White Light |
| 3 | 일곱 개의 단어 | Seven Words |
| 4 | 테디 | Teddy |
| 5 | 달빛과 가위 | Moonlight and Scissors |
| 6 | 물속의 밤 | Night Beneath the Water |
| 7 | 숲에 남겨진 아이 | Left in the Forest |
| 8 | 달이 뜨는 밤 | The Night the Moon Rose |
| 9 | 루즈 시티 | Rouge City |
| 10 | 세상의 끝 | The End of the World |
| 11 | 푸른 요정 | The Blue Fairy |
| 12 | 이천 년의 얼음 | Two Thousand Years of Ice |
| 13 | 단 하루 | Just One Day |
| 14 | 꿈이 시작되는 곳 | Where Dreams Begin |

## 조작

| 동작 | 방법 |
|---|---|
| 다음 / 이전 장 | 화면 아래 화살표, 키보드 `→` `←`, 좌우로 쓸어 넘기기 |
| 원하는 장으로 이동 | 아래쪽 점(장 목록) 클릭 |
| 표지로 돌아가기 | 「표지로」 버튼, `Esc` 또는 `Home` |
| 음악 · 낭독 켜고 끄기 | 상단 「음악」, 「낭독」 버튼 |
| 자동 넘김 | 상단 「자동 넘김」 버튼. 켜 두면 낭독이 끝난 뒤 다음 장으로 넘어갑니다 |
| 다시 듣기 | 상단 「다시 듣기」 버튼 |
| 언어 전환 | 상단 지구본 버튼. 처음에는 영어로 열리고, 선택한 언어는 다음 방문 때도 유지 |

## 실행하기

빌드 과정이 없는 정적 파일입니다.

- `index.html`을 브라우저로 바로 열면 됩니다. (ES 모듈을 쓰지 않아 파일을 직접 열어도 동작합니다)
- 로컬 서버로 띄우려면:

```bash
python -m http.server 5178
```

이후 `http://localhost:5178`에 접속합니다. 소리는 브라우저 정책상 「책 펼치기」를 누른 뒤부터 나옵니다.

## 나레이션 목소리에 대해

나레이션은 브라우저의 [Web Speech API](https://developer.mozilla.org/docs/Web/API/Web_Speech_API)로 읽습니다. 문장과 재생 시점은 코드가 정하지만, 목소리 자체는 기기에 설치된 음성을 씁니다.

- 코드는 **여성 목소리만** 골라 씁니다. 기기에 해당 언어의 여성 음성이 없으면 소리 없이 자막으로만 이야기를 보여 주고, 화면에 안내를 띄웁니다.
- 한국어: Windows의 Microsoft Heami, Edge의 SunHi(Natural), macOS의 Yuna, Chrome의 Google 한국의 음성 등을 우선 사용합니다.
- 영어: Edge의 Aria·Jenny(Natural), Chrome의 Google US English, Windows의 Zira, macOS의 Samantha 등을 우선 사용합니다.
- 영어 음성이 없다면 Windows 설정 → 시간 및 언어 → 음성에서 영어 음성을 추가하거나, Edge·Chrome으로 열어 보세요.

## 파일 구조

```
index.html          화면 뼈대 (버튼, 자막, 표지 안내)와 스크립트 불러오기
css/style.css       UI 스타일
js/paper.js         공용 유틸, 종이 오리기·그리기 도구, 종이 단면·결 마감
js/scenes.js        14장면 데이터: 한국어 나레이션, 조명, 음악 분위기, 종이 조각 그림
js/i18n.js          영어판 본문, 화면 문구(한국어·영어), 현재 언어
js/book.js          Three.js 무대, 책과 넘기는 책장, 팝업 동작, 빛·물·입자, 카메라
js/audio.js         배경음악과 효과음 합성
js/narration.js     여성 나레이션 (언어별 여성 목소리 선택)
js/main.js          책장 넘기기 제어, 자막, 언어 전환, 입력, 렌더 루프와 시작
```

스크립트는 모듈 없이 일반 `<script>` 태그로 위 순서대로 불러옵니다. 각 파일의 최상위 선언은 모든 스크립트가 함께 쓰는 전역 범위에 놓이므로, 뒤 파일은 앞 파일에서 선언한 이름을 그대로 씁니다. 파일을 추가할 때는 `index.html`의 불러오는 순서에 맞춰 넣어 주세요.

장면을 고치거나 추가하려면 `js/scenes.js`의 `SC` 배열(한국어)과 `js/i18n.js`의 `EN` 배열(영어)을 같은 순서로 함께 수정하면 됩니다.

## 기술

- [Three.js](https://threejs.org/) r128: 3D 장면, 그림자, 조명
- Canvas 2D: 모든 종이 조각, 책장, 표지 그림
- Web Audio API: 배경음악과 효과음 합성
- Web Speech API: 여성 나레이션
- Google Fonts: Gowun Batang, Cormorant Garamond

외부에서 불러오는 것은 Three.js 라이브러리(cdnjs)와 글꼴 두 가지뿐입니다.
`prefers-reduced-motion` 설정을 켜면 카메라 흔들림이 꺼지고 책장 넘김이 짧아집니다.

## 저작권 안내

이 저장소는 영화 「A.I. Artificial Intelligence」(2001)에서 영감을 받은 **비공식 팬 헌정 작품**이며, 영화사나 제작진과 관련이 없습니다.
영화의 이미지, 음악, 대사를 사용하지 않았고, 모든 그림과 음악, 나레이션 문장은 이 프로젝트를 위해 새로 만들었습니다.
