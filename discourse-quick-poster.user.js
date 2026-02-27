// ==UserScript==
// @name         Discourse Quick Poster / Discourse 快速发帖器 (Bilingual)
// @namespace    https://aiya.de5.net
// @version      2.1.0
// @description  EN/ZH bilingual quick poster for Discourse API. Supports template, memory, custom hotkey, and CORS-safe cross-domain requests.
// @author       yezi
// @match        *://*/*
// @grant        GM_addStyle
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_registerMenuCommand
// @grant        GM_xmlhttpRequest
// @connect      *
// ==/UserScript==

(function () {
  'use strict';

  const KEY = {
    siteUrl: 'dqp_site_url',
    apiKey: 'dqp_api_key',
    apiUser: 'dqp_api_user',
    defaultCategory: 'dqp_default_category',
    defaultTags: 'dqp_default_tags',
    lastCategory: 'dqp_last_category',
    lastTags: 'dqp_last_tags',
    bodyTemplate: 'dqp_body_template',
    lang: 'dqp_lang',
    hotkey: 'dqp_hotkey'
  };

  const get = (k, d = '') => GM_getValue(k, d);
  const set = (k, v) => GM_setValue(k, v);

  const I18N = {
    zh: {
      menuConfig: '⚙️ 配置 / Configuration',
      menuOpen: '📝 发帖 / New Post',
      menuLang: '🌐 切换语言 / Toggle Language',
      configTitle: 'Discourse 快速发帖器 · 配置',
      close: '关闭',
      saveConfig: '保存配置',
      siteUrl: '站点 URL（例：https://yabai.de5.net）',
      apiKey: 'API Key',
      apiUser: 'Api Username',
      defaultCategory: '默认分类ID（可空）',
      defaultTags: '默认标签（逗号/空格分隔）',
      hotkey: '发帖快捷键（例如 Ctrl+Shift+P）',
      hotkeyHint: '支持组合键：Ctrl / Shift / Alt / Meta + 字母或功能键（如 F2）',
      configHint: '建议使用低权限专用 key，避免管理员 key 外泄。',
      configSaved: '配置已保存',
      configRequired: '请先配置站点/API Key/用户名',
      postTitle: 'Discourse 快速发帖（API）',
      title: '标题 *',
      body: '正文（支持模板）*',
      category: '分类ID（可空）',
      tags: '标签（逗号/空格分隔，可空）',
      template: '正文模板（保存后下次默认套用）',
      templateVars: '可用变量：{{selected}} {{page_title}} {{page_url}} {{now}}',
      saveTemplate: '保存模板',
      submit: '发帖',
      sending: '发送中...',
      templateSaved: '模板已保存',
      okPosted: '发帖成功 ✅',
      errEmpty: '标题和正文不能为空',
      errCategory: '分类ID必须是正整数',
      errTimeout: '请求超时',
      errPost: '发帖失败：',
      errHotkey: '快捷键格式无效，已回退默认 Ctrl+Shift+P',
      langSwitched: '语言已切换：',
      langName: '中文'
    },
    en: {
      menuConfig: '⚙️ Configure',
      menuOpen: '📝 New Post',
      menuLang: '🌐 Toggle Language',
      configTitle: 'Discourse Quick Poster · Configuration',
      close: 'Close',
      saveConfig: 'Save Config',
      siteUrl: 'Site URL (e.g. https://yabai.de5.net)',
      apiKey: 'API Key',
      apiUser: 'API Username',
      defaultCategory: 'Default Category ID (optional)',
      defaultTags: 'Default Tags (comma/space separated)',
      hotkey: 'Post Hotkey (e.g. Ctrl+Shift+P)',
      hotkeyHint: 'Supports Ctrl / Shift / Alt / Meta + letter/function key (e.g. F2)',
      configHint: 'Use a low-privileged key whenever possible. Avoid exposing admin keys.',
      configSaved: 'Configuration saved',
      configRequired: 'Please configure site/API key/username first',
      postTitle: 'Discourse Quick Post (API)',
      title: 'Title *',
      body: 'Body (template supported) *',
      category: 'Category ID (optional)',
      tags: 'Tags (comma/space separated, optional)',
      template: 'Body Template (saved for next time)',
      templateVars: 'Template vars: {{selected}} {{page_title}} {{page_url}} {{now}}',
      saveTemplate: 'Save Template',
      submit: 'Post',
      sending: 'Posting...',
      templateSaved: 'Template saved',
      okPosted: 'Posted successfully ✅',
      errEmpty: 'Title and body are required',
      errCategory: 'Category ID must be a positive integer',
      errTimeout: 'Request timeout',
      errPost: 'Post failed: ',
      errHotkey: 'Invalid hotkey format, fallback to Ctrl+Shift+P',
      langSwitched: 'Language switched: ',
      langName: 'English'
    }
  };

  function detectLang() {
    const saved = get(KEY.lang, '');
    if (saved === 'zh' || saved === 'en') return saved;
    return /^zh/i.test(navigator.language || '') ? 'zh' : 'en';
  }

  function t(k) {
    const lang = detectLang();
    return I18N[lang]?.[k] || I18N.en[k] || k;
  }

  function toggleLang() {
    const next = detectLang() === 'zh' ? 'en' : 'zh';
    set(KEY.lang, next);
    toast(`${I18N[next].langSwitched}${I18N[next].langName}`);
  }

  function toast(msg, ok = true) {
    const el = document.createElement('div');
    el.textContent = msg;
    el.style.cssText = `
      position: fixed; z-index: 999999; right: 16px; top: 16px;
      background: ${ok ? '#16a34a' : '#dc2626'};
      color: #fff; padding: 10px 14px; border-radius: 8px;
      box-shadow: 0 6px 20px rgba(0,0,0,.2); font-size: 14px;
    `;
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 2400);
  }

  function escHtml(str = '') {
    return str.replace(/[&<>"']/g, m => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[m]));
  }

  function parseTags(input) {
    return (input || '').split(/[,\s，]+/).map(s => s.trim()).filter(Boolean);
  }

  function fillTemplate(tpl, vars = {}) {
    return tpl.replace(/\{\{(.*?)\}\}/g, (_, k) => vars[k.trim()] ?? '');
  }

  function nowStr() {
    const d = new Date();
    const pad = n => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
  }

  function normalizeHotkey(input) {
    let s = (input || '').trim();
    if (!s) s = 'Ctrl+Shift+P';
    const parts = s.split('+').map(x => x.trim()).filter(Boolean);
    if (!parts.length) return null;

    const mods = { ctrl: false, shift: false, alt: false, meta: false };
    let key = '';

    for (const raw of parts) {
      const p = raw.toLowerCase();
      if (p === 'ctrl' || p === 'control') mods.ctrl = true;
      else if (p === 'shift') mods.shift = true;
      else if (p === 'alt' || p === 'option') mods.alt = true;
      else if (p === 'meta' || p === 'cmd' || p === 'command' || p === 'win' || p === 'super') mods.meta = true;
      else if (!key) key = raw;
      else return null;
    }

    if (!key) return null;
    key = key.length === 1 ? key.toUpperCase() : key.toUpperCase();

    return {
      ctrl: mods.ctrl,
      shift: mods.shift,
      alt: mods.alt,
      meta: mods.meta,
      key,
      display: `${mods.ctrl ? 'Ctrl+' : ''}${mods.shift ? 'Shift+' : ''}${mods.alt ? 'Alt+' : ''}${mods.meta ? 'Meta+' : ''}${key}`
    };
  }

  function getHotkeyConfig() {
    const parsed = normalizeHotkey(get(KEY.hotkey, 'Ctrl+Shift+P'));
    if (!parsed) return normalizeHotkey('Ctrl+Shift+P');
    return parsed;
  }

  function isHotkeyMatch(e, hk) {
    if (!!e.ctrlKey !== hk.ctrl) return false;
    if (!!e.shiftKey !== hk.shift) return false;
    if (!!e.altKey !== hk.alt) return false;
    if (!!e.metaKey !== hk.meta) return false;

    const ek = (e.key || '').toUpperCase();
    return ek === hk.key;
  }

  function tmRequest(url, method = 'GET', data = null, headers = {}) {
    return new Promise((resolve, reject) => {
      GM_xmlhttpRequest({
        method,
        url,
        headers,
        data: data ? JSON.stringify(data) : undefined,
        timeout: 20000,
        onload: (res) => {
          let json = {};
          try { json = JSON.parse(res.responseText || '{}'); } catch (_) {}
          resolve({ status: res.status, data: json, raw: res.responseText });
        },
        onerror: (err) => reject(err),
        ontimeout: () => reject(new Error(t('errTimeout')))
      });
    });
  }

  GM_addStyle(`
    .dqp-mask { position: fixed; inset: 0; background: rgba(0,0,0,.45); z-index: 999998; display: flex; align-items: center; justify-content: center; }
    .dqp-modal { width: min(760px, 94vw); max-height: 92vh; overflow: auto; background: #fff; border-radius: 12px; box-shadow: 0 14px 40px rgba(0,0,0,.28); font-family: -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"PingFang SC","Microsoft Yahei",sans-serif; }
    .dqp-hd { display:flex; justify-content:space-between; align-items:center; padding: 14px 16px; border-bottom: 1px solid #eee; font-weight: 700; }
    .dqp-bd { padding: 14px 16px; display: grid; gap: 10px; }
    .dqp-row { display: grid; gap: 6px; }
    .dqp-row label { font-size: 13px; color:#444; font-weight:600; }
    .dqp-row input, .dqp-row textarea { width: 100%; box-sizing: border-box; border: 1px solid #d9d9d9; border-radius: 8px; padding: 8px 10px; font-size: 14px; outline: none; }
    .dqp-row textarea { min-height: 120px; resize: vertical; }
    .dqp-grid { display:grid; grid-template-columns: 1fr 1fr; gap:10px; }
    .dqp-ft { display:flex; gap:8px; justify-content:flex-end; padding: 12px 16px; border-top:1px solid #eee; }
    .dqp-btn { border: 0; border-radius: 8px; padding: 8px 12px; font-size: 14px; cursor: pointer; }
    .dqp-btn.gray { background:#f3f4f6; color:#111; }
    .dqp-btn.blue { background:#2563eb; color:#fff; }
    .dqp-btn.green { background:#16a34a; color:#fff; }
    .dqp-hint { font-size: 12px; color:#666; line-height: 1.4; }
    .dqp-mini { font-size:12px; color:#888; }
  `);

  function getConfig() {
    return {
      siteUrl: get(KEY.siteUrl, '').trim().replace(/\/+$/, ''),
      apiKey: get(KEY.apiKey, '').trim(),
      apiUser: get(KEY.apiUser, '').trim(),
      defaultCategory: String(get(KEY.defaultCategory, '')).trim(),
      defaultTags: get(KEY.defaultTags, '').trim(),
      hotkey: get(KEY.hotkey, 'Ctrl+Shift+P').trim() || 'Ctrl+Shift+P'
    };
  }

  function needConfig(cfg) {
    return !(cfg.siteUrl && cfg.apiKey && cfg.apiUser);
  }

  function openConfigModal() {
    const cfg = getConfig();
    const html = `
      <div class="dqp-mask" id="dqpMaskCfg">
        <div class="dqp-modal">
          <div class="dqp-hd"><span>${t('configTitle')}</span><button class="dqp-btn gray" id="dqpCloseCfg">${t('close')}</button></div>
          <div class="dqp-bd">
            <div class="dqp-row"><label>${t('siteUrl')}</label><input id="dqp_siteUrl" value="${escHtml(cfg.siteUrl)}" placeholder="https://forum.example.com" /></div>
            <div class="dqp-row"><label>${t('apiKey')}</label><input id="dqp_apiKey" value="${escHtml(cfg.apiKey)}" placeholder="API Key" /></div>
            <div class="dqp-row"><label>${t('apiUser')}</label><input id="dqp_apiUser" value="${escHtml(cfg.apiUser)}" placeholder="api_username" /></div>
            <div class="dqp-grid">
              <div class="dqp-row"><label>${t('defaultCategory')}</label><input id="dqp_defaultCategory" value="${escHtml(cfg.defaultCategory)}" placeholder="12" /></div>
              <div class="dqp-row"><label>${t('defaultTags')}</label><input id="dqp_defaultTags" value="${escHtml(cfg.defaultTags)}" placeholder="tag1, tag2" /></div>
            </div>
            <div class="dqp-row"><label>${t('hotkey')}</label><input id="dqp_hotkey" value="${escHtml(cfg.hotkey)}" placeholder="Ctrl+Shift+P" /><div class="dqp-mini">${t('hotkeyHint')}</div></div>
            <div class="dqp-hint">${t('configHint')}</div>
          </div>
          <div class="dqp-ft"><button class="dqp-btn green" id="dqpSaveCfg">${t('saveConfig')}</button></div>
        </div>
      </div>
    `;
    document.body.insertAdjacentHTML('beforeend', html);
    const mask = document.getElementById('dqpMaskCfg');

    document.getElementById('dqpCloseCfg').onclick = () => mask.remove();
    document.getElementById('dqpSaveCfg').onclick = () => {
      set(KEY.siteUrl, document.getElementById('dqp_siteUrl').value.trim().replace(/\/+$/, ''));
      set(KEY.apiKey, document.getElementById('dqp_apiKey').value.trim());
      set(KEY.apiUser, document.getElementById('dqp_apiUser').value.trim());
      set(KEY.defaultCategory, document.getElementById('dqp_defaultCategory').value.trim());
      set(KEY.defaultTags, document.getElementById('dqp_defaultTags').value.trim());

      const hkRaw = document.getElementById('dqp_hotkey').value.trim() || 'Ctrl+Shift+P';
      const hkParsed = normalizeHotkey(hkRaw);
      if (!hkParsed) {
        set(KEY.hotkey, 'Ctrl+Shift+P');
        toast(t('errHotkey'), false);
      } else {
        set(KEY.hotkey, hkParsed.display);
        toast(t('configSaved'));
      }

      mask.remove();
    };
  }

  function openPostModal() {
    const cfg = getConfig();
    if (needConfig(cfg)) {
      toast(t('configRequired'), false);
      openConfigModal();
      return;
    }

    const lastCategory = get(KEY.lastCategory, '') || cfg.defaultCategory || '';
    const lastTags = get(KEY.lastTags, '') || cfg.defaultTags || '';
    const tpl = get(KEY.bodyTemplate,
`{{selected}}\n\n---\nSource/来源: {{page_title}}\nURL: {{page_url}}\nTime/时间: {{now}}`);

    const selected = (window.getSelection?.().toString() || '').trim();
    const initBody = fillTemplate(tpl, {
      selected,
      page_title: document.title || '',
      page_url: location.href,
      now: nowStr()
    });

    const html = `
      <div class="dqp-mask" id="dqpMaskPost">
        <div class="dqp-modal">
          <div class="dqp-hd"><span>${t('postTitle')}</span><button class="dqp-btn gray" id="dqpClosePost">${t('close')}</button></div>
          <div class="dqp-bd">
            <div class="dqp-row"><label>${t('title')}</label><input id="dqp_title" placeholder="Title" /></div>
            <div class="dqp-row"><label>${t('body')}</label><textarea id="dqp_body">${escHtml(initBody)}</textarea></div>
            <div class="dqp-grid">
              <div class="dqp-row"><label>${t('category')}</label><input id="dqp_category" value="${escHtml(lastCategory)}" placeholder="12" /></div>
              <div class="dqp-row"><label>${t('tags')}</label><input id="dqp_tags" value="${escHtml(lastTags)}" placeholder="tag1,tag2" /></div>
            </div>
            <div class="dqp-row">
              <label>${t('template')}</label>
              <textarea id="dqp_template" style="min-height:95px;">${escHtml(tpl)}</textarea>
              <div class="dqp-mini">${t('templateVars')}</div>
            </div>
          </div>
          <div class="dqp-ft">
            <button class="dqp-btn gray" id="dqpSaveTemplate">${t('saveTemplate')}</button>
            <button class="dqp-btn blue" id="dqpSubmitPost">${t('submit')}</button>
          </div>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', html);
    const mask = document.getElementById('dqpMaskPost');

    document.getElementById('dqpClosePost').onclick = () => mask.remove();
    document.getElementById('dqpSaveTemplate').onclick = () => {
      set(KEY.bodyTemplate, document.getElementById('dqp_template').value);
      toast(t('templateSaved'));
    };

    document.getElementById('dqpSubmitPost').onclick = async () => {
      const title = document.getElementById('dqp_title').value.trim();
      const raw = document.getElementById('dqp_body').value.trim();
      const categoryInput = document.getElementById('dqp_category').value.trim();
      const tagsInput = document.getElementById('dqp_tags').value.trim();

      if (!title || !raw) {
        toast(t('errEmpty'), false);
        return;
      }

      const payload = { title, raw };
      if (categoryInput) {
        const n = Number(categoryInput);
        if (!Number.isInteger(n) || n <= 0) {
          toast(t('errCategory'), false);
          return;
        }
        payload.category = n;
      }

      const tags = parseTags(tagsInput);
      if (tags.length) payload.tags = tags;

      set(KEY.lastCategory, categoryInput);
      set(KEY.lastTags, tagsInput);

      const btn = document.getElementById('dqpSubmitPost');
      btn.disabled = true;
      btn.textContent = t('sending');

      try {
        const resp = await tmRequest(`${cfg.siteUrl}/posts.json`, 'POST', payload, {
          'Content-Type': 'application/json',
          'Api-Key': cfg.apiKey,
          'Api-Username': cfg.apiUser
        });

        if (resp.status < 200 || resp.status >= 300) {
          const msg = (resp.data?.errors && resp.data.errors.join(' | ')) || resp.data?.error || `HTTP ${resp.status}`;
          throw new Error(msg);
        }

        const topicId = resp.data?.topic_id;
        const postId = resp.data?.id;
        const url = topicId ? `${cfg.siteUrl}/t/${topicId}${postId ? `/${postId}` : ''}` : cfg.siteUrl;

        toast(t('okPosted'));
        window.open(url, '_blank');
        mask.remove();
      } catch (e) {
        console.error(e);
        toast(`${t('errPost')}${e?.message || e}`, false);
      } finally {
        btn.disabled = false;
        btn.textContent = t('submit');
      }
    };
  }

  GM_registerMenuCommand(t('menuConfig'), openConfigModal);
  GM_registerMenuCommand(t('menuOpen'), openPostModal);
  GM_registerMenuCommand(t('menuLang'), toggleLang);

  window.addEventListener('keydown', (e) => {
    const hk = getHotkeyConfig();
    if (isHotkeyMatch(e, hk)) {
      e.preventDefault();
      openPostModal();
    }
  });
})();
