# Project Sekai 贴纸生成器

<div align="center">

![GitHub License](https://img.shields.io/github/license/25-ji-code-de/stickers-maker?style=flat-square&color=884499)
![GitHub stars](https://img.shields.io/github/stars/25-ji-code-de/stickers-maker?style=flat-square&color=884499)
![GitHub forks](https://img.shields.io/github/forks/25-ji-code-de/stickers-maker?style=flat-square&color=884499)
![GitHub issues](https://img.shields.io/github/issues/25-ji-code-de/stickers-maker?style=flat-square&color=884499)
![GitHub last commit](https://img.shields.io/github/last-commit/25-ji-code-de/stickers-maker?style=flat-square&color=884499)
![GitHub repo size](https://img.shields.io/github/repo-size/25-ji-code-de/stickers-maker?style=flat-square&color=884499)
[![CodeFactor](https://img.shields.io/codefactor/grade/github/25-ji-code-de/stickers-maker?style=flat-square&color=884499)](https://www.codefactor.io/repository/github/25-ji-code-de/stickers-maker)

</div>

功能完整、界面精美的 Project Sekai 角色贴纸生成器。支持自定义文字、样式和多种导出格式。

> 本项目整合了社区多个优秀实现的最佳功能和用户体验。

## ✨ 特性

- 🎨 **丰富的文字自定义** - 多字体选择、位置调整、旋转、行距、字距、描边
- 📝 **多种文字模式** - 支持横排、竖排、弧形排列
- 🖼️ **370+ 角色贴纸** - 包含 31 个 Project Sekai 角色的多种姿势
- 🎯 **精准控制** - 滑块微调或 ±5px 快捷按钮
- 🎨 **动态主题** - 根据角色图片自动提取主题色
- 💾 **多格式导出** - PNG、JPG、WebP 下载或剪贴板复制
- 📱 **响应式设计** - 完美支持桌面、平板和移动设备
- 🌙 **暗色主题** - Material-UI 精美界面

## 🚀 快速开始

### 前置要求

- Node.js 18+
- npm 或 yarn

### 安装

```bash
# 克隆仓库
git clone https://github.com/25-ji-code-de/stickers-maker.git
cd stickers-maker

# 安装依赖
npm install
```

### 运行

```bash
# 开发环境
npm run dev

# 构建生产版本
npm run build

# 预览生产版本
npm run preview
```

## 🎮 使用说明

1. **选择角色** - 点击人物图标打开角色选择器
2. **输入文字** - 在文本框输入内容（支持多行）
3. **自定义样式** - 使用滑块调整字体大小、旋转、间距等
4. **调整位置** - 使用滑块精确定位或使用 ±5px 按钮快速调整
5. **导出贴纸** - 复制到剪贴板或下载为文件

**高级选项:**
- 弧形文字、竖排文字
- 文字前景/背景图层切换
- 自定义图片上传
- 描边宽度和颜色调整

## 🛠️ 技术栈

![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react&logoColor=white&color=884499)
![Vite](https://img.shields.io/badge/Vite-7-646CFF?style=flat-square&logo=vite&logoColor=white&color=884499)
![Material--UI](https://img.shields.io/badge/Material--UI-5-007FFF?style=flat-square&logo=mui&logoColor=white&color=884499)

- **前端框架**: React 18 + Vite 7
- **UI 组件库**: Material-UI 5
- **图像处理**: HTML5 Canvas + Fast Average Color
- **字体优化**: 自定义 Web 字体（YurukaStd、SSFangTangTi）

## 🌐 SEKAI 生态

本项目是 **SEKAI 生态**的一部分。

查看完整的项目列表和架构：**[SEKAI 门户](https://sekai.nightcord.de5.net)**

---

**声明**：本项目受 *Project SEKAI COLORFUL STAGE! feat. Hatsune Miku* 启发。

本项目是非官方、非商业性质的粉丝作品，与 SEGA、Colorful Palette、Crypton Future Media 或任何其他与《Project SEKAI》相关的版权持有方无任何官方关联。

所有游戏相关素材（包括但不限于角色贴纸图像）的版权归其各自的版权持有方所有。

## 🤝 贡献

欢迎贡献！我们非常感谢任何形式的贡献。

在贡献之前，请阅读：
- [贡献指南](./CONTRIBUTING.md)
- [行为准则](./CODE_OF_CONDUCT.md)

## 🔒 安全

如果发现安全漏洞，请查看我们的 [安全政策](./SECURITY.md)。

## 📄 许可证

本项目采用 GNU Affero General Public License v3.0 - 详见 [LICENSE](./LICENSE) 文件。

⚠️ **重要提示**：
- AGPL-3.0 许可证仅适用于本项目的原创代码
- 游戏相关素材（贴纸图像等）的版权归 SEGA、Colorful Palette、Crypton Future Media 等原版权方所有
- 本项目整合了来自 MIT 许可证项目的代码，详见 [NOTICE](./NOTICE) 文件

**AGPL-3.0 要求**：如果你修改此程序并通过网络提供服务，你必须向用户提供修改后的源代码。

## 📧 联系方式

- **GitHub Issues**: [https://github.com/25-ji-code-de/stickers-maker/issues](https://github.com/25-ji-code-de/stickers-maker/issues)
- **哔哩哔哩**: [@bili_47177171806](https://space.bilibili.com/3546904856103196)

## 🙏 致谢

本项目整合并改进了以下优秀项目：

- **[TheOriginalAyaka/sekai-stickers](https://github.com/TheOriginalAyaka/sekai-stickers)** (MIT License, Copyright (c) 2022 Ayaka) - 原始实现
- **[BedrockDigger/sekai-stickers](https://github.com/BedrockDigger/sekai-stickers)** (MIT License, Copyright (c) 2022 Ayaka) - 精美的 Material-UI 设计、动态主题提取
- **[atnightcord/sekai-stickers](https://github.com/atnightcord/sekai-stickers)** - 高级文字控制功能参考（注意：该仓库无许可证文件）
- **[u/SherenPlaysGames](https://www.reddit.com/r/ProjectSekai/comments/x1h4v1/)** - 原创贴纸生成器创意

感谢所有原项目的贡献者！

## ⭐ Star History

如果这个项目对你有帮助，请给我们一个 Star！

[![Star History Chart](https://api.star-history.com/svg?repos=25-ji-code-de/stickers-maker&type=Date)](https://star-history.com/#25-ji-code-de/stickers-maker&Date)

---

<div align="center">

**[SEKAI 生态](https://sekai.nightcord.de5.net)** 的一部分

Made with 💜 by the [25-ji-code-de](https://github.com/25-ji-code-de) team

</div>
