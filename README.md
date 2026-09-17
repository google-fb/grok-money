# 賺錢課

給高中生的公開 wiki：全世界最能賺錢的 Top 100 職業、Top 100 方式，以及 AI 衝擊後的預測榜。

學校幾乎不教這門課。這份整理把 BLS、OECD、WEF、McKinsey、台灣勞動部與經濟學經典，寫成可以點開的地圖。

## 本機閱讀

導覽與兩張榜需要 JavaScript。請用任何靜態伺服器打開，不要直接雙擊檔案：

```bash
python3 -m http.server 4173
```

然後開 <http://127.0.0.1:4173/>。

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
