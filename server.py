import io

from flask import Flask, request, send_file, jsonify
from PIL import Image
from rembg import new_session, remove

app = Flask(__name__, static_folder="static", static_url_path="")
app.config["MAX_CONTENT_LENGTH"] = 20 * 1024 * 1024  # 20MB

ALLOWED = {"image/png", "image/jpeg", "image/webp"}
session = new_session("u2net")  # 첫 실행 시 모델(~170MB)을 ~/.u2net 에 다운로드


@app.get("/")
def index():
    return app.send_static_file("index.html")


@app.post("/api/remove-bg")
def remove_bg():
    file = request.files.get("image")
    if file is None or file.mimetype not in ALLOWED:
        return jsonify(error="PNG, JPEG, WEBP 이미지만 업로드할 수 있습니다."), 400
    try:
        img = Image.open(file.stream)
        img.load()
    except Exception:
        return jsonify(error="이미지를 읽을 수 없습니다."), 400

    result = remove(img, session=session)
    buf = io.BytesIO()
    result.save(buf, format="PNG")
    buf.seek(0)
    return send_file(buf, mimetype="image/png")


@app.errorhandler(413)
def too_large(_):
    return jsonify(error="파일은 20MB 이하만 업로드할 수 있습니다."), 413


if __name__ == "__main__":
    app.run(host="127.0.0.1", port=5000)
