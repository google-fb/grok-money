(function () {
  const links = [
    ["index.html", "這門課"],
    ["map.html", "賺錢地圖"],
    ["careers.html", "職業 Top 100"],
    ["methods.html", "方式 Top 100"],
    ["ai.html", "AI 衝擊與預測"],
    ["start.html", "高中生怎麼走"],
    ["sources.html", "文獻與方法"],
  ];

  const page = (location.pathname.split("/").pop() || "index.html").toLowerCase();

  function esc(s) {
    return String(s ?? "").replace(/[&<>"']/g, (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])
    );
  }

  function navHtml() {
    return `
      <a class="brand" href="index.html">賺錢課<small>給還沒修過這門課的人</small></a>
      <ol>
        ${links
          .map(([href, label]) => {
            const active = page === href || (page === "" && href === "index.html");
            return `<li><a class="${active ? "active" : ""}" href="${href}">${esc(label)}</a></li>`;
          })
          .join("")}
      </ol>
      <p class="meta">整理自 BLS、OECD、WEF、McKinsey、台灣勞動部與經濟學文獻。數字會過時，地圖比較耐用。</p>
    `;
  }

  function mountChrome() {
    const nav = document.querySelector("[data-nav]");
    if (nav) {
      nav.id = nav.id || "site-nav";
      nav.innerHTML = navHtml();
    }

    const bar = document.querySelector("[data-mobile]");
    if (bar) {
      bar.innerHTML = `
        <a class="brand" href="index.html">賺錢課</a>
        <button type="button" data-toggle aria-expanded="false" aria-controls="site-nav">目錄</button>
      `;
      const btn = bar.querySelector("[data-toggle]");
      const setOpen = (open) => {
        nav?.classList.toggle("open", open);
        btn.setAttribute("aria-expanded", String(open));
        btn.textContent = open ? "關閉" : "目錄";
        if (open) nav?.querySelector("ol a")?.focus();
        else btn.focus();
      };
      btn.addEventListener("click", () => setOpen(!nav?.classList.contains("open")));
      document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") setOpen(false);
      });
      nav?.addEventListener("click", (e) => {
        if (e.target.closest("a") && window.matchMedia("(max-width: 920px)").matches) {
          setOpen(false);
        }
      });
    }

    const foot = document.querySelector("[data-footer]");
    if (foot) {
      foot.innerHTML = `
        <p>這份 wiki 是教育地圖，不是投資建議、也不是生涯保證。高薪職業通常伴隨長工時、執照、資本或運氣。任何「保證致富」的說法，先當它是廣告。</p>
        <p>資料主年份：2024–2026。美國薪資多取勞動統計局職業就業與薪資統計（BLS OEWS）2025 年 5 月；台灣數字取勞動部職類別薪資調查。預測榜是情境推演，不是預言。</p>
      `;
    }
  }

  function aiClass(label) {
    if (label === "強化") return "ai-boost";
    if (label === "改寫") return "ai-rewrite";
    if (label === "削弱") return "ai-cut";
    if (label === "高風險") return "ai-risk";
    return "ai-unknown";
  }

  function delta(now, pred) {
    const d = now - pred;
    if (d > 0) return { cls: "up", text: `↑${d}` };
    if (d < 0) return { cls: "down", text: `↓${Math.abs(d)}` };
    return { cls: "same", text: "—" };
  }

  function haystack(x, keys) {
    return keys
      .map((k) => (Array.isArray(x[k]) ? x[k].join(" ") : x[k] || ""))
      .join(" ")
      .toLowerCase();
  }

  function emptyRow(query, cols) {
    return `<tr class="empty-row"><td colspan="${cols}">沒有符合「${esc(query)}」的項目。試試更短的詞，或 <button type="button" data-clear>清除搜尋</button></td></tr>`;
  }

  function bindBoard(tbody, prefix, open) {
    tbody.addEventListener("click", (e) => {
      if (e.target.closest("[data-clear]")) return;
      const tr = e.target.closest("tr[data-open]");
      if (!tr) return;
      toggle(tbody, prefix, open, tr.dataset.id);
    });
    tbody.addEventListener("keydown", (e) => {
      const tr = e.target.closest("tr[data-open]");
      if (!tr || (e.key !== "Enter" && e.key !== " ")) return;
      e.preventDefault();
      toggle(tbody, prefix, open, tr.dataset.id);
    });
  }

  function toggle(tbody, prefix, open, id) {
    if (open.has(id)) open.delete(id);
    else open.add(id);
    const on = open.has(id);
    document.getElementById(prefix + id)?.classList.toggle("open", on);
    const tr = tbody.querySelector(`tr[data-open][data-id="${id}"]`);
    tr?.setAttribute("aria-expanded", String(on));
    if (on) history.replaceState(null, "", "#" + prefix + id);
  }

  function restoreOpen(tbody, prefix, open) {
    open.forEach((id) => {
      document.getElementById(prefix + id)?.classList.add("open");
      tbody.querySelector(`tr[data-open][data-id="${id}"]`)?.setAttribute("aria-expanded", "true");
    });
  }

  function hashId(prefix) {
    const raw = decodeURIComponent(location.hash.slice(1));
    if (raw.startsWith(prefix)) return raw.slice(prefix.length);
    return "";
  }

  function renderCareers(root, items) {
    if (!root || !Array.isArray(items)) {
      if (root) root.insertAdjacentHTML("beforeend", "<p class='warn'>榜單資料沒載入。請用本機伺服器打開，不要直接雙擊檔案。</p>");
      return;
    }
    const q = root.querySelector("[data-q]");
    const cat = root.querySelector("[data-cat]");
    const sort = root.querySelector("[data-sort]");
    const chips = root.querySelector("[data-chips]");
    const tbody = root.querySelector("[data-body]");
    const count = root.querySelector("[data-count]");
    if (!q || !cat || !sort || !tbody || !count) {
      root.insertAdjacentHTML("beforeend", "<p class='warn'>榜單工具列缺了必要欄位，請重新整理頁面。</p>");
      return;
    }
    let aiFilter = "";
    const open = new Set();
    const boot = hashId("d-");
    if (boot) open.add(boot);

    const cats = [...new Set(items.map((x) => x.cat))].sort();
    cat.innerHTML =
      `<option value="">全部分類</option>` +
      cats.map((c) => `<option value="${esc(c)}">${esc(c)}</option>`).join("");

    if (chips) {
      chips.setAttribute("role", "radiogroup");
      chips.setAttribute("aria-label", "AI 衝擊");
      chips.innerHTML = ["全部", "強化", "改寫", "削弱", "高風險"]
        .map((x, i) => {
          const val = x === "全部" ? "" : x;
          return `<button type="button" class="chip${i === 0 ? " on" : ""}" role="radio" aria-checked="${i === 0}" data-ai-chip="${val}">${x}</button>`;
        })
        .join("");
    }

    function filtered() {
      const text = (q.value || "").trim().toLowerCase();
      const c = cat.value;
      return items.filter((x) => {
        if (c && x.cat !== c) return false;
        if (aiFilter && x.ai !== aiFilter) return false;
        if (!text) return true;
        return haystack(x, ["name", "en", "why", "path", "tags", "cat"]).includes(text);
      });
    }

    function sorted(list) {
      const mode = sort.value;
      const copy = list.slice();
      if (mode === "pred") copy.sort((a, b) => a.pred - b.pred);
      else if (mode === "pay") copy.sort((a, b) => (b.usdMean || 0) - (a.usdMean || 0));
      else if (mode === "rise") copy.sort((a, b) => b.now - b.pred - (a.now - a.pred));
      else copy.sort((a, b) => a.now - b.now);
      return copy;
    }

    function row(x) {
      const d = delta(x.now, x.pred);
      const tags = Array.isArray(x.tags) ? x.tags : [];
      const expanded = open.has(x.id);
      return `
        <tr data-open data-id="${esc(x.id)}" tabindex="0" aria-expanded="${expanded}" aria-controls="d-${esc(x.id)}">
          <td class="rank">${x.now}</td>
          <td class="rank">${x.pred}<div class="delta ${d.cls}">${d.text}</div></td>
          <td><strong>${esc(x.name)}</strong><div class="stat">${esc(x.en)}</div></td>
          <td>${esc(x.cat)}</td>
          <td>${esc(x.pay)}</td>
          <td><span class="badge ${aiClass(x.ai)}">${esc(x.ai || "未標")}</span></td>
        </tr>
        <tr class="detail-row"><td colspan="6">
          <div class="detail${expanded ? " open" : ""}" id="d-${esc(x.id)}">
            <div class="detail-grid">
              <div class="stat"><b>為什麼現在能賺</b>${esc(x.why)}</div>
              <div class="stat"><b>AI 會怎麼改它</b>${esc(x.aiWhy)}</div>
              <div class="stat"><b>上檔：最頂那截，不是人人有</b>${esc(x.upside)}</div>
              <div class="stat"><b>門檻</b>${esc(x.barrier)}</div>
              <div class="stat"><b>高中生可以先做</b>${esc(x.path)}</div>
              <div class="stat"><b>台灣對照</b>${esc(x.tw)}</div>
            </div>
            <div>${tags.map((t) => `<span class="badge">${esc(t)}</span>`).join("")}</div>
            <p class="stat"><b>出處</b>${esc(x.src)}</p>
          </div>
        </td></tr>`;
    }

    const sortLabel = {
      now: "依現在榜",
      pred: "依預測榜",
      rise: "依上升最多",
      pay: "依美元參考薪",
    };

    function draw() {
      const list = sorted(filtered());
      const qv = (q.value || "").trim();
      tbody.innerHTML = list.length ? list.map(row).join("") : emptyRow(qv, 6);
      count.textContent = `顯示 ${list.length} / ${items.length} 筆 · ${sortLabel[sort.value] || ""}`;
      restoreOpen(tbody, "d-", open);
    }

    bindBoard(tbody, "d-", open);
    tbody.addEventListener("click", (e) => {
      if (!e.target.closest("[data-clear]")) return;
      q.value = "";
      draw();
      q.focus();
    });
    q.addEventListener("input", draw);
    cat.addEventListener("change", draw);
    sort.addEventListener("change", draw);
    chips?.addEventListener("click", (e) => {
      const btn = e.target.closest("[data-ai-chip]");
      if (!btn) return;
      chips.querySelectorAll(".chip").forEach((c) => {
        c.classList.remove("on");
        c.setAttribute("aria-checked", "false");
      });
      btn.classList.add("on");
      btn.setAttribute("aria-checked", "true");
      aiFilter = btn.dataset.aiChip;
      draw();
    });
    window.addEventListener("hashchange", () => {
      const id = hashId("d-");
      if (!id) return;
      open.add(id);
      draw();
    });
    draw();
  }

  function renderMethods(root, items) {
    if (!root || !Array.isArray(items)) {
      if (root) root.insertAdjacentHTML("beforeend", "<p class='warn'>榜單資料沒載入。請用本機伺服器打開，不要直接雙擊檔案。</p>");
      return;
    }
    const q = root.querySelector("[data-q]");
    const cat = root.querySelector("[data-cat]");
    const sort = root.querySelector("[data-sort]");
    const tbody = root.querySelector("[data-body]");
    const count = root.querySelector("[data-count]");
    const chips = root.querySelector("[data-chips]");
    if (!q || !cat || !sort || !tbody || !count) {
      root.insertAdjacentHTML("beforeend", "<p class='warn'>榜單工具列缺了必要欄位，請重新整理頁面。</p>");
      return;
    }
    let aiFilter = "";
    const open = new Set();
    const boot = hashId("m-");
    if (boot) open.add(boot);

    const cats = [...new Set(items.map((x) => x.cat))].sort();
    cat.innerHTML =
      `<option value="">全部分類</option>` +
      cats.map((c) => `<option value="${esc(c)}">${esc(c)}</option>`).join("");

    if (chips) {
      chips.setAttribute("role", "radiogroup");
      chips.setAttribute("aria-label", "AI 衝擊");
      chips.innerHTML = ["全部", "強化", "改寫", "削弱", "高風險"]
        .map((x, i) => {
          const val = x === "全部" ? "" : x;
          return `<button type="button" class="chip${i === 0 ? " on" : ""}" role="radio" aria-checked="${i === 0}" data-ai-chip="${val}">${x}</button>`;
        })
        .join("");
      chips.addEventListener("click", (e) => {
        const btn = e.target.closest("[data-ai-chip]");
        if (!btn) return;
        chips.querySelectorAll(".chip").forEach((c) => {
          c.classList.remove("on");
          c.setAttribute("aria-checked", "false");
        });
        btn.classList.add("on");
        btn.setAttribute("aria-checked", "true");
        aiFilter = btn.dataset.aiChip;
        draw();
      });
    }

    function filtered() {
      const text = (q.value || "").trim().toLowerCase();
      const c = cat.value;
      return items.filter((x) => {
        if (c && x.cat !== c) return false;
        if (aiFilter && x.ai !== aiFilter) return false;
        if (!text) return true;
        return haystack(x, ["name", "why", "how", "catch", "tags", "cat", "engine"]).includes(text);
      });
    }

    function sorted(list) {
      const mode = sort.value;
      const copy = list.slice();
      if (mode === "pred") copy.sort((a, b) => a.pred - b.pred);
      else if (mode === "access") copy.sort((a, b) => a.access - b.access);
      else copy.sort((a, b) => a.now - b.now);
      return copy;
    }

    function row(x) {
      const d = delta(x.now, x.pred);
      const tags = Array.isArray(x.tags) ? x.tags : [];
      const expanded = open.has(x.id);
      return `
        <tr data-open data-id="${esc(x.id)}" tabindex="0" aria-expanded="${expanded}" aria-controls="m-${esc(x.id)}">
          <td class="rank">${x.now}</td>
          <td class="rank">${x.pred}<div class="delta ${d.cls}">${d.text}</div></td>
          <td><strong>${esc(x.name)}</strong></td>
          <td>${esc(x.cat)}</td>
          <td>${esc(x.engine)}</td>
          <td><span class="badge ${aiClass(x.ai)}">${esc(x.ai || "未標")}</span></td>
        </tr>
        <tr class="detail-row"><td colspan="6">
          <div class="detail${expanded ? " open" : ""}" id="m-${esc(x.id)}">
            <div class="detail-grid">
              <div class="stat"><b>為什麼這能賺</b>${esc(x.why)}</div>
              <div class="stat"><b>高中生能理解的做法</b>${esc(x.how)}</div>
              <div class="stat"><b>陷阱</b>${esc(x.catch)}</div>
              <div class="stat"><b>AI 之後</b>${esc(x.aiWhy)}</div>
            </div>
            <div>${tags.map((t) => `<span class="badge">${esc(t)}</span>`).join("")}<span class="badge">起步難度 ${esc(x.access)}/5</span></div>
          </div>
        </td></tr>`;
    }

    const sortLabel = { now: "依現在賺錢力", pred: "依 AI 之後", access: "依起步難度" };

    function draw() {
      const list = sorted(filtered());
      const qv = (q.value || "").trim();
      tbody.innerHTML = list.length ? list.map(row).join("") : emptyRow(qv, 6);
      count.textContent = `顯示 ${list.length} / ${items.length} 筆 · ${sortLabel[sort.value] || ""}`;
      restoreOpen(tbody, "m-", open);
    }

    bindBoard(tbody, "m-", open);
    tbody.addEventListener("click", (e) => {
      if (!e.target.closest("[data-clear]")) return;
      q.value = "";
      draw();
      q.focus();
    });
    q.addEventListener("input", draw);
    cat.addEventListener("change", draw);
    sort.addEventListener("change", draw);
    window.addEventListener("hashchange", () => {
      const id = hashId("m-");
      if (!id) return;
      open.add(id);
      draw();
    });
    draw();
  }

  window.MoneyWiki = { mountChrome, renderCareers, renderMethods, esc };
})();
