import { INITIAL_AFFINITY, PROPOSALS } from "@/content/caucus";
import { ALL_SEATS } from "@/content/seats";
import type { AiDelegateId, CaucusAction, CaucusRecord, ChatTurn, CountryId, DelegateThread } from "@/types/game";

export const DELEGATE_ORDER: AiDelegateId[] = ["bangladesh", "brazil", "germany", "china", "usa"];

interface MoodWords {
  high: string;
  warm: string;
  watch: string;
  low: string;
}

interface Voice {
  aim: string;
  greeting: string;
  redline: readonly [string, string];
  condition: readonly [string, string];
  proposals: Record<string, readonly [string, string]>;
  persuadeHit: readonly [string, string];
  persuadeMiss: readonly [string, string];
  echo: readonly [string, string];
  selfPitch: readonly [string, string];
  moods: MoodWords;
}

export const VOICES: Record<CountryId, Voice> = {
  bangladesh: {
    aim: "學年開始前，贈款要進到社區，不能再記成新債。",
    greeting: "學年不等人。你要問的如果是錢的形式，我們可以直接說。",
    redline: [
      "我們退不了的是債務。贈款要寫在窗口的第一句，不是放在註腳。報告可以有，但學年不能在表格裡空等。",
      "這條剛才說過：新的貸款我們不簽。若還要聽，聽的是時間——社區要在這一學期進得了門。",
    ],
    condition: [
      "連署要看到兩樣具體的東西：贈款優先，以及地方和青年在九十日內有回音。你先告訴我申請門開在哪一條。",
      "條件沒有變成氣氛。門還是那兩扇：錢的形式，和社區進不進得去。",
    ],
    proposals: {
      "grant-report": [
        "贈款為主、摘要不凍結撥款，這句我們能跟著走。請別把社區通道留到以後再寫。",
        "這個方向你提過。我們仍站在贈款這邊。下一句要寫的是誰可以申請。",
      ],
      "private-first": [
        "私人資本若變成主體，贈款就只是裝飾，風險會回到債務裡。孟加拉不會把名字放上去。",
        "再講一次也一樣：主體若是私人資本，我們的名字不在這份文本上。",
      ],
      "community-access": [
        "九十日回覆、地方進得去，這是我們要的那扇門。輟學預警要算在裡面，不是另案。",
        "門的形狀你已經聽到了。把它寫成條款，比在走廊裡再問一次有用。",
      ],
    },
    persuadeHit: [
      "這則資料碰到贈款、債務、社區或預警。我們聽得見。請把它放進條款，不要停在這句話。",
      "資料對得上。我們要的不是再聽一遍，而是草案裡看得到社區進門的那一句。",
    ],
    persuadeMiss: [
      "這則沒有碰到債務，也沒有碰到社區進不進得了門。換一則，或直接說申請門開在哪。",
      "還是沒有回答：錢會不會變成新債。在這點說清之前，我們不改口。",
    ],
    echo: [
      "這是我們自己的開場。我們記得。請說你準備寫進草案的那一句，不要再念回來。",
      "原話你已經還給我們了。下一句該是條款。",
    ],
    selfPitch: [
      "肯尼亞的主張我們很熟。若要我們靠近，請指向債務、社區或預警的一則資料。",
      "只重複肯尼亞的句子，孟加拉的門不會因此打開。",
    ],
    moods: {
      high: "趕得上學年",
      warm: "還聽得進贈款",
      watch: "擔心又變債務",
      low: "申請門快關上",
    },
  },
  brazil: {
    aim: "全納教室、母語教學和脆弱社區的治理席位，要寫進資格，不能只剩校舍。",
    greeting: "先把資格攤開。校舍之外，母語算不算，我們想先聽你怎麼寫。",
    redline: [
      "我們的紅線是資格。校舍可以留，全納和母語不能在表格裡消失。全納教育若被排除，巴西不簽。",
      "你問過這條。再講短一點：沒有母語和障礙學習者支持的教育，對我們不是完整的優質教育。",
    ],
    condition: [
      "給脆弱社區一個清楚的治理席位，並讓全納教育合格，我們可以支持。只談融資工具、不談資格，巴西仍會猶豫。",
      "條件還是那兩句：資格寫不寫全納，席位給不給脆弱社區。",
    ],
    proposals: {
      "grant-report": [
        "贈款和報告我們不反對。請在資格裡補上全納教育，否則這份合作還不完整。",
        "方向可以。下一句請寫母語或障礙學習者支持。",
      ],
      "private-first": [
        "私人資本優先通常偏向可收費的技能產品。全納支持會更邊緣。這個方向我們往後退。",
        "再講一次：主體若是私人資本，全納很容易從表格裡消失。",
      ],
      "community-access": [
        "社區進得了門，和在地的全納教室是同方向的。若草案同時寫上全納教育，巴西會認真考慮連署。",
        "門你已經聽到了。請把全納寫成資格，不要只寫通道。",
      ],
    },
    persuadeHit: [
      "你點到了全納、治理或社區。巴西在乎的就是資格和席位，而不只是金額。",
      "資料對得上。請把它寫進條款。",
    ],
    persuadeMiss: [
      "這則還沒有回答：母語和障礙學習者算不算優質教育。沒有這句，我們很難簽名。",
      "還是沒有碰到資格。我們先不改口。",
    ],
    echo: [
      "這句是我們說的。謝你記得。連署要看它有沒有變成條款。",
      "原話收到。下一句該是資格條款。",
    ],
    selfPitch: [
      "請不要只用肯尼亞的句子來說服巴西。我們要看到全納教育或治理席位。",
      "肯尼亞的社區很重要。巴西要的是另一句：全納教育有沒有資格。",
    ],
    moods: {
      high: "全納寫得進資格",
      warm: "還在聽母語",
      watch: "怕只剩校舍",
      low: "資格門快關上",
    },
  },
  germany: {
    aim: "公共教育援助要可預測，年度成果要能核對，問責不能做成撥款前的凍結。",
    greeting: "先把報告放在哪一句說清楚。金額可以後談。",
    redline: [
      "我們的紅線不是反對錢，而是反對沒有報告的錢。年度公開學習成果可以很短。我們不堅持在撥款前做完全面審計。",
      "這條說過：沒有報告的承諾我們聽不見。全面審計也不該變成凍結撥款的前置關卡。",
    ],
    condition: [
      "合作條件有兩條：對得上教育計畫，以及成果可被公眾核對。速度可以談。你先告訴我報告會放在哪一句。",
      "條件沒有變。報告和速度要同時寫，不要逼我們二選一。",
    ],
    proposals: {
      "grant-report": [
        "贈款窗口加上同步報告，和我們的條件同向。我們仍要看最終文本有沒有把摘要寫進去。",
        "這個方向你提過。摘要仍要出現在條款裡。",
      ],
      "private-first": [
        "私人資本可以是補充窗口。把它寫成主體，公共資金的問責反而更不清楚。我們不會因此明顯靠近。",
        "再講一次：主體若是私人資本，問責句會更模糊。",
      ],
      "community-access": [
        "社區通道可以接受。請記得：更短的表格，仍然需要每年的學習成果摘要。",
        "門可以開。摘要不能刪。",
      ],
    },
    persuadeHit: [
      "你這則資料碰到了我們在乎的問責或程序。它還不是草案文字，但可以成為德國不反對的理由。",
      "資料對得上。請寫成可核對的摘要。",
    ],
    persuadeMiss: [
      "這則材料沒有回答報告要不要寫、由誰核對。換一則，或先說明它和問責的關係。合作意願不變。",
      "還是沒有碰到報告。我們先停在原地。",
    ],
    echo: [
      "這是我們自己的話。複述證明你有在聽，還沒有證明草案會採納。寫成條款，再來談連署。",
      "原話收到。下一句該是條款。",
    ],
    selfPitch: [
      "只用肯尼亞自己的主張當證據，說服力不夠。指出一項我們在乎、而且可以核對的資料。",
      "肯尼亞的句子說明了誰受害。德國還需要一項可核對的程序。",
    ],
    moods: {
      high: "報告與速度都在",
      warm: "還聽得進摘要",
      watch: "怕只剩速度",
      low: "問責句快不見",
    },
  },
  china: {
    aim: "發達國家的公共教育援助要留在原則裡；南南合作只是補充，不能替代。",
    greeting: "先談原則。補充方案可以後寫，原則不要先被換掉。",
    redline: [
      "請不要把新興經濟體寫成與發達國家相同的強制出資方。南南合作可以寫，但要標成補充。",
      "這條說過：相同的強制分攤我們不簽。南南合作是補充，不是替代。",
    ],
    condition: [
      "寫清公共教育援助的既有原則，我們可以考慮。透明度可以談。用南南合作換掉發達國家的承諾，我們不會簽。",
      "條件沒有變：公共承諾先在，補充方案後寫。",
    ],
    proposals: {
      "grant-report": [
        "以公共贈款為主，並附上可核對的摘要，沒有改寫責任原則。這個方向和中方的底線相容。",
        "方向可以。原則句仍要留在文本裡。",
      ],
      "private-first": [
        "私人資本優先很容易被讀成公共承諾可以退下。我們不接受這種替換。合作意願下降。",
        "再講一次：私人資本不能換掉公共承諾。",
      ],
      "community-access": [
        "讓資金到達發展中國家的社區學校，我們支持。請同時保留公共資金的原則，不要只寫程序。",
        "通道可以談。原則不能只剩程序。",
      ],
    },
    persuadeHit: [
      "你這則資料碰到公共資金或共同但有區別的責任。可以作為草案裡的原則句。",
      "資料對得上。請寫成「補充不能替代」。",
    ],
    persuadeMiss: [
      "這則還沒有回答責任如何區別。沒有這一句，我們不會因為氣氛好就簽名。",
      "還是沒有碰到原則。我們先不改口。",
    ],
    echo: [
      "原則我們已經說過。請把它寫成「補充不能替代」，而不是再複述一次。",
      "原話收到。下一句該是原則條款。",
    ],
    selfPitch: [
      "請用公約原則或公共資金的資料來說，不要只重複肯尼亞的利益。",
      "肯尼亞的社區需求，不能代替責任如何區別。",
    ],
    moods: {
      high: "原則還在原位",
      warm: "還聽得進補充",
      watch: "怕被換掉承諾",
      low: "強制分攤就退",
    },
  },
  usa: {
    aim: "自願窗口和教育科技要有位置，學習成果要可衡量，不要新的強制分攤。",
    greeting: "先說自願性。強制分攤這條，我們不會打開。",
    redline: [
      "我們不會接受新的強制分攤公式。自願、可衡量、透明，這三個詞同時在，美國才繼續聽。",
      "這條說過：強制分攤免談。自願窗口還在不在，才是我們要聽的。",
    ],
    condition: [
      "保留自願性的公私窗口，並證明項目提高了什麼學習成果，我們可以不反對。公共贈款可以是一個窗口，不要把它寫成自動攤派。",
      "條件沒有變：自願、可衡量、透明。",
    ],
    proposals: {
      "grant-report": [
        "贈款加報告，透明度是好的。若整個文件只剩贈款、沒有自願窗口，美國傾向棄權，而不是連署。",
        "透明度收到。自願窗口還要寫進去。",
      ],
      "private-first": [
        "把私人資本寫成主體，符合我們的優先。但你要知道：前線國家會把這句讀成贈款被拿掉。",
        "這個方向你提過。合作意願可以上升，不代表對前線席位安全。",
      ],
      "community-access": [
        "社區通道可以討論。請加上可衡量的學習成果。單是開門，還不足以讓我們簽名。",
        "門可以談。可衡量的成果句還缺。",
      ],
    },
    persuadeHit: [
      "這則碰到自願、教育科技或問責。美國可以把它當成不反對的理由。強制分攤仍然免談。",
      "資料對得上。請保留自願性。",
    ],
    persuadeMiss: [
      "這則沒有說明私人資本或自願窗口放在哪裡。我們先不調整合作意願。",
      "仍看不到可衡量的那個窗口。美國這席先停在原地。",
    ],
    echo: [
      "你引用了我們的話。接下來要看草案是否保留自願性。",
      "原話收到。自願性要出現在條款裡，不是只出現在你的複述。",
    ],
    selfPitch: [
      "肯尼亞的主張本身不是美國的決策依據。請指向自願性、教育科技，或可核對的學習成果。",
      "再講肯尼亞的利益，不會變成美國的窗口。請換一則對得上自願或可衡量的資料。",
    ],
    moods: {
      high: "自願窗口留著",
      warm: "還在量成果",
      watch: "先不要談分攤",
      low: "看到強制就退",
    },
  },
  kenya: {
    aim: "贈款要在學期中到達農村學校和女童，不能記成新債。",
    greeting: "學期不等人。你要問的如果是錢的形式，我們可以直接說。",
    redline: [
      "我們退不了的是債務。贈款要寫在窗口的第一句。報告可以有，但農村學校不能在表格裡空等下一個學年。",
      "這條剛才說過：把基礎教育援助全盤改成貸款，我們不簽。若還要聽，聽的是輟學預警什麼時候到社區。",
    ],
    condition: [
      "連署要看到兩樣具體的東西：贈款優先，以及地方和青年在學期中用得上輟學預警。你先告訴我申請門開在哪一條。",
      "條件沒有變成氣氛。門還是那兩扇：錢的形式，和社區進不進得去。",
    ],
    proposals: {
      "grant-report": [
        "贈款為主、摘要不凍結撥款，這句我們能跟著走。請別把社區通道留到以後再寫。",
        "這個方向你提過。我們仍站在贈款這邊。下一句要寫的是誰可以申請。",
      ],
      "private-first": [
        "私人資本若變成主體，贈款就只是裝飾，風險會回到債務裡。肯尼亞不會把名字放上去。",
        "再講一次也一樣：主體若是私人資本，我們的名字不在這份文本上。",
      ],
      "community-access": [
        "地方進得去，輟學預警算在這一學期，這是我們要的那扇門。",
        "門的形狀你已經聽到了。把它寫成條款，比在走廊裡再問一次有用。",
      ],
    },
    persuadeHit: [
      "這則資料碰到贈款、債務、社區或預警。我們聽得見。請把它放進條款，不要停在這句話。",
      "資料對得上。我們要的不是再聽一遍，而是草案裡看得到社區進門的那一句。",
    ],
    persuadeMiss: [
      "這則沒有碰到債務，也沒有碰到社區進不進得了門。換一則，或直接說申請門開在哪。",
      "還是沒有回答：錢會不會變成新債。在這點說清之前，我們不改口。",
    ],
    echo: [
      "這是我們自己的開場。我們記得。請說你準備寫進草案的那一句，不要再念回來。",
      "原話你已經還給我們了。下一句該是條款。",
    ],
    selfPitch: [
      "只用你自己的主張當證據，說服力不夠。請指向債務、社區或預警的一則資料。",
      "只重複你自己的句子，肯尼亞的門不會因此打開。",
    ],
    moods: {
      high: "學期中還趕得上",
      warm: "還聽得進贈款",
      watch: "擔心又變債務",
      low: "社區的門快關上",
    },
  },
};

export function moodLabel(id: CountryId, affinity: number): string {
  const moods = VOICES[id].moods;
  if (affinity >= 70) return moods.high;
  if (affinity >= 55) return moods.warm;
  if (affinity >= 40) return moods.watch;
  return moods.low;
}

export function emptyThreads(): Record<CountryId, DelegateThread> {
  const threads = {} as Record<CountryId, DelegateThread>;
  for (const id of ALL_SEATS) {
    threads[id] = {
      aim: VOICES[id].aim,
      moodLabel: moodLabel(id, INITIAL_AFFINITY[id]),
      turns: [],
    };
  }
  return threads;
}

export function playerLineFor(input: {
  action: CaucusAction;
  proposalId?: string;
  playerLine?: string;
}): string {
  if (input.action === "redline") return "我們想先確認你們不能退讓的那一條。";
  if (input.action === "condition") return "若草案要得到你們連署，需要寫上什麼？";
  if (input.action === "propose") {
    const own = input.playerLine?.trim();
    if (own && own.length >= 16) return own;
    const proposal = PROPOSALS.find((item) => item.id === input.proposalId);
    return proposal ? `我們提出：${proposal.text}` : "我們提出一個合作方向。";
  }
  const line = input.playerLine?.trim() ?? "";
  return line || "請聽這一則，以及我們希望你們聽見的那一句。";
}

export function turnsFromLog(log: CaucusRecord[], playerId: CountryId = "kenya"): Record<CountryId, ChatTurn[]> {
  const turns = Object.fromEntries(ALL_SEATS.map((id) => [id, [] as ChatTurn[]])) as Record<CountryId, ChatTurn[]>;
  for (const record of log) {
    turns[record.delegateId]?.push(
      {
        id: `${record.id}-you`,
        speaker: playerId,
        text: playerLineFor(record),
      },
      {
        id: record.id,
        speaker: record.delegateId,
        text: record.reply,
      },
    );
  }
  return turns;
}

export function voiceLine(id: CountryId, key: keyof Omit<Voice, "aim" | "greeting" | "moods" | "proposals">, heard: number): string {
  const lines = VOICES[id][key];
  return lines[Math.min(heard, lines.length - 1)] ?? lines[0];
}

export function proposalLine(id: CountryId, proposalId: string, heard: number): string {
  const lines = VOICES[id].proposals[proposalId];
  if (!lines) return "";
  return lines[Math.min(heard, lines.length - 1)] ?? lines[0];
}
