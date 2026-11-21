# 用自己的系统和文案做产品宣传片

**[打开工作流（SKILL.md）](SKILL.md)** · **[下载完整 Skill（含团队女声和 Remotion Studio 工程）](https://github.com/BiQing-hc/product-screen-film/releases/latest/download/product-screen-film.zip)**

这个仓库就是 Codex Skill `product-screen-film`。给它你的系统入口、旁白文案和想讲清楚的业务问题，它会先整理大纲与操作分镜。你确认后，再用真实画面和同一位女声制作视频，交付 MP4 和可继续修改的工程。

## 1. 安装到你的项目

1. 下载上方的完整 Skill 并解压，找到里面直接包含 `SKILL.md` 的 `product-screen-film` 文件夹。
2. 把这个文件夹放到你的视频项目目录下的 `.agents/skills/`。缺少的目录可以新建。装好后的文件位置应为 `你的项目/.agents/skills/product-screen-film/SKILL.md`。如果你的系统只有网页入口，也可以新建一个视频项目文件夹来放脚本和录屏。
3. 用 Codex 打开**你的项目根目录**，新开对话，输入 `$product-screen-film`。列表里的显示名是「真实系统宣传片」。

## 2. 复制这段指令给 Codex

把方括号里的内容换成自己的信息。文案可以直接粘贴，也可以填写项目里的文件名。已有录屏就填位置，需要从网页录制就填可操作的演示入口。

```text
请用 $product-screen-film 为我的系统制作一条产品讲解视频。

系统名称和演示入口：【名称、可访问的网址】
给谁看、希望多长：【例如：给调度负责人看，约 60 秒】
要讲清楚的问题：【例如：发现设备故障后，系统怎样帮调度员派单并确认处理进度】
我的旁白文案：【粘贴文案，或填写文件路径】
可用素材：【已有录屏或资料目录，以及需要新录的操作】

先依据我的文案和真实页面给出大纲与分镜，每一段写清「用户做了什么、系统如何响应、观众能看到什么结果」。等我确认后再制作。
请在独立的制作工程里使用 Skill 自带的团队女声，正常语速连续讲述。把实际操作录清楚，按声音对齐画面和字幕，用 Remotion Studio 剪辑。最后交付 MP4、可编辑工程，并告诉我怎样单独修改其中一镜。
```

## 3. 审稿、试听和拿成片

| 到了哪一步 | 你可以看什么、改什么 |
| --- | --- |
| 审大纲和分镜 | 对照自己的系统，确认每个业务结论能由哪个实际操作和结果证明。比如讲派单时，要能看到同一张工单从「待派单」变成「已派单」。[制作手册](references/制作手册.md) |
| 用自己的文案配音 | 制作时将 Skill 的整个 `assets/remotion` 复制为项目工程。在这份工程中改 `配音/旁白.txt`，在 M 系列 Mac 上双击 `配音/生成女声.command`。首次需要 uv 和约 2.3 GB 的模型下载。生成的 WAV 自动接到「团队女声」轨。Windows 或 Intel Mac 可使用队友生成的 WAV。[配音说明](assets/remotion/配音/使用说明.md) |
| 预览和修改 | 在**复制出来的工程**中，首次运行 `npm ci` 安装依赖，再运行 `npm run studio` 打开 Remotion Studio，选择 **ProductFilm**。在时间线上按名称找到镜头，核对画面、字幕和配音。[团队接片与单镜修改](references/团队接片.md) |
| 导出成片 | 工程所在电脑安装 FFmpeg 和 ffprobe 后，运行 `npm run render`，成片在 `out/product-film.mp4`。保留该工程和 `public/` 素材，下次可以接着改。 |
