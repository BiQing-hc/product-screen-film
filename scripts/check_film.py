"""Verify a video and extract a frame from the middle of each shot listed in a UTF-8 CSV."""
import argparse
import csv
import json
import math
import shutil
import subprocess
import sys
from fractions import Fraction
from pathlib import Path


def run(args):
    return subprocess.run([str(arg) for arg in args], check=True, capture_output=True, text=True)


def shot_cues(path, duration, tolerance):
    shots = []
    if path is None:
        return shots
    with path.open(encoding="utf-8-sig", newline="") as file:
        reader = csv.DictReader(file)
        fields = set(reader.fieldnames or [])
        columns = next(((a, b) for a, b in [("成片入点秒", "成片出点秒"), ("开始秒", "结束秒")]
                        if {"镜头", a, b}.issubset(fields)), None)
        if columns is None:
            raise ValueError("镜头表应含镜头及一对时间列：开始秒/结束秒，或成片入点秒/成片出点秒。")
        start_column, end_column = columns
        for line, row in enumerate(reader, 2):
            if not any((value or "").strip() for value in row.values()):
                continue
            name = row["镜头"].strip()
            try:
                start, end = float(row[start_column]), float(row[end_column])
            except ValueError as error:
                raise ValueError(f"镜头表第 {line} 行请填写成片起止秒数。") from error
            if not name or not (math.isfinite(start) and math.isfinite(end)
                                and 0 <= start < end <= duration + tolerance):
                raise ValueError(f"镜头表第 {line} 行名称或时间超出影片范围。")
            shots.append((name, (start + min(end, duration)) / 2))
    if not shots:
        raise ValueError("镜头表只有表头，请填写实际镜头再抽帧。")
    return shots


def main():
    parser = argparse.ArgumentParser(description="检查发送用 MP4 并生成可供人工对照的镜头截图。")
    parser.add_argument("movie", type=Path)
    parser.add_argument("--shots", type=Path)
    parser.add_argument("--out", type=Path, required=True, help="新建的验片目录")
    parser.add_argument("--size", default="1920x1080")
    parser.add_argument("--fps", type=Fraction, default=Fraction(30))
    parser.add_argument("--duration", type=float, help="预期成片秒数，允许一帧误差")
    args = parser.parse_args()
    for tool in ("ffmpeg", "ffprobe"):
        if not shutil.which(tool):
            raise ValueError(f"请让 {tool} 在本机命令行中可用。")
    if not args.movie.is_file():
        raise ValueError("找不到指定视频。")
    probe = json.loads(run(["ffprobe", "-v", "error", "-show_format", "-show_streams",
                            "-of", "json", args.movie]).stdout)
    streams = probe["streams"]
    video = next((s for s in streams if s["codec_type"] == "video"
                  and not s.get("disposition", {}).get("attached_pic")), None)
    audio = next((s for s in streams if s["codec_type"] == "audio"), None)
    if video is None or audio is None:
        raise ValueError("未找到完整的画面和声音轨道。")
    size = f"{video['width']}x{video['height']}"
    fps = Fraction(video["avg_frame_rate"])
    if size != args.size or abs(fps - args.fps) > Fraction(1, 1000):
        raise ValueError(f"本片为 {size}、{float(fps):g} fps，请核对预期规格。")
    if video["codec_name"] != "h264" or audio["codec_name"] != "aac":
        raise ValueError("本工作流的发送规格是 H.264 画面加 AAC 声音。")
    duration = float(probe["format"]["duration"])
    if args.duration is not None:
        if not math.isfinite(args.duration) or args.duration <= 0:
            raise ValueError("预期时长应是大于零的秒数。")
        if abs(duration - args.duration) > 1 / float(fps):
            raise ValueError(f"成片长 {duration:.3f} 秒，预期 {args.duration:g} 秒。")
    shots = shot_cues(args.shots, duration, 1 / float(fps))
    if args.out.exists():
        raise ValueError("验片目录已存在，请给这次检查一个新目录名。")
    run(["ffmpeg", "-nostdin", "-v", "error", "-xerror", "-i", args.movie,
         "-map", f"0:{video['index']}", "-map", f"0:{audio['index']}", "-f", "null", "-"])
    args.out.mkdir(parents=True)
    extracts = []
    for number, (name, time) in enumerate(shots, 1):
        target = args.out / f"{number:02d}.jpg"
        run(["ffmpeg", "-nostdin", "-v", "error", "-ss", f"{time:.5f}", "-i", args.movie,
             "-map", f"0:{video['index']}", "-frames:v", "1", "-q:v", "2", target])
        if not target.is_file() or target.stat().st_size == 0:
            raise ValueError(f"镜头 {name} 抽帧失败。")
        extracts.append({"镜头": name, "抽取秒数": round(time, 3), "图片": target.name})
    report = {"文件": args.movie.name, "时长秒": duration, "画面": size, "帧率": str(fps),
              "声音声道": audio["channels"], "音视频完整解码": "通过", "待人工对照的截图": extracts}
    (args.out / "验片结果.json").write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"全片解码通过，时长 {duration:.2f} 秒，已抽取 {len(shots)} 张画面。")


if __name__ == "__main__":
    try:
        main()
    except subprocess.CalledProcessError as error:
        sys.exit(str(error.stderr or error)[:1800])
    except (ValueError, OSError) as error:
        sys.exit(str(error))
