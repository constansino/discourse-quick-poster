<img width="1941" height="1541" alt="PixPin_2026-02-27_11-39-31" src="https://github.com/user-attachments/assets/fa6d9540-2510-46b2-ba2a-609f5cc5588f" />

# Discourse Quick Poster

> Bilingual Tampermonkey userscript for posting to Discourse via API (no UI flow).
>
> 通过 API 直发 Discourse 的 Tampermonkey 脚本（跳过 UI 流程）。

---

## Language / 语言

- [English](#english)
- [中文](#中文)

---

## English

### What it is

A Tampermonkey userscript that opens a quick post modal anywhere, then sends:

`POST /posts.json`

to your Discourse instance using API credentials.

### Features

- Direct posting via Discourse API
- CORS-safe request path (`GM_xmlhttpRequest`)
- Configurable:
  - Site URL
  - API Key
  - API Username
  - Default category / tags
- Per-post fields:
  - Title
  - Body
  - Category
  - Tags
- Remembers last used category and tags
- Body template support
- Bilingual UI (EN / 中文)
- Custom hotkey (default: `Ctrl + Shift + P`)

### Install

1. Install [Tampermonkey](https://www.tampermonkey.net/)
2. Open `discourse-quick-poster.user.js`
3. Copy the script into a new Tampermonkey script
4. Save and enable

### Usage

1. Open any webpage
2. Press `Ctrl + Shift + P` (or open from Tampermonkey menu)
3. Configure once:
   - Site URL
   - API Key
   - API Username
   - Hotkey (e.g. `Ctrl+Shift+P`, `Ctrl+Alt+K`, `Alt+F2`)
4. Fill post fields and click **Post**
5. On success, the topic link opens automatically

### Template variables

- `{{selected}}` → selected text on current page
- `{{page_title}}` → page title
- `{{page_url}}` → current URL
- `{{now}}` → local datetime

### Security notes

- Prefer low-privileged API keys
- Do not expose admin keys in shared environments
- Script config is stored in local userscript storage

---

## 中文

### 这是什么

这是一个 Tampermonkey 脚本，可在任意网页弹出“快速发帖”窗口，
然后调用 Discourse API：

`POST /posts.json`

直接发帖，不走 Discourse 页面编辑流程。

### 功能

- 通过 Discourse API 直接发帖
- 使用 `GM_xmlhttpRequest` 规避浏览器 CORS 限制
- 可配置：
  - 站点 URL
  - API Key
  - API 用户名
  - 默认分类 / 默认标签
- 每次发帖可填写：
  - 标题
  - 正文
  - 分类
  - 标签
- 自动记忆上次使用的分类和标签
- 支持正文模板
- 支持中英双语界面切换
- 支持自定义快捷键（默认：`Ctrl + Shift + P`）

### 安装

1. 安装 [Tampermonkey](https://www.tampermonkey.net/)
2. 打开 `discourse-quick-poster.user.js`
3. 新建 Tampermonkey 脚本并粘贴内容
4. 保存并启用

### 使用

1. 打开任意网页
2. 按 `Ctrl + Shift + P`（或在 Tampermonkey 菜单打开）
3. 首次配置：
   - 站点 URL
   - API Key
   - API 用户名
   - 快捷键（如 `Ctrl+Shift+P`、`Ctrl+Alt+K`、`Alt+F2`）
4. 填写帖子信息并点击 **发帖**
5. 成功后会自动打开帖子链接

### 模板变量

- `{{selected}}` → 当前页面选中的文本
- `{{page_title}}` → 页面标题
- `{{page_url}}` → 当前页面链接
- `{{now}}` → 本地时间

### 安全建议

- 优先使用低权限 API Key
- 不要在共享环境暴露管理员 Key
- 脚本配置保存在本地 userscript 存储中

---

## License

MIT
