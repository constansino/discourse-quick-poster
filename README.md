# Discourse Quick Poster / Discourse 快速发帖器

A bilingual (English/中文) Tampermonkey userscript that lets you post to Discourse directly via API, without going through the Discourse UI.

一个中英双语的 Tampermonkey 脚本，可直接通过 API 发帖到 Discourse，跳过 Discourse 前端 UI。

---

## Features / 功能

- ✅ Direct API posting (`POST /posts.json`)
- ✅ Bilingual UI (English + 中文)
- ✅ Configurable site URL, API Key, API Username
- ✅ Post title/body/category/tags
- ✅ Category/tags memory (reuse last used values)
- ✅ Body templates with variables
- ✅ CORS-safe via `GM_xmlhttpRequest`
- ✅ Hotkey: `Ctrl + Shift + P`

- ✅ 直连 API 发帖（`POST /posts.json`）
- ✅ 中英双语界面
- ✅ 可配置站点 URL / API Key / 用户名
- ✅ 每次可填写标题、正文、分类、标签
- ✅ 分类和标签记忆上次输入
- ✅ 正文模板变量支持
- ✅ 使用 `GM_xmlhttpRequest` 规避 CORS 限制
- ✅ 快捷键：`Ctrl + Shift + P`

---

## Install / 安装

1. Install [Tampermonkey](https://www.tampermonkey.net/)
2. Create a new script and paste `discourse-quick-poster.user.js`
3. Save and enable the script

1. 安装 [Tampermonkey](https://www.tampermonkey.net/)
2. 新建脚本并粘贴 `discourse-quick-poster.user.js`
3. 保存并启用

---

## Usage / 使用

1. Open any webpage
2. Press `Ctrl + Shift + P` (or use Tampermonkey menu)
3. Configure once: `Site URL`, `API Key`, `API Username`
4. Fill post fields and click **Post**
5. The script opens the created topic automatically

1. 打开任意网页
2. 按 `Ctrl + Shift + P`（或从 Tampermonkey 菜单打开）
3. 首次先配置：`站点 URL`、`API Key`、`API 用户名`
4. 填写发帖内容并点击发帖
5. 成功后自动打开帖子链接

---

## Template Variables / 模板变量

Use these in body template:

- `{{selected}}` — selected text on current page / 当前页面选中文本
- `{{page_title}}` — page title / 页面标题
- `{{page_url}}` — current URL / 当前链接
- `{{now}}` — local datetime / 本地时间

---

## Security Notes / 安全提示

- Prefer a low-privileged API key
- Do not expose admin keys in shared environments
- Script storage is local to your browser profile

- 尽量使用低权限 API Key
- 不要在共享环境暴露管理员 Key
- 脚本配置保存在本地浏览器环境

---

## License / 许可

MIT
