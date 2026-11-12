const $ = (id) => document.getElementById(id);
const drop = $("drop"), fileInput = $("file");
let resultUrl;

fileInput.addEventListener("change", () => fileInput.files[0] && handle(fileInput.files[0]));
["dragover", "dragenter"].forEach(e => drop.addEventListener(e, ev => { ev.preventDefault(); drop.classList.add("over"); }));
["dragleave", "drop"].forEach(e => drop.addEventListener(e, () => drop.classList.remove("over")));
drop.addEventListener("drop", ev => { ev.preventDefault(); ev.dataTransfer.files[0] && handle(ev.dataTransfer.files[0]); });
$("again").addEventListener("click", reset);

async function handle(file) {
  $("error").textContent = "";
  if (!["image/png", "image/jpeg", "image/webp"].includes(file.type)) {
    $("error").textContent = "PNG, JPEG, WEBP 이미지만 업로드할 수 있습니다.";
    return;
  }
  drop.style.display = "none";
  $("result").style.display = "grid";
  $("actions").style.display = "none";
  $("before").src = URL.createObjectURL(file);
  $("after").style.display = "none";
  $("afterFrame").insertAdjacentHTML("beforeend", '<div class="spinner" id="spin"></div>');

  try {
    const form = new FormData();
    form.append("image", file);
    const res = await fetch("/api/remove-bg", { method: "POST", body: form });
    if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error || "처리 중 오류가 발생했습니다.");
    if (resultUrl) URL.revokeObjectURL(resultUrl);
    resultUrl = URL.createObjectURL(await res.blob());
    $("after").src = resultUrl;
    $("after").style.display = "";
    $("download").href = resultUrl;
    $("download").download = file.name.replace(/\.[^.]+$/, "") + "_nobg.png";
    $("actions").style.display = "flex";
  } catch (e) {
    $("error").textContent = e.message;
    $("actions").style.display = "flex";
    $("download").style.display = "none";
  } finally {
    $("spin")?.remove();
  }
}

function reset() {
  fileInput.value = "";
  drop.style.display = "";
  $("result").style.display = "none";
  $("actions").style.display = "none";
  $("download").style.display = "";
  $("error").textContent = "";
}
