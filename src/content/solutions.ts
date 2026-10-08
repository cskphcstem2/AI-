import type { OfficialLang } from "@/i18n/languages";
import type { CountryId } from "@/types/game";

type Band = "close" | "far" | "redline";

const LINES: Record<CountryId, Record<Band, { zh: string; en: string }>> = {
  bangladesh: {
    close: {
      zh: "這句靠近我們的立場：贈款、債務或社區進門有被寫到。請把這句留在草案裡。",
      en: "This is close to our position: grants, debt, or a community door is actually written. Keep this sentence in the draft.",
    },
    far: {
      zh: "這句還沒靠近我們的立場。我們在等贈款，以及社區進不進得了門。",
      en: "This is not close to our position yet. We are waiting for the grant, and for whether communities can get in the door.",
    },
    redline: {
      zh: "這句碰到我們的紅線。私人資本優先、新的貸款，或撥款前凍結，我們不會跟著走。",
      en: "This crosses our red line. Private capital first, a new loan, or a freeze before disbursement is not something we will follow.",
    },
  },
  brazil: {
    close: {
      zh: "這句靠近我們的立場：全納教育、輟學預警或治理席位有被寫到。",
      en: "This is close to our position: inclusive education, dropout early warning, or a governance seat is written.",
    },
    far: {
      zh: "這句還沒靠近我們的立場。校舍之外，母語和障礙學習者算不算，還沒看到。",
      en: "This is not close to our position yet. Beyond school buildings, we still do not see mother-tongue or disability support.",
    },
    redline: {
      zh: "這句碰到我們的紅線。資格若只剩硬體、沒有全納教育，巴西不簽。",
      en: "This crosses our red line. If eligibility is only hardware and inclusive education is gone, Brazil will not sign.",
    },
  },
  germany: {
    close: {
      zh: "這句靠近我們的立場：學習成果可以被核對。請確認報告不會變成凍結撥款的前置條件。",
      en: "This is close to our position: learning results can be checked. Make sure the report does not become a precondition that freezes disbursement.",
    },
    far: {
      zh: "這句還沒靠近我們的立場。我們還沒看到可核對的成果或報告。",
      en: "This is not close to our position yet. We still do not see results or a report that can be checked.",
    },
    redline: {
      zh: "這句碰到我們的紅線。沒有報告的速度，德國不接受。",
      en: "This crosses our red line. Speed with no report is not something Germany accepts.",
    },
  },
  china: {
    close: {
      zh: "這句靠近我們的立場：公共資金或贈款還在，沒有把新興經濟體寫成相同的強制出資方。",
      en: "This is close to our position: public finance or grants remain, and emerging economies are not written in as the same mandatory contributors.",
    },
    far: {
      zh: "這句還沒靠近我們的立場。公共資金義務和誰出資，還沒說清。",
      en: "This is not close to our position yet. Public-finance duties, and who pays, are still unclear.",
    },
    redline: {
      zh: "這句碰到我們的紅線。新興經濟體被寫進相同的強制分攤，我們不接受。",
      en: "This crosses our red line. We do not accept emerging economies being written into the same mandatory burden-share.",
    },
  },
  usa: {
    close: {
      zh: "這句靠近我們的立場：自願窗口或教育科技有一個位置，而且不是新的強制分攤。",
      en: "This is close to our position: a voluntary window or education technology has a place, and it is not a new mandatory burden-share.",
    },
    far: {
      zh: "這句還沒靠近我們的立場。私人資本或自願窗口放在哪，還沒看到。",
      en: "This is not close to our position yet. We still do not see where private capital or a voluntary window sits.",
    },
    redline: {
      zh: "這句碰到我們的紅線。新的強制分攤，美國不接受。",
      en: "This crosses our red line. A new mandatory burden-share is not something the United States accepts.",
    },
  },
  kenya: {
    close: {
      zh: "這句靠近我們的立場：贈款、債務或社區進門有被寫到。請把這句留在草案裡。",
      en: "This is close to our position: grants, debt, or a community door is actually written. Keep this sentence in the draft.",
    },
    far: {
      zh: "這句還沒靠近我們的立場。我們在等贈款，以及農村學校和女童進不進得了門。",
      en: "This is not close to our position yet. We are waiting for the grant, and for whether rural schools and girls can get in the door.",
    },
    redline: {
      zh: "這句碰到我們的紅線。私人資本優先、新的貸款，或撥款前凍結，我們不會跟著走。",
      en: "This crosses our red line. Private capital first, a new loan, or a freeze before disbursement is not something we will follow.",
    },
  },
};

const BOOST = {
  zh: "附上的論據對得上我們在聽的方向，這只是額外說服，方案仍是你寫的那句。",
  en: "The attached evidence point matches what we are listening for. That is only extra persuasion. The proposal is still the sentence you wrote.",
};

export function closenessReply(id: CountryId, band: Band, boosted: boolean, lang: OfficialLang): string {
  const row = LINES[id][band];
  const base = lang === "zh" ? row.zh : row.en;
  if (!boosted || band === "redline") return base;
  return `${base} ${lang === "zh" ? BOOST.zh : BOOST.en}`;
}
