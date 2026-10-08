const RULES: { pattern: RegExp; tag: string }[] = [
  { pattern: /私人資本為主|私部門優先|私人資本優先|刪去贈款/, tag: "private-first" },
  { pattern: /優惠貸款為主要|以貸款為主|全額貸款|改為貸款/, tag: "loan-only" },
  { pattern: /撥款前.*審計|審計之前|預先凍結|凍結撥款|不得撥付/, tag: "freeze" },
  { pattern: /不要求任何|不寫報告|無需報告|不要報告/, tag: "no-accountability" },
  { pattern: /強制分攤|相同的強制|新興經濟體必須/, tag: "binding-emerging" },
  { pattern: /強制分攤|自動綁進|相同的出資義務/, tag: "binding-obligation" },
  { pattern: /贈款|免償/, tag: "grant" },
  { pattern: /債務/, tag: "debt" },
  { pattern: /報告|問責|透明|成果摘要|覆核|學習成果/, tag: "accountability" },
  { pattern: /報告|成果摘要|公開成果|抽樣|學習成果/, tag: "report" },
  { pattern: /社區|地方機構|地方教育局|青年|女童|農村/, tag: "community" },
  { pattern: /簡化申請|九十日|90日|直接申請/, tag: "access" },
  { pattern: /預警|輟學|乾旱|沿海/, tag: "warning" },
  { pattern: /自然|生態|紅樹林|森林|濕地|流域|全納|母語|障礙/, tag: "nature" },
  { pattern: /席位|治理/, tag: "governance" },
  { pattern: /自願/, tag: "voluntary" },
  { pattern: /私部門|私人|保險|教育科技/, tag: "private" },
  { pattern: /共同但有區別|發達國家|公共資金|公共贈款|公共教育/, tag: "public-finance" },
  { pattern: /共同但有區別|區別的責任/, tag: "cbdr" },
  { pattern: /南南/, tag: "south-south" },
  { pattern: /硬體|混凝土|海堤|校舍/, tag: "infra" },
  { pattern: /private capital (as |is )?(the )?(main|primary)|primarily private|private[- ]first|delete the grant|remove grant priority/i, tag: "private-first" },
  { pattern: /concessional loans? as the main|primarily loans|loan-only|loans as the main/i, tag: "loan-only" },
  { pattern: /audit before (any )?disburs|freeze disburs|no disbursement until|frozen before/i, tag: "freeze" },
  { pattern: /no reporting|without (any )?report|do not write a report/i, tag: "no-accountability" },
  { pattern: /same (mandatory )?obligation for emerging|emerging economies must|mandatory burden[- ]shar/i, tag: "binding-emerging" },
  { pattern: /mandatory burden[- ]shar|same contribution obligation/i, tag: "binding-obligation" },
  { pattern: /\bgrants?\b|grant-based/i, tag: "grant" },
  { pattern: /\bdebt\b/i, tag: "debt" },
  { pattern: /\breports?\b|accountability|transparenc|results summary|learning results?/i, tag: "accountability" },
  { pattern: /\breports?\b|results summary|sample review|learning results?/i, tag: "report" },
  { pattern: /\bcommunit(y|ies)\b|local institutions?|\byouth\b|pastoral|girls?\b|rural schools?/i, tag: "community" },
  { pattern: /simplified application|ninety days|\b90 days\b|direct access/i, tag: "access" },
  { pattern: /early warning|\bdrought\b|\bcoastal\b|dropout/i, tag: "warning" },
  { pattern: /nature-based|\bmangroves?\b|\bforests?\b|\bwetlands?\b|\bwatersheds?\b|\bnature\b|inclusive|mother[- ]tongue|disability/i, tag: "nature" },
  { pattern: /\bgovernance\b|council seat/i, tag: "governance" },
  { pattern: /\bvoluntary\b/i, tag: "voluntary" },
  { pattern: /private sector|private capital|\binsurance\b|edtech|education tech/i, tag: "private" },
  { pattern: /common but differentiated|developed countries|public finance|public grants?/i, tag: "public-finance" },
  { pattern: /common but differentiated|differentiated responsibilit/i, tag: "cbdr" },
  { pattern: /south-south/i, tag: "south-south" },
  { pattern: /\bhardware\b|\bconcrete\b|\bseawalls?\b|school buildings?/i, tag: "infra" },
];

export function tagsFromText(text: string): string[] {
  const tags = new Set<string>();
  for (const rule of RULES) {
    if (rule.pattern.test(text)) tags.add(rule.tag);
  }
  return [...tags];
}
