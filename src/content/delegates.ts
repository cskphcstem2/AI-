import type { AiDelegateId, CountryId, DelegateProfile } from "@/types/game";

export const PLAYER: DelegateProfile = {
  id: "kenya",
  countryZh: "肯尼亞共和國",
  countryEn: "Republic of Kenya",
  placard: "肯尼亞",
  style: "把教室放進句子裡。先講誰上不了學，再講你希望教育資金以什麼形式到達。",
  interests: [
    "教育援助以贈款為主，避免脆弱國家為建校與師資再舉債",
    "農村學校、女童中學完成率，以及能留住合格教師的條件",
    "地方教育局與社區學校進得了申請門，輟學預警要在學期中用得上",
  ],
  redLines: [
    "不接受把基礎教育援助全盤改成貸款",
    "不接受把基礎教育私有化寫成唯一路徑，讓公共學校變成沒有人承擔的空話",
  ],
  openingSpeech:
    "主席。肯尼亞把優質教育看成這一季的教室、女童能否完成中學，以及農村有沒有教師，而不是下一份研究。我們需要以贈款為主的教育援助窗口。新的貸款只會把學習缺口記進債務。地方教育局、社區學校和青年必須進得了申請門，輟學預警要在學期中到達，而不是停在首都的顧問桌上。我們支持可核對的學習成果，但報告不能成為讓學校空等下一個學年的凍結。若草案把基礎教育援助全盤改成貸款，或刪掉公共教育責任，肯尼亞不能連署。",
  speechSummary: "肯尼亞：教育援助應以贈款為主，社區學校要在學期中用得上輟學預警，報告不能讓撥款凍結。",
  tags: ["grant", "community", "warning", "debt"],
  seal: "#6e2430",
  sealInk: "#f4efe6",
  mark: "肯",
};

export const AI_DELEGATES: DelegateProfile[] = [
  {
    id: "bangladesh",
    countryZh: "孟加拉人民共和國",
    countryEn: "People's Republic of Bangladesh",
    placard: "孟加拉",
    style: "用學期和社區說話，少堆抽象名詞。",
    interests: [
      "以贈款應付已經發生的學習中斷，而不是新的教育債務",
      "簡化申請，讓地方教育局在寫明的期限內得到回覆",
      "學期中就把輟學預警和女童留校措施用起來",
    ],
    redLines: ["不接受以貸款為主的教育援助安排", "不接受把報告做成撥款前的長期凍結"],
    openingSpeech:
      "主席。對孟加拉來說，優質教育不是下一份研究的題目，而是這一學期的女童能否回校、社區學習中心還在不在。我們需要以贈款為主的教育窗口。新的貸款只會把學習中斷記進債務。申請必須讓地方教育局和社區組織進得了門，並且在寫明的期限內得到回覆。輟學預警已經說明一件事：資源若在學期中到達社區，保住的是學習機會，而不只是災後才補課的合約。若程序複雜到只能由首都的顧問寫完，這筆資金就還沒有離開會議廳。孟加拉支持問責，但報告不能成為讓學年空等的理由。",
    speechSummary:
      "孟加拉：教育援助應以贈款為主，社區要進得了申請門，報告不能讓學期中資源趕不上女童留校。",
    tags: ["grant", "debt", "community", "access", "warning"],
    seal: "#1d6a4a",
    sealInk: "#f4efe6",
    mark: "孟",
  },
  {
    id: "brazil",
    countryZh: "巴西聯邦共和國",
    countryEn: "Federative Republic of Brazil",
    placard: "巴西",
    style: "把全納和治理放在同一句裡。",
    interests: [
      "全納教育、母語教學與障礙學習者支持應具有教育資金資格",
      "教育脆弱社區在治理裡要有席位，而不是表決時才被叫進來",
      "成果指標不能只計算新建校舍",
    ],
    redLines: ["不接受只資助校舍硬體、把全納與母語教學排除在外的資格條款"],
    openingSpeech:
      "巴西請各位把教育的想像從校舍和課桌再打開一點。母語教學、障礙學習者支持和全納教室會降低輟學風險，這些做法應該有資格使用教育資金。治理上也一樣：教育脆弱社區不能只在表決時被邀請進來。我們支持可核對的學習成果，但指標如果只計算混凝土校舍，全納與母語就會在表格裡消失。給全納教育資格，並在理事會保留脆弱社區的席位，這份草案才算完整。",
    speechSummary: "巴西：全納教育與母語教學應具資金資格，教育脆弱社區要在治理中有席位。",
    tags: ["nature", "governance", "equity"],
    seal: "#2f6b3a",
    sealInk: "#f4efe6",
    mark: "巴",
  },
  {
    id: "germany",
    countryZh: "德意志聯邦共和國",
    countryEn: "Federal Republic of Germany",
    placard: "德國",
    style: "先講條件，再講能接受的折衷。",
    interests: [
      "增加可預測的公共教育援助",
      "年度公開學習成果，讓出資方的公眾核對得到",
      "問責和撥款同步，而不是二選一",
    ],
    redLines: ["不接受沒有任何報告的承諾", "也不把全面審計當作撥款前的關卡"],
    openingSpeech:
      "主席、各位代表。德意志聯邦共和國希望教育援助變得可預測，也願意討論增加多邊公共資源。我們的條件很具體：資金要對得上國家教育計畫，並且每年公開錢撥到哪裡、誰受益、學習成果如何核實。沒有報告的承諾，出資方的公眾無法監督，資源也可能停在紙面上。但我們同樣不認為，應該在撥款前設置漫長的全面審計，把學校急需的師資和教材凍結到下一個學年。問責應當和撥款同步進行，而不是變成另一道關卡。請各位不要把問責和速度寫成二選一。若草案同時寫上公開摘要與不得預先凍結，德國可以認真考慮支持。",
    speechSummary:
      "德國：可以討論增加公共教育資源，條件是年度公開成果；問責不能做成撥款前的無限期凍結。",
    tags: ["accountability", "report", "procedure"],
    seal: "#3c4654",
    sealInk: "#f4efe6",
    mark: "德",
  },
  {
    id: "china",
    countryZh: "中華人民共和國",
    countryEn: "People's Republic of China",
    placard: "中國",
    style: "先講原則，再講補充方案不能替代原則。",
    interests: [
      "發達國家履行已寫入承諾的公共教育援助",
      "南南合作與教師培訓可以補充，不能替代",
      "必要的透明度，讓教育資金被看見",
    ],
    redLines: ["不接受要求新興經濟體承擔與發達國家相同的強制出資義務"],
    openingSpeech:
      "中方重申共同但有區別的責任與各自能力。教育援助的公共承諾，應首先由發達國家履行。這是已經寫下的原則，不是會議當天新提出的恩惠。南南合作、教師培訓和數位公共產品可以作為補充，但不能被寫成替代。我們支持讓資源更容易到達發展中國家的學校，也支持必要的透明度，讓資金被看見。我們反對的是另一種寫法：要求新興經濟體承擔與發達國家相同的強制出資義務。補充方案可以進草案，原則不能被補充方案換掉。",
    speechSummary:
      "中國：發達國家應履行公共教育援助承諾，南南合作只是補充，反對把新興經濟體納入相同強制出資。",
    tags: ["cbdr", "public-finance", "south-south"],
    seal: "#8d3030",
    sealInk: "#f4efe6",
    mark: "中",
  },
  {
    id: "usa",
    countryZh: "美利堅合眾國",
    countryEn: "United States of America",
    placard: "美國",
    style: "把「自願」和「可衡量」放在一起。",
    interests: [
      "用自願貢獻、技能夥伴和教育科技撬動私人資本",
      "項目要透明，並說明如何提高可核對的學習成果",
      "保留一個有限度的公共窗口，而不是只剩口號",
    ],
    redLines: ["不接受新的強制分攤公式，或不接受把特定國家自動綁進出資義務"],
    openingSpeech:
      "美國承認公共教育資金重要，也承認目前的學習機會缺口不是口號。但單靠公共預算填不滿這個缺口。我們支持自願貢獻、技能夥伴和教育科技，讓私人資本進入那些學習成果可衡量的項目。我們不接受新的強制分攤公式，也不接受把任何國家自動綁進出資義務。若草案保留自願性，寫清楚項目如何提高學習成果，並維持透明，美國可以討論一個有限度的窗口。若文本把私人部門寫成唯一主體，或把公共贈款全部刪掉，那會是另一種失衡。",
    speechSummary: "美國：支持自願貢獻和可衡量的教育科技與技能夥伴，拒絕新的強制分攤公式。",
    tags: ["private", "voluntary", "accountability"],
    seal: "#1e3f66",
    sealInk: "#f4efe6",
    mark: "美",
  },
];

export const SPEECH_ORDER: AiDelegateId[] = [
  "bangladesh",
  "germany",
  "usa",
  "china",
  "brazil",
];

export const DELEGATES: Record<CountryId, DelegateProfile> = {
  kenya: PLAYER,
  bangladesh: AI_DELEGATES[0],
  brazil: AI_DELEGATES[1],
  germany: AI_DELEGATES[2],
  china: AI_DELEGATES[3],
  usa: AI_DELEGATES[4],
};

export function delegateById(id: CountryId): DelegateProfile {
  return DELEGATES[id];
}
