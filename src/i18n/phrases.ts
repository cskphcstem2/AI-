import { EDUCATION_ROWS } from "@/i18n/phraseEducation";
import { FLOOR_ROWS } from "@/i18n/phraseFloor";
import { AUTH_ROWS } from "@/i18n/phraseAuth";
import { BODY_ROWS } from "@/i18n/phraseBody";
import { FACT_ROWS } from "@/i18n/phraseFacts";
import { ONLINE_ROWS } from "@/i18n/phraseOnline";
import { PEOPLE_ROWS } from "@/i18n/phrasePeople";
import { REST_ROWS } from "@/i18n/phraseRest";
import { phraseMap, type PhraseRow } from "@/i18n/phraseRows";
import { RUBRIC_ROWS } from "@/i18n/phraseRubric";
import { SCENE_ROWS } from "@/i18n/phraseScene";
import { SOURCE_ROWS } from "@/i18n/phraseSources";
import { TALK_ROWS } from "@/i18n/phraseTalks";
import { CASE_ROWS } from "@/i18n/phraseCases";
import { UI_ROWS } from "@/i18n/phraseUi";
import { SEAT_ROWS } from "@/i18n/phraseSeats";
import { TRIAL_ROWS } from "@/i18n/phraseTrial";
import { VOICE_ROWS } from "@/i18n/phraseVoice";

const GROUPS: PhraseRow[][] = [
  UI_ROWS,
  SCENE_ROWS,
  BODY_ROWS,
  FACT_ROWS,
  PEOPLE_ROWS,
  TALK_ROWS,
  REST_ROWS,
  VOICE_ROWS,
  TRIAL_ROWS,
  SEAT_ROWS,
  EDUCATION_ROWS,
  FLOOR_ROWS,
  AUTH_ROWS,
  RUBRIC_ROWS,
  SOURCE_ROWS,
  ONLINE_ROWS,
  CASE_ROWS,
];

export const PHRASES = phraseMap(GROUPS.flat());
