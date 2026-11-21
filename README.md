# 用真实系统画面做产品宣传片

团队共用的 Codex Skill，制作工作台是 **Remotion Studio**。可以从一个业务问题做到成片，也可以接手已有工程，只改其中一个镜头。

[下载含女声的完整制作包](https://github.com/BiQing-hc/product-screen-film/releases/latest/download/product-screen-film.zip)

**第一次用，先看[同事安装与接片指南](references/团队接片.md)。** 把仓库放到目标项目的 `.agents/skills/product-screen-film/`，在 Codex 中打开目标项目并输入：

> 请用 $product-screen-film 为【系统名称】制作给【观众】看的【时长】宣传片，重点讲清【系统解决的问题】。入口是【地址】，录屏或资料在【目录】。先给我大纲和真实操作分镜，确认后用 Skill 自带的团队女声制作。

[Skill 主文件](SKILL.md) · [从大纲、录屏、配音到成片](references/制作手册.md) · [Remotion 工程](assets/remotion) · [镜头清单](assets/镜头清单.csv) · [页面转场](references/页面转场工作流.md)

**换文案，沿用选址片女声。** 把 `assets/remotion` 整个文件夹复制成新项目，在项目的 `配音/旁白.txt` 写入台词，在 M 系列 Mac 上双击 `配音/生成女声.command`。生成的 WAV 会自动接到 Studio 的「团队女声」轨。首次使用需要安装 uv 并下载约 2.3 GB 的模型。[配音使用说明](assets/remotion/配音/使用说明.md)

随包的设备工单练习使用虚构数据，可直接试听、预览和导出。实际系统录屏由项目团队提供。
