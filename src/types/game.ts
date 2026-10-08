import type { ChineseVoice, OfficialLang } from "@/i18n/languages";

export type Phase =
  | "lobby"
  | "chair"
  | "dossier"
  | "quiz"
  | "opening"
  | "moderated"
  | "unmoderated"
  | "drafting"
  | "voting"
  | "debrief";

export type CountryId =
  | "kenya"
  | "germany"
  | "bangladesh"
  | "brazil"
  | "usa"
  | "china";

export type AiDelegateId = Exclude<CountryId, "kenya">;

export type BulletSource = "highlight" | "comprehension" | "secretariat" | "discussion";

export type BulletSpeaker = CountryId | "fact";

export type InterventionMode = "speech" | "support" | "rebut";

export type CaucusAction = "redline" | "condition" | "propose" | "persuade";

export type AmendmentChoice = "accept" | "reject" | "counter";

export type Ballot = "yes" | "no" | "abstain";

export type BlankKind = "option" | "bullet" | "custom";

export interface TruthBullet {
  id: string;
  text: string;
  source: BulletSource;
  origin: string;
  speakerId: BulletSpeaker;
  tags: string[];
  note?: string;
  /** Public URL for a newspaper, government, or UN report. */
  href?: string;
  /** Short label for the hyperlink, e.g. UNESCO GEM Report. */
  sourceLabel?: string;
}

export type FloorBeat = "listen" | "player" | "answer" | "done";

export interface FloorLine {
  id: string;
  round: 1 | 2 | 3;
  speaker: CountryId;
  role: "open" | "idea" | "react" | "answer" | "pass";
  text: string;
  bulletId?: string;
  valid?: boolean;
}

export interface FloorState {
  round: 1 | 2 | 3;
  beat: FloorBeat;
  lines: FloorLine[];
  harvested: boolean;
}

export interface DelegateProfile {
  id: CountryId;
  countryZh: string;
  countryEn: string;
  placard: string;
  style: string;
  interests: string[];
  redLines: string[];
  openingSpeech: string;
  speechSummary: string;
  tags: string[];
  seal: string;
  sealInk: string;
  mark: string;
}

export interface EvidenceSentence {
  id: string;
  text: string;
  tags: string[];
  speakerId: BulletSpeaker;
  origin: string;
  href?: string;
  sourceLabel?: string;
}

export type DossierBlock =
  | { type: "h"; text: string }
  | { type: "p"; text: string }
  | { type: "sentence"; sentenceId: string }
  | { type: "note"; text: string };

export interface DossierTab {
  id: string;
  label: string;
  kicker: string;
  blocks: DossierBlock[];
}

export interface QuizChoice {
  id: string;
  text: string;
}

export interface QuizQuestion {
  id: string;
  prompt: string;
  choices: QuizChoice[];
  correctChoiceId: string;
  explanation: string;
  bullet: {
    text: string;
    tags: string[];
    origin: string;
  };
}

export interface FocusRemark {
  delegateId: AiDelegateId;
  text: string;
}

export interface FocusQuestion {
  id: string;
  prompt: string;
  tags: string[];
  remarks: FocusRemark[];
}

export interface Proposal {
  id: string;
  title: string;
  text: string;
  tags: string[];
}

export interface CaucusReply {
  text: string;
  delta: number;
}

export interface DelegateDiplomacy {
  id: CountryId;
  listenTags: string[];
  redline: CaucusReply;
  condition: CaucusReply;
  proposals: Record<string, CaucusReply>;
  persuadeHit: CaucusReply;
  persuadeMiss: CaucusReply;
  echo: CaucusReply;
  selfPitch: CaucusReply;
}

export interface DraftOption {
  id: string;
  text: string;
  tags: string[];
}

export interface DraftBlank {
  id: string;
  numeral: string;
  label: string;
  lead: string;
  hint: string;
  options: DraftOption[];
}

export interface Amendment {
  id: string;
  sponsorId: AiDelegateId;
  text: string;
  stakes: string;
  counterText: string;
}

export interface DifficultyProfile {
  level: 1 | 2 | 3;
  label: string;
  summary: string;
  speechMinChars: number;
  rebuttalMinChars: number;
  strictMechanisms: boolean;
  maxBulletUses: number;
  cosponsorCount: number;
  hint: "guided" | "light" | "none";
}

export interface DeliverySample {
  durationMs: number;
  pauseCount: number;
  meanVolume: number;
  volumeSpread: number;
}

export type RubricLevel = 1 | 2 | 3 | 4 | 5;
export type PresentationOccasion = "opening" | "moderated";
export type PresentationMode = "voice" | "typed";
export type RubricAxisId =
  | "position"
  | "reasoning"
  | "evidence"
  | "solution"
  | "focus"
  | "delivery"
  | "protocol";

export interface PresentationReview {
  id: string;
  occasion: PresentationOccasion;
  mode: PresentationMode;
  axes: Record<RubricAxisId, RubricLevel>;
  notes: Record<RubricAxisId, string>;
  /** Average of the five content axes; kept for older summaries. */
  content: RubricLevel;
  /** Same as axes.delivery. */
  oratory: RubricLevel;
  /** Same as axes.protocol. */
  protocol: RubricLevel;
  contentNote: string;
  oratoryNote: string;
  protocolNote: string;
  suggestions: string[];
}

export interface SpeechAssessment {
  score: number;
  aligned: boolean;
  citedBullet: boolean;
  hasReason: boolean;
  longEnough: boolean;
  notes: string[];
}

export interface InterventionRecord {
  id: string;
  questionId: string;
  mode: InterventionMode;
  bulletId?: string;
  text: string;
  valid: boolean;
  feedback: string;
}

export interface CaucusRecord {
  id: string;
  delegateId: CountryId;
  action: CaucusAction;
  proposalId?: string;
  bulletId?: string;
  playerLine?: string;
  reply: string;
  delta: number;
  replyKey?: string;
}

export interface ChatTurn {
  id: string;
  speaker: CountryId;
  text: string;
}

export interface DelegateThread {
  aim: string;
  moodLabel: string;
  turns: ChatTurn[];
}

export interface BlankValue {
  kind: BlankKind;
  optionId?: string;
  bulletId?: string;
  custom?: string;
}

export interface Notice {
  tone: "good" | "warn" | "info";
  text: string;
}

export interface ScoreNarrative {
  consistency: string;
  argumentation: string;
  alliance: string;
  influence: string;
  closing: string;
}

export interface SessionScore {
  sessionId: string;
  playedAt: string;
  difficultyLevel: 1 | 2 | 3;
  consistency: number;
  argumentation: number;
  alliance: number;
  influence: number;
  overall: number;
  tier: "distinguished" | "steady" | "developing";
  tierLabel: string;
  comprehensionCorrect: number;
  comprehensionTotal: number;
  validInterventions: number;
  interventionAttempts: number;
  cosponsors: CountryId[];
  workingPaper: boolean;
  passed: boolean;
  coreSurvived: boolean;
  yesCount: number;
  noCount: number;
  narrative: ScoreNarrative;
  /** Set when the examiner has marked this round. */
  coachMark?: CoachMark;
}

export interface ExamplePick {
  id: string;
  /** 1 introductory, 2 standard, 3 rigorous. Follows this round's mark. */
  level: 1 | 2 | 3;
}

export interface CoachMark {
  overall: number;
  levels: { id: string; level: RubricLevel }[];
  improvements: string[];
  examples: ExamplePick[];
  source: "model" | "examiner";
}

export type OpeningStep = "write" | "floor" | "secretariat";

export type SessionMode = "solo" | "online";

export interface GameState {
  phase: Phase;
  sessionId: string;
  difficulty: DifficultyProfile;
  uiLanguage: OfficialLang;
  speechLanguage: OfficialLang;
  /** Mandarin or Cantonese when the microphone language is Chinese. */
  chineseVoice: ChineseVoice;
  /** Training case chosen before a country. Null until the player picks one. */
  caseId: string | null;
  /** Local perspective seat (solo player, or this client's country online). */
  playerId: CountryId;
  /** solo = one human; online = up to four humans, rest AI. */
  mode: SessionMode;
  /** Country seats controlled by humans this session. */
  humanSeats: CountryId[];
  /** Opening speeches keyed by human seat (online multi-speaker). */
  openingSpeeches: Partial<Record<CountryId, string>>;
  bullets: TruthBullet[];
  quizAnswers: Record<string, string>;
  quizIndex: number;
  composer: string;
  playerSpeech: string;
  speechAssessment: SpeechAssessment | null;
  openingStep: OpeningStep;
  aiRevealed: number;
  questionIndex: number;
  remarksShown: number;
  floor: FloorState;
  interventions: InterventionRecord[];
  bulletUses: number;
  affinities: Record<CountryId, number>;
  threads: Record<CountryId, DelegateThread>;
  caucusLog: CaucusRecord[];
  actionsLeft: number;
  selectedDelegateId: CountryId | null;
  blanks: Record<string, BlankValue | undefined>;
  activeBlankId: string | null;
  solicited: boolean;
  cosponsors: CountryId[];
  cosponsorNotes: Partial<Record<CountryId, string>>;
  amendmentCursor: number;
  amendmentChoices: Partial<Record<string, AmendmentChoice>>;
  amendmentTexts: Partial<Record<string, string>>;
  workingPaper: boolean;
  votes: Partial<Record<CountryId, Ballot>> | null;
  revealedVotes: number;
  score: SessionScore | null;
  reflection: string;
  archived: boolean;
  formalStartedAt: number | null;
  presentations: PresentationReview[];
  lastNotice: Notice | null;
}
