import { AccountBar } from "@/components/chamber/AccountBar";
import { Kicker, Mark, Seal } from "@/components/chamber/primitives";
import { Button } from "@/components/ui/button";
import { CASES, SDGS, casesForSdg, type TrainingCase } from "@/content/cases";
import { DELEGATES } from "@/content/delegates";
import { useTr } from "@/i18n/useTr";
import { LanguageBar } from "@/i18n/LanguageBar";
import { useGame } from "@/state/context";

const STEPS = [
  { n: "1", zh: "選例子" },
  { n: "2", zh: "選國家" },
  { n: "3", zh: "入席" },
];

export function CaseSelectScreen() {
  const { dispatch } = useGame();
  const { t } = useTr();

  return (
    <div className="mx-auto flex min-h-dvh max-w-6xl flex-col px-4 py-8 sm:px-8" data-testid="case-catalog">
      <header className="flex flex-wrap items-center justify-between gap-3 text-brass">
        <div className="flex items-center gap-3">
          <Mark className="size-12" />
          <div>
            <Kicker>{t("可持續發展目標")}</Kicker>
            <p className="font-serif text-lg text-paper">{t("先選例子，再選國家")}</p>
          </div>
        </div>
        <AccountBar tone="dark" />
      </header>

      <div className="mt-8 max-w-3xl">
        <p className="text-sm tracking-[0.22em] text-brass">{t("可持續發展目標 1–17")}</p>
        <h1 className="mt-3 font-serif text-4xl leading-tight text-paper sm:text-5xl">
          {t("選擇本場例子")}
        </h1>
        <p className="mt-4 text-lg leading-8 text-[#e7dfd0]">
          {t("十七個可持續發展目標，每個有兩到三個例子。選定例子後，下一頁才選擇你要代表的國家。不同例子涉及的國家可以不一樣。")}
        </p>
        <ol className="mt-5 flex flex-wrap gap-2">
          {STEPS.map((step, index) => (
            <li
              key={step.n}
              className={
                index === 0
                  ? "rounded-sm bg-brass px-3 py-2 text-sm font-medium text-ink"
                  : "rounded-sm border border-white/20 px-3 py-2 text-sm text-[#e7dfd0]"
              }
            >
              {step.n} {t(step.zh)}
            </li>
          ))}
        </ol>
        <div className="mt-5">
          <p className="mb-2 text-sm text-brass">{t("會議語言")}</p>
          <LanguageBar mode="session" />
        </div>
      </div>

      <nav
        aria-label={t("按目標跳轉")}
        className="sticky top-0 z-10 -mx-4 mt-8 border-y border-white/10 bg-[#0e1c2b]/95 px-4 py-3 backdrop-blur sm:-mx-8 sm:px-8"
      >
        <p className="mb-2 text-xs text-brass">
          {t(`${SDGS.length} 個目標，每個兩到三個例子，共 ${CASES.length} 個`)}
        </p>
        <div className="flex flex-wrap gap-1.5">
          {SDGS.map((goal) => (
            <a
              key={goal.n}
              href={`#sdg-${goal.n}`}
              data-testid={`sdg-jump-${goal.n}`}
              className="inline-flex size-9 items-center justify-center rounded-sm text-sm font-semibold"
              style={{ background: goal.color, color: goal.ink === "light" ? "#f4efe6" : "#172033" }}
            >
              {goal.n}
            </a>
          ))}
        </div>
      </nav>

      <div className="mt-8 space-y-10 pb-16">
        {SDGS.map((goal) => {
          const cases = casesForSdg(goal.n);
          return (
            <section key={goal.n} id={`sdg-${goal.n}`} className="scroll-mt-28">
              <div className="flex items-center gap-3">
                <span
                  className="inline-flex size-12 items-center justify-center rounded-sm font-serif text-2xl"
                  style={{ background: goal.color, color: goal.ink === "light" ? "#f4efe6" : "#172033" }}
                >
                  {goal.n}
                </span>
                <div>
                  <Kicker>{t(`可持續發展目標 ${goal.n}`)}</Kicker>
                  <h2 className="font-serif text-2xl text-paper sm:text-3xl">{t(goal.titleZh)}</h2>
                </div>
              </div>
              <p className="mt-2 text-sm text-[#d9d0c2]">
                {t(`${cases.length} 個例子。選一個，再去選國家。這一組國家可以和其他例子不同。`)}
              </p>
              <div className="mt-4 grid gap-4 lg:grid-cols-2">
                {cases.map((item, index) => (
                  <CaseCard
                    key={item.id}
                    item={item}
                    index={index}
                    onChoose={() => dispatch({ type: "SELECT_CASE", caseId: item.id })}
                  />
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}

function CaseCard({
  item,
  index,
  onChoose,
}: {
  item: TrainingCase;
  index: number;
  onChoose: () => void;
}) {
  const { t } = useTr();
  return (
    <article className="flex flex-col rounded-md border border-white/15 bg-white/5 p-4">
      <p className="text-xs tracking-[0.16em] text-brass">
        {t(`例子 ${index + 1}`)}
      </p>
      <h3 className="mt-1 font-serif text-2xl leading-snug text-paper">{t(item.titleZh)}</h3>
      <p className="mt-2 text-sm leading-6 text-[#e7dfd0]">{t(item.questionZh)}</p>
      <p className="mt-4 text-xs tracking-[0.14em] text-brass">{t("可選國家")}</p>
      <ul className="mt-2 flex flex-wrap gap-2">
        {item.seats.map((id) => (
          <li key={id} className="inline-flex items-center gap-1.5 rounded-sm bg-white/10 px-2 py-1 text-sm text-paper">
            <Seal id={id} size="sm" />
            {t(DELEGATES[id].placard)}
          </li>
        ))}
      </ul>
      <div className="mt-4">
        <Button data-testid={`case-${item.id}`} size="lg" onClick={onChoose}>
          {t("選擇此例子")}
        </Button>
      </div>
    </article>
  );
}
