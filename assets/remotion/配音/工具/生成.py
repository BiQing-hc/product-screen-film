"""Generate the project narration with the film's original voice profile."""
import hashlib
import json
import math
import os
from pathlib import Path
import platform
import shutil
import subprocess
import sys
import tempfile
import wave

from huggingface_hub import snapshot_download

tools = Path(__file__).resolve().parent
voice_dir = tools / "声音"
project = tools.parent.parent
revision = "37e955a1deb861c088ae5f3a67043185f3d1a60c"


def main():
    if (platform.system(), platform.machine()) != ("Darwin", "arm64"):
        raise ValueError("请在 M 系列芯片的 Mac 上生成旁白。")
    text = "".join(line.strip() for line in (tools.parent / "旁白.txt").read_text(encoding="utf-8-sig").splitlines())
    if not text:
        raise ValueError("请先将旁白文案写入「配音/旁白.txt」。")
    cfg = json.loads((voice_dir / "音色配置.json").read_text(encoding="utf-8"))
    reference = voice_dir / "统一女声明样.wav"
    if hashlib.sha256(reference.read_bytes()).hexdigest() != cfg["reference_sha256"]:
        raise ValueError("样音校验失败，请从团队 Skill 恢复工具/声音目录。")

    local = os.environ.get("EVCS_REFERENCE_TTS")
    if local:
        model = Path(local).expanduser().resolve()
    else:
        print("正在准备团队女声模型。首次使用需要下载约 2.3 GB。", flush=True)
        model = Path(snapshot_download(repo_id=cfg["model"], revision=revision))
    if not all((model / p).is_file() for p in ["model.safetensors", "speech_tokenizer/model.safetensors"]):
        raise ValueError("模型目录缺少完整权重或语音分词器。")
    output = project / "public" / "audio" / "旁白.wav"
    output.parent.mkdir(parents=True, exist_ok=True)
    with tempfile.TemporaryDirectory(prefix=".recording-", dir=tools.parent) as temp:
        work = Path(temp)
        shutil.copyfile(tools / "录音.py", work / "录音.py")
        shutil.copytree(voice_dir, work / "声音")
        (work / "脚本.json").write_text(json.dumps([{"voice": [text]}], ensure_ascii=False), encoding="utf-8")
        print("正在用团队女声连续讲述新文案……", flush=True)
        subprocess.run([sys.executable, str(work / "录音.py")],
                       env={**os.environ, "EVCS_REFERENCE_TTS": str(model)}, check=True)
        audio = work / "声音/全片连续女声.wav"
        with wave.open(str(audio)) as wav:
            duration = wav.getnframes() / wav.getframerate()
            if duration <= 0:
                raise ValueError("这次没有生成有效录音。")
        os.replace(audio, output)
    print(f"旁白已生成，{duration:.2f} 秒。若从片头播放，30 fps 时间线至少需 {math.ceil(duration * 30)} 帧。")
    print(f"{output}\n在 Remotion Studio 打开或刷新 ProductFilm，试听并对齐字幕与镜头。")


if __name__ == "__main__":
    try:
        main()
    except (OSError, ValueError, subprocess.CalledProcessError) as error:
        sys.exit(str(error))
