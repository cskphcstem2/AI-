import type { FocusQuestion } from "@/types/game";

export const FOCUS_QUESTIONS: FocusQuestion[] = [
  {
    id: "q-finance",
    prompt:
      "教育援助應以什麼形式到達學習機會脆弱的國家？公共贈款、貸款、自願性的私人資本，各自該放在什麼位置？",
    tags: ["grant", "private", "debt", "public-finance", "voluntary", "cbdr"],
    remarks: [
      {
        delegateId: "usa",
        text: "若只寫贈款，缺口仍然在。私人資本和教育科技應該是正文，不是註腳。我們不接受用強制分攤來補這個句子。",
      },
      {
        delegateId: "china",
        text: "私人資本可以討論。它不能用來改寫發達國家已經承諾的公共教育援助義務，也不能把新興經濟體寫成相同的強制出資方。",
      },
    ],
  },
  {
    id: "q-access",
    prompt: "如何讓申請更快，同時讓出資方相信資源用在優質教育上？",
    tags: ["access", "community", "accountability", "report", "procedure", "warning"],
    remarks: [
      {
        delegateId: "germany",
        text: "我們可以接受更短的期限和更短的表格。每年的學習成果摘要不能刪，否則速度只是不可核對。",
      },
      {
        delegateId: "bangladesh",
        text: "摘要可以有。若它變成撥款前的長審計，社區會再錯過一個學年。門要開給地方，不只開給首都的顧問。",
      },
    ],
  },
  {
    id: "q-scope",
    prompt: "資金資格要不要寫進輟學預警和全納教育、母語教學？",
    tags: ["nature", "governance", "warning", "grant", "community"],
    remarks: [
      {
        delegateId: "brazil",
        text: "無論你們把贈款和報告怎麼搭配，請不要把全納教育、母語教學和輟學預警排除在資格之外。治理席位也請留給脆弱社區。",
      },
    ],
  },
];
