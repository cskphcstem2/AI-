# 全球之聲 Global Voice

給中學生的模擬聯合國訓練。可單人練習，也可最多 4 人聯機：各自代表一國發言，其餘席位由輔助智能補充。一場正式會議大約 40 分鐘：讀資料、畫論據、開場發言、有秩序動議、策略接觸、填決議草案、唱名表決。

本場議題是「讓優質教育趕在輟學前到達」（SDG 4、SDG 17）。大廳可以選六國其中一席來代表，預設是肯尼亞。另外五席由規則引擎扮演。立場經過簡化，用來練習利益、證據和程序，不是各國政府的完整政策。

準備環節不計入 40 分鐘。計時是建議節奏，時間到了不會把發言切斷。

## 本地執行

```bash
npm install
npm run dev
```

開發伺服器預設在 [http://127.0.0.1:4317](http://127.0.0.1:4317)。

正式網站用 Vercel 靜態發佈（`npm run build` 產出 `dist`）。在這個對話按 Publish，連上 Vercel 之後會得到一個一直在的 `vercel.app` 網址。臨時的 trycloudflare 連結會過期，不要用佢做正式入口。

```bash
npm test
npm run lint
npm run build
```

同一分頁會用 `sessionStorage` 記住進行中的會議。已結束的場次和「儲存進度」寫進登入帳號的 Firestore 紀錄（`users/{uid}`），這部瀏覽器只留一份副本。換裝置後用同一個 Google 帳號登入，即可看到練習紀錄並繼續帳號存檔。離開期間不計入建議的四十分鐘。

## 登入

進大廳前要用 **Google 帳號**（Firebase Authentication）登入。身分由 Firebase 驗證。練習紀錄和進度存檔在 Firestore 的 `users/{uid}`，只有該帳號可以讀寫。

在 [Firebase 主控台](https://console.firebase.google.com/) 請確認：

1. Authentication → Sign-in method 已開啟 Google。
2. Authentication → Settings → Authorized domains 已加入 `localhost`、你的 Vercel／正式網址。
3. Firestore Database 已建立（正式模式即可），並套用本 repo 的 `firestore.rules`（已登入使用者可讀寫自己的 `users/{uid}`，以及自己參與的 `rooms/{code}`）。

環境變數可寫在 `.env`（亦可直接使用專案內建的 Firebase web 設定）：

```bash
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
VITE_FIREBASE_MEASUREMENT_ID=
```

## 聯機會議（最多 4 人）

大廳可「建立房間」或輸入 6 碼「加入房間」。同一場最多 **4 位** Google 登入使用者，各自選不同國家席位並按「準備就緒」；房主按「開議」。

- 未選的席位由規則引擎／輔助智能代言（開場講稿、動議對白等）。
- 開場發言：每位真人代表各自用語音或打字送出；齊了之後再揭示 AI 席位。
- 會中狀態存在 Firestore `rooms/{code}`，由房主套用操作意圖並廣播 `game` 狀態。
- 聯機場不寫入本機單人存檔；要結束請按「離開房間」。

## 會議語言

首頁可以選聯合國六種官方語言：العربية、中文、English、Français、Русский、Español。選了之後，介面和預設錄音語言一起換。錄音面板上仍可單獨改辨識語言。中文辨識用國語（`zh-TW`），不用廣東話。說出來的逐字稿保持原話；介面、卷宗和各席對白在顯示時翻譯。阿拉伯文由右至左。

## 一場怎麼走

| 環節 | 你在做什麼 |
| --- | --- |
| 準備 | 聽主席開幕、讀卷宗、最多畫 12 則論據、回答 4 題理解檢測、點名出席 |
| 各自發言 | 可以先寫講稿，但要用語音說出開場。說完按內容、表達、外交儀態給分。然後聽五席，秘書處把摘要收成論據 |
| 有秩序動議 | 三輪輪流發言。先聽一席，輪到你就寫進一步想法；論據用來支持或反駁，不能代替你要說的話。對方會回應，你可以再應對或略過 |
| 非監管式議會 | 五席都開得了，跟完一國不會鎖住其他國。方案要自己寫，論據只加說服力。每一席可談三次，至少跟三個國家談過才能寫草案 |
| 草案 | 四個空位都由你自己填。論據只能附在句子上加分，不能單獨成為答案。反建議也由你寫，系統只給指引 |
| 表決與覆盤 | 簡單多數。通過之外，還看你的核心主張有沒有留在文本裡 |

論據有三個來源：

1. 卷宗裡手動畫線，上限 12。卷宗「參考來源」頁為六國各附政府／聯合國與報紙超連結論據。
2. 理解題答對的內容。
3. 秘書處整理的開場摘要。摘要是「誰說了什麼」，不是事實核查。

論據清單分開顯示：我畫的線、理解題、秘書處摘要、討論收成。有秩序動議和非監管式議會的來回會收成新的論據，每則附短描述。論據是額外說服力，不是草案或方案的唯一答案。

評分只檢查結構：有沒有理由、論據有沒有對上當前問題、文本有沒有守住紅線、有沒有人連署、核心主張還在不在。它不判斷價值觀對不對。

## 難度

第一場是「標準」。最近一到兩場的綜合分會調整下一場：

- 低於 55：入門。提示多一些，連署門檻低一些。
- 80 以上：嚴謹。發言要更完整，指證要點出機制，正式草案要三席連署，指證只有兩次。

合作意願的加減幅不隨難度變，變的是門檻和論證標準。這樣學生學的是各席在乎什麼，而不是去猜隱藏分數。

## 資料結構

型別在 `src/types/game.ts`。一場的狀態是 `GameState`，由 `src/engine/reducer.ts` 更新。

- `Phase`：`lobby` 到 `debrief`。
- `TruthBullet`：`id`、`text`、`source`（`highlight` | `comprehension` | `secretariat`）、`origin`、`speakerId`、`tags`。
- `DelegateProfile`：身份、利益、紅線、說話風格、開場講稿、摘要。
- `DifficultyProfile`：字數、指證次數、連署人數、提示強度。
- `GameState` 另外守著論據列表、理解題答案、開場稿、五席合作意願、接觸紀錄、四個草案空位、修正案選擇、唱名結果和 `SessionScore`。

內容和規則分開：

- `src/content/` 是議題、卷宗、講稿、提案和草案選項。
- `src/engine/judge.ts` 檢查指證結構。
- `src/engine/diplomacy.ts` 計算接觸、連署和表決。
- `src/engine/scoring.ts` 產出四項指標。
- `src/llm/client.ts` 預留 OpenAI 相容接口。沒有金鑰時使用內建引擎。

介面由 `GameProvider` 提供狀態。版面是議場外框：左側席位、中間議程、右側論據面板。

| 畫面 | 檔案 |
| --- | --- |
| 會前 | `src/components/phases/LobbyScreen.tsx` |
| 開幕、卷宗、理解題 | `src/components/phases/PrepScreens.tsx` |
| 各自發言 | `src/components/phases/OpeningScreen.tsx` |
| 有秩序動議 | `src/components/phases/ModeratedScreen.tsx` |
| 策略接觸 | `src/components/phases/UnmoderatedScreen.tsx` |
| 草案與修正 | `src/components/phases/DraftingScreen.tsx` |
| 表決與覆盤 | `src/components/phases/ClosingScreens.tsx` |

## 語言模型

對白、好感度和表決目前故意不交給模型自由發揮，避免紅線被改寫。`.env.example` 裡的 `VITE_LLM_BASE_URL`、`VITE_LLM_API_KEY`、`VITE_LLM_MODEL` 只會讓頁尾顯示「已偵測到設定」。真正結算仍走 `src/engine/`。

之後若要讓某一席的語氣改由模型生成，用 `buildDelegateSystemPrompt()` 組系統提示，呼叫 `createLlmClient().complete()`，再把回傳句子交回 `resolveCaucus()` 的既有加減幅。模型可以換說法，不應該自己決定連署和投票。

## 之後可以加什麼

- 第二、第三個 SDG 議題，沿用同一套 `GameState`。
- 教師看版：匯出覆盤、論據使用和連署路徑。現在用 Firebase Google 登入，還沒有雲端教師看版。
- 聯機場的有秩序動議改為依真人席位輪流發言（目前開場已支援最多四席真人，後續階段仍共用同一份會議狀態）。
- 修正案改由玩家自己寫，規則引擎只檢查有沒有同時留下雙方紅線。
- 鏡頭評分眼神和站姿。現在口語只計時間、快慢、停頓和音量。
- 把秘書處摘要改成模型生成，但每則仍要帶來源標籤，並在畫面上寫明「這不是事實核查」。
