import { ALL_SEATS } from "@/content/seats";
import type { CountryId } from "@/types/game";

export interface SdgGoal {
  n: number;
  titleZh: string;
  titleEn: string;
  /** Official SDG colour. */
  color: string;
  /** Badge text when the colour is light. */
  ink: "light" | "dark";
}

export interface TrainingCase {
  id: string;
  sdg: number;
  titleZh: string;
  titleEn: string;
  questionZh: string;
  questionEn: string;
  seats: CountryId[];
}

export const SDGS: readonly SdgGoal[] = [
  { n: 1, titleZh: "消除貧窮", titleEn: "No Poverty", color: "#E5243B", ink: "light" },
  { n: 2, titleZh: "零飢餓", titleEn: "Zero Hunger", color: "#DDA63A", ink: "dark" },
  { n: 3, titleZh: "良好健康與福祉", titleEn: "Good Health and Well-being", color: "#4C9F38", ink: "light" },
  { n: 4, titleZh: "優質教育", titleEn: "Quality Education", color: "#C5192D", ink: "light" },
  { n: 5, titleZh: "性別平等", titleEn: "Gender Equality", color: "#FF3A21", ink: "light" },
  { n: 6, titleZh: "清潔飲水與衛生", titleEn: "Clean Water and Sanitation", color: "#26BDE2", ink: "dark" },
  { n: 7, titleZh: "可負擔的潔淨能源", titleEn: "Affordable and Clean Energy", color: "#FCC30B", ink: "dark" },
  { n: 8, titleZh: "尊嚴就業與經濟成長", titleEn: "Decent Work and Economic Growth", color: "#A21942", ink: "light" },
  { n: 9, titleZh: "產業、創新與基礎設施", titleEn: "Industry, Innovation and Infrastructure", color: "#FD6925", ink: "light" },
  { n: 10, titleZh: "減少不平等", titleEn: "Reduced Inequalities", color: "#DD1367", ink: "light" },
  { n: 11, titleZh: "永續城市與社區", titleEn: "Sustainable Cities and Communities", color: "#FD9D24", ink: "dark" },
  { n: 12, titleZh: "負責任的消費與生產", titleEn: "Responsible Consumption and Production", color: "#BF8B2E", ink: "light" },
  { n: 13, titleZh: "氣候行動", titleEn: "Climate Action", color: "#3F7E44", ink: "light" },
  { n: 14, titleZh: "水下生命", titleEn: "Life Below Water", color: "#0A97D9", ink: "light" },
  { n: 15, titleZh: "陸域生命", titleEn: "Life on Land", color: "#56C02B", ink: "dark" },
  { n: 16, titleZh: "和平、正義與健全制度", titleEn: "Peace, Justice and Strong Institutions", color: "#00689D", ink: "light" },
  { n: 17, titleZh: "夥伴關係", titleEn: "Partnerships for the Goals", color: "#19486A", ink: "light" },
];

const six: CountryId[] = ["kenya", "bangladesh", "brazil", "germany", "china", "usa"];

export const CASES: readonly TrainingCase[] = [
  {
    id: "sdg1-cash",
    sdg: 1,
    titleZh: "下一季的現金轉移",
    titleEn: "Disbursement of cash transfers in the coming season",
    questionZh: "最窮家庭的現金轉移，能不能在下一季到達，而不是停在首都的計劃書裡？",
    questionEn: "Should cash transfers reach the poorest households in the coming season, rather than remain in a plan retained in the capital?",
    seats: ["kenya", "bangladesh", "brazil", "germany"],
  },
  {
    id: "sdg1-debt",
    sdg: 1,
    titleZh: "債務暫停與社會救助",
    titleEn: "Suspension of debt service and social assistance",
    questionZh: "債務暫停要不要綁上社會救助支出，避免省下的錢沒有進到貧窮家庭？",
    questionEn: "Should a suspension of debt service be linked to expenditure on social assistance, so that the resources released reach households in poverty?",
    seats: ["kenya", "germany", "china", "usa"],
  },
  {
    id: "sdg1-floor",
    sdg: 1,
    titleZh: "社會保護的最低標準",
    titleEn: "A minimum standard of social protection",
    questionZh: "社會保護的最低標準要不要寫進今年的公共預算，而不是留到下一份計劃？",
    questionEn: "Should a minimum standard of social protection be entered in this year's public budget, rather than deferred to a subsequent plan?",
    seats: ["bangladesh", "brazil", "usa", "china"],
  },
  {
    id: "sdg2-meals",
    sdg: 2,
    titleZh: "誰先付學校供餐",
    titleEn: "Financing of school meals",
    questionZh: "學校供餐的穀物由本國預算先付，還是等國際採購合約簽完才開伙？",
    questionEn: "Should national budgets finance grain for school meals in the first instance, or should provision await the conclusion of an international procurement contract?",
    seats: ["kenya", "bangladesh", "brazil", "usa"],
  },
  {
    id: "sdg2-seed",
    sdg: 2,
    titleZh: "小農種子補助",
    titleEn: "Seed support for smallholder farmers",
    questionZh: "小農種子補助要不要對跨國公司開放，還是只留給公共種子庫和本地合作社？",
    questionEn: "Should seed support for smallholder farmers be open to multinational enterprises, or reserved for public seed banks and local cooperatives?",
    seats: ["brazil", "kenya", "china", "germany"],
  },
  {
    id: "sdg3-cold",
    sdg: 3,
    titleZh: "疫苗冷鏈誰出錢",
    titleEn: "Financing of the vaccine cold chain",
    questionZh: "基礎疫苗的冷鏈由公共預算負擔，還是再寫進一筆新的健康貸款？",
    questionEn: "Should the public budget finance the cold chain for basic vaccines, or should that expenditure be included in a new health loan?",
    seats: ["kenya", "bangladesh", "germany", "usa"],
  },
  {
    id: "sdg3-workers",
    sdg: 3,
    titleZh: "社區衛生員的薪資",
    titleEn: "Remuneration of community health workers",
    questionZh: "社區衛生員的薪資能不能寫進援助窗口，而不是只購買設備？",
    questionEn: "Should the remuneration of community health workers be included in the assistance window, rather than confined to the procurement of equipment?",
    seats: ["bangladesh", "kenya", "china", "brazil"],
  },
  {
    id: "sdg3-meds",
    sdg: 3,
    titleZh: "基本藥物的價格",
    titleEn: "The price of essential medicines",
    questionZh: "基本藥物要不要設公開價格上限，避免診所買不起清單上的藥？",
    questionEn: "Should a published price ceiling apply to essential medicines, so that clinics remain able to procure the items on the list?",
    seats: ["kenya", "brazil", "germany", "china"],
  },
  {
    id: "sdg4-reach",
    sdg: 4,
    titleZh: "讓優質教育趕在輟學前到達",
    titleEn: "Quality education before learners leave school",
    questionZh: "教育援助要以贈款為主，並在學期中到達社區學校，還是可以改成貸款、把報告做成撥款凍結？",
    questionEn: "Should education assistance consist principally of grants that reach community schools during the school term, or may it take the form of loans whose reporting requirements suspend disbursement?",
    seats: six,
  },
  {
    id: "sdg4-girls",
    sdg: 4,
    titleZh: "女童中學要不要單列",
    titleEn: "A separate budget line for girls' secondary education",
    questionZh: "女童完成中學的經費要不要單列，避免被校舍工程整筆用掉？",
    questionEn: "Should financing for the completion of secondary education by girls constitute a separate budget line, so that school construction does not absorb the grant in full?",
    seats: ["kenya", "bangladesh", "germany", "usa"],
  },
  {
    id: "sdg5-care",
    sdg: 5,
    titleZh: "照護算不算公共投資",
    titleEn: "Care recognised as public investment",
    questionZh: "兒童與長者照護要不要算進公共投資，而不是當成家庭自己的事？",
    questionEn: "Should care for children and older persons be recognised as public investment, rather than treated solely as a private family responsibility?",
    seats: ["germany", "kenya", "brazil", "bangladesh"],
  },
  {
    id: "sdg5-land",
    sdg: 5,
    titleZh: "婦女的土地權",
    titleEn: "Women's land rights",
    questionZh: "農村方案要不要寫明婦女的土地權，否則補助仍只進到戶長名下？",
    questionEn: "Should rural programmes specify women's land rights, so that support does not accrue solely to the head of household?",
    seats: ["kenya", "bangladesh", "brazil", "china"],
  },
  {
    id: "sdg5-seats",
    sdg: 5,
    titleZh: "婦女的議席",
    titleEn: "Seats for women in local councils",
    questionZh: "地方議會要不要寫明婦女席次，否則性別方案只停在就業訓練？",
    questionEn: "Should local councils specify seats for women, so that gender programmes are not confined to employment training?",
    seats: ["bangladesh", "kenya", "germany", "usa"],
  },
  {
    id: "sdg6-rural",
    sdg: 6,
    titleZh: "農村供水是公共服務",
    titleEn: "Rural water supply as a public service",
    questionZh: "農村供水維持公共服務，還是改成特許經營、由水費決定誰喝得到？",
    questionEn: "Should rural water supply remain a public service, or become a concession under which charges determine access to drinking water?",
    seats: ["kenya", "bangladesh", "brazil", "germany"],
  },
  {
    id: "sdg6-city",
    sdg: 6,
    titleZh: "城市污水誰付費",
    titleEn: "Financing of urban wastewater treatment",
    questionZh: "城市污水處理的費用由用水戶、城市預算，還是出口企業一起分擔？",
    questionEn: "Should households, the municipal budget, or exporting enterprises share the cost of urban wastewater treatment?",
    seats: ["china", "germany", "usa", "brazil"],
  },
  {
    id: "sdg7-grid",
    sdg: 7,
    titleZh: "農村微電網",
    titleEn: "Rural microgrids",
    questionZh: "農村微電網用贈款建起來，還是只靠電價補貼、讓偏遠村莊繼續等？",
    questionEn: "Should rural microgrids be constructed through grants, or solely through tariff subsidies that leave remote villages without service?",
    seats: ["kenya", "bangladesh", "germany", "china"],
  },
  {
    id: "sdg7-coal",
    sdg: 7,
    titleZh: "煤電退役與技術",
    titleEn: "Retirement of coal-fired power and technology transfer",
    questionZh: "煤電退役時間表能不能用來交換可核對的技術轉移，而不是只換一句意向？",
    questionEn: "May a timetable for the retirement of coal-fired power be exchanged for verifiable technology transfer, rather than a statement of intent alone?",
    seats: ["china", "germany", "usa", "brazil"],
  },
  {
    id: "sdg7-stoves",
    sdg: 7,
    titleZh: "清潔爐灶誰先拿到",
    titleEn: "Priority in the allocation of clean cookstoves",
    questionZh: "清潔爐灶的補貼先給農村家庭，還是先給城市經銷商？",
    questionEn: "Should subsidies for clean cookstoves be directed first to rural households, or first to distributors in cities?",
    seats: ["kenya", "bangladesh", "usa", "brazil"],
  },
  {
    id: "sdg8-youth",
    sdg: 8,
    titleZh: "青年學徒名額",
    titleEn: "Apprenticeship places for young people",
    questionZh: "貿易優惠要不要綁上青年學徒名額，否則就業承諾只留在公報裡？",
    questionEn: "Should trade preferences require apprenticeship places for young people, so that commitments on employment do not remain solely in the communiqué?",
    seats: ["bangladesh", "kenya", "germany", "usa"],
  },
  {
    id: "sdg8-platform",
    sdg: 8,
    titleZh: "平台工人的保障",
    titleEn: "Minimum protection for platform workers",
    questionZh: "平台工人的最低保障由工作所在國負責，還是由平台總部所在國一起出規則？",
    questionEn: "Should the State in which the work is performed establish minimum protection for platform workers, or should the State in which the platform is headquartered also set the rules?",
    seats: ["brazil", "usa", "germany", "china"],
  },
  {
    id: "sdg9-broadband",
    sdg: 9,
    titleZh: "農村寬頻歸誰",
    titleEn: "Ownership of rural broadband",
    questionZh: "農村寬頻是公共基礎設施，還是商業特許、只鋪到付得起的城鎮？",
    questionEn: "Should rural broadband constitute public infrastructure, or a commercial concession that extends only to towns able to meet the cost?",
    seats: ["kenya", "brazil", "china", "usa"],
  },
  {
    id: "sdg9-port",
    sdg: 9,
    titleZh: "港口貸款與學校",
    titleEn: "Port loans and the education budget",
    questionZh: "港口升級的貸款會不會排擠學校預算，草案要不要寫上這條紅線？",
    questionEn: "Might a loan for the upgrading of a port displace the education budget, and should the draft resolution record that limit?",
    seats: ["bangladesh", "kenya", "germany", "china"],
  },
  {
    id: "sdg9-open",
    sdg: 9,
    titleZh: "公開研究還是專利牆",
    titleEn: "Open dissemination of publicly funded research",
    questionZh: "公共資助的研究要不要開放分享，還是可以整段鎖進專利？",
    questionEn: "Should research financed from public funds be shared openly, or may it be withheld in full under patent?",
    seats: ["germany", "china", "kenya", "usa"],
  },
  {
    id: "sdg10-remit",
    sdg: 10,
    titleZh: "匯款費用上限",
    titleEn: "A ceiling on remittance fees",
    questionZh: "跨境匯款費用要不要設上限，讓打工家庭寄回的錢少被抽走？",
    questionEn: "Should a ceiling be placed on fees for cross-border remittances, so that a smaller portion is deducted from the sums that workers remit to their households?",
    seats: ["bangladesh", "kenya", "usa", "germany"],
  },
  {
    id: "sdg10-quota",
    sdg: 10,
    titleZh: "殘障者就業配額",
    titleEn: "Employment quotas for persons with disabilities",
    questionZh: "殘障者就業配額能不能寫進跨國企業準則，而不只是鼓勵？",
    questionEn: "Should employment quotas for persons with disabilities be incorporated into the rules applicable to multinational enterprises, rather than merely encouraged?",
    seats: ["germany", "brazil", "kenya", "usa"],
  },
  {
    id: "sdg11-tenure",
    sdg: 11,
    titleZh: "非正規住區先保土地",
    titleEn: "Security of tenure before eviction",
    questionZh: "非正規住區要不要先保障土地保有，再談拆遷和重建？",
    questionEn: "Should informal settlements be assured of security of tenure before eviction and reconstruction are considered?",
    seats: ["kenya", "brazil", "bangladesh", "germany"],
  },
  {
    id: "sdg11-fare",
    sdg: 11,
    titleZh: "公車票價誰補",
    titleEn: "The subsidy for public-transport fares",
    questionZh: "公共交通票價補貼由城市自己出，還是中央預算寫明一份？",
    questionEn: "Should the municipality meet the public-transport fare subsidy alone, or should the national budget specify a defined share?",
    seats: ["china", "brazil", "germany", "usa"],
  },
  {
    id: "sdg11-flood",
    sdg: 11,
    titleZh: "洪泛區的搬遷",
    titleEn: "Relocation from floodplains",
    questionZh: "洪泛區搬遷要不要先提供可負擔住房，再要求居民離開？",
    questionEn: "Should relocation from floodplains provide affordable housing before residents are required to depart?",
    seats: ["bangladesh", "china", "germany", "usa"],
  },
  {
    id: "sdg12-plastic",
    sdg: 12,
    titleZh: "塑膠包裝追到出口國",
    titleEn: "Responsibility for plastic packaging extended to the exporting State",
    questionZh: "塑膠包裝的回收責任要不要延伸到出口國，而不只留在進口港？",
    questionEn: "Should responsibility for the recovery of plastic packaging extend to the exporting State, rather than remain solely at the port of import?",
    seats: ["germany", "china", "usa", "brazil"],
  },
  {
    id: "sdg12-waste",
    sdg: 12,
    titleZh: "食物浪費要不要綁住",
    titleEn: "A binding target for the reduction of food waste",
    questionZh: "減少食物浪費的公開目標要不要具約束力，否則每年只換一句承諾？",
    questionEn: "Should the published target for the reduction of food waste be binding, or should each year renew only a political commitment?",
    seats: ["usa", "germany", "brazil", "china", "kenya"],
  },
  {
    id: "sdg13-adapt",
    sdg: 13,
    titleZh: "適應資金下一季到達",
    titleEn: "Disbursement of adaptation finance in the coming season",
    questionZh: "氣候適應資金能不能在下一季到達社區，同時公開錢去了哪裡？",
    questionEn: "Should climate adaptation finance reach communities in the coming season, with public disclosure of the destination of the funds?",
    seats: six,
  },
  {
    id: "sdg13-loss",
    sdg: 13,
    titleZh: "損失與損害不要用貸款",
    titleEn: "Loss and damage exclusive of loans",
    questionZh: "損失與損害的窗口要不要排除貸款，避免災後重建再變成債務？",
    questionEn: "Should the window for loss and damage exclude loans, so that reconstruction after a disaster does not give rise to new debt?",
    seats: ["bangladesh", "kenya", "germany", "china"],
  },
  {
    id: "sdg13-warn",
    sdg: 13,
    titleZh: "預警要在村里響",
    titleEn: "Climate warnings at the village level",
    questionZh: "氣候預警要不要寫到村一級，否則只在首都的氣象台響？",
    questionEn: "Should climate warnings be specified down to the village level, or may they remain confined to the meteorological service in the capital?",
    seats: ["bangladesh", "kenya", "usa", "germany"],
  },
  {
    id: "sdg14-fish",
    sdg: 14,
    titleZh: "禁漁補貼給誰",
    titleEn: "Recipients of payments for fishing closures",
    questionZh: "近海禁漁的補貼給小規模漁民，還是也補到遠洋船隊？",
    questionEn: "Should payments for inshore fishing closures be made to small-scale fishers, or extended also to distant-water fleets?",
    seats: ["bangladesh", "kenya", "china", "usa"],
  },
  {
    id: "sdg14-port",
    sdg: 14,
    titleZh: "港口檢查誰付費",
    titleEn: "Financing of port inspections",
    questionZh: "擋住塑膠入海的港口檢查，由船旗國、港口國，還是貨主付費？",
    questionEn: "Should the flag State, the port State, or the owner of the cargo finance the port inspections intended to prevent plastic from entering the sea?",
    seats: ["china", "germany", "brazil", "usa"],
  },
  {
    id: "sdg15-forest",
    sdg: 15,
    titleZh: "社區林地先於碳匯",
    titleEn: "Community forest rights prior to carbon contracts",
    questionZh: "社區林地權要不要先寫明，再簽碳匯合約，避免森林被人代簽？",
    questionEn: "Should community forest rights be recorded before carbon contracts are concluded, so that a forest is not committed on behalf of the people who reside there?",
    seats: ["brazil", "kenya", "germany", "china"],
  },
  {
    id: "sdg15-seed",
    sdg: 15,
    titleZh: "抗旱種子與專利",
    titleEn: "Patents on drought-resistant seed",
    questionZh: "抗旱種子的專利會不會擋住公共種子庫，草案要不要留一條公共使用？",
    questionEn: "Might patents on drought-resistant seed impede public seed banks, and should the draft resolution retain a provision for public use?",
    seats: ["kenya", "brazil", "usa", "germany"],
  },
  {
    id: "sdg15-corridor",
    sdg: 15,
    titleZh: "野生動物廊道",
    titleEn: "Wildlife corridors",
    questionZh: "跨境野生動物廊道要不要寫進土地規劃，避免公路把棲地切成孤島？",
    questionEn: "Should cross-border wildlife corridors be incorporated into land-use plans, so that roads do not divide habitat into isolated areas?",
    seats: ["kenya", "brazil", "china", "usa"],
  },
  {
    id: "sdg16-protect",
    sdg: 16,
    titleZh: "學校和診所受保護",
    titleEn: "Protection of schools and clinics",
    questionZh: "衝突中的學校和診所算不算受保護目標，人道通道要不要寫死？",
    questionEn: "Should schools and clinics in situations of conflict be recognised as protected, and should the humanitarian corridor be established as a fixed rule?",
    seats: ["kenya", "bangladesh", "germany", "usa"],
  },
  {
    id: "sdg16-justice",
    sdg: 16,
    titleZh: "司法援助獨立預算",
    titleEn: "A separate budget for legal aid",
    questionZh: "司法援助的預算要不要獨立於安全部門，避免法庭經費被裝備花掉？",
    questionEn: "Should the budget for legal aid be kept separate from the security sector, so that funds for access to the courts are not expended on equipment?",
    seats: ["brazil", "kenya", "germany", "usa"],
  },
  {
    id: "sdg17-data",
    sdg: 17,
    titleZh: "撥款當季公開數據",
    titleEn: "Publication of assistance data in the season of disbursement",
    questionZh: "援助數據要不要在撥款的同一季公開，讓公眾核對得到？",
    questionEn: "Should data on assistance be published in the same season as disbursement, so that the public may verify them?",
    seats: ["germany", "kenya", "usa", "china", "bangladesh"],
  },
  {
    id: "sdg17-south",
    sdg: 17,
    titleZh: "南南合作不是替代",
    titleEn: "South-South cooperation as a complement",
    questionZh: "南南合作可以寫進草案當補充，還是可以拿來替代已承諾的公共資金？",
    questionEn: "May South-South cooperation be included in the draft resolution as a complement, or may it replace public finance already pledged?",
    seats: ["china", "brazil", "kenya", "germany", "usa"],
  },
  {
    id: "sdg17-tech",
    sdg: 17,
    titleZh: "技術轉移的條款",
    titleEn: "Terms of technology transfer",
    questionZh: "技術轉移要不要寫明可負擔的授權條款，而不只交換訪問團？",
    questionEn: "Should technology transfer specify affordable terms of licensing, rather than consist solely of exchanges of visiting delegations?",
    seats: ["china", "germany", "bangladesh", "kenya"],
  },
];

export function sdgGoal(n: number): SdgGoal {
  return SDGS.find((item) => item.n === n) ?? SDGS[0]!;
}

export function casesForSdg(n: number): TrainingCase[] {
  return CASES.filter((item) => item.sdg === n);
}

export function findCase(id: string | null | undefined): TrainingCase | null {
  if (!id) return null;
  return CASES.find((item) => item.id === id) ?? null;
}

/** Countries the player may represent for this case. With no case yet, every seat is available. */
export function seatsForCase(id: string | null | undefined): CountryId[] {
  const training = findCase(id);
  return training ? [...training.seats] : [...ALL_SEATS];
}
