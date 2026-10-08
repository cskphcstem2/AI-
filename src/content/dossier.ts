import { REFERENCE_SENTENCES } from "@/content/references";
import type { DossierTab, EvidenceSentence } from "@/types/game";

const CORE_SENTENCES: EvidenceSentence[] = [
  {
    id: "st-bd",
    speakerId: "bangladesh",
    origin: "孟加拉立場摘要",
    tags: ["grant", "community", "warning", "access"],
    text: "孟加拉要求以贈款為主、讓社區進得了申請門，並在學期中把輟學預警和女童留校用起來。",
  },
  {
    id: "st-br",
    speakerId: "brazil",
    origin: "巴西立場摘要",
    tags: ["nature", "governance"],
    text: "巴西主張全納教育與母語教學應具資格，且教育脆弱社區要在治理裡有席位。",
  },
  {
    id: "st-de",
    speakerId: "germany",
    origin: "德國立場摘要",
    tags: ["accountability", "report"],
    text: "德國支持增加公共教育援助，但堅持要有年度公開報告，並反對用審計把撥款無限期凍結。",
  },
  {
    id: "st-cn",
    speakerId: "china",
    origin: "中國立場摘要",
    tags: ["cbdr", "public-finance"],
    text: "中國強調發達國家的公共教育援助義務，並反對把新興經濟體寫進相同的強制出資。",
  },
  {
    id: "st-us",
    speakerId: "usa",
    origin: "美國立場摘要",
    tags: ["private", "voluntary"],
    text: "美國傾向自願貢獻與教育科技夥伴，拒絕新的強制分攤公式。",
  },
  {
    id: "st-ke",
    speakerId: "kenya",
    origin: "肯尼亞立場摘要",
    tags: ["grant", "debt", "community", "warning"],
    text: "肯尼亞要求以贈款為主，讓農村學校和女童在學期中用得上輟學預警，並拒絕把基礎教育援助全盤改成貸款。",
  },
  {
    id: "f-gap",
    speakerId: "fact",
    origin: "聯合國教科文組織全球教育監測報告訓練摘要",
    sourceLabel: "UNESCO GEM Report",
    href: "https://www.unesco.org/gem-report/en",
    tags: ["grant", "public-finance", "scale"],
    text: "低收入國家每年的優質教育資金缺口以數百億美元計，已追蹤到的國際公共教育援助只覆蓋其中一部分。",
  },
  {
    id: "f-debt",
    speakerId: "fact",
    origin: "主權債務與教育支出對照（訓練摘要）",
    sourceLabel: "World Bank · Education overview",
    href: "https://www.worldbank.org/en/topic/education",
    tags: ["debt", "grant"],
    text: "多個低收入國家每年的償債支出，高於它們能動用的公共教育預算。",
  },
  {
    id: "f-kenya",
    speakerId: "fact",
    origin: "肯尼亞教育部門計畫訓練摘要",
    sourceLabel: "Kenya Ministry of Education",
    href: "https://www.education.go.ke/",
    tags: ["warning", "community"],
    text: "肯尼亞的教育重點包括農村教師留任、女童中學完成率，以及能在學期中觸達社區學校的輟學預警。",
  },
  {
    id: "f-bd-warn",
    speakerId: "fact",
    origin: "孟加拉女童教育與社區學習中心經驗（訓練摘要）",
    sourceLabel: "UNICEF Bangladesh · Education",
    href: "https://www.unicef.org/bangladesh/en/education",
    tags: ["warning", "community"],
    text: "孟加拉長期投資女童留校和社區學習中心之後，相關地區的中學完成率較缺乏這套支持的年代明顯上升。",
  },
  {
    id: "f-gcf",
    speakerId: "fact",
    origin: "全球教育夥伴關係申請經驗（訓練摘要）",
    sourceLabel: "Global Partnership for Education",
    href: "https://www.globalpartnership.org/",
    tags: ["access", "procedure", "community"],
    text: "多邊教育基金雖有簡化審批，許多國家的直接申請仍然很慢，資金容易停在程序裡。",
  },
  {
    id: "f-cbdr",
    speakerId: "fact",
    origin: "發展合作與教育援助原則摘要",
    sourceLabel: "United Nations · SDG 4",
    href: "https://sdgs.un.org/goals/goal4",
    tags: ["cbdr", "public-finance"],
    text: "共同但有區別的責任提醒：各締約方都要行動，但公共教育援助義務並不相同。",
  },
  {
    id: "f-ld",
    speakerId: "fact",
    origin: "學習貧困與基礎識字率訓練摘要",
    sourceLabel: "UNESCO · Education",
    href: "https://www.unesco.org/en/education",
    tags: ["community", "warning"],
    text: "在若干低收入地區，十歲兒童中仍有高比例無法讀懂簡單文字；缺乏教師與教材的學校輟學風險更高。",
  },
  {
    id: "f-private",
    speakerId: "fact",
    origin: "教育科技與私人資本流向訓練摘要",
    sourceLabel: "BBC · Education",
    href: "https://www.bbc.com/news/education",
    tags: ["private", "grant"],
    text: "私人資本較常流向可收費的技能與科技產品；農村基礎教育和全納支持往往更依賴公共贈款。",
  },
];

export const SENTENCES: EvidenceSentence[] = [...CORE_SENTENCES, ...REFERENCE_SENTENCES];

export const SENTENCE_MAP = Object.fromEntries(SENTENCES.map((sentence) => [sentence.id, sentence]));

export const HIGHLIGHT_LIMIT = 12;
export const HIGHLIGHT_MINIMUM = 3;

const REFERENCE_BLOCKS = [
  {
    type: "p" as const,
    text: "下面按六個席位各附兩則可畫線論據：一則政府或聯合國公開頁，一則新聞或國際機構來源。點句子畫線後，論據面板會保留超連結，方便你回原頁核對。它們是訓練用摘要，不是可直接寫進論文的頁碼引文。",
  },
  { type: "h" as const, text: "肯尼亞" },
  { type: "sentence" as const, sentenceId: "ref-ke-moe" },
  { type: "sentence" as const, sentenceId: "ref-ke-news" },
  { type: "h" as const, text: "孟加拉" },
  { type: "sentence" as const, sentenceId: "ref-bd-moedu" },
  { type: "sentence" as const, sentenceId: "ref-bd-unicef" },
  { type: "h" as const, text: "巴西" },
  { type: "sentence" as const, sentenceId: "ref-br-mec" },
  { type: "sentence" as const, sentenceId: "ref-br-unesco" },
  { type: "h" as const, text: "德國" },
  { type: "sentence" as const, sentenceId: "ref-de-bmz" },
  { type: "sentence" as const, sentenceId: "ref-de-gem" },
  { type: "h" as const, text: "中國" },
  { type: "sentence" as const, sentenceId: "ref-cn-moe" },
  { type: "sentence" as const, sentenceId: "ref-cn-un" },
  { type: "h" as const, text: "美國" },
  { type: "sentence" as const, sentenceId: "ref-us-usaid" },
  { type: "sentence" as const, sentenceId: "ref-us-news" },
  {
    type: "note" as const,
    text: "打開連結核對最新版。會場引用時仍要用自己的話說明它支持哪一句主張，不要整段照搬來源標題。",
  },
];

export const DOSSIER_TABS: DossierTab[] = [
  {
    id: "background",
    label: "議題",
    kicker: "輔助智能整理 · 先讀再畫線",
    blocks: [
      { type: "h", text: "讓優質教育趕在輟學前到達" },
      {
        type: "p",
        text: "本場只處理一個決定：如何讓教育援助更可預測，並且到達學習機會最脆弱的社區。完整的課程改革、高等教育學費政治，都不是今天要表決的句子。",
      },
      {
        type: "p",
        text: "優質教育指的是有教師、有教材、女童與障礙學習者進得了教室，而且學習成果可以被核對。它和「只建校舍」不是同一筆帳。許多基礎教育措施是公共物品，例如輟學預警和全納支持，不容易向投資人收費。",
      },
      { type: "sentence", sentenceId: "f-gap" },
      { type: "sentence", sentenceId: "f-private" },
      {
        type: "note",
        text: "輔助智能會把報告收成順句。順句更容易刪掉「大約」「最新版可能不同」。你畫成論據之後，發言時仍要用自己的話說明它支持哪一個主張。精確數字請回原報告核對，不要背誦二手摘要。",
      },
    ],
  },
  {
    id: "seat",
    label: "你的席位",
    kicker: "肯尼亞共和國 · 由你發言",
    blocks: [
      { type: "h", text: "你不是中立主持人" },
      {
        type: "p",
        text: "你代表肯尼亞。這一席在乎的是：錢不要變成新債務，農村學校、女童和社區要在學期中收到輟學預警，申請不能只對首都的顧問開放。",
      },
      {
        type: "p",
        text: "紅線有兩條。第一，不接受把基礎教育援助全盤改成貸款。第二，不接受把基礎教育私有化寫成唯一路徑，讓公共學校變成沒有人承擔的空話。紅線不是不能談判，而是這些句子不該出現在你連署的文本裡。",
      },
      { type: "sentence", sentenceId: "f-kenya" },
      { type: "sentence", sentenceId: "f-debt" },
      {
        type: "note",
        text: "席位說明是你的任務，不是證據。證據在事實摘要和其他代表已經說出口的句子裡。這一頁也會依你選的席位，附上對應的政府與報導來源。",
      },
    ],
  },
  {
    id: "stances",
    label: "五個席位",
    kicker: "簡化立場 · 不是政府全文",
    blocks: [
      {
        type: "p",
        text: "下面五句是主席辦公室為訓練整理的立場，方便你記住每席的紅線。點句子可以畫成論據。引用時你是在回應「誰說過什麼」，不是在證明那句話是事實。",
      },
      { type: "sentence", sentenceId: "st-bd" },
      { type: "sentence", sentenceId: "st-br" },
      { type: "sentence", sentenceId: "st-de" },
      { type: "sentence", sentenceId: "st-cn" },
      { type: "sentence", sentenceId: "st-us" },
      { type: "sentence", sentenceId: "st-ke" },
      {
        type: "note",
        text: "這些是教學用的簡化立場，省略了國內政治、選舉和部會分歧。不要把它們說成該國政府的完整政策。",
      },
    ],
  },
  {
    id: "facts",
    label: "事實摘要",
    kicker: "可畫線 · 最多 12 則",
    blocks: [
      {
        type: "p",
        text: "每一則都標了出處類型。它們是訓練摘要，不是你可以在正式論文裡直接引用的頁碼。畫線時問自己：這句話準備支持我的哪一個主張？",
      },
      { type: "sentence", sentenceId: "f-gap" },
      { type: "sentence", sentenceId: "f-debt" },
      { type: "sentence", sentenceId: "f-kenya" },
      { type: "sentence", sentenceId: "f-bd-warn" },
      { type: "sentence", sentenceId: "f-gcf" },
      { type: "sentence", sentenceId: "f-cbdr" },
      { type: "sentence", sentenceId: "f-ld" },
      { type: "sentence", sentenceId: "f-private" },
      {
        type: "note",
        text: "論據上限是 12 則，包含你在其他頁畫的線。挑你願意在會上負責的句子。收集更多不會加分。",
      },
    ],
  },
  {
    id: "sources",
    label: "參考來源",
    kicker: "報紙 · 政府 · 聯合國公開頁",
    blocks: REFERENCE_BLOCKS,
  },
];
