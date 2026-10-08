import type { OfficialLang } from "@/i18n/languages";

export interface SpeechLexicon {
  country: string[];
  reason: string[];
  solution: string[];
  evidence: string[];
  opening: string[];
  closing: string[];
  slips: string[];
  attack: string[];
  support: string[];
  contrast: string[];
  mechanisms: string[];
}

export const LEXICON: Record<OfficialLang, SpeechLexicon> = {
  zh: {
    country: ["肯尼亞", "本代表團", "代表團", "我國", "本國"],
    reason: ["因為", "因此", "所以", "然而", "但是", "但係", "若", "若果", "如果", "同時", "否則"],
    solution: ["贈款", "社區", "預警", "報告", "申請", "窗口", "資格", "債務"],
    evidence: ["資料", "根據", "研究"],
    opening: ["主席", "各位代表", "尊敬的"],
    closing: ["謝謝", "唔該", "多謝"],
    slips: ["我覺得", "我想", "我認為", "我希望", "我個人", "我要"],
    attack: ["愚蠢", "胡說", "閉嘴", "垃圾", "可笑", "笨蛋", "廢物"],
    support: ["因為", "因此", "所以", "這表示", "可見", "意味", "如果", "若", "支持"],
    contrast: ["然而", "但是", "不過", "可是", "相反", "不足", "忽略", "無法", "不能", "反而", "沒有處理", "問題在於"],
    mechanisms: ["贈款", "貸款", "債務", "報告", "審計", "社區", "青年", "自願", "治理", "席位", "預警", "自然", "生態", "義務", "公共", "程序", "簡化", "南南", "保險", "窗口", "凍結"],
  },
  en: {
    country: ["kenya", "kenyan delegation", "this delegation", "our country"],
    reason: ["because", "therefore", "so that", "however", "but", "if"],
    solution: ["grant", "community", "early warning", "report", "application", "window", "eligib", "debt"],
    evidence: ["data", "according", "report", "evidence"],
    opening: ["chair", "mr. president", "madam president", "distinguished delegates", "fellow delegates"],
    closing: ["thank you", "thanks"],
    slips: ["i think", "i believe", "i hope", "i want", "in my opinion"],
    attack: ["stupid", "idiot", "shut up", "ridiculous", "garbage"],
    support: ["because", "therefore", "this shows", "if", "support"],
    contrast: ["however", "but", "instead", "fails to", "does not address", "the problem is"],
    mechanisms: ["grant", "loan", "debt", "report", "audit", "community", "youth", "voluntary", "governance", "seat", "warning", "nature", "ecosystem", "obligation", "public", "procedure", "south-south", "insurance", "window", "freeze"],
  },
  fr: {
    country: ["kenya", "délégation du kenya", "délégation kényane", "notre pays"],
    reason: ["parce que", "donc", "cependant", "mais", "si"],
    solution: ["don", "subvention", "communauté", "alerte précoce", "rapport", "demande", "fenêtre", "éligib", "dette"],
    evidence: ["données", "selon", "rapport", "preuve"],
    opening: ["monsieur le président", "madame la présidente", "président", "distingués délégués"],
    closing: ["merci", "je vous remercie"],
    slips: ["je pense", "je crois", "j'espère", "je veux", "à mon avis"],
    attack: ["stupide", "idiot", "tais-toi", "ridicule"],
    support: ["parce que", "donc", "cela montre", "si", "souten"],
    contrast: ["cependant", "mais", "en revanche", "ne traite pas", "le problème est"],
    mechanisms: ["subvention", "don", "prêt", "dette", "rapport", "audit", "communauté", "jeunesse", "volontaire", "gouvernance", "siège", "alerte", "nature", "écosystème", "obligation", "public", "procédure", "sud-sud", "assurance", "fenêtre", "gel"],
  },
  es: {
    country: ["kenia", "delegación de kenia", "nuestro país"],
    reason: ["porque", "por tanto", "sin embargo", "pero", "si"],
    solution: ["donación", "subvención", "comunidad", "alerta temprana", "informe", "solicitud", "ventana", "eligib", "deuda"],
    evidence: ["datos", "según", "informe", "prueba"],
    opening: ["señor presidente", "señora presidenta", "presidente", "distinguidos delegados"],
    closing: ["gracias"],
    slips: ["yo creo", "yo pienso", "espero que", "yo quiero", "en mi opinión"],
    attack: ["estúpido", "idiota", "cállate", "ridículo"],
    support: ["porque", "por tanto", "esto muestra", "si", "apoy"],
    contrast: ["sin embargo", "pero", "en cambio", "no aborda", "el problema es"],
    mechanisms: ["subvención", "donación", "préstamo", "deuda", "informe", "auditoría", "comunidad", "juventud", "voluntari", "gobernanza", "asiento", "alerta", "naturaleza", "ecosistema", "obligación", "públic", "procedimiento", "sur-sur", "seguro", "ventana", "congel"],
  },
  ru: {
    country: ["кени", "делегация кении", "наша страна"],
    reason: ["потому что", "поэтому", "однако", "но", "если"],
    solution: ["грант", "общин", "раннее предупреждение", "отчет", "отчёт", "заявк", "окно", "критери", "долг"],
    evidence: ["данные", "согласно", "отчет", "отчёт", "доказатель"],
    opening: ["господин председатель", "госпожа председатель", "председатель", "уважаемые делегаты"],
    closing: ["благодарю", "спасибо"],
    slips: ["я думаю", "я считаю", "я надеюсь", "я хочу", "по моему мнению"],
    attack: ["глупый", "идиот", "замолчи", "смешно"],
    support: ["потому что", "поэтому", "это показывает", "если", "поддержива"],
    contrast: ["однако", "но", "вместо этого", "не рассматривает", "проблема в том"],
    mechanisms: ["грант", "заём", "заем", "долг", "отчет", "отчёт", "аудит", "общин", "молодеж", "молодёж", "доброволь", "управлени", "место", "предупрежден", "природ", "экосистем", "обязатель", "публич", "процедур", "юг-юг", "страхован", "окно", "замороз"],
  },
  ar: {
    country: ["كينيا", "وفد كينيا", "بلدنا"],
    reason: ["لأن", "لذلك", "لكن", "إذا", "غير أن"],
    solution: ["منحة", "منح", "مجتمع", "إنذار مبكر", "تقرير", "طلب", "نافذة", "أهلية", "دين"],
    evidence: ["بيانات", "وفقا", "تقرير", "دليل"],
    opening: ["السيد الرئيس", "السيدة الرئيسة", "الرئيس", "المندوبون الكرام"],
    closing: ["شكرا", "شكرًا"],
    slips: ["أعتقد", "أظن", "آمل", "أريد", "في رأيي"],
    attack: ["غبي", "أحمق", "اصمت", "سخيف"],
    support: ["لأن", "لذلك", "هذا يدل", "إذا", "ندعم"],
    contrast: ["لكن", "غير أن", "بدلا من ذلك", "لا يعالج", "المشكلة هي"],
    mechanisms: ["منحة", "قرض", "دين", "تقرير", "تدقيق", "مجتمع", "شباب", "طوعي", "حوكمة", "مقعد", "إنذار", "طبيعة", "نظام بيئي", "التزام", "عام", "إجراء", "جنوب جنوب", "تأمين", "نافذة", "تجميد"],
  },
};

function markerHits(hay: string, marker: string): boolean {
  if (!marker) return false;
  const needle = marker.toLowerCase();
  const shortWord = needle.length <= 4 && !needle.includes(" ");
  if (!shortWord) return hay.includes(needle);
  const escaped = needle.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`(?:^|[^\\p{L}\\p{N}])${escaped}(?:$|[^\\p{L}\\p{N}])`, "iu").test(hay);
}

export function includesMarker(text: string, markers: string[]): boolean {
  const hay = text.toLowerCase();
  return markers.some((marker) => markerHits(hay, marker));
}

export function countMarkers(text: string, markers: string[]): number {
  const hay = text.toLowerCase();
  return markers.reduce((sum, marker) => sum + (markerHits(hay, marker) ? 1 : 0), 0);
}
