import { findCase, seatsForCase } from "@/content/cases";
import { INITIAL_AFFINITY } from "@/content/caucus";
import { AMENDMENTS } from "@/content/draft";
import { HIGHLIGHT_LIMIT, HIGHLIGHT_MINIMUM, SENTENCE_MAP } from "@/content/dossier";
import { DELEGATES } from "@/content/delegates";
import { isSeat, speechOrder, humanSeatsOf } from "@/content/seats";
import { emptyFloor, floorScript } from "@/content/floor";
import { FOCUS_QUESTIONS } from "@/content/moderated";
import { QUIZ, quizPassed } from "@/content/quiz";
import { DIFFICULTY_LEVELS } from "@/engine/levels";
import {
  blanksComplete,
  buildBallots,
  collectTags,
  contactsRemaining,
  countriesTalked,
  evaluateCosponsors,
  seatContactsLeft,
  resolveCaucus,
  tagsAfterAmendments,
} from "@/engine/diplomacy";
import { harvestCaucus, harvestFloor, ideaMinChars, openerLine, reactToIdea } from "@/engine/floorTrial";
import { judgeIntervention } from "@/engine/judge";
import { applyCoachMark } from "@/llm/coach";
import { scoreSession } from "@/engine/scoring";
import { undoubleTranscript } from "@/engine/speechCapture";
import { assessOpeningSpeech, playerSpeechBullet, speechEvidenceBullets, VOICE_MIN_CHARS } from "@/engine/speech";
import { emptyThreads, moodLabel, playerLineFor } from "@/content/voices";
import { ensurePresentations, scorePresentation } from "@/engine/presentation";
import { isChineseVoice, isOfficialLang, type ChineseVoice, type OfficialLang } from "@/i18n/languages";
import { tr } from "@/i18n/tr";
import { clamp } from "@/lib/utils";
import { ensureDebate, ensureThreads, resumeClock, withLanguages } from "@/state/storage";
import type {
  AmendmentChoice,
  CoachMark,
  CountryId,
  BlankValue,
  CaucusAction,
  DifficultyProfile,
  GameState,
  InterventionMode,
  Notice,
  DeliverySample,
  TruthBullet,
} from "@/types/game";

export type Action =
  | { type: "BEGIN" }
  | { type: "SELECT_CASE"; caseId: string }
  | { type: "CLEAR_CASE" }
  | { type: "SET_PLAYER"; playerId: CountryId }
  | { type: "TO_DOSSIER" }
  | { type: "TOGGLE_HIGHLIGHT"; sentenceId: string }
  | { type: "TO_QUIZ" }
  | { type: "ANSWER"; questionId: string; choiceId: string }
  | { type: "NEXT_QUIZ" }
  | { type: "ATTEND"; now: number }
  | { type: "SET_COMPOSER"; text: string }
  | { type: "INSERT_BULLET"; bulletId: string }
  | { type: "SUBMIT_SPEECH"; text?: string; delivery?: DeliverySample; actorSeat?: CountryId }
  | { type: "REVEAL_SPEAKER" }
  | { type: "REVEAL_SECRETARIAT" }
  | { type: "TO_MODERATED" }
  | { type: "REVEAL_REMARK" }
  | { type: "SUBMIT_INTERVENTION"; mode: InterventionMode; text: string; bulletId?: string; delivery?: DeliverySample }
  | { type: "FLOOR_TURN" }
  | { type: "FLOOR_SPEAK"; text: string; mode: InterventionMode; bulletId?: string; delivery?: DeliverySample }
  | { type: "FLOOR_ANSWER"; text: string; delivery?: DeliverySample }
  | { type: "FLOOR_PASS" }
  | { type: "CONTINUE_FOCUS" }
  | { type: "SKIP_TURN" }
  | { type: "TO_CAUCUS" }
  | { type: "SELECT_DELEGATE"; delegateId: CountryId }
  | {
      type: "CAUCUS";
      delegateId: CountryId;
      action: CaucusAction;
      proposalId?: string;
      bulletId?: string;
      playerLine?: string;
      fromVoice?: boolean;
    }
  | { type: "TO_DRAFT" }
  | { type: "FOCUS_BLANK"; blankId: string }
  | { type: "SET_BLANK"; blankId: string; value: BlankValue }
  | { type: "SOLICIT" }
  | { type: "BACK_TO_DRAFT" }
  | { type: "BACK_TO_CAUCUS" }
  | { type: "START_AMENDMENTS" }
  | { type: "WORK_AS_PAPER" }
  | { type: "RESOLVE_AMENDMENT"; amendmentId: string; choice: AmendmentChoice; text?: string }
  | { type: "OPEN_VOTE" }
  | { type: "REVEAL_VOTE" }
  | { type: "TO_DEBRIEF" }
  | { type: "SET_REFLECTION"; text: string }
  | { type: "APPLY_COACH"; mark: CoachMark }
  | { type: "SET_DIFFICULTY"; difficulty: DifficultyProfile }
  | { type: "NEW_SESSION"; sessionId: string; difficulty: DifficultyProfile; caseId?: string }
  | { type: "LOAD_SAVE"; state: GameState; savedAt: string; now: number }
  | { type: "SET_UI_LANGUAGE"; language: OfficialLang }
  | { type: "SET_SPEECH_LANGUAGE"; language: OfficialLang }
  | { type: "SET_CHINESE_VOICE"; voice: ChineseVoice }
  | { type: "CLEAR_NOTICE" };

function notice(tone: Notice["tone"], text: string): Notice {
  return { tone, text };
}

export function createInitialState(input?: {
  sessionId?: string;
  difficulty?: DifficultyProfile;
}): GameState {
  return {
    phase: "lobby",
    sessionId: input?.sessionId ?? `gv-${Date.now()}`,
    difficulty: input?.difficulty ?? DIFFICULTY_LEVELS[2],
    uiLanguage: "zh",
    speechLanguage: "zh",
    chineseVoice: "cmn",
    caseId: null,
    playerId: "kenya",
    mode: "solo",
    humanSeats: ["kenya"],
    openingSpeeches: {},
    bullets: [],
    quizAnswers: {},
    quizIndex: 0,
    composer: "",
    playerSpeech: "",
    speechAssessment: null,
    openingStep: "write",
    aiRevealed: 0,
    questionIndex: 0,
    remarksShown: 0,
    floor: emptyFloor(),
    interventions: [],
    bulletUses: 0,
    affinities: { ...INITIAL_AFFINITY },
    threads: emptyThreads(),
    caucusLog: [],
    actionsLeft: 15,
    selectedDelegateId: null,
    blanks: {},
    activeBlankId: "form",
    solicited: false,
    cosponsors: [],
    cosponsorNotes: {},
    amendmentCursor: -1,
    amendmentChoices: {},
    amendmentTexts: {},
    workingPaper: false,
    votes: null,
    revealedVotes: 0,
    score: null,
    reflection: "",
    archived: false,
    formalStartedAt: null,
    presentations: [],
    lastNotice: null,
  };
}

function highlightBullets(bullets: TruthBullet[]): TruthBullet[] {
  return bullets.filter((bullet) => bullet.source === "highlight");
}

function currentQuestion(state: GameState) {
  return FOCUS_QUESTIONS[state.questionIndex];
}

function alreadySpoke(state: GameState, questionId: string): boolean {
  return state.interventions.some((item) => item.questionId === questionId);
}

export function reducer(state: GameState, action: Action): GameState {
  switch (action.type) {
    case "SELECT_CASE": {
      const training = findCase(action.caseId);
      if (!training || state.phase !== "lobby") return state;
      const playerId = training.seats.includes(state.playerId) ? state.playerId : training.seats[0]!;
      return {
        ...state,
        caseId: training.id,
        playerId,
        humanSeats: state.mode === "online" ? state.humanSeats : [playerId],
        lastNotice: null,
      };
    }
    case "CLEAR_CASE":
      if (state.phase !== "lobby") return state;
      return { ...state, caseId: null, lastNotice: null };
    case "SET_PLAYER":
      if (state.phase !== "lobby" || !isSeat(action.playerId)) return state;
      if (state.mode === "online") return state;
      if (!seatsForCase(state.caseId).includes(action.playerId)) return state;
      return {
        ...state,
        playerId: action.playerId,
        humanSeats: [action.playerId],
        lastNotice: null,
      };
    case "CLEAR_NOTICE":
      return { ...state, lastNotice: null };
    case "BEGIN":
      return state.phase === "lobby" ? { ...state, phase: "chair", lastNotice: null } : state;
    case "TO_DOSSIER":
      if (state.phase !== "chair" && state.phase !== "quiz") return state;
      return { ...state, phase: "dossier", lastNotice: null };
    case "TOGGLE_HIGHLIGHT": {
      if (state.phase !== "dossier") return state;
      const sentence = SENTENCE_MAP[action.sentenceId];
      if (!sentence) return state;
      const exists = state.bullets.some((bullet) => bullet.id === sentence.id);
      if (exists) {
        return {
          ...state,
          bullets: state.bullets.filter((bullet) => bullet.id !== sentence.id),
          lastNotice: null,
        };
      }
      if (highlightBullets(state.bullets).length >= HIGHLIGHT_LIMIT) {
        return {
          ...state,
          lastNotice: notice("warn", `論據已達上限（${HIGHLIGHT_LIMIT} 則）。先取消一則你不打算在會上負責的句子。`),
        };
      }
      const bullet: TruthBullet = {
        id: sentence.id,
        text: sentence.text,
        source: "highlight",
        origin: sentence.origin,
        speakerId: sentence.speakerId,
        tags: sentence.tags,
        href: sentence.href,
        sourceLabel: sentence.sourceLabel,
      };
      return { ...state, bullets: [...state.bullets, bullet], lastNotice: null };
    }
    case "TO_QUIZ": {
      if (state.phase !== "dossier") return state;
      if (highlightBullets(state.bullets).length < HIGHLIGHT_MINIMUM) {
        return {
          ...state,
          lastNotice: notice("warn", "進會場前至少畫 3 則你願意引用的句子。沒有證據，發言容易只剩口號。"),
        };
      }
      return { ...state, phase: "quiz", lastNotice: null };
    }
    case "ANSWER": {
      if (state.phase !== "quiz") return state;
      if (state.quizAnswers[action.questionId]) return state;
      const question = QUIZ.find((item) => item.id === action.questionId);
      if (!question || state.quizIndex !== QUIZ.indexOf(question)) return state;
      const correct = action.choiceId === question.correctChoiceId;
      const bullets = [...state.bullets];
      if (correct && !bullets.some((bullet) => bullet.id === `quiz-${question.id}`)) {
        bullets.push({
          id: `quiz-${question.id}`,
          text: question.bullet.text,
          source: "comprehension",
          origin: question.bullet.origin,
          speakerId: "fact",
          tags: question.bullet.tags,
        });
      }
      return {
        ...state,
        quizAnswers: { ...state.quizAnswers, [action.questionId]: action.choiceId },
        bullets,
        lastNotice: notice(
          correct ? "good" : "warn",
          correct ? "答對。這則已收入論據，會上可以引用。" : "這題先記住解釋。答錯不會收入論據。",
        ),
      };
    }
    case "NEXT_QUIZ": {
      if (state.phase !== "quiz") return state;
      const question = QUIZ[state.quizIndex];
      if (!question || !state.quizAnswers[question.id]) return state;
      if (state.quizIndex >= QUIZ.length - 1) return state;
      return { ...state, quizIndex: state.quizIndex + 1, lastNotice: null };
    }
    case "ATTEND": {
      if (state.phase !== "quiz") return state;
      if (Object.keys(state.quizAnswers).length < QUIZ.length) {
        return { ...state, lastNotice: notice("warn", "四題都回答之後才能出席。") };
      }
      if (!quizPassed(state.quizAnswers)) {
        return {
          ...state,
          phase: "lobby",
          caseId: null,
          quizAnswers: {},
          quizIndex: 0,
          bullets: state.bullets.filter((bullet) => bullet.source !== "highlight" && bullet.source !== "comprehension"),
          lastNotice: notice("warn", "理解檢測要高於五成才能出席。請回到選例子，再讀一次卷宗。"),
        };
      }
      return {
        ...state,
        phase: "opening",
        formalStartedAt: action.now,
        lastNotice: notice("info", `${DELEGATES[state.playerId].placard}代表出席。正式會議開始，請先提出你的基本看法。`),
      };
    }
    case "SET_COMPOSER": {
      if (state.phase !== "opening" || state.openingStep !== "write") return state;
      return { ...state, composer: action.text.slice(0, 600) };
    }
    case "INSERT_BULLET": {
      const bullet = state.bullets.find((item) => item.id === action.bulletId);
      if (!bullet) return state;
      if (state.phase === "opening" && state.openingStep === "write") {
        const quote = `「${tr(state.uiLanguage, bullet.text)}」`;
        if (state.composer.includes(quote)) {
          return { ...state, lastNotice: notice("info", "這則論據已經在發言稿裡。") };
        }
        const next = state.composer.trim().length ? `${state.composer.trim()} ${quote}` : quote;
        return { ...state, composer: next.slice(0, 600), lastNotice: null };
      }
      if (state.phase === "drafting" && state.amendmentCursor < 0 && state.activeBlankId) {
        const current = state.blanks[state.activeBlankId];
        if (!current || current.kind !== "custom" || !current.custom || current.custom.trim().length < 16) {
          return {
            ...state,
            lastNotice: notice("warn", "論據不能單獨成為答案。先寫下你的句子，再附上論據增加說服力。"),
          };
        }
        return {
          ...state,
          solicited: false,
          blanks: {
            ...state.blanks,
            [state.activeBlankId]: { kind: "custom", custom: current.custom, bulletId: bullet.id },
          },
          lastNotice: notice("info", "已把論據附在這段。說服力會加，句子仍是你寫的。"),
        };
      }
      return state;
    }
    case "SUBMIT_SPEECH": {
      if (state.phase !== "opening" || state.openingStep !== "write") return state;
      const actorSeat = action.actorSeat && isSeat(action.actorSeat) ? action.actorSeat : state.playerId;
      const humans = humanSeatsOf(state);
      if (!humans.includes(actorSeat)) return state;
      if (state.openingSpeeches?.[actorSeat]?.trim()) {
        return { ...state, lastNotice: notice("info", "這一席的開場已經送出，請等其他代表。") };
      }
      const spoken = undoubleTranscript((action.text ?? state.composer).trim());
      const assessment = assessOpeningSpeech(spoken, state.bullets, state.difficulty, state.speechLanguage, actorSeat);
      const voiceReady = Boolean(action.delivery) && spoken.length >= VOICE_MIN_CHARS;
      const priorTalks = state.presentations ?? [];
      const presentations = [
        ...priorTalks,
        scorePresentation({
          id: `talk-${priorTalks.length + 1}`,
          occasion: "opening",
          text: spoken,
          delivery: action.delivery,
          bullets: state.bullets,
          speechLang: state.speechLanguage,
          mode: action.delivery ? "voice" : "typed",
        }),
      ];
      if (!assessment.longEnough && !voiceReady) {
        return {
          ...state,
          presentations,
          speechAssessment: assessment,
          lastNotice: notice("warn", assessment.notes[0] ?? "發言太短。請再說一次，把主張和理由說完。"),
        };
      }
      const openingSpeeches = { ...state.openingSpeeches, [actorSeat]: spoken };
      const typed = !action.delivery;
      const allHumansDone = humans.every((seat) => Boolean(openingSpeeches[seat]?.trim()));
      if (!allHumansDone) {
        const waiting = humans.filter((seat) => !openingSpeeches[seat]?.trim()).length;
        return {
          ...state,
          presentations,
          openingSpeeches,
          playerSpeech: actorSeat === state.playerId ? spoken : state.playerSpeech,
          speechAssessment: assessment,
          composer: actorSeat === state.playerId ? "" : state.composer,
          lastNotice: notice(
            "good",
            typed
              ? `打字開場已記入。還有 ${waiting} 席真人代表尚未發言，請稍候。`
              : `發言已記入。還有 ${waiting} 席真人代表尚未發言，請稍候。`,
          ),
        };
      }
      return {
        ...state,
        presentations,
        openingSpeeches,
        playerSpeech: openingSpeeches[state.playerId] ?? spoken,
        speechAssessment: assessment,
        openingStep: "floor",
        composer: "",
        lastNotice: notice(
          "good",
          typed
            ? "各席開場已齊。接下來請聽其餘代表。秘書處整理後，主張會收成論據。"
            : "各席開場已齊。接下來請聽其餘代表。先聽完，再決定你要抓哪一句。",
        ),
      };
    }
    case "REVEAL_SPEAKER": {
      if (state.phase !== "opening" || state.openingStep !== "floor") return state;
      if (state.aiRevealed >= speechOrder(state.playerId, humanSeatsOf(state)).length) return state;
      return { ...state, aiRevealed: state.aiRevealed + 1, lastNotice: null };
    }
    case "REVEAL_SECRETARIAT": {
      if (state.phase !== "opening" || state.openingStep !== "floor") return state;
      const humans = humanSeatsOf(state);
      const order = speechOrder(state.playerId, humans);
      if (state.aiRevealed < order.length) return state;
      const known = new Set(state.bullets.map((bullet) => bullet.id));
      const added: TruthBullet[] = [];
      for (const id of order) {
        const bulletId = `sec-${id}`;
        if (known.has(bulletId)) continue;
        const delegate = DELEGATES[id];
        added.push({
          id: bulletId,
          text: delegate.speechSummary,
          source: "secretariat",
          origin: `秘書處摘要 · ${delegate.placard}開場`,
          speakerId: delegate.id,
          tags: delegate.tags,
        });
        known.add(bulletId);
      }
      for (const humanId of humans) {
        const speech = state.openingSpeeches?.[humanId] ?? (humanId === state.playerId ? state.playerSpeech : "");
        if (!speech.trim()) continue;
        const playerBulletId = `sec-${humanId}`;
        if (known.has(playerBulletId)) continue;
        const summary = playerSpeechBullet(speech, humanId);
        const player = DELEGATES[humanId];
        added.push({
          id: playerBulletId,
          text: summary.text,
          source: "secretariat",
          origin: `秘書處摘要 · ${player.placard}開場`,
          speakerId: humanId,
          tags: summary.tags,
        });
        known.add(playerBulletId);
        for (const bullet of speechEvidenceBullets(speech, humanId)) {
          if (known.has(bullet.id)) continue;
          added.push(bullet);
          known.add(bullet.id);
        }
      }
      return {
        ...state,
        openingStep: "secretariat",
        bullets: [...state.bullets, ...added],
        lastNotice: notice("info", "秘書處摘要是「誰說了什麼」，不是事實核查。引用前先決定你要支持還是質疑。"),
      };
    }
    case "TO_MODERATED":
      if (state.phase !== "opening" || state.openingStep !== "secretariat") return state;
      return {
        ...state,
        phase: "moderated",
        floor: emptyFloor(),
        lastNotice: notice("info", "進入有秩序動議。三輪輪流發言。輪到你時先說進一步想法，論據用來支持或反駁，不能代替你要說的話。"),
      };
    case "REVEAL_REMARK": {
      if (state.phase !== "moderated") return state;
      const question = currentQuestion(state);
      if (!question || state.remarksShown >= question.remarks.length) return state;
      return { ...state, remarksShown: state.remarksShown + 1, lastNotice: null };
    }
    case "SUBMIT_INTERVENTION": {
      if (state.phase !== "moderated") return state;
      const question = currentQuestion(state);
      if (!question || state.remarksShown < question.remarks.length) return state;
      if (alreadySpoke(state, question.id)) return state;
      const bullet = action.bulletId ? state.bullets.find((item) => item.id === action.bulletId) : undefined;
      if ((action.mode === "support" || action.mode === "rebut") && state.bulletUses >= state.difficulty.maxBulletUses) {
        return {
          ...state,
          lastNotice: notice("warn", `本場論據指證最多 ${state.difficulty.maxBulletUses} 次。這一輪可以改用普通發言。`),
        };
      }
      const judgment = judgeIntervention({
        mode: action.mode,
        text: action.text,
        bullet,
        questionTags: question.tags,
        difficulty: state.difficulty,
        lang: state.speechLanguage,
        playerId: state.playerId,
      });
      const priorTalks = state.presentations ?? [];
      const presentations = [
        ...priorTalks,
        scorePresentation({
          id: `talk-${priorTalks.length + 1}`,
          occasion: "moderated",
          text: action.text,
          delivery: action.delivery,
          questionTags: question.tags,
          bullets: state.bullets,
          speechLang: state.speechLanguage,
          mode: action.delivery ? "voice" : "typed",
        }),
      ];
      if (!judgment.record) {
        return { ...state, presentations, lastNotice: notice("warn", judgment.feedback) };
      }
      return {
        ...state,
        presentations,
        interventions: [
          ...state.interventions,
          {
            id: `int-${state.interventions.length + 1}`,
            questionId: question.id,
            mode: action.mode,
            bulletId: bullet?.id,
            text: action.text.trim(),
            valid: judgment.valid,
            feedback: judgment.feedback,
          },
        ],
        bulletUses: state.bulletUses + (judgment.consumeUse ? 1 : 0),
        composer: "",
        lastNotice: notice(judgment.valid ? "good" : "warn", judgment.feedback),
      };
    }
    case "FLOOR_TURN": {
      if (state.phase !== "moderated" || state.floor.beat !== "listen") return state;
      const exists = state.floor.lines.some((line) => line.round === state.floor.round && line.role === "open");
      return {
        ...state,
        floor: {
          ...state.floor,
          beat: "player",
          lines: exists ? state.floor.lines : [...state.floor.lines, openerLine(state)],
        },
        lastNotice: null,
      };
    }
    case "FLOOR_SPEAK": {
      if (state.phase !== "moderated" || state.floor.beat !== "player") {
        return { ...state, lastNotice: notice("warn", "先聽完這一輪，再發言。") };
      }
      const script = floorScript(state.floor.round);
      const text = action.text.trim();
      const min = action.delivery ? VOICE_MIN_CHARS : ideaMinChars(state.difficulty.speechMinChars);
      if (text.length < min) {
        return {
          ...state,
          lastNotice: notice("warn", `進一步想法還太短（目前 ${text.length} 字，至少 ${min} 字）。先把你的判斷說完，論據是額外的。`),
        };
      }
      const usingBullet = action.mode === "support" || action.mode === "rebut";
      if (usingBullet && state.bulletUses >= state.difficulty.maxBulletUses) {
        return {
          ...state,
          lastNotice: notice("warn", "本輪論據次數已用完。這一輪可以只說想法，不附論據。"),
        };
      }
      const bullet = action.bulletId ? state.bullets.find((item) => item.id === action.bulletId) : undefined;
      const judgment = usingBullet
        ? judgeIntervention({
            mode: action.mode,
            text,
            bullet,
            questionTags: script.tags,
            difficulty: action.delivery
              ? { ...state.difficulty, speechMinChars: VOICE_MIN_CHARS, rebuttalMinChars: VOICE_MIN_CHARS }
              : state.difficulty,
            lang: state.speechLanguage,
            playerId: state.playerId,
          })
        : { valid: true, record: true, consumeUse: false, feedback: "這則發言有基本結構。主席不會替你判斷立場對不對，只確認你把看法說成了可以回應的句子。" };
      if (!judgment.record) {
        return { ...state, lastNotice: notice("warn", judgment.feedback) };
      }
      const reaction = reactToIdea({
        round: state.floor.round,
        text,
        mode: action.mode,
        valid: judgment.valid,
        bullet,
        lang: state.uiLanguage,
        playerId: state.playerId,
      });
      const priorTalks = state.presentations ?? [];
      const presentations = [
        ...priorTalks,
        scorePresentation({
          id: `talk-${priorTalks.length + 1}`,
          occasion: "moderated",
          text,
          delivery: action.delivery,
          questionTags: script.tags,
          bullets: state.bullets,
          speechLang: state.speechLanguage,
          mode: action.delivery ? "voice" : "typed",
        }),
      ];
      const round = state.floor.round;
      return {
        ...state,
        presentations,
        interventions: [
          ...state.interventions,
          {
            id: `int-${state.interventions.length + 1}`,
            questionId: `floor-${round}`,
            mode: action.mode,
            bulletId: usingBullet ? bullet?.id : undefined,
            text,
            valid: judgment.valid,
            feedback: judgment.feedback,
          },
        ],
        bulletUses: state.bulletUses + (judgment.consumeUse ? 1 : 0),
        floor: {
          ...state.floor,
          beat: "answer",
          lines: [
            ...state.floor.lines,
            {
              id: `floor-${round}-idea`,
              round,
              speaker: state.playerId,
              role: "idea",
              text,
              bulletId: usingBullet ? bullet?.id : undefined,
              valid: judgment.valid,
            },
            {
              id: `floor-${round}-react`,
              round,
              speaker: reaction.speakerId,
              role: "react",
              text: reaction.text,
            },
          ],
        },
        lastNotice: notice(judgment.valid ? "good" : "warn", judgment.feedback),
      };
    }
    case "FLOOR_ANSWER":
    case "FLOOR_PASS": {
      if (state.phase !== "moderated" || state.floor.beat !== "answer") return state;
      const text = action.type === "FLOOR_ANSWER" ? action.text.trim() : "";
      const answerMin = action.type === "FLOOR_ANSWER" && action.delivery ? VOICE_MIN_CHARS : 12;
      if (action.type === "FLOOR_ANSWER" && text.length > 0 && text.length < answerMin) {
        return { ...state, lastNotice: notice("warn", "用至少 12 個字說明你希望對方聽見什麼。不要只貼論據。") };
      }
      const round = state.floor.round;
      const lines = [
        ...state.floor.lines,
        text.length >= answerMin
          ? { id: `floor-${round}-answer`, round, speaker: state.playerId, role: "answer" as const, text }
          : { id: `floor-${round}-pass`, round, speaker: state.playerId, role: "pass" as const, text: "本席本輪不再回應。" },
      ];
      const priorTalks = state.presentations ?? [];
      const presentations =
        action.type === "FLOOR_ANSWER" && text.length >= answerMin
          ? [
              ...priorTalks,
              scorePresentation({
                id: `talk-${priorTalks.length + 1}`,
                occasion: "moderated",
                text,
                delivery: action.delivery,
                questionTags: floorScript(round).tags,
                bullets: state.bullets,
                speechLang: state.speechLanguage,
                mode: action.delivery ? "voice" : "typed",
              }),
            ]
          : priorTalks;
      if (round >= 3) {
        const pending: GameState = {
          ...state,
          presentations,
          floor: { ...state.floor, round, beat: "done", lines, harvested: false },
        };
        const added = harvestFloor(pending);
        return {
          ...pending,
          floor: { ...pending.floor, harvested: true },
          bullets: [...state.bullets, ...added],
          lastNotice: notice("info", "三輪討論已收成論據。可以進入非監管式議會。"),
        };
      }
      const nextRound = (round + 1) as 1 | 2 | 3;
      return {
        ...state,
        presentations,
        floor: { ...state.floor, round: nextRound, beat: "listen", lines },
        lastNotice: null,
      };
    }
    case "CONTINUE_FOCUS":
    case "TO_CAUCUS": {
      if (state.phase !== "moderated") return state;
      if (state.floor.beat !== "done") {
        return { ...state, lastNotice: notice("warn", "有秩序動議還沒說完三輪。") };
      }
      return {
        ...state,
        phase: "unmoderated",
        lastNotice: notice("info", "有秩序動議結束。接下來是非監管式議會：五席都開得了。跟完一國不會關掉其他國，點另一國就換過去。"),
      };
    }
    case "SKIP_TURN": {
      if (state.phase !== "moderated") return state;
      if (state.floor.beat === "answer") return reducer(state, { type: "FLOOR_PASS" });
      return { ...state, lastNotice: notice("info", "這一輪你還要先說進一步想法。") };
    }
    case "SELECT_DELEGATE":
      if (state.phase !== "unmoderated" || action.delegateId === state.playerId) return state;
      return { ...state, selectedDelegateId: action.delegateId, lastNotice: null };
    case "CAUCUS": {
      if (state.phase !== "unmoderated" || action.delegateId === state.playerId) return state;
      if (seatContactsLeft(state.caucusLog, action.delegateId) <= 0) {
        return { ...state, lastNotice: notice("warn", "這一席先聽到這裡。點另一國繼續，談完一國不會關掉其他國。") };
      }
      const bullet = action.bulletId ? state.bullets.find((item) => item.id === action.bulletId) : undefined;
      const prior = state.caucusLog.filter((item) => item.delegateId === action.delegateId);
      const resolved = resolveCaucus({
        delegateId: action.delegateId,
        action: action.action,
        proposalId: action.proposalId,
        bullet,
        playerLine: action.playerLine,
        nextId: `cau-${state.caucusLog.length + 1}`,
        prior,
        lang: state.uiLanguage,
        playerId: state.playerId,
        voice: action.fromVoice,
      });
      if ("error" in resolved) return { ...state, lastNotice: notice("warn", resolved.error) };
      const current = state.affinities[action.delegateId];
      const nextAffinity = clamp(current + resolved.delta, 0, 100);
      const threads = state.threads ?? emptyThreads();
      const thread = threads[action.delegateId];
      return {
        ...state,
        threads: {
          ...threads,
          [action.delegateId]: {
            aim: thread.aim,
            moodLabel: moodLabel(action.delegateId, nextAffinity),
            turns: [
              ...thread.turns,
              {
                id: `${resolved.record.id}-you`,
                speaker: state.playerId,
                text: playerLineFor({
                  action: action.action,
                  proposalId: action.proposalId,
                  playerLine: action.playerLine,
                }),
              },
              {
                id: resolved.record.id,
                speaker: action.delegateId,
                text: resolved.record.reply,
              },
            ],
          },
        },
        actionsLeft: contactsRemaining([...state.caucusLog, resolved.record], state.playerId),
        affinities: {
          ...state.affinities,
          [action.delegateId]: nextAffinity,
        },
        caucusLog: [...state.caucusLog, resolved.record],
        selectedDelegateId: action.delegateId,
        lastNotice: null,
      };
    }
    case "TO_DRAFT": {
      if (state.phase !== "unmoderated") return state;
      if (countriesTalked(state.caucusLog) < 3) {
        return {
          ...state,
          lastNotice: notice("warn", "非監管式議會至少要跟三個國家談過，再進草案。"),
        };
      }
      const added = harvestCaucus(state);
      return {
        ...state,
        bullets: [...state.bullets, ...added],
        phase: "drafting",
        lastNotice: notice("info", "秘書處依討論放好了非關鍵段落。你要填的是四個會改變文本方向的空位。"),
      };
    }
    case "FOCUS_BLANK":
      if (state.phase !== "drafting" || state.amendmentCursor >= 0) return state;
      return { ...state, activeBlankId: action.blankId };
    case "SET_BLANK":
      if (state.phase !== "drafting" || state.amendmentCursor >= 0) return state;
      return {
        ...state,
        activeBlankId: action.blankId,
        solicited: false,
        blanks: { ...state.blanks, [action.blankId]: action.value },
        lastNotice: null,
      };
    case "SOLICIT": {
      if (state.phase !== "drafting" || state.amendmentCursor >= 0) return state;
      const tags = collectTags(state.blanks, state.bullets);
      const result = evaluateCosponsors(tags, state.affinities, state.difficulty.level, state.playerId);
      const enough = blanksComplete(state.blanks) && result.cosponsors.length >= state.difficulty.cosponsorCount;
      return {
        ...state,
        solicited: true,
        cosponsors: result.cosponsors,
        cosponsorNotes: result.notes,
        workingPaper: !enough,
        amendmentCursor: 0,
        lastNotice: notice(
          enough ? "good" : "warn",
          enough
            ? `已有 ${result.cosponsors.length} 席連署，可以處理修正案。`
            : `目前 ${result.cosponsors.length} 席願意連署，正式草案需要 ${state.difficulty.cosponsorCount} 席。`,
        ),
      };
    }
    case "BACK_TO_DRAFT":
      if (state.phase !== "drafting") return state;
      return {
        ...state,
        amendmentCursor: -1,
        amendmentChoices: {},
        workingPaper: false,
        solicited: false,
        lastNotice: null,
      };
    case "BACK_TO_CAUCUS":
      if (state.phase !== "drafting" || state.actionsLeft <= 0 || state.amendmentCursor >= 0) return state;
      return { ...state, phase: "unmoderated", lastNotice: notice("info", "你回到非監管式議會。每席的對話還在原來那一席，剩餘行動仍可使用。") };
    case "START_AMENDMENTS":
      if (state.phase !== "drafting" || !state.solicited) return state;
      if (state.cosponsors.length < state.difficulty.cosponsorCount) return state;
      return { ...state, amendmentCursor: 0, workingPaper: false, lastNotice: null };
    case "WORK_AS_PAPER":
      if (state.phase !== "drafting" || !state.solicited) return state;
      if (state.cosponsors.length >= state.difficulty.cosponsorCount) return state;
      return {
        ...state,
        workingPaper: true,
        amendmentCursor: 0,
        lastNotice: notice("warn", "未達連署門檻。文本以工作文件進入修正與表決，代表們投票時會更謹慎。"),
      };
    case "RESOLVE_AMENDMENT": {
      if (state.phase !== "drafting" || state.amendmentCursor < 0 || state.amendmentCursor >= AMENDMENTS.length) {
        return state;
      }
      const current = AMENDMENTS[state.amendmentCursor];
      if (!current || current.id !== action.amendmentId) return state;
      const counter = action.text?.trim() ?? "";
      if (action.choice === "counter" && counter.length < 16) {
        return { ...state, lastNotice: notice("warn", "反建議至少 16 字。指引只是方向，句子要你自己寫。") };
      }
      return {
        ...state,
        amendmentChoices: { ...state.amendmentChoices, [action.amendmentId]: action.choice },
        amendmentTexts: action.choice === "counter" ? { ...state.amendmentTexts, [action.amendmentId]: counter } : state.amendmentTexts,
        amendmentCursor: state.amendmentCursor + 1,
        lastNotice: null,
      };
    }
    case "OPEN_VOTE": {
      if (state.phase !== "drafting" || state.amendmentCursor < AMENDMENTS.length) return state;
      const tags = tagsAfterAmendments(collectTags(state.blanks, state.bullets), state.amendmentChoices, state.amendmentTexts);
      const votes = buildBallots(tags, state.affinities, state.amendmentChoices, state.workingPaper, state.playerId);
      const score = scoreSession({ ...state, votes }, tags, votes);
      return {
        ...state,
        phase: "voting",
        votes,
        revealedVotes: 0,
        score,
        lastNotice: null,
      };
    }
    case "REVEAL_VOTE":
      if (state.phase !== "voting" || !state.votes) return state;
      return { ...state, revealedVotes: Math.min(6, state.revealedVotes + 1) };
    case "TO_DEBRIEF":
      if (state.phase !== "voting" || state.revealedVotes < 6) return state;
      return { ...state, phase: "debrief", archived: true };
    case "SET_REFLECTION":
      return { ...state, reflection: action.text.slice(0, 300) };
    case "APPLY_COACH":
      if (state.phase !== "debrief" || !state.score) return state;
      return { ...state, score: applyCoachMark(state.score, action.mark) };
    case "SET_DIFFICULTY":
      if (state.phase !== "lobby") return state;
      return { ...state, difficulty: action.difficulty };
    case "NEW_SESSION": {
      const nextCase = action.caseId ? (findCase(action.caseId)?.id ?? null) : null;
      const carried = state.mode === "online" ? (state.humanSeats[0] ?? state.playerId) : state.playerId;
      const allowed = seatsForCase(nextCase);
      const playerId = allowed.includes(carried) ? carried : allowed[0]!;
      return {
        ...createInitialState({ sessionId: action.sessionId, difficulty: action.difficulty }),
        uiLanguage: state.uiLanguage,
        speechLanguage: state.speechLanguage,
        chineseVoice: state.chineseVoice,
        caseId: nextCase,
        playerId,
        mode: "solo",
        humanSeats: [playerId],
        openingSpeeches: {},
      };
    }
    case "SET_UI_LANGUAGE":
      if (!isOfficialLang(action.language)) return state;
      return { ...state, uiLanguage: action.language, speechLanguage: action.language };
    case "SET_SPEECH_LANGUAGE":
      if (!isOfficialLang(action.language)) return state;
      return { ...state, speechLanguage: action.language };
    case "SET_CHINESE_VOICE":
      if (!isChineseVoice(action.voice)) return state;
      return { ...state, speechLanguage: "zh", chineseVoice: action.voice };
    case "LOAD_SAVE":
      return {
        ...resumeClock(
          ensureDebate(
            withLanguages({
              ...ensureThreads(action.state),
              presentations: ensurePresentations(action.state.presentations),
            }),
          ),
          action.savedAt,
          action.now,
        ),
        lastNotice: notice("good", "已開啟存檔，從你停下的地方繼續。離開期間的時間不計入建議節奏。"),
      };
    default:
      return state;
  }
}
