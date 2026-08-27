# Shearmine 个人作品集网站

这是一个使用 Vue 3、Vite 和 Three.js 制作的单页作品集网站，包含滚动驱动的 3D 首页、个人简介、作品分类、分页和作品详情抽屉。

## 环境要求

- Node.js：`^20.19.0` 或 `>=22.12.0`
- npm：随 Node.js 安装即可

可以先确认本机版本：

```bash
node --version
npm --version
```

## 本地启动

进入项目目录后安装锁定版本的依赖：

```bash
npm ci
```

启动开发服务器：

```bash
npm run dev
```

终端会显示本地地址，通常是：

```text
http://localhost:5173/
```

如果需要让同一局域网中的其他设备访问：

```bash
npm run dev -- --host 0.0.0.0
```

开发服务器支持热更新，保存源文件后浏览器会自动刷新。

## 构建与预览

生成生产版本：

```bash
npm run build
```

构建结果位于 `dist/`。本地预览生产版本：

```bash
npm run preview
```

## 常用配置位置

| 要修改的内容 | 文件 | 说明 |
| --- | --- | --- |
| 网站标志、导航、作品区标题、详情标签、页脚文字 | `src/data/siteConfig.js` | 集中管理大部分界面文案 |
| 姓名、职位、所在地、邮箱、电话、个人介绍、技能 | `src/data/profile.js` | About 区和 3D 名牌、手机都会使用这些资料 |
| 首页主标题和滚动提示 | `src/components/HeroScene.vue` | 当前包含 `Selected films`、`Shearmine`、`Scroll to enter` 等文字 |
| 作品资料 | `src/data/projects/*.md` | 每个 Markdown 文件代表一个作品 |
| 每页显示数量 | `src/App.vue` | 修改 `const perPage = 6` |
| 全站颜色、排版、响应式布局和动画 | `src/styles.css` | 顶部的 CSS 变量控制主色 |
| 头像 | `public/assets/avatar.jpg` | 可直接替换同名文件，或修改 `profile.image` |
| 作品图片 | `public/assets/projects/` | 在作品 Markdown 中使用 `/assets/projects/文件名` 引用 |
| 网站图标 | `public/favicon.svg` | 浏览器标签页图标 |
| 首页 3D 场景 | `src/three/createPortfolioScene.js` | 镜头路径、场景动画和渲染逻辑 |
| 首页 3D 物件 | `src/three/createDirectorSet.js` | 导演场景物件 |
| About 3D 名牌和手机 | `src/three/createAboutObjects.js` | 名牌、头像纹理和手机交互 |

## 修改个人资料

编辑 `src/data/profile.js`：

```js
export const profile = {
  image: '/assets/avatar.jpg',
  name: 'Shearmine',
  role: 'Director',
  location: 'Kuala Lumpur, Malaysia',
  email: 'name@example.com',
  phone: '+6012-3456789',
  availability: 'Available for selected productions',
  intro: 'Short introduction.',
  approach: 'Creative approach and experience.',
  disciplines: ['Producer', 'Director', 'Scriptwriter', 'Sound Mixer'],
}
```

头像有两种修改方式：

1. 直接替换 `public/assets/avatar.jpg`，保持文件名不变。
2. 把新图片放进 `public/assets/`，再修改 `profile.image`，例如 `/assets/new-avatar.webp`。

## 修改网站文案

大部分文字位于 `src/data/siteConfig.js`：

- `brand`：左上角标志和无障碍标签。
- `nav`：顶部导航文字。
- `portfolio`：作品区标题和介绍。
- `about`：个人简介区标题和提示文字。
- `projectCard`：作品详情标签、按钮文字和默认值。
- `footer`：页脚版权和返回顶部文字。

首页最上方的主标题目前直接写在 `src/components/HeroScene.vue`，需要在该组件中修改：

```html
<p>Selected films · 2023—2026</p>
<h1 class="sr-only">Film director portfolio</h1>
<strong>Shearmine</strong>
```

## 新增或修改作品

作品会自动从 `src/data/projects/` 读取，不需要手动维护 JavaScript 数组。

### 1. 准备图片

把封面放到：

```text
public/assets/projects/my-project.jpg
```

网页中的路径写成：

```text
/assets/projects/my-project.jpg
```

### 2. 新增 Markdown 文件

在 `src/data/projects/` 新建文件，例如：

```text
48-my-project.md
```

文件会按照文件名排序。建议保留补零编号，例如 `01-`、`02-`、`48-`，以明确控制作品顺序和项目编号。

推荐模板：

```markdown
---
title: My Project
subtitle: Project Subtitle
project-date: 2026/08
category: SHORT FILM, COMMERCIAL
role-description: Director, Editor
act-as:
watch-url: https://www.youtube.com/watch?v=VIDEO_ID
image: /assets/projects/my-project.jpg
alt: My Project cover
client: Independent
description: A short description of the project.
duration: 05:30
format: 4K
color: Color
language: English
accent: #ff6a3d
surface: #f7ead8
---
```

也可以把较长的介绍写在第二个 `---` 后面。当 `description` 为空时，这段正文会作为项目描述：

```markdown
---
title: My Project
project-date: 2026/08
category: SHORT FILM
image: /assets/projects/my-project.jpg
---
This is a longer project description.
```

### 3. 字段说明

| 字段 | 用途 |
| --- | --- |
| `title` | 作品主标题 |
| `subtitle` | 副标题 |
| `project-date` | 项目日期 |
| `category` | 分类；多个分类使用英文逗号分隔 |
| `role-description` | 在项目中的职责 |
| `act-as` | 角色资料；目前会载入数据，但界面暂未显示 |
| `watch-url` | 观看地址和详情中的嵌入媒体 |
| `image` | 封面和无视频时的详情图片 |
| `alt` | 图片替代文字 |
| `client` | 客户名称 |
| `description` | 项目介绍，仅支持单行 |
| `duration` | 时长 |
| `format` | 画面或交付格式 |
| `color` | 彩色或黑白等信息 |
| `language` | 语言 |
| `accent` | 单张作品卡的强调色 |
| `surface` | 单张作品卡的浅色背景 |

`watch-url` 会自动识别以下地址：

- Google Drive 文件和文件夹
- YouTube 标准链接和 `youtu.be` 短链接
- Instagram Reel
- `xhslink.com`

其他网站如果禁止 iframe 嵌入，详情中的播放器可能无法显示；这时应使用平台提供的直接嵌入地址，或只保留外部观看链接。

### Frontmatter 限制

当前项目使用轻量级解析器，不是完整 YAML 解析器：

- 每个字段必须独占一行。
- 不支持数组、嵌套对象和多行 YAML 值。
- 通常不需要给值加引号；引号会被当成内容的一部分。
- Markdown 正文目前会作为纯文字描述显示，不会渲染成富文本 HTML。

如果作品没有配置 `image`，组件会尝试读取 `/assets/projects/default.svg`。因此应为每个作品填写 `image`，或者自行创建 `public/assets/projects/default.svg` 作为统一占位图。

## 修改颜色和滚动长度

全站主色位于 `src/styles.css` 开头：

```css
:root {
  --blue: #2d76a5;
  --blue-dark: #14496d;
  --cream: #272e38;
  --ink: #57dae3;
  --orange: #ff5b43;
}
```

首页滚动动画长度由 `.hero-scroll` 控制：

```css
.hero-scroll {
  height: 500vh;
}
```

移动端还有独立的 `430vh` 设置。修改滚动长度后，应同时检查桌面和手机尺寸下的动画节奏。

## 项目结构

```text
my-portfolio/
├─ public/
│  ├─ assets/
│  │  ├─ avatar.jpg
│  │  └─ projects/
│  └─ favicon.svg
├─ src/
│  ├─ components/
│  ├─ data/
│  │  ├─ projects/
│  │  ├─ profile.js
│  │  ├─ projects.js
│  │  └─ siteConfig.js
│  ├─ three/
│  ├─ App.vue
│  ├─ main.js
│  └─ styles.css
├─ index.html
├─ package.json
└─ vite.config.js
```

## 修改后的检查流程

```bash
npm run build
npm run preview
```

建议至少检查：

- 首页 3D 动画和滚动进度是否正常。
- 进度结束后顶部导航是否出现背景色。
- About 名牌、头像、联系方式和手机点击交互是否正常。
- 分类筛选、分页、作品详情和关闭按钮是否正常。
- 所有封面、视频链接和 iframe 是否能加载。
- 桌面和手机尺寸下是否有文字溢出或布局错位。
