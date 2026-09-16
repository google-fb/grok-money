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

  function navHtml() {
    return `
      <a class="brand" href="index.html">賺錢課<small>給還沒修過這門課的人</small></a>
      <ol>
        ${links
          .map(([href, label]) => {
            const active = page === href || (page === "" && href === "index.html");
            return `<li><a class="${active ? "active" : ""}" href="${href}">${label}</a></li>`;
          })
          .join("")}
      </ol>
      <p class="meta">整理自 BLS、OECD、WEF、McKinsey、台灣勞動部與經典經濟學文獻。數字會過時，地圖比較耐用。</p>
    `;
  }

  function mountChrome() {
    const nav = document.querySelector("[data-nav]");
    if (nav) nav.innerHTML = navHtml();

    const bar = document.querySelector("[data-mobile]");
    if (bar) {
      bar.innerHTML = `
        <a class="brand" href="index.html">賺錢課</a>
        <button type="button" data-toggle>目錄</button>
      `;
      bar.querySelector("[data-toggle]").addEventListener("click", () => {
        document.querySelector("[data-nav]")?.classList.toggle("open");
      });
      document.querySelector("[data-nav]")?.addEventListener("click", (e) => {
        if (e.target.closest("a") && window.matchMedia("(max-width: 920px)").matches) {
          document.querySelector("[data-nav]")?.classList.remove("open");
        }
      });
    }

    const foot = document.querySelector("[data-footer]");
    if (foot) {
      foot.innerHTML = `
        <p>這份 wiki 是教育地圖，不是投資建議、也不是生涯保證。高薪職業通常伴隨長工時、執照、資本或運氣。任何「保證致富」的說法，先當它是廣告。</p>
        <p>資料主年份：2024–2026。美國薪資多取 BLS OEWS May 2025 平均年薪；台灣數字取勞動部職類別薪資調查。預測榜是情境推演，不是預言。</p>
      `;
    }
  }

  function aiClass(label) {
    if (label === "強化") return "ai-boost";
    if (label === "改寫") return "ai-rewrite";
    if (label === "削弱") return "ai-cut";
    return "ai-risk";
  }

  function delta(now, pred) {
    const d = now - pred;
    if (d > 0) return { cls: "up", text: `↑${d}` };
    if (d < 0) return { cls: "down", text: `↓${Math.abs(d)}` };
    return { cls: "same", text: "—" };
  }

  function usd(n) {
    if (!n) return "—";
    return "約 US$" + Number(n).toLocaleString("en-US");
  }

  function renderCareers(root, items) {
    const q = root.querySelector("[data-q]");
    const cat = root.querySelector("[data-cat]");
    const ai = root.querySelector("[data-ai]");
    const sort = root.querySelector("[data-sort]");
    const chips = root.querySelector("[data-chips]");
    const tbody = root.querySelector("[data-body]");
    const count = root.querySelector("[data-count]");

    const cats = [...new Set(items.map((x) => x.cat))].sort();
    cat.innerHTML =
      `<option value="">全部分類</option>` +
      cats.map((c) => `<option value="${c}">${c}</option>`).join("");

    chips.innerHTML = ["全部", "強化", "改寫", "削弱", "高風險"]
      .map((x, i) => `<button type="button" class="chip${i === 0 ? " on" : ""}" data-ai-chip="${x === "全部" ? "" : x}">${x}</button>`)
      .join("");

    function filtered() {
      const text = (q.value || "").trim().toLowerCase();
      const c = cat.value;
      const a = ai.value;
      return items.filter((x) => {
        if (c && x.cat !== c) return false;
        if (a && x.ai !== a) return false;
        if (!text) return true;
        return (x.name + x.en + x.why + x.path + x.tags.join(" ")).toLowerCase().includes(text);
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
      return `
        <tr data-open data-id="${x.id}">
          <td class="rank">${x.now}</td>
          <td class="rank">${x.pred}<div class="delta ${d.cls}">${d.text}</div></td>
          <td><strong>${x.name}</strong><div class="stat">${x.en}</div></td>
          <td>${x.cat}</td>
          <td>${x.pay}</td>
          <td><span class="badge ${aiClass(x.ai)}">${x.ai}</span></td>
        </tr>
        <tr class="detail-row"><td colspan="6">
          <div class="detail" id="d-${x.id}">
            <div class="detail-grid">
              <div class="stat"><b>為什麼現在能賺</b>${x.why}</div>
              <div class="stat"><b>AI 會怎麼改它</b>${x.aiWhy}</div>
              <div class="stat"><b>上檔 / 現實</b>${x.upside}</div>
              <div class="stat"><b>門檻</b>${x.barrier}</div>
              <div class="stat"><b>高中生可以先做</b>${x.path}</div>
              <div class="stat"><b>台灣對照</b>${x.tw}</div>
            </div>
            <div>${x.tags.map((t) => `<span class="badge">${t}</span>`).join("")}</div>
            <p class="stat"><b>出處</b>${x.src}</p>
          </div>
        </td></tr>`;
    }

    function draw() {
      const list = sorted(filtered());
      tbody.innerHTML = list.map(row).join("");
      count.textContent = `顯示 ${list.length} / ${items.length} 筆`;
      tbody.querySelectorAll("tr[data-open]").forEach((tr) => {
        tr.addEventListener("click", () => {
          const box = document.getElementById("d-" + tr.dataset.id);
          box?.classList.toggle("open");
        });
      });
    }

    q.addEventListener("input", draw);
    cat.addEventListener("change", draw);
    ai.addEventListener("change", draw);
    sort.addEventListener("change", draw);
    chips.addEventListener("click", (e) => {
      const btn = e.target.closest("[data-ai-chip]");
      if (!btn) return;
      chips.querySelectorAll(".chip").forEach((c) => c.classList.remove("on"));
      btn.classList.add("on");
      ai.value = btn.dataset.aiChip;
      draw();
    });
    draw();
  }

  function renderMethods(root, items) {
    const q = root.querySelector("[data-q]");
    const cat = root.querySelector("[data-cat]");
    const sort = root.querySelector("[data-sort]");
    const tbody = root.querySelector("[data-body]");
    const count = root.querySelector("[data-count]");

    const cats = [...new Set(items.map((x) => x.cat))].sort();
    cat.innerHTML =
      `<option value="">全部分類</option>` +
      cats.map((c) => `<option value="${c}">${c}</option>`).join("");

    function filtered() {
      const text = (q.value || "").trim().toLowerCase();
      const c = cat.value;
      return items.filter((x) => {
        if (c && x.cat !== c) return false;
        if (!text) return true;
        return (x.name + x.why + x.how + x.catch + x.tags.join(" ")).toLowerCase().includes(text);
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
      return `
        <tr data-open data-id="${x.id}">
          <td class="rank">${x.now}</td>
          <td class="rank">${x.pred}<div class="delta ${d.cls}">${d.text}</div></td>
          <td><strong>${x.name}</strong></td>
          <td>${x.cat}</td>
          <td>${x.engine}</td>
          <td><span class="badge ${aiClass(x.ai)}">${x.ai}</span></td>
        </tr>
        <tr class="detail-row"><td colspan="6">
          <div class="detail" id="m-${x.id}">
            <div class="detail-grid">
              <div class="stat"><b>為什麼這能賺</b>${x.why}</div>
              <div class="stat"><b>高中生能理解的做法</b>${x.how}</div>
              <div class="stat"><b>陷阱</b>${x.catch}</div>
              <div class="stat"><b>AI 之後</b>${x.aiWhy}</div>
            </div>
            <div>${x.tags.map((t) => `<span class="badge">${t}</span>`).join("")}<span class="badge">起步難度 ${x.access}/5</span></div>
          </div>
        </td></tr>`;
    }

    function draw() {
      const list = sorted(filtered());
      tbody.innerHTML = list.map(row).join("");
      count.textContent = `顯示 ${list.length} / ${items.length} 筆`;
      tbody.querySelectorAll("tr[data-open]").forEach((tr) => {
        tr.addEventListener("click", () => {
          document.getElementById("m-" + tr.dataset.id)?.classList.toggle("open");
        });
      });
    }

    q.addEventListener("input", draw);
    cat.addEventListener("change", draw);
    sort.addEventListener("change", draw);
    draw();
  }

  window.MoneyWiki = { mountChrome, renderCareers, renderMethods, usd };
})();
