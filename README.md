# Background_Invisibility

이미지(PNG, JPEG, WEBP)를 업로드하면 AI가 배경을 지워 투명 PNG로 돌려주고, 바로 다운로드할 수 있는 웹사이트입니다.

## 기능

- 클릭 또는 드래그 앤 드롭으로 이미지 업로드 (PNG, JPEG, WEBP, 최대 20MB)
- [rembg](https://github.com/danielgatis/rembg)의 `u2net` 모델로 배경 제거
- 원본과 결과를 나란히 비교 (투명 영역은 체크무늬로 표시)
- 결과를 `원본이름_nobg.png`로 다운로드

## 구조

```
Background_Invisibility/
├── server.py          # Flask 서버 (배경 제거 API + 정적 파일 제공)
├── requirements.txt   # 파이썬 의존성
└── static/
    ├── index.html     # 화면 구조와 스타일
    └── app.js         # 업로드, 서버 요청, 미리보기, 다운로드
```

## 설치

Python 3.9 이상이 필요합니다.

```bash
cd Background_Invisibility
python3 -m venv .venv
.venv/bin/pip install -r requirements.txt
```

## 실행

```bash
.venv/bin/python server.py
```

브라우저에서 http://127.0.0.1:5000 을 엽니다. 종료는 터미널에서 `Ctrl+C`.

> 처음 실행하면 AI 모델(약 170MB)을 `~/.u2net`에 내려받기 때문에 시작이 조금 느립니다.

## API

### `POST /api/remove-bg`

| 항목 | 내용 |
| --- | --- |
| 요청 | `multipart/form-data`, 필드 이름 `image` |
| 성공 | `200`, 배경이 투명한 `image/png` |
| 실패 | `400` 지원하지 않는 형식 또는 읽을 수 없는 이미지, `413` 20MB 초과. 본문은 `{"error": "..."}` |

```bash
curl -F image=@photo.jpg http://127.0.0.1:5000/api/remove-bg -o photo_nobg.png
```

## 모델 바꾸기

경계를 더 정교하게 따고 싶다면 `server.py`의 `new_session("u2net")`을 `"isnet-general-use"`나 `"birefnet-general"`로 바꿔 보세요. 정확도는 올라가지만 처리 속도는 느려집니다.
