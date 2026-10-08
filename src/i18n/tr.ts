import type { OfficialLang } from "@/i18n/languages";
import { PHRASES } from "@/i18n/phrases";

const LEAD: Record<Exclude<OfficialLang, "zh">, string> = {
  en: "We propose: ",
  fr: "Nous proposons : ",
  es: "Proponemos: ",
  ru: "Мы предлагаем: ",
  ar: "نقترح: ",
};

const CLAIM: Record<Exclude<OfficialLang, "zh">, string> = {
  en: "Kenya's opening claim: ",
  fr: "Position d'ouverture du Kenya : ",
  es: "Planteamiento inicial de Kenia: ",
  ru: "Вступительная позиция Кении: ",
  ar: "موقف كينيا الافتتاحي: ",
};

function pack(
  lang: Exclude<OfficialLang, "zh">,
  en: string,
  fr: string,
  es: string,
  ru: string,
  ar: string,
): string {
  if (lang === "en") return en;
  if (lang === "fr") return fr;
  if (lang === "es") return es;
  if (lang === "ru") return ru;
  return ar;
}

function pattern(lang: Exclude<OfficialLang, "zh">, source: string): string | null {
  const goalCount = /^(\d+) 個目標，每個兩到三個例子，共 (\d+) 個$/.exec(source);
  if (goalCount) {
    const goals = goalCount[1] ?? "";
    const total = goalCount[2] ?? "";
    return pack(
      lang,
      `${goals} goals, two or three examples each, ${total} in total`,
      `${goals} objectifs, deux ou trois exemples chacun, ${total} au total`,
      `${goals} objetivos, dos o tres ejemplos cada uno, ${total} en total`,
      `${goals} целей, по два или три примера, всего ${total}`,
      `${goals} أهدافًا، مثالان أو ثلاثة لكل هدف، ${total} في المجموع`,
    );
  }
  const exampleNote = /^(\d+) 個例子。選一個，再去選國家。這一組國家可以和其他例子不同。$/.exec(source);
  if (exampleNote) {
    const count = exampleNote[1] ?? "";
    const ar =
      count === "2"
        ? "مثالان. اختر واحدًا، ثم اختر بلدًا. قد تختلف بلدان هذه المجموعة عن بلدان الأمثلة الأخرى."
        : `${count} أمثلة. اختر واحدًا، ثم اختر بلدًا. قد تختلف بلدان هذه المجموعة عن بلدان الأمثلة الأخرى.`;
    return pack(
      lang,
      `${count} examples. Select one, then select a country. The countries in this set may differ from those in the other examples.`,
      `${count} exemples. Sélectionnez-en un, puis sélectionnez un pays. Les pays de cet ensemble peuvent différer de ceux des autres exemples.`,
      `${count} ejemplos. Seleccione uno y, a continuación, seleccione un país. Los países de este conjunto pueden diferir de los de los demás ejemplos.`,
      `${count} примера. Выберите один, затем выберите страну. Страны в этом наборе могут отличаться от стран в других примерах.`,
      ar,
    );
  }
  const exampleLabel = /^例子 (\d+)$/.exec(source);
  if (exampleLabel) {
    const n = exampleLabel[1] ?? "";
    return pack(lang, `Example ${n}`, `Exemple ${n}`, `Ejemplo ${n}`, `Пример ${n}`, `المثال ${n}`);
  }
  const quizLine = /^答對 (\d+)\/(\d+)。高於五成才能進入下一頁。$/.exec(source);
  if (quizLine) {
    const correct = quizLine[1] ?? "";
    const total = quizLine[2] ?? "";
    return pack(
      lang,
      `${correct}/${total} correct. More than half is required to continue.`,
      `${correct}/${total} justes. Il faut plus de la moitié pour continuer.`,
      `${correct}/${total} correctas. Hace falta más de la mitad para continuar.`,
      `${correct}/${total} верно. Чтобы продолжить, нужно больше половины.`,
      `${correct}/${total} صحيحة. يلزم أكثر من النصف للمتابعة.`,
    );
  }
  const sdgLabel = /^可持續發展目標 (\d+)$/.exec(source);
  if (sdgLabel) {
    const n = sdgLabel[1] ?? "";
    return pack(lang, `SDG ${n}`, `ODD ${n}`, `ODS ${n}`, `ЦУР ${n}`, `الهدف ${n}`);
  }
  if (source.startsWith("我們提出：")) {
    return LEAD[lang] + tr(lang, source.slice("我們提出：".length));
  }
  if (source.startsWith("肯尼亞開場主張：")) {
    return CLAIM[lang] + source.slice("肯尼亞開場主張：".length);
  }
  const claimAny = /^(.+)開場主張：([\s\S]*)$/.exec(source);
  if (claimAny) {
    const name = tr(lang, claimAny[1] ?? "");
    const rest = claimAny[2] ?? "";
    return pack(
      lang,
      `${name}'s opening claim: ${rest}`,
      `Position d'ouverture : ${name} : ${rest}`,
      `Planteamiento inicial de ${name}: ${rest}`,
      `Вступительная позиция — ${name}: ${rest}`,
      `موقف ${name} الافتتاحي: ${rest}`,
    );
  }
  const yourSeat = /^你的席位是(.+)。$/.exec(source);
  if (yourSeat) {
    const name = tr(lang, yourSeat[1] ?? "");
    return pack(
      lang,
      `Your seat is ${name}.`,
      `Ton siège est ${name}.`,
      `Tu asiento es ${name}.`,
      `Ваше место — ${name}.`,
      `مقعدك هو ${name}.`,
    );
  }
  const attendLong = /^(.+)代表出席。正式會議開始，請先提出你的基本看法。$/.exec(source);
  if (attendLong) {
    const name = tr(lang, attendLong[1] ?? "");
    return pack(
      lang,
      `The delegate of ${name} is present. The formal meeting begins. Please state your basic view first.`,
      `Le délégué de ${name} est présent. La réunion formelle commence. Donne d'abord ta vue de base.`,
      `El delegado de ${name} está presente. Empieza la reunión formal. Di primero tu visión básica.`,
      `Делегат ${name} присутствует. Формальное заседание начинается. Сначала скажите основную позицию.`,
      `مندوب ${name} حاضر. يبدأ الاجتماع الرسمي. اعرض رؤيتك الأساسية أولًا.`,
    );
  }
  const attend = /^(.+)代表出席$/.exec(source);
  if (attend) {
    const name = tr(lang, attend[1] ?? "");
    return pack(
      lang,
      `The delegate of ${name} is present`,
      `Le délégué de ${name} est présent`,
      `El delegado de ${name} está presente`,
      `Делегат ${name} присутствует`,
      `مندوب ${name} حاضر`,
    );
  }
  const byYou = /^由你代表(.+)發言$/.exec(source);
  if (byYou) {
    const name = tr(lang, byYou[1] ?? "");
    return pack(
      lang,
      `You speak for ${name}`,
      `Tu parles pour ${name}`,
      `Hablas por ${name}`,
      `Вы говорите от имени ${name}`,
      `تتكلم باسم ${name}`,
    );
  }
  const passedCore = /^主席宣布草案通過。(.+)的核心主張仍在文本中。這不是國際法，是你把證據、紅線和程序接在一起的訓練結果。$/.exec(source);
  if (passedCore) {
    const name = tr(lang, passedCore[1] ?? "");
    return pack(
      lang,
      `The chair declares the draft adopted. ${name}'s core claim is still in the text. This is not international law. It is a training result of connecting evidence, red lines, and procedure.`,
      `La présidence déclare le projet adopté. La position centrale de ${name} reste dans le texte. Ce n'est pas du droit international. C'est un exercice qui relie preuves, lignes rouges et procédure.`,
      `La presidencia declara aprobado el proyecto. La propuesta central de ${name} sigue en el texto. Esto no es derecho internacional. Es un ejercicio que une pruebas, líneas rojas y procedimiento.`,
      `Председатель объявляет проект принятым. Основная позиция ${name} остаётся в тексте. Это не международное право. Это тренировка: доказательства, красные линии и процедура.`,
      `يعلن الرئيس اعتماد المشروع. موقف ${name} الأساسي ما زال في النص. هذا ليس قانونًا دوليًا. هذه نتيجة تدريب تربط الأدلة والخطوط الحمراء والإجراء.`,
    );
  }

  let match = source.match(/^這次約 (\d+) 秒。(開場建議說 45–80 秒|這一輪建議說 25–50 秒)，把理由說完再停。$/);
  if (match) {
    const seconds = match[1] ?? "";
    const opening = match[2]?.startsWith("開場");
    return pack(
      lang,
      `About ${seconds} seconds this time. ${opening ? "Aim for 45–80 seconds in the opening" : "Aim for 25–50 seconds this round"}, and finish the reason before you stop.`,
      `Environ ${seconds} secondes. ${opening ? "L'ouverture vise 45–80 secondes" : "Ce tour vise 25–50 secondes"} : termine la raison avant de t'arrêter.`,
      `Unos ${seconds} segundos. ${opening ? "La apertura pide 45–80 segundos" : "Esta ronda pide 25–50 segundos"}: termina la razón antes de parar.`,
      `Около ${seconds} секунд. ${opening ? "Во вступительном слове нужно 45–80 секунд" : "В этом раунде нужно 25–50 секунд"}: закончите причину, прежде чем остановиться.`,
      `حوالي ${seconds} ثانية. ${opening ? "الافتتاح يحتاج 45–80 ثانية" : "هذه الجولة تحتاج 25–50 ثانية"}، أكمل السبب قبل أن تتوقف.`,
    );
  }

  match = source.match(/^還太短（目前 (\d+) 字，至少 (\d+) 字）。寫清主張，以及它為什麼跟現在這個問題有關。$/);
  if (match) {
    return pack(
      lang,
      `Still too short (${match[1]} characters now, at least ${match[2]}). State the claim and why it belongs to this question.`,
      `Encore trop court (${match[1]} caractères, au moins ${match[2]}). Dis la position et pourquoi elle répond à cette question.`,
      `Todavía es corto (${match[1]} caracteres, al menos ${match[2]}). Di la propuesta y por qué responde a esta pregunta.`,
      `Пока коротко (${match[1]} знаков, нужно не меньше ${match[2]}). Сформулируйте позицию и почему она относится к этому вопросу.`,
      `ما زال قصيرًا (${match[1]} حرفًا الآن، والمطلوب ${match[2]} على الأقل). اذكر الموقف ولماذا يتصل بهذا السؤال.`,
    );
  }

  match = source.match(/^本場論據指證最多 (\d+) 次。這一輪可以改用普通發言。$/);
  if (match) {
    return pack(
      lang,
      `Evidence points can be used at most ${match[1]} times. You can still make an ordinary speech this round.`,
      `Les points de preuve servent au plus ${match[1]} fois. Tu peux encore faire une intervention ordinaire.`,
      `Los puntos de evidencia se usan como máximo ${match[1]} veces. Aún puedes hacer una intervención ordinaria.`,
      `пункты доказательства можно использовать не больше ${match[1]} раз. В этом раунде ещё можно выступить без цитаты.`,
      `يمكن استخدام نقاط الدليل ${match[1]} مرات كحد أقصى. ما زال بإمكانك إلقاء كلمة عادية في هذه الجولة.`,
    );
  }

  match = source.match(/^論據已達上限（(\d+) 則）。先取消一則你不打算在會上負責的句子。$/);
  if (match) {
    return pack(
      lang,
      `Evidence points are at the cap (${match[1]}). Unmark one sentence you do not intend to stand behind.`,
      `Les points de preuve sont au plafond (${match[1]}). Retire une phrase dont tu ne veux pas répondre.`,
      `Los puntos de evidencia están al tope (${match[1]}). Quita una frase de la que no piensas hacerte cargo.`,
      `Пункты доказательства на потолке (${match[1]}). Снимите одну фразу, за которую не собираетесь отвечать.`,
      `نقاط الدليل بلغت الحد (${match[1]}). ألغِ جملة لا تنوي الدفاع عنها.`,
    );
  }

  match = source.match(/^畫線 (\d+)\/(\d+) · 指證剩餘 (\d+)$/);
  if (match) {
    return pack(
      lang,
      `Marked ${match[1]}/${match[2]} · challenges left ${match[3]}`,
      `Surlignées ${match[1]}/${match[2]} · défis restants ${match[3]}`,
      `Marcadas ${match[1]}/${match[2]} · retos restantes ${match[3]}`,
      `Отмечено ${match[1]}/${match[2]} · вызовов осталось ${match[3]}`,
      `محدد ${match[1]}/${match[2]} · الطعون المتبقية ${match[3]}`,
    );
  }

  match = source.match(/^畫線 (\d+)\/(\d+)$/);
  if (match) {
    return pack(
      lang,
      `Marked ${match[1]}/${match[2]}`,
      `Surlignées ${match[1]}/${match[2]}`,
      `Marcadas ${match[1]}/${match[2]}`,
      `Отмечено ${match[1]}/${match[2]}`,
      `محدد ${match[1]}/${match[2]}`,
    );
  }

  match = source.match(/^ · 上限 (\d+) 則$/);
  if (match) {
    return pack(
      lang,
      ` · cap ${match[1]}`,
      ` · plafond ${match[1]}`,
      ` · tope ${match[1]}`,
      ` · потолок ${match[1]}`,
      ` · الحد ${match[1]}`,
    );
  }

  match = source.match(/^長度還不夠展開一個完整看法。建議至少 (\d+) 字。$/);
  if (match) {
    return pack(
      lang,
      `This is not long enough for a full view. Aim for at least ${match[1]} characters.`,
      `Ce n'est pas assez long pour une position complète. Vise au moins ${match[1]} caractères.`,
      `No alcanza para una postura completa. Apunta al menos a ${match[1]} caracteres.`,
      `Этого мало для цельной позиции. Нужно хотя бы ${match[1]} знаков.`,
      `هذا لا يكفي لعرض موقف كامل. استهدف ${match[1]} حرفًا على الأقل.`,
    );
  }

  match = source.match(
    /^這次(支持|反駁)在結構上成立：你選了對得上問題的論據，並寫出了自己的理由。這仍是結構檢查，不是在宣布你的價值觀正確。$/,
  );
  if (match) {
    const support = match[1] === "支持";
    return pack(
      lang,
      `This ${support ? "support" : "rebuttal"} holds structurally: the evidence point fits the question and you added your own reason. This checks structure, not whether your values are right.`,
      `Ce ${support ? "soutien" : "contre-argument"} tient sur la structure : le point de preuve correspond à la question et tu as ajouté ta raison. On vérifie la structure, pas tes valeurs.`,
      `Este ${support ? "apoyo" : "réplica"} se sostiene en la estructura: el punto de evidencia encaja con la pregunta y añadiste tu razón. Se revisa la estructura, no tus valores.`,
      `Это ${support ? "поддержка" : "возражение"} выдержано по структуре: цитата подходит к вопросу, и вы добавили свою причину. Проверяется структура, а не правота ценностей.`,
      `هذا ${support ? "التأييد" : "الرد"} مقبول من حيث البنية: اخترت نقطة دليل تناسب السؤال وأضفت سببك. هذا فحص للبنية وليس حكمًا على قيمك.`,
    );
  }

  match = source.match(
    /^有秩序動議 (\d+) 次介入，其中 (\d+) 次在結構上成立。成立只代表理由接得上論據，不代表立場自動正確。$/,
  );
  if (match) {
    return pack(
      lang,
      `${match[1]} interventions in the moderated debate, ${match[2]} structurally valid. Valid means the reason connects to the evidence point, not that the position is automatically right.`,
      `${match[1]} interventions au débat dirigé, dont ${match[2]} valides sur la structure. Valide veut dire que la raison rejoint le point de preuve, pas que la position est juste.`,
      `${match[1]} intervenciones en el debate moderado, ${match[2]} válidas en la estructura. Válido significa que la razón se une al punto de evidencia, no que la postura sea correcta.`,
      `В организованных прениях ${match[1]} выступлений, из них ${match[2]} структурно состоятельны. Это значит, что причина связана с цитатой, а не что позиция верна.`,
      `${match[1]} مداخلات في النقاش المنظم، منها ${match[2]} مقبولة بنيويًا. القبول يعني أن السبب يتصل بنقطة الدليل، لا أن الموقف صحيح تلقائيًا.`,
    );
  }

  match = source.match(/^連署 (\d+) 席，未達 (\d+) 席，草案以工作文件進入表決。$/);
  if (match) {
    return pack(
      lang,
      `${match[1]} cosponsors, short of ${match[2]}. The text goes to a vote as a working paper.`,
      `${match[1]} coparrainages, en dessous de ${match[2]}. Le texte passe au vote comme document de travail.`,
      `${match[1]} copatrocinios, por debajo de ${match[2]}. El texto pasa a votación como documento de trabajo.`,
      `${match[1]} соавторов, нужно ${match[2]}. Текст идёт на голосование как рабочий документ.`,
      `${match[1]} من المشاركين في التقديم، والمطلوب ${match[2]}. يدخل النص التصويت بوصفه ورقة عمل.`,
    );
  }

  match = source.match(/^你爭取到 (\d+) 席連署，本場門檻是 (\d+) 席。$/);
  if (match) {
    return pack(
      lang,
      `You secured ${match[1]} cosponsors. This session needs ${match[2]}.`,
      `Tu as obtenu ${match[1]} coparrainages. Le seuil de cette séance est ${match[2]}.`,
      `Conseguiste ${match[1]} copatrocinios. El umbral de esta sesión es ${match[2]}.`,
      `Вы получили ${match[1]} соавторов. Порог этой сессии — ${match[2]}.`,
      `حصلت على ${match[1]} من المشاركين في التقديم. عتبة هذه الجلسة ${match[2]}.`,
    );
  }

  match = source.match(/^最近表現平均 (\d+)，下一場提高論證與連署門檻。$/);
  if (match) {
    return pack(
      lang,
      `Recent average ${match[1]}. The next session raises the bar for argument and cosponsors.`,
      `Moyenne récente ${match[1]}. La prochaine séance relève le seuil d'argumentation et de coparrainage.`,
      `Promedio reciente ${match[1]}. La próxima sesión sube el umbral de argumento y copatrocinio.`,
      `Недавнее среднее ${match[1]}. В следующей сессии выше порог аргумента и соавторства.`,
      `المتوسط الأخير ${match[1]}. الجلسة التالية ترفع عتبة الحجة والمشاركة في التقديم.`,
    );
  }

  match = source.match(/^最近表現平均 (\d+)，下一場改為入門：結構提示更多，連署門檻較低。$/);
  if (match) {
    return pack(
      lang,
      `Recent average ${match[1]}. The next session is introductory: more structure hints, a lower cosponsor bar.`,
      `Moyenne récente ${match[1]}. La prochaine séance est d'initiation : plus d'indications de structure, seuil de coparrainage plus bas.`,
      `Promedio reciente ${match[1]}. La próxima sesión es de inicio: más pistas de estructura y un umbral de copatrocinio más bajo.`,
      `Недавнее среднее ${match[1]}. Следующая сессия вводная: больше подсказок по структуре и ниже порог соавторства.`,
      `المتوسط الأخير ${match[1]}. الجلسة التالية للمبتدئين: إرشادات بنيوية أكثر وعتبة مشاركة أقل.`,
    );
  }

  match = source.match(/^最近表現平均 (\d+)，維持標準難度。$/);
  if (match) {
    return pack(
      lang,
      `Recent average ${match[1]}. Difficulty stays standard.`,
      `Moyenne récente ${match[1]}. La difficulté reste standard.`,
      `Promedio reciente ${match[1]}. La dificultad se mantiene estándar.`,
      `Недавнее среднее ${match[1]}. Сложность остаётся стандартной.`,
      `المتوسط الأخير ${match[1]}. تبقى الصعوبة قياسية.`,
    );
  }

  match = source.match(/^已有 (\d+) 席連署，可以處理修正案。$/);
  if (match) {
    return pack(
      lang,
      `${match[1]} delegations will cosponsor. You can take up the amendments.`,
      `${match[1]} délégations coparrainent. Tu peux passer aux amendements.`,
      `${match[1]} delegaciones copatrocinan. Puedes pasar a las enmiendas.`,
      `${match[1]} делегаций готовы стать соавторами. Можно переходить к поправкам.`,
      `${match[1]} وفود تشارك في التقديم. يمكنك معالجة التعديلات.`,
    );
  }

  match = source.match(/^目前 (\d+) 席願意連署，正式草案需要 (\d+) 席。$/);
  if (match) {
    return pack(
      lang,
      `${match[1]} will cosponsor now. A formal draft needs ${match[2]}.`,
      `${match[1]} acceptent de coparrainer. Un projet formel exige ${match[2]}.`,
      `${match[1]} quieren copatrocinar. Un proyecto formal necesita ${match[2]}.`,
      `Сейчас готовы ${match[1]}. Для официального проекта нужно ${match[2]}.`,
      `${match[1]} مستعدون للمشاركة في التقديم الآن. المشروع الرسمي يحتاج ${match[2]}.`,
    );
  }

  match = source.match(/^已畫 (\d+)\/10 · 至少 (\d+) 則$/);
  if (match) {
    return pack(
      lang,
      `Marked ${match[1]}/10 · at least ${match[2]}`,
      `Surlignées ${match[1]}/10 · au moins ${match[2]}`,
      `Marcadas ${match[1]}/10 · al menos ${match[2]}`,
      `Отмечено ${match[1]}/10 · минимум ${match[2]}`,
      `حُددت ${match[1]}/10 · على الأقل ${match[2]}`,
    );
  }

  match = source.match(/^理解檢測 · (\d+)\/(\d+)$/);
  if (match) {
    return pack(
      lang,
      `Comprehension · ${match[1]}/${match[2]}`,
      `Compréhension · ${match[1]}/${match[2]}`,
      `Comprensión · ${match[1]}/${match[2]}`,
      `Проверка понимания · ${match[1]}/${match[2]}`,
      `اختبار الفهم · ${match[1]}/${match[2]}`,
    );
  }

  match = source.match(/^有秩序動議 · 問題 (\d+)\/(\d+)$/);
  if (match) {
    return pack(
      lang,
      `Moderated debate · question ${match[1]}/${match[2]}`,
      `Débat dirigé · question ${match[1]}/${match[2]}`,
      `Debate moderado · pregunta ${match[1]}/${match[2]}`,
      `Организованные прения · вопрос ${match[1]}/${match[2]}`,
      `نقاش منظم · السؤال ${match[1]}/${match[2]}`,
    );
  }

  match = source.match(/^論據指證剩餘 (\d+) 次。用完之後仍可普通發言。$/);
  if (match) {
    return pack(
      lang,
      `${match[1]} evidence-point challenges left. After that you can still speak without one.`,
      `Il reste ${match[1]} usages de point de preuve. Ensuite tu peux encore intervenir sans elle.`,
      `Quedan ${match[1]} usos de punto de evidencia. Después aún puedes hablar sin él.`,
      `Осталось ${match[1]} использований пункты доказательства. Потом всё ещё можно выступить без неё.`,
      `تبقّى ${match[1]} من استخدامات نقطة الدليل. بعد ذلك يمكنك الكلام بدونها.`,
    );
  }

  match = source.match(/^畫線 (\d+)\/10$/);
  if (match) {
    return pack(lang, `Marked ${match[1]}/10`, `Surlignées ${match[1]}/10`, `Marcadas ${match[1]}/10`, `Отмечено ${match[1]}/10`, `حُددت ${match[1]}/10`);
  }

  match = source.match(/^畫線 (\d+)\/10 · 指證剩餘 (\d+)$/);
  if (match) {
    return pack(
      lang,
      `Marked ${match[1]}/10 · ${match[2]} challenges left`,
      `Surlignées ${match[1]}/10 · ${match[2]} usages restants`,
      `Marcadas ${match[1]}/10 · quedan ${match[2]} usos`,
      `Отмечено ${match[1]}/10 · осталось ${match[2]}`,
      `حُددت ${match[1]}/10 · تبقّى ${match[2]}`,
    );
  }

  match = source.match(/^停止並評分 · (\d+) 秒$/);
  if (match) {
    return pack(
      lang,
      `Stop and score · ${match[1]} s`,
      `Arrêter et noter · ${match[1]} s`,
      `Parar y puntuar · ${match[1]} s`,
      `Стоп и оценка · ${match[1]} с`,
      `إيقاف وتقييم · ${match[1]} ث`,
    );
  }

  match = source.match(/^講稿可以先寫，也可以把右側論據插進講稿。正式發言請按「開始發言」，說完才會計入會議。至少說到 (\d+) 字。$/);
  if (match) {
    return pack(
      lang,
      `You may draft notes first, and insert an evidence point from the tray. Press “Start speaking” for the floor. Only what you say is entered. Aim for at least ${match[1]} characters.`,
      `Tu peux écrire un brouillon et y insérer un point de preuve. Pour la salle, appuie sur « Commencer ». Seul ce que tu dis est inscrit. Vise au moins ${match[1]} caractères.`,
      `Puedes escribir un borrador e insertar un punto de evidencia. En el pleno pulsa «Empezar a hablar». Solo entra lo que dices. Apunta al menos a ${match[1]} caracteres.`,
      `Можно сначала написать текст и вставить пункт доказательства. Для зала нажмите «Начать выступление». В протокол идёт только сказанное. Нужно хотя бы ${match[1]} знаков.`,
      `يمكنك كتابة مسودة أولًا وإدراج نقطة الدليل. للكلمة الرسمية اضغط «ابدأ الكلام». ما يُسجَّل هو ما تقوله. استهدف ${match[1]} حرفًا على الأقل.`,
    );
  }

  match = source.match(/^在下面寫出你的開場主張。右側論據可以插進句子。送出之後這段文字會記入會議，秘書處整理後會收成論據。至少寫到 (\d+) 字。$/);
  if (match) {
    return pack(
      lang,
      `Write your opening claim below. You may insert an evidence point from the tray. After you send it, this text is entered in the meeting, and the secretariat will turn it into an evidence point. Aim for at least ${match[1]} characters.`,
      `Écris ta position d'ouverture ci-dessous. Tu peux y insérer un point de preuve. Après l'envoi, ce texte entre dans la réunion, et le secrétariat en fera un point de preuve. Vise au moins ${match[1]} caractères.`,
      `Escribe abajo tu planteamiento inicial. Puedes insertar un punto de evidencia. Al enviarlo, este texto entra en la reunión y la secretaría lo convertirá en un punto de evidencia. Apunta al menos a ${match[1]} caracteres.`,
      `Напишите ниже вступительную позицию. Можно вставить пункт доказательства. После отправки этот текст войдёт в заседание, и секретариат сделает из него пункт доказательства. Нужно хотя бы ${match[1]} знаков.`,
      `اكتب أدناه موقفك الافتتاحي. يمكنك إدراج نقطة الدليل. بعد الإرسال يُسجَّل هذا النص في الاجتماع، وتحوّله الأمانة إلى نقطة الدليل. استهدف ${match[1]} حرفًا على الأقل.`,
    );
  }

  match = source.match(/^你還有 (\d+) 次接觸。$/);
  if (match) {
    return pack(
      lang,
      `You have ${match[1]} contacts left.`,
      `Il te reste ${match[1]} contacts.`,
      `Te quedan ${match[1]} contactos.`,
      `Осталось контактов: ${match[1]}.`,
      `تبقّى لك ${match[1]} من اللقاءات.`,
    );
  }

  match = source.match(/^ · (\d+) 則$/);
  if (match) {
    return pack(lang, ` · ${match[1]}`, ` · ${match[1]}`, ` · ${match[1]}`, ` · ${match[1]}`, ` · ${match[1]}`);
  }

  match = source.match(/^返回非監管式議會（還有 (\d+) 次）$/);
  if (match) {
    return pack(
      lang,
      `Back to the unmoderated caucus (${match[1]} left)`,
      `Retour au débat non dirigé (${match[1]} restants)`,
      `Volver al caucus no moderado (quedan ${match[1]})`,
      `Назад к неофициальным консультациям (осталось ${match[1]})`,
      `العودة إلى المشاورات غير الرسمية (تبقّى ${match[1]})`,
    );
  }

  match = source.match(/^連署 (\d+)\/(\d+)$/);
  if (match) {
    return pack(
      lang,
      `Cosponsors ${match[1]}/${match[2]}`,
      `Coparrainages ${match[1]}/${match[2]}`,
      `Copatrocinios ${match[1]}/${match[2]}`,
      `Соавторы ${match[1]}/${match[2]}`,
      `المشاركون في التقديم ${match[1]}/${match[2]}`,
    );
  }

  match = source.match(/^第 (\d+) 段 · (.+)$/);
  if (match) {
    return pack(
      lang,
      `Paragraph ${match[1]} · ${tr(lang, match[2] ?? "")}`,
      `Paragraphe ${match[1]} · ${tr(lang, match[2] ?? "")}`,
      `Párrafo ${match[1]} · ${tr(lang, match[2] ?? "")}`,
      `Пункт ${match[1]} · ${tr(lang, match[2] ?? "")}`,
      `الفقرة ${match[1]} · ${tr(lang, match[2] ?? "")}`,
    );
  }

  match = source.match(/^修正案 (\d+)\/(\d+)$/);
  if (match) {
    return pack(
      lang,
      `Amendment ${match[1]}/${match[2]}`,
      `Amendement ${match[1]}/${match[2]}`,
      `Enmienda ${match[1]}/${match[2]}`,
      `Поправка ${match[1]}/${match[2]}`,
      `التعديل ${match[1]}/${match[2]}`,
    );
  }

  match = source.match(/^請(.+)代表發言$/);
  if (match) {
    const name = tr(lang, match[1] ?? "");
    return pack(
      lang,
      `Call on ${name}`,
      `Donner la parole à ${name}`,
      `Dar la palabra a ${name}`,
      `Предоставить слово: ${name}`,
      `أعطِ الكلمة لـ${name}`,
    );
  }

  match = source.match(/^送出給(.+)$/);
  if (match) {
    const name = tr(lang, match[1] ?? "");
    return pack(lang, `Send to ${name}`, `Envoyer à ${name}`, `Enviar a ${name}`, `Отправить: ${name}`, `إرسال إلى ${name}`);
  }

  match = source.match(/^唱名：(.+)$/);
  if (match) {
    const name = tr(lang, match[1] ?? "");
    return pack(lang, `Roll call: ${name}`, `Appel : ${name}`, `Pase de lista: ${name}`, `Поимённое голосование: ${name}`, `المناداة: ${name}`);
  }

  match = source.match(/^連署：(.+)$/);
  if (match) {
    const names = (match[1] ?? "")
      .split("、")
      .map((part) => tr(lang, part))
      .join(", ");
    return pack(lang, `Cosponsors: ${names}`, `Coparrains : ${names}`, `Copatrocinadores: ${names}`, `Соавторы: ${names}`, `المشاركون في التقديم: ${names}`);
  }

  match = source.match(/^帳號存檔 · (.+) · (.+)$/);
  if (match) {
    return pack(
      lang,
      `Account save · ${tr(lang, match[1] ?? "")} · ${match[2]}`,
      `Sauvegarde du compte · ${tr(lang, match[1] ?? "")} · ${match[2]}`,
      `Guardado de la cuenta · ${tr(lang, match[1] ?? "")} · ${match[2]}`,
      `Сохранение аккаунта · ${tr(lang, match[1] ?? "")} · ${match[2]}`,
      `حفظ الحساب · ${tr(lang, match[1] ?? "")} · ${match[2]}`,
    );
  }

  match = source.match(/^已超出建議 (\d{2}:\d{2})$/);
  if (match) {
    return pack(
      lang,
      `Past the suggested time ${match[1]}`,
      `Au-delà du temps suggéré ${match[1]}`,
      `Pasado el tiempo sugerido ${match[1]}`,
      `Сверх рекомендуемого времени ${match[1]}`,
      `تجاوز الوقت المقترح ${match[1]}`,
    );
  }

  match = source.match(/^建議剩餘 (\d{2}:\d{2})$/);
  if (match) {
    return pack(
      lang,
      `Suggested time left ${match[1]}`,
      `Temps suggéré restant ${match[1]}`,
      `Tiempo sugerido restante ${match[1]}`,
      `Осталось по ориентиру ${match[1]}`,
      `الوقت المقترح المتبقي ${match[1]}`,
    );
  }

  match = source.match(/^論據 (\d+)$/);
  if (match) {
    return pack(
      lang,
      `Bullets ${match[1]}`,
      `Balles ${match[1]}`,
      `Balas ${match[1]}`,
      `Пункты доказательства ${match[1]}`,
      `نقاط الدليل ${match[1]}`,
    );
  }

  match = source.match(/^ · 上限 (\d+) 則$/);
  if (match) {
    return pack(lang, ` · limit ${match[1]}`, ` · limite ${match[1]}`, ` · límite ${match[1]}`, ` · предел ${match[1]}`, ` · الحد ${match[1]}`);
  }

  match = source.match(/^秘書處摘要 · (.+)開場$/);
  if (match) {
    const name = tr(lang, match[1] ?? "");
    return pack(
      lang,
      `Secretariat summary · ${name} opening`,
      `Résumé du secrétariat · ouverture de ${name}`,
      `Resumen de la secretaría · apertura de ${name}`,
      `Сводка секретариата · вступительное слово: ${name}`,
      `ملخص الأمانة · افتتاح ${name}`,
    );
  }

  match = source.match(/^贊成 (\d+) · 反對 (\d+) · 棄權 (\d+)$/);
  if (match) {
    return pack(
      lang,
      `Yes ${match[1]} · No ${match[2]} · Abstain ${match[3]}`,
      `Pour ${match[1]} · Contre ${match[2]} · Abstention ${match[3]}`,
      `A favor ${match[1]} · En contra ${match[2]} · Abstención ${match[3]}`,
      `За ${match[1]} · Против ${match[2]} · Воздержались ${match[3]}`,
      `مع ${match[1]} · ضد ${match[2]} · امتناع ${match[3]}`,
    );
  }

  match = source.match(/^綜合 (\d+) · 難度 (.+) · 理解題 (\d+)\/(\d+)$/);
  if (match) {
    const level = tr(lang, match[2] ?? "");
    return pack(
      lang,
      `Overall ${match[1]} · ${level} · quiz ${match[3]}/${match[4]}`,
      `Global ${match[1]} · ${level} · quiz ${match[3]}/${match[4]}`,
      `Global ${match[1]} · ${level} · prueba ${match[3]}/${match[4]}`,
      `Итог ${match[1]} · ${level} · тест ${match[3]}/${match[4]}`,
      `الإجمالي ${match[1]} · ${level} · الاختبار ${match[3]}/${match[4]}`,
    );
  }

  match = source.match(/^共 (\d+) 次發言。立場 (.+) · 論證 (.+) · 證據 (.+) · 方案 (.+) · 扣題 (.+) · 表達 (.+) · 儀態 (.+)。口語場次的眼神和站姿沒有計入。$/);
  if (match) {
    return pack(
      lang,
      `${match[1]} speeches. Position ${match[2]} · reasoning ${match[3]} · evidence ${match[4]} · proposal ${match[5]} · focus ${match[6]} · delivery ${match[7]} · protocol ${match[8]}. Eye contact and posture were not scored on spoken turns.`,
      `${match[1]} prises de parole. Position ${match[2]} · raisonnement ${match[3]} · preuves ${match[4]} · proposition ${match[5]} · focus ${match[6]} · expression ${match[7]} · protocole ${match[8]}. Le regard et la posture ne sont pas notés à l'oral.`,
      `${match[1]} intervenciones. Postura ${match[2]} · razonamiento ${match[3]} · evidencia ${match[4]} · propuesta ${match[5]} · foco ${match[6]} · expresión ${match[7]} · protocolo ${match[8]}. La mirada y la postura no se puntúan en lo oral.`,
      `${match[1]} выступлений. Позиция ${match[2]} · обоснование ${match[3]} · доказательства ${match[4]} · предложение ${match[5]} · фокус ${match[6]} · подача ${match[7]} · протокол ${match[8]}. Взгляд и осанка в устных турах не оцениваются.`,
      `${match[1]} كلمات. الموقف ${match[2]} · التسبيب ${match[3]} · الأدلة ${match[4]} · الاقتراح ${match[5]} · التركيز ${match[6]} · الإلقاء ${match[7]} · البروتوكول ${match[8]}. لم يُقيَّم التواصل البصري ولا الوقفة في الجولات الشفهية.`,
    );
  }

  match = source.match(/^共 (\d+) 次發言。內容平均 (.+) · 表達平均 (.+) · 儀態平均 (.+)。眼神和站姿沒有計入。$/);
  if (match) {
    return pack(
      lang,
      `${match[1]} speeches. Content average ${match[2]} · delivery ${match[3]} · protocol ${match[4]}. Eye contact and posture were not scored.`,
      `${match[1]} prises de parole. Contenu ${match[2]} · expression ${match[3]} · protocole ${match[4]}. Le regard et la posture ne sont pas notés.`,
      `${match[1]} intervenciones. Contenido ${match[2]} · expresión ${match[3]} · protocolo ${match[4]}. La mirada y la postura no se puntúan.`,
      `${match[1]} выступлений. Содержание ${match[2]} · подача ${match[3]} · протокол ${match[4]}. Взгляд и осанка не оцениваются.`,
      `${match[1]} كلمات. المحتوى ${match[2]} · الإلقاء ${match[3]} · البروتوكول ${match[4]}. لم يُقيَّم التواصل البصري ولا الوقفة.`,
    );
  }

  match = source.match(/^上一場「(.+)」。立場 (\d+) · 論證 (\d+) · 盟友 (\d+) · 影響 (\d+)$/);
  if (match) {
    return pack(
      lang,
      `Last session “${tr(lang, match[1] ?? "")}”. Position ${match[2]} · argument ${match[3]} · allies ${match[4]} · influence ${match[5]}`,
      `Séance précédente « ${tr(lang, match[1] ?? "")} ». Position ${match[2]} · argument ${match[3]} · alliés ${match[4]} · influence ${match[5]}`,
      `Sesión anterior «${tr(lang, match[1] ?? "")}». Posición ${match[2]} · argumento ${match[3]} · aliados ${match[4]} · influencia ${match[5]}`,
      `Прошлая сессия «${tr(lang, match[1] ?? "")}». Позиция ${match[2]} · аргумент ${match[3]} · союзники ${match[4]} · влияние ${match[5]}`,
      `الجلسة السابقة «${tr(lang, match[1] ?? "")}». الموقف ${match[2]} · الحجة ${match[3]} · الحلفاء ${match[4]} · التأثير ${match[5]}`,
    );
  }

  match = source.match(/^第 (\d+) 輪 \/ 3$/);
  if (match) {
    return pack(
      lang,
      `Round ${match[1]} / 3`,
      `Round ${match[1]} / 3`,
      `Round ${match[1]} / 3`,
      `Round ${match[1]} / 3`,
      `Round ${match[1]} / 3`,
    );
  }

  match = source.match(/^這一席還可以再談 (\d+) 次。$/);
  if (match) {
    return pack(
      lang,
      `You can talk to this seat ${match[1]} more times.`,
      `You can talk to this seat ${match[1]} more times.`,
      `You can talk to this seat ${match[1]} more times.`,
      `You can talk to this seat ${match[1]} more times.`,
      `You can talk to this seat ${match[1]} more times.`,
    );
  }

  match = source.match(/^目前已跟 (\d+) 國談過。$/);
  if (match) {
    return pack(
      lang,
      `You have talked with ${match[1]} countries so far.`,
      `You have talked with ${match[1]} countries so far.`,
      `You have talked with ${match[1]} countries so far.`,
      `You have talked with ${match[1]} countries so far.`,
      `You have talked with ${match[1]} countries so far.`,
    );
  }

  match = source.match(/^有秩序動議 · 第(\d+)輪$/);
  if (match) {
    return pack(
      lang,
      `Moderated debate · round ${match[1]}`,
      `Moderated debate · round ${match[1]}`,
      `Moderated debate · round ${match[1]}`,
      `Moderated debate · round ${match[1]}`,
      `Moderated debate · round ${match[1]}`,
    );
  }

  match = source.match(/^非監管式議會 · (.+)$/);
  if (match) {
    const seat = tr(lang, match[1] ?? "");
    return pack(
      lang,
      `Unmoderated caucus · ${seat}`,
      `Unmoderated caucus · ${seat}`,
      `Unmoderated caucus · ${seat}`,
      `Unmoderated caucus · ${seat}`,
      `Unmoderated caucus · ${seat}`,
    );
  }

  match = source.match(/^進一步想法還太短（目前 (\d+) 字，至少 (\d+) 字）。先把你的判斷說完，論據是額外的。$/);
  if (match) {
    return pack(
      lang,
      `The further idea is still too short (${match[1]} characters now, at least ${match[2]}). Finish the judgment. An evidence point is extra.`,
      `The further idea is still too short (${match[1]} characters now, at least ${match[2]}). Finish the judgment. An evidence point is extra.`,
      `The further idea is still too short (${match[1]} characters now, at least ${match[2]}). Finish the judgment. An evidence point is extra.`,
      `The further idea is still too short (${match[1]} characters now, at least ${match[2]}). Finish the judgment. An evidence point is extra.`,
      `The further idea is still too short (${match[1]} characters now, at least ${match[2]}). Finish the judgment. An evidence point is extra.`,
    );
  }

  match = source.match(/^第 (\d+) 次(開場|有秩序動議)（(打字|口語)）：立場 (\d+) · 論證 (\d+) · 證據 (\d+) · 方案 (\d+) · 扣題 (\d+) · 表達 (\d+) · 儀態 (\d+)$/);
  if (match) {
    const kind = tr(lang, match[2] ?? "");
    const mode = tr(lang, match[3] ?? "");
    return pack(
      lang,
      `Speech ${match[1]} · ${kind} (${mode}): position ${match[4]} · reasoning ${match[5]} · evidence ${match[6]} · proposal ${match[7]} · focus ${match[8]} · delivery ${match[9]} · protocol ${match[10]}`,
      `Prise de parole ${match[1]} · ${kind} (${mode}) : position ${match[4]} · raisonnement ${match[5]} · preuves ${match[6]} · proposition ${match[7]} · focus ${match[8]} · expression ${match[9]} · protocole ${match[10]}`,
      `Intervención ${match[1]} · ${kind} (${mode}): postura ${match[4]} · razonamiento ${match[5]} · evidencia ${match[6]} · propuesta ${match[7]} · foco ${match[8]} · expresión ${match[9]} · protocolo ${match[10]}`,
      `Выступление ${match[1]} · ${kind} (${mode}): позиция ${match[4]} · обоснование ${match[5]} · доказательства ${match[6]} · предложение ${match[7]} · фокус ${match[8]} · подача ${match[9]} · протокол ${match[10]}`,
      `الكلمة ${match[1]} · ${kind} (${mode}): الموقف ${match[4]} · التسبيب ${match[5]} · الأدلة ${match[6]} · الاقتراح ${match[7]} · التركيز ${match[8]} · الإلقاء ${match[9]} · البروتوكول ${match[10]}`,
    );
  }

  match = source.match(/^第 (\d+) 次(開場|有秩序動議)：內容 (\d+) (.+) · 表達 (\d+) (.+) · 儀態 (\d+) (.+)$/);
  if (match) {
    const kind = tr(lang, match[2] ?? "");
    const content = tr(lang, match[4] ?? "");
    const oratory = tr(lang, match[6] ?? "");
    const protocol = tr(lang, match[8] ?? "");
    return pack(
      lang,
      `Speech ${match[1]} · ${kind}: content ${match[3]} ${content} · delivery ${match[5]} ${oratory} · protocol ${match[7]} ${protocol}`,
      `Prise de parole ${match[1]} · ${kind} : contenu ${match[3]} ${content} · expression ${match[5]} ${oratory} · protocole ${match[7]} ${protocol}`,
      `Intervención ${match[1]} · ${kind}: contenido ${match[3]} ${content} · expresión ${match[5]} ${oratory} · protocolo ${match[7]} ${protocol}`,
      `Выступление ${match[1]} · ${kind}: содержание ${match[3]} ${content} · подача ${match[5]} ${oratory} · протокол ${match[7]} ${protocol}`,
      `الكلمة ${match[1]} · ${kind}: المحتوى ${match[3]} ${content} · الإلقاء ${match[5]} ${oratory} · البروتوكول ${match[7]} ${protocol}`,
    );
  }

  return null;
}

export function tr(lang: OfficialLang, source: string): string {
  if (!source || lang === "zh") return source;
  const exact = PHRASES.get(source)?.[lang];
  if (exact) return exact;
  return pattern(lang, source) ?? source;
}
