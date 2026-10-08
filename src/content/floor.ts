import { FOCUS_QUESTIONS } from "@/content/moderated";
import type { AiDelegateId, FloorState } from "@/types/game";

export interface FloorScript {
  round: 1 | 2 | 3;
  promptZh: string;
  promptEn: string;
  guideZh: string;
  guideEn: string;
  tags: string[];
  openerId: AiDelegateId;
  opener: string;
  reactorId: AiDelegateId;
  openerRebutZh: string;
  openerRebutEn: string;
  openerSupportZh: string;
  openerSupportEn: string;
  openerMissZh: string;
  openerMissEn: string;
  reactorCloseZh: string;
  reactorCloseEn: string;
  reactorFarZh: string;
  reactorFarEn: string;
  reactorConflictZh: string;
  reactorConflictEn: string;
}

const finance = FOCUS_QUESTIONS[0];
const access = FOCUS_QUESTIONS[1];
const scope = FOCUS_QUESTIONS[2];

export const FLOOR_ROUNDS: FloorScript[] = [
  {
    round: 1,
    promptZh: finance?.prompt ?? "",
    promptEn: "In what form should education finance reach countries where learning opportunities are fragile?",
    guideZh: "先聽美國。輪到你時，寫進一步想法。若要反駁或支持，再選論據；論據不能代替你要說的話。",
    guideEn: "Listen to the United States first. On your turn, write a further idea. Attach an evidence point only if you want to support or rebut. The bullet cannot replace what you say.",
    tags: finance?.tags ?? [],
    openerId: "usa",
    opener: finance?.remarks[0]?.text ?? "",
    reactorId: "bangladesh",
    openerRebutZh: "你抓住了贈款不該被私人資本蓋過。我們仍要私人資本寫在正文。若它是自願窗口、不取代公共贈款，美國可以繼續談。",
    openerRebutEn: "You caught that grants should not be buried under private capital. We still want private capital in the operative text. If it is a voluntary window and does not replace public grants, the United States can keep talking.",
    openerSupportZh: "你站到私人資本這一邊。請在草案裡寫明它不是註腳，而是正文的一部分。",
    openerSupportEn: "You stood with private capital. Write into the draft that it is part of the operative text, not a footnote.",
    openerMissZh: "我聽到你想反駁或支持，但理由還沒接上論據。先把轉折或因果說清楚，我才會改口。",
    openerMissEn: "I hear that you want to rebut or support, but the reason is not tied to the evidence point yet. Make the contrast or the cause clear before I move.",
    reactorCloseZh: "你的想法碰到贈款或債務。這比較靠近孟加拉要守的那一句。下一步請說社區什麼時候進得了門。",
    reactorCloseEn: "Your idea touches grants or debt. That is closer to the sentence Bangladesh is protecting. Next, say when communities can actually get in the door.",
    reactorFarZh: "這句還沒碰到錢的形式。美國在談私人資本，我們在等你說贈款還在不在。",
    reactorFarEn: "This sentence does not yet touch the form of the money. The United States is talking about private capital. We are waiting to hear whether the grant is still there.",
    reactorConflictZh: "若私人資本或貸款變成主體，這碰到我們的紅線。贈款要留在第一句。",
    reactorConflictEn: "If private capital or loans become the main instrument, that crosses our red line. The grant has to stay in the first sentence.",
  },
  {
    round: 2,
    promptZh: access?.prompt ?? "",
    promptEn: "How can applications move faster without leaving funders unable to see that the money is used for quality education?",
    guideZh: "德國要報告，孟加拉怕報告變成關卡。輪到你時寫進一步想法，論據仍然只是加分。",
    guideEn: "Germany wants a report. Bangladesh fears the report becomes a gate. On your turn, write a further idea. An evidence point is still only a bonus.",
    tags: access?.tags ?? [],
    openerId: "germany",
    opener: access?.remarks[0]?.text ?? "",
    reactorId: "bangladesh",
    openerRebutZh: "你說報告不該變成關卡。我們可以接受更短的摘要。我們不能接受把學習成果從文本裡刪掉。",
    openerRebutEn: "You said the report should not become a gate. We can accept a shorter summary. We cannot accept deleting learning results from the text.",
    openerSupportZh: "你支持保留成果摘要。請同時寫上它不得凍結撥款，否則速度和問責會打成兩截。",
    openerSupportEn: "You supported keeping a results summary. Also write that it must not freeze disbursement, or speed and accountability split apart.",
    openerMissZh: "這次指證的結構還沒成立。我聽到了態度，還沒聽到報告和撥款是什麼關係。",
    openerMissEn: "This challenge is not structurally sound yet. I heard a stance. I did not hear how the report relates to disbursement.",
    reactorCloseZh: "摘要可以有。你這句靠近我們：報告不能讓學年空等。請寫成社區進得去的門。",
    reactorCloseEn: "A summary can exist. This is close to us: the report cannot make communities wait out a school year. Write it as a door communities can enter.",
    reactorFarZh: "這句還沒說申請門開在哪。報告和社區是兩件事，我們兩件都要聽到。",
    reactorFarEn: "This sentence does not say where the application door opens. The report and the community are two things. We need to hear both.",
    reactorConflictZh: "若撥款前要先審計或凍結，社區會再錯過一個學年。這是我們退不了的線。",
    reactorConflictEn: "If an audit or a freeze comes before disbursement, communities miss another school year. That is a line we cannot cross.",
  },
  {
    round: 3,
    promptZh: scope?.prompt ?? "",
    promptEn: "Should dropout early warning and inclusive or mother-tongue education be eligible for the money?",
    guideZh: "巴西守住全納教育。輪到你時寫進一步想法。說完這輪，才進入非監管式議會。",
    guideEn: "Brazil is protecting inclusive education. On your turn, write a further idea. After this round, the unmoderated caucus opens.",
    tags: scope?.tags ?? [],
    openerId: "brazil",
    opener: scope?.remarks[0]?.text ?? "",
    reactorId: "usa",
    openerRebutZh: "你質疑資格寫得太窄。全納、母語和預警若被拿掉，巴西不會簽。治理席位也請留給脆弱社區。",
    openerRebutEn: "You questioned a narrow eligibility list. If inclusion, mother-tongue instruction, and early warning are removed, Brazil will not sign. Keep a governance seat for fragile communities.",
    openerSupportZh: "你支持把全納教育寫進資格。請別讓它只剩一句口號，校舍之外要有母語和障礙學習者支持。",
    openerSupportEn: "You supported writing inclusive education into eligibility. Do not leave it as a slogan. Beyond school buildings, mother-tongue and disability support have to count.",
    openerMissZh: "指證還沒成立。請用論據指出資格漏了什麼，不要只說你不同意。",
    openerMissEn: "The challenge does not land yet. Use an evidence point to show what eligibility misses. Disagreement alone is not enough.",
    reactorCloseZh: "全納教育可以留。若同時有自願性的私人窗口，而且不取代公共資金，這比較靠近我們能接受的寫法。",
    reactorCloseEn: "Inclusive education can stay. If there is also a voluntary private window, and it does not replace public finance, that is closer to a text we can accept.",
    reactorFarZh: "這句還沒說私人資本和自願窗口放在哪。我們不會只為了全納改口。",
    reactorFarEn: "This sentence does not say where private capital and a voluntary window sit. We will not move only because of inclusion.",
    reactorConflictZh: "若資格只剩硬體、把全納拿掉，那不是我們要爭的句子。但把新的強制分攤寫進來，會碰到美國的紅線。",
    reactorConflictEn: "If eligibility is only hardware and inclusion is removed, that is not the sentence we are fighting for. Writing in a new mandatory burden-share would cross a United States red line.",
  },
];

export function floorScript(round: 1 | 2 | 3): FloorScript {
  return FLOOR_ROUNDS[round - 1] ?? FLOOR_ROUNDS[0]!;
}

export function emptyFloor(): FloorState {
  return { round: 1, beat: "listen", lines: [], harvested: false };
}

export function loc(lang: string, zh: string, en: string): string {
  return lang === "zh" ? zh : en;
}
