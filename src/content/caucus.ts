import type { CountryId, DelegateDiplomacy, Proposal } from "@/types/game";

export const PROPOSALS: Proposal[] = [
  {
    id: "grant-report",
    title: "贈款窗口，加上同步報告",
    text: "以贈款為主的教育援助窗口，受援方每年公開學習成果摘要，但報告不凍結撥款。",
    tags: ["grant", "accountability", "report"],
  },
  {
    id: "private-first",
    title: "私人資本優先",
    text: "把撬動私人資本寫成資金主體，公共贈款只做陪襯。",
    tags: ["private", "private-first"],
  },
  {
    id: "community-access",
    title: "社區直接申請",
    text: "開設地方教育局與青年可使用的簡化通道，九十日內初步回覆，並包含輟學預警。",
    tags: ["community", "access", "warning"],
  },
];

export const DIPLOMACY: Record<string, DelegateDiplomacy> = {
  germany: {
    id: "germany",
    listenTags: ["accountability", "report", "procedure"],
    redline: {
      delta: 4,
      text: "我們的紅線不是反對錢，而是反對沒有報告的錢。年度公開學習成果可以很短。我們不堅持在撥款前做完全面審計。你若把這兩句同時寫進草案，德國才聽得見合作。",
    },
    condition: {
      delta: 5,
      text: "合作條件有兩條：對得上教育計畫，以及成果可被公眾核對。速度可以談。你不要只問我們能給多少，先告訴我報告會放在哪一句。",
    },
    proposals: {
      "grant-report": {
        delta: 12,
        text: "贈款窗口加上同步報告，和我們的條件同向。我們仍要看最終文本有沒有把摘要寫進去。就這次接觸而言，德國願意把合作意願往上調。",
      },
      "private-first": {
        delta: 2,
        text: "私人資本可以是補充窗口。把它寫成主體，公共資金的問責反而更不清楚。我們不會因此明顯靠近。",
      },
      "community-access": {
        delta: 6,
        text: "社區通道可以接受。請記得：更短的表格，仍然需要每年的學習成果摘要。",
      },
    },
    persuadeHit: {
      delta: 10,
      text: "你這則資料碰到了我們在乎的問責或程序。它還不是草案文字，但可以成為德國不反對的理由。",
    },
    persuadeMiss: {
      delta: 0,
      text: "這則材料沒有回答報告要不要寫、由誰核對。換一則，或先說明它和問責的關係。合作意願不變。",
    },
    echo: {
      delta: 2,
      text: "這是我們自己的話。複述證明你有在聽，還沒有證明草案會採納。寫成條款，再來談連署。",
    },
    selfPitch: {
      delta: 0,
      text: "只用肯尼亞自己的主張當證據，說服力不夠。指出一項我們在乎、而且可以核對的資料。",
    },
  },
  bangladesh: {
    id: "bangladesh",
    listenTags: ["grant", "debt", "community", "access", "warning"],
    redline: {
      delta: 4,
      text: "我們不能接受新的債務式教育援助。贈款是底線，不是修飾語。報告可以有，但不能讓學年空等。",
    },
    condition: {
      delta: 5,
      text: "若草案寫明贈款優先，並給社區一個進得去的門，孟加拉會考慮連署。你若改去推私人資本優先，這扇門會關上。",
    },
    proposals: {
      "grant-report": {
        delta: 10,
        text: "贈款為主、報告不凍結，這是我們能簽名的方向。請保持社區進得了門。",
      },
      "private-first": {
        delta: -12,
        text: "若私人資本成為主體，贈款就變成裝飾。孟加拉不會把名字放在一份可能把風險留在債務裡的文本上。",
      },
      "community-access": {
        delta: 12,
        text: "九十日回覆、地方和青年進得去，這句話對我們是具體的。合作意願明顯上升。",
      },
    },
    persuadeHit: {
      delta: 10,
      text: "這則資料說到了贈款、債務、社區或預警。孟加拉聽得見。把它寫進條款，比停在走廊裡有用。",
    },
    persuadeMiss: {
      delta: 0,
      text: "這則沒有碰到我們的底線。我們仍在問：錢會不會變成債務，社區進不進得了門。",
    },
    echo: {
      delta: 2,
      text: "你重複了我們的開場。我們知道自己的立場。請告訴我你準備寫進草案的那一句。",
    },
    selfPitch: {
      delta: 0,
      text: "肯尼亞的主張我們很熟。若要推動合作，請指向一則關於債務、社區或預警的資料。",
    },
  },
  brazil: {
    id: "brazil",
    listenTags: ["nature", "governance", "community"],
    redline: {
      delta: 4,
      text: "不要把全納教育和母語教學排除在資格外。這是我們的紅線。校舍可以有，障礙學習者和母語不能在表格裡消失。",
    },
    condition: {
      delta: 4,
      text: "給脆弱社區一個清楚的治理席位，並讓全納教育合格，我們可以支持。只談融資工具、不談資格，巴西仍會猶豫要不要簽名。",
    },
    proposals: {
      "grant-report": {
        delta: 6,
        text: "贈款和報告我們不反對。請在資格裡補上全納教育，否則這份合作還不完整。",
      },
      "private-first": {
        delta: -5,
        text: "私人資本優先通常偏向可收費的技能產品。全納支持會更邊緣。這個方向我們往後退。",
      },
      "community-access": {
        delta: 8,
        text: "社區進得了門，和在地的全納教室是同方向的。若草案同時寫上全納教育，巴西會認真考慮連署。",
      },
    },
    persuadeHit: {
      delta: 10,
      text: "你點到了全納、治理或社區。巴西在乎的就是資格和席位，而不只是金額。",
    },
    persuadeMiss: {
      delta: 0,
      text: "這則還沒有回答：母語和障礙學習者算不算優質教育。沒有這句，我們很難簽名。",
    },
    echo: {
      delta: 2,
      text: "這句是我們說的。謝你記得。連署要看它有沒有變成條款。",
    },
    selfPitch: {
      delta: 0,
      text: "請不要只用肯尼亞的句子來說服巴西。我們要看到全納教育或治理席位。",
    },
  },
  usa: {
    id: "usa",
    listenTags: ["private", "voluntary", "accountability"],
    redline: {
      delta: 3,
      text: "我們不會接受新的強制分攤公式。自願、可衡量、透明，這三個詞同時在，美國才繼續聽。",
    },
    condition: {
      delta: 4,
      text: "保留自願性的公私窗口，並證明項目提高了什麼學習成果，我們可以不反對。公共贈款可以是一個窗口，不要把它寫成自動向任何國家攤派。",
    },
    proposals: {
      "grant-report": {
        delta: 2,
        text: "贈款加報告，透明度是好的。若整個文件只剩贈款、沒有自願窗口，美國傾向棄權，而不是連署。",
      },
      "private-first": {
        delta: 16,
        text: "把私人資本寫成主體，符合我們的優先。但你要知道：前線國家會把這句讀成贈款被拿掉。合作意願上升，不代表這份草案對你的席位安全。",
      },
      "community-access": {
        delta: 3,
        text: "社區通道可以討論。請加上可衡量的學習成果。單是開門，還不足以讓我們簽名。",
      },
    },
    persuadeHit: {
      delta: 12,
      text: "這則碰到自願、教育科技或問責。美國可以把它當成不反對的理由。強制分攤仍然免談。",
    },
    persuadeMiss: {
      delta: 0,
      text: "這則沒有說明私人資本或自願窗口放在哪裡。我們先不調整合作意願。",
    },
    echo: {
      delta: 2,
      text: "你引用了我們的話。很好。接下來要看草案是否保留自願性。",
    },
    selfPitch: {
      delta: 0,
      text: "肯尼亞的主張本身不是美國的決策依據。請指向自願性、教育科技，或可核對的學習成果。",
    },
  },
  china: {
    id: "china",
    listenTags: ["cbdr", "public-finance", "grant"],
    redline: {
      delta: 4,
      text: "請不要把新興經濟體寫成與發達國家相同的強制出資方。南南合作可以寫，但要標成補充。",
    },
    condition: {
      delta: 5,
      text: "寫清公共教育援助的既有原則，我們可以考慮。透明度可以談。用南南合作換掉發達國家的承諾，我們不會簽。",
    },
    proposals: {
      "grant-report": {
        delta: 8,
        text: "以公共贈款為主，並附上可核對的摘要，沒有改寫責任原則。這個方向和中方的底線相容。",
      },
      "private-first": {
        delta: -6,
        text: "私人資本優先很容易被讀成公共承諾可以退下。我們不接受這種替換。合作意願下降。",
      },
      "community-access": {
        delta: 4,
        text: "讓資金到達發展中國家的社區學校，我們支持。請同時保留公共資金的原則，不要只寫程序。",
      },
    },
    persuadeHit: {
      delta: 9,
      text: "你這則資料碰到公共資金或共同但有區別的責任。可以作為草案裡的原則句。",
    },
    persuadeMiss: {
      delta: 0,
      text: "這則還沒有回答責任如何區別。沒有這一句，我們不會因為氣氛好就簽名。",
    },
    echo: {
      delta: 2,
      text: "原則我們已經說過。請把它寫成「補充不能替代」，而不是再複述一次。",
    },
    selfPitch: {
      delta: 0,
      text: "請用公約原則或公共資金的資料來說，不要只重複肯尼亞的利益。",
    },
  },
  kenya: {
    id: "kenya",
    listenTags: ["grant", "debt", "community", "access", "warning"],
    redline: {
      delta: 4,
      text: "我們不能接受把基礎教育援助全盤改成貸款。贈款是底線。報告可以有，但不能讓農村學校空等。",
    },
    condition: {
      delta: 5,
      text: "若草案寫明贈款優先，並讓農村學校和女童在學期中用得上輟學預警，肯尼亞會考慮連署。",
    },
    proposals: {
      "grant-report": {
        delta: 10,
        text: "贈款為主、報告不凍結，這是我們能簽名的方向。請讓社區進得了門。",
      },
      "private-first": {
        delta: -12,
        text: "若私人資本成為主體，贈款就變成裝飾。肯尼亞不會把名字放在一份把風險留在債務裡的文本上。",
      },
      "community-access": {
        delta: 12,
        text: "地方和青年進得去，輟學預警算在裡面，這句話對我們是具體的。",
      },
    },
    persuadeHit: {
      delta: 10,
      text: "這則資料說到了贈款、債務、社區或預警。肯尼亞聽得見。把它寫進條款，比停在走廊裡有用。",
    },
    persuadeMiss: {
      delta: 0,
      text: "這則沒有碰到我們的底線。我們仍在問：錢會不會變成債務，社區進不進得了門。",
    },
    echo: {
      delta: 2,
      text: "你重複了我們的開場。我們知道自己的立場。請告訴我你準備寫進草案的那一句。",
    },
    selfPitch: {
      delta: 0,
      text: "只用你自己的主張當證據，說服力不夠。請指向債務、社區或預警的一則資料。",
    },
  },
};

export const INITIAL_AFFINITY: Record<CountryId, number> = {
  kenya: 52,
  bangladesh: 66,
  brazil: 54,
  germany: 42,
  china: 49,
  usa: 34,
};

export const AFFINITY_THRESHOLD: Record<CountryId, Record<1 | 2 | 3, number>> = {
  kenya: { 1: 58, 2: 62, 3: 64 },
  bangladesh: { 1: 56, 2: 60, 3: 60 },
  brazil: { 1: 56, 2: 58, 3: 60 },
  germany: { 1: 54, 2: 60, 3: 64 },
  china: { 1: 52, 2: 56, 3: 56 },
  usa: { 1: 58, 2: 62, 3: 66 },
};
