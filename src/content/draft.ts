import type { Amendment, DraftBlank } from "@/types/game";

export const DRAFT_BLANKS: DraftBlank[] = [
  {
    id: "form",
    numeral: "1",
    label: "資金形式",
    lead: "鼓勵設立可預測的教育援助安排，其主要形式為",
    hint: "先看你的紅線，再決定贈款、貸款和私人資本誰在前面。",
    options: [
      {
        id: "opt-grant",
        text: "以贈款為主，避免學習機會脆弱的國家為優質教育增加主權債務。",
        tags: ["grant", "debt", "public-finance"],
      },
      {
        id: "opt-loan",
        text: "以優惠貸款為主要工具，贈款只作小額技術援助。",
        tags: ["loan-only"],
      },
      {
        id: "opt-blend",
        text: "不規定贈款或貸款的優先順序，交由各項目自行搭配。",
        tags: ["private"],
      },
    ],
  },
  {
    id: "access",
    numeral: "2",
    label: "誰可以申請",
    lead: "請秘書處設立申請通道，具體為",
    hint: "想一想資金會停在首都，還是到得了社區學校。",
    options: [
      {
        id: "opt-community",
        text: "地方教育局與青年組織可提交簡化申請，秘書處在九十日內作出初步回覆，並包含輟學預警。",
        tags: ["community", "access", "warning"],
      },
      {
        id: "opt-capital",
        text: "僅接受國家中央機關的完整標書，不設回覆期限。",
        tags: ["procedure"],
      },
      {
        id: "opt-fast",
        text: "申請送達後三十日內全額撥付，不要求任何後續說明。",
        tags: ["access", "no-accountability"],
      },
    ],
  },
  {
    id: "account",
    numeral: "3",
    label: "問責",
    lead: "決定問責安排如下",
    hint: "德國和孟加拉的紅線在這裡相遇：要報告，但報告不能變成關卡。",
    options: [
      {
        id: "opt-sync",
        text: "受援方每年公開學習成果摘要，並接受抽樣覆核；報告不得作為凍結撥款的前置條件。",
        tags: ["accountability", "report"],
      },
      {
        id: "opt-freeze",
        text: "完成獨立審計之前，不得撥付任何資金。",
        tags: ["accountability", "freeze"],
      },
      {
        id: "opt-none",
        text: "為了速度，草案不寫報告與問責。",
        tags: ["no-accountability"],
      },
    ],
  },
  {
    id: "scope",
    numeral: "4",
    label: "資格與補充窗口",
    lead: "進一步決定資金範圍",
    hint: "這一格同時決定巴西、美國和中國會不會在表決時往前靠。",
    options: [
      {
        id: "opt-nature",
        text: "輟學預警與全納教育、母語教學均具資格；另設自願性公私窗口，不替代公共贈款。理事會保留教育脆弱社區席位。",
        tags: ["nature", "governance", "voluntary", "warning", "private"],
      },
      {
        id: "opt-infra",
        text: "資金只用於校舍硬體工程，不包括全納支持、母語教學與預警維護。",
        tags: ["infra"],
      },
      {
        id: "opt-binding",
        text: "所有成員國，包括新興經濟體，接受與發達國家相同的強制分攤公式。",
        tags: ["binding-obligation", "binding-emerging"],
      },
    ],
  },
];

export const AMENDMENTS: Amendment[] = [
  {
    id: "de-audit",
    sponsorId: "germany",
    text: "在任何撥款之前，必須完成獨立外部審計。",
    stakes: "問責會變強，但也會變成前置關卡。孟加拉和你的「資金要趕在學年開始前到達」會被削弱。",
    counterText:
      "改為：每年公開學習成果摘要，並接受抽樣覆核；審計不得作為凍結撥款的前置條件。",
  },
  {
    id: "us-private",
    sponsorId: "usa",
    text: "刪去贈款優先，改寫為以私人資本為資金主體。",
    stakes: "美國會更願意投贊成。肯尼亞的核心主張，以及孟加拉的底線，會從文本裡消失。",
    counterText: "保留贈款優先窗口，另設自願性公私窗口，並寫明不替代公共贈款。",
  },
];

export const DRAFT_PREAMBLE = [
  "全球之聲訓練議場",
  "簡化決議草案 A/GV/L.1",
  "議題：讓優質教育趕在輟學前到達",
  "可持續發展委員會（簡化議程）確認，教育援助應當可預測，並且到達學習機會脆弱的社區。非關鍵段落已由秘書處依前述討論填妥。代表只需決定下列四個關鍵位置。",
];
