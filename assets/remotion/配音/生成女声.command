#!/bin/zsh
set -eu
cd -- "$(dirname -- "$0")"
if [[ "$(uname -s)" != Darwin || "$(uname -m)" != arm64 ]]; then
  echo '此配音入口适用于 M 系列芯片的 Mac。生成的 WAV 可以在其他电脑上剪辑。'
  exit 1
fi
export PATH="$PATH:$HOME/.local/bin:/opt/homebrew/bin:/usr/local/bin"
if [[ -x .venv/bin/python ]]; then
  exec .venv/bin/python 工具/生成.py
fi
if ! command -v uv >/dev/null; then
  echo '首次使用请先安装 uv；如果已装 Homebrew，可以运行 brew install uv。也可以按《使用说明》用 Python 3.11 配置。'
  exit 1
fi
exec uv run --no-project --python 3.11 --with-requirements 工具/依赖.txt 工具/生成.py
