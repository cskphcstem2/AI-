import type { PhraseRow } from "@/i18n/phraseRows";

function row(zh: string, en: string): PhraseRow {
  return [zh, en, en, en, en, en];
}

export const SEAT_ROWS: PhraseRow[] = [
  row("先選你要代表的國家。點一張席位卡，再入席。", "Choose the country you will represent. Tap a seat card, then take your place."),
  row(
    "可持續發展委員會，簡化議程。對應 SDG 4 優質教育，以及 SDG 17 夥伴關係。",
    "Commission on Sustainable Development, simplified agenda. It tracks SDG 4 on quality education and SDG 17 on partnerships.",
  ),
  row(
    "可持續發展委員會，簡化議程。對應 SDG 4 優質教育，以及 SDG 17 夥伴關係。你的席位是肯尼亞。",
    "Commission on Sustainable Development, simplified agenda. It tracks SDG 4 on quality education and SDG 17 on partnerships. Your seat is Kenya.",
  ),
  row("同一筆教育援助，五個席位在乎的後果不一樣。", "The same education aid has different consequences for the five seats."),
  row("本席本輪不再回應。", "This seat does not reply further this round."),
  row(
    "讀者還看不出肯尼亞在乎什麼。試著點出社區、債務、輟學預警，或贈款。",
    "A reader still cannot tell what Kenya cares about. Try naming communities, debt, dropout early warning, or grants.",
  ),
  row(
    "讀者還看不出這一席在乎什麼。試著點出這一國的名字、利益，或紅線。",
    "A reader still cannot tell what this seat cares about. Name the country, an interest, or a red line.",
  ),
  row("你的核心主張留在最終文本裡。", "Your core claim is still in the final text."),
  row("最終文本沒有守住這一席的紅線。先對照你接受了哪項修正。", "The final text does not keep this seat's red line. Check which amendment you accepted."),
  row(
    "草案踩到肯尼亞的紅線：資金若變成貸款、私人資本優先，或在撥款前凍結，他們不會連署。",
    "The draft crosses Kenya's red line. If the money becomes loans, private capital comes first, or disbursement is frozen beforehand, they will not cosponsor.",
  ),
  row(
    "資格若只剩校舍硬體、沒有全納教育，巴西不會連署。",
    "If eligibility is only school-building hardware with no inclusive education, Brazil will not cosponsor.",
  ),
  row("巴西還沒有在草案裡看到全納教育或母語教學。", "Brazil still does not see inclusive education or mother-tongue instruction in the draft."),
  row(
    "嚴謹難度要求你點出機制：贈款、報告、社區、程序、自願窗口、全納教育，或其他具體安排。只有態度詞，指證不成立。",
    "At the rigorous level you must name a mechanism: grants, reports, communities, procedure, a voluntary window, inclusive education, or another concrete arrangement. Attitude words alone do not make the challenge land.",
  ),
  row(
    "先點名這一席：用「肯尼亞代表團」說出贈款、社區或輟學預警，不要只說「這很重要」。",
    "Name this seat first: use 'the Kenyan delegation' and say grants, communities, or dropout early warning. Do not only say 'this matters'.",
  ),
  row(
    "補一個具體做法，例如贈款窗口、社區申請，或學期中的輟學預警。",
    "Add one concrete step, for example a grant window, a community application, or dropout early warning during the term.",
  ),
  row(
    "再重複你自己的句子，這一席不會因此改口。",
    "Repeating your own sentence will not make this seat change its mind.",
  ),
  row("肯尼亞立場摘要", "Kenya position summary"),
  row(
    "私人資本若變成主體，贈款就只是裝飾，風險會回到債務裡。肯尼亞不會把名字放上去。",
    "If private capital becomes the main instrument, the grant is decoration and the risk goes back into debt. Kenya will not put its name on that.",
  ),
  row(
    "只用你自己的主張當證據，說服力不夠。請指向債務、社區或預警的一則資料。",
    "Using only your own claim as evidence is not persuasive enough. Point to one piece of material on debt, communities, or warning.",
  ),
  row("只重複你自己的句子，肯尼亞的門不會因此打開。", "Repeating only your own sentence will not open Kenya's door."),
  row("社區的門快關上", "The community door is about to close"),
  row("語音發言", "Speak aloud"),
  row("打字寫開場", "Type the opening"),
  row("開場主張", "Opening claim"),
  row("用打字送出開場", "Send the opening in writing"),
  row("字起計", "characters minimum"),
  row(
    "寫出你代表這一席的基本看法、理由，以及你希望會議做出什麼決定。",
    "Write this seat's basic view, a reason, and the decision you want the meeting to make.",
  ),
  row(
    "打字開場已記入。接下來請聽五席代表。秘書處整理後，你的主張會收成論據。",
    "The typed opening is entered. Next, listen to the five seats. After the secretariat summarises, your claim becomes an evidence point.",
  ),
];
