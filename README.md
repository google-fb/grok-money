# 賺錢課

給高中生的公開 wiki：全世界最能賺錢的 Top 100 職業、Top 100 方式，以及 AI 衝擊後的預測榜。

學校幾乎不教這門課。這份整理把 BLS、OECD、WEF、McKinsey、台灣勞動部與經濟學經典，寫成可以點開的地圖。

## 本機閱讀

導覽與兩張榜需要 JavaScript。請用任何靜態伺服器打開，不要直接雙擊檔案：

```bash
python3 -m http.server 4173
```

然後開 <http://127.0.0.1:4173/>。

## GitHub Pages

這是靜態 HTML／CSS／JS。workflow 會把網站推到 `gh-pages` 分支，**不再呼叫** `actions/configure-pages`（那個 action 在 Pages 尚未開啟時會 404，而且舊版跑在 Node 20）。

預期網址：<https://google-fb.github.io/grok-money/>

1. 合併這份修正後，等 Actions 的 `GitHub Pages` 跑完（會建立／更新 `gh-pages`）。
2. 打開 repo **Settings → Pages**。
3. Build and deployment 選 **Deploy from a branch**，Branch 選 `gh-pages`、資料夾 `/ (root)`。
4. 這個倉庫若仍是 **private**，免費帳號看不到 Pages；把 repo 改成 Public，或用 GitHub Pro。

## 頁面

| 頁 | 內容 |
| --- | --- |
| `index.html` | 這門課在講什麼 |
| `map.html` | 類似流程圖的架構圖 |
| `careers.html` | 職業 100：現在榜／預測榜 |
| `methods.html` | 方式 100 |
| `ai.html` | 預測方法與文獻翻譯 |
| `start.html` | 高中生可執行清單 |
| `sources.html` | 出處 |

資料在 `js/careers.js`、`js/methods.js`，由 `scripts/build_data.py` 產生。

## 這不是什麼

不是投資建議，不是生涯保證，不是致富課程。數字會過時，地圖比較耐用。

2026/09/18
