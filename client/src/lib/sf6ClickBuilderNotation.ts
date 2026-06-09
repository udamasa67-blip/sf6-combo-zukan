export type TokenKind =
  | "attack"
  | "direction"
  | "cancel"
  | "motion"
  | "modifier";

export interface PaletteToken {
  id: string;
  label: string;
  notation: string;
  kind: TokenKind;
  color: string;
  border: string;
  textColor: string;
  glowColor: string;
}

export type NotationMode = "en" | "jp";
export type DirectionNotationMode = "arrow" | "number";

const ARROW_NOTATION: Record<string, string> = {
  "1": "↙",
  "2": "↓",
  "3": "↘",
  "4": "←",
  "5": "",
  "6": "→",
  "7": "↖",
  "8": "↑",
  "9": "↗",
};

const toArrowNotation = (notation: string) =>
  notation.replace(/[1-9]/g, (direction) => ARROW_NOTATION[direction] ?? direction);

const JP_ATTACK_NOTATION: Record<string, string> = {
  LP: "弱P",
  MP: "中P",
  HP: "強P",
  P: "P",
  PPP: "PPP",
  LK: "弱K",
  MK: "中K",
  HK: "強K",
  K: "K",
  KKK: "KKK",
};

const toJapaneseAttackNotation = (notation: string) =>
  notation.replace(/LP|MP|HP|PPP|LK|MK|HK|KKK|P|K/g, (attack) => JP_ATTACK_NOTATION[attack] ?? attack);

const getNumberNotation = (token: PaletteToken) => {
  if (token.kind === "direction" || token.kind === "motion") return token.id;
  if (token.kind === "attack" && /^[25]/.test(token.id)) return token.id;
  return token.notation;
};

export function formatTokenNotation(
  token: PaletteToken,
  mode: NotationMode,
  directionMode: DirectionNotationMode = "arrow",
): string {
  const baseNotation = directionMode === "number"
    ? getNumberNotation(token)
    : token.notation;

  return mode === "jp" && token.kind === "attack"
    ? toJapaneseAttackNotation(baseNotation)
    : baseNotation;
}

export function formatTokenLabel(
  token: PaletteToken,
  mode: NotationMode,
  directionMode: DirectionNotationMode = "arrow",
): string {
  const baseLabel = directionMode === "number"
    ? getNumberNotation(token)
    : token.label;

  return mode === "jp" && token.kind === "attack"
    ? toJapaneseAttackNotation(baseLabel)
    : baseLabel;
}

export const ATTACK_TOKENS: PaletteToken[] = [
  { id: "LP",  label: "LP",  notation: "LP",  kind: "attack", color: "bg-blue-900",    border: "border-blue-400",    textColor: "text-blue-200",    glowColor: "rgba(96,165,250,0.7)" },
  { id: "MP",  label: "MP",  notation: "MP",  kind: "attack", color: "bg-yellow-900",  border: "border-yellow-400",  textColor: "text-yellow-200",  glowColor: "rgba(250,204,21,0.7)" },
  { id: "HP",  label: "HP",  notation: "HP",  kind: "attack", color: "bg-red-900",     border: "border-red-400",     textColor: "text-red-200",     glowColor: "rgba(248,113,113,0.7)" },
  { id: "PP",  label: "P",   notation: "P",   kind: "attack", color: "bg-sky-900",     border: "border-sky-400",     textColor: "text-sky-200",     glowColor: "rgba(56,189,248,0.7)" },
  { id: "PPP", label: "PPP", notation: "PPP", kind: "attack", color: "bg-cyan-900",    border: "border-cyan-400",    textColor: "text-cyan-200",    glowColor: "rgba(34,211,238,0.7)" },
  { id: "LK",  label: "LK",  notation: "LK",  kind: "attack", color: "bg-green-900",   border: "border-green-400",   textColor: "text-green-200",   glowColor: "rgba(74,222,128,0.7)" },
  { id: "MK",  label: "MK",  notation: "MK",  kind: "attack", color: "bg-purple-900",  border: "border-purple-400",  textColor: "text-purple-200",  glowColor: "rgba(192,132,252,0.7)" },
  { id: "HK",  label: "HK",  notation: "HK",  kind: "attack", color: "bg-orange-900",  border: "border-orange-400",  textColor: "text-orange-200",  glowColor: "rgba(251,146,60,0.7)" },
  { id: "KK",  label: "K",   notation: "K",   kind: "attack", color: "bg-lime-900",    border: "border-lime-400",    textColor: "text-lime-200",    glowColor: "rgba(163,230,53,0.7)" },
  { id: "KKK", label: "KKK", notation: "KKK", kind: "attack", color: "bg-emerald-900", border: "border-emerald-400", textColor: "text-emerald-200", glowColor: "rgba(52,211,153,0.7)" },
];

export const CROUCH_ATTACK_TOKENS: PaletteToken[] = [
  { id: "2LP", label: "↓LP", notation: "↓LP", kind: "attack", color: "bg-blue-950",   border: "border-blue-600",   textColor: "text-blue-300",   glowColor: "rgba(96,165,250,0.6)" },
  { id: "2MP", label: "↓MP", notation: "↓MP", kind: "attack", color: "bg-yellow-950", border: "border-yellow-600", textColor: "text-yellow-300", glowColor: "rgba(250,204,21,0.6)" },
  { id: "2HP", label: "↓HP", notation: "↓HP", kind: "attack", color: "bg-red-950",    border: "border-red-600",    textColor: "text-red-300",    glowColor: "rgba(248,113,113,0.6)" },
  { id: "2LK", label: "↓LK", notation: "↓LK", kind: "attack", color: "bg-green-950",  border: "border-green-600",  textColor: "text-green-300",  glowColor: "rgba(74,222,128,0.6)" },
  { id: "2MK", label: "↓MK", notation: "↓MK", kind: "attack", color: "bg-purple-950", border: "border-purple-600", textColor: "text-purple-300", glowColor: "rgba(192,132,252,0.6)" },
  { id: "2HK", label: "↓HK", notation: "↓HK", kind: "attack", color: "bg-orange-950", border: "border-orange-600", textColor: "text-orange-300", glowColor: "rgba(251,146,60,0.6)" },
];

export const STAND_ATTACK_TOKENS: PaletteToken[] = [
  { id: "5LP", label: "LP", notation: "LP", kind: "attack", color: "bg-blue-900",   border: "border-blue-300",   textColor: "text-blue-100",   glowColor: "rgba(96,165,250,0.8)" },
  { id: "5MP", label: "MP", notation: "MP", kind: "attack", color: "bg-yellow-900", border: "border-yellow-300", textColor: "text-yellow-100", glowColor: "rgba(250,204,21,0.8)" },
  { id: "5HP", label: "HP", notation: "HP", kind: "attack", color: "bg-red-900",    border: "border-red-300",    textColor: "text-red-100",    glowColor: "rgba(248,113,113,0.8)" },
  { id: "5LK", label: "LK", notation: "LK", kind: "attack", color: "bg-green-900",  border: "border-green-300",  textColor: "text-green-100",  glowColor: "rgba(74,222,128,0.8)" },
  { id: "5MK", label: "MK", notation: "MK", kind: "attack", color: "bg-purple-900", border: "border-purple-300", textColor: "text-purple-100", glowColor: "rgba(192,132,252,0.8)" },
  { id: "5HK", label: "HK", notation: "HK", kind: "attack", color: "bg-orange-900", border: "border-orange-300", textColor: "text-orange-100", glowColor: "rgba(251,146,60,0.8)" },
];

export const DIRECTION_TOKENS: PaletteToken[] = [
  { id: "5",  label: "N",   notation: "N",   kind: "direction", color: "bg-slate-800", border: "border-slate-500", textColor: "text-slate-200", glowColor: "rgba(148,163,184,0.5)" },
  { id: "1",  label: "↙",   notation: "↙",   kind: "direction", color: "bg-slate-800", border: "border-slate-500", textColor: "text-slate-200", glowColor: "rgba(148,163,184,0.5)" },
  { id: "2",  label: "↓",   notation: "↓",   kind: "direction", color: "bg-slate-800", border: "border-slate-500", textColor: "text-slate-200", glowColor: "rgba(148,163,184,0.5)" },
  { id: "3",  label: "↘",   notation: "↘",   kind: "direction", color: "bg-slate-800", border: "border-slate-500", textColor: "text-slate-200", glowColor: "rgba(148,163,184,0.5)" },
  { id: "4",  label: "←",   notation: "←",   kind: "direction", color: "bg-slate-800", border: "border-slate-500", textColor: "text-slate-200", glowColor: "rgba(148,163,184,0.5)" },
  { id: "6",  label: "→",   notation: "→",   kind: "direction", color: "bg-slate-800", border: "border-slate-500", textColor: "text-slate-200", glowColor: "rgba(148,163,184,0.5)" },
  { id: "7",  label: "↖",   notation: "↖",   kind: "direction", color: "bg-slate-800", border: "border-slate-500", textColor: "text-slate-200", glowColor: "rgba(148,163,184,0.5)" },
  { id: "8",  label: "↑",   notation: "↑",   kind: "direction", color: "bg-slate-800", border: "border-slate-500", textColor: "text-slate-200", glowColor: "rgba(148,163,184,0.5)" },
  { id: "9",  label: "↗",   notation: "↗",   kind: "direction", color: "bg-slate-800", border: "border-slate-500", textColor: "text-slate-200", glowColor: "rgba(148,163,184,0.5)" },
  { id: "j",  label: "j.",  notation: "j.",  kind: "direction", color: "bg-slate-700", border: "border-slate-400", textColor: "text-slate-100", glowColor: "rgba(148,163,184,0.5)" },
  { id: "cr", label: "cr.", notation: "cr.", kind: "direction", color: "bg-slate-700", border: "border-slate-400", textColor: "text-slate-100", glowColor: "rgba(148,163,184,0.5)" },
  { id: "st", label: "st.", notation: "st.", kind: "direction", color: "bg-slate-700", border: "border-slate-400", textColor: "text-slate-100", glowColor: "rgba(148,163,184,0.5)" },
];

export const MOTION_TOKENS: PaletteToken[] = [
  { id: "236",   label: "↓↘→",   notation: "↓↘→",   kind: "motion", color: "bg-violet-900", border: "border-violet-400", textColor: "text-violet-200", glowColor: "rgba(167,139,250,0.6)" },
  { id: "214",   label: "↓↙←",   notation: "↓↙←",   kind: "motion", color: "bg-violet-900", border: "border-violet-400", textColor: "text-violet-200", glowColor: "rgba(167,139,250,0.6)" },
  { id: "623",   label: "→↓↘",   notation: "→↓↘",   kind: "motion", color: "bg-violet-900", border: "border-violet-400", textColor: "text-violet-200", glowColor: "rgba(167,139,250,0.6)" },
  { id: "421",   label: "←↓↙",   notation: "←↓↙",   kind: "motion", color: "bg-violet-900", border: "border-violet-400", textColor: "text-violet-200", glowColor: "rgba(167,139,250,0.6)" },
  { id: "41236", label: "←↙↓↘→", notation: "←↙↓↘→", kind: "motion", color: "bg-violet-900", border: "border-violet-400", textColor: "text-violet-200", glowColor: "rgba(167,139,250,0.6)" },
  { id: "63214", label: "→↘↓↙←", notation: "→↘↓↙←", kind: "motion", color: "bg-violet-900", border: "border-violet-400", textColor: "text-violet-200", glowColor: "rgba(167,139,250,0.6)" },
  { id: "360",   label: "1回転", notation: "1回転", kind: "motion", color: "bg-violet-900", border: "border-violet-400", textColor: "text-violet-200", glowColor: "rgba(167,139,250,0.6)" },
  { id: "720",   label: "2回転", notation: "2回転", kind: "motion", color: "bg-violet-900", border: "border-violet-400", textColor: "text-violet-200", glowColor: "rgba(167,139,250,0.6)" },
  { id: "22",    label: "↓↓",    notation: "↓↓",    kind: "motion", color: "bg-violet-900", border: "border-violet-400", textColor: "text-violet-200", glowColor: "rgba(167,139,250,0.6)" },
  { id: "66",    label: "→→",    notation: "→→",    kind: "motion", color: "bg-violet-900", border: "border-violet-400", textColor: "text-violet-200", glowColor: "rgba(167,139,250,0.6)" },
  { id: "44",    label: "←←",    notation: "←←",    kind: "motion", color: "bg-violet-900", border: "border-violet-400", textColor: "text-violet-200", glowColor: "rgba(167,139,250,0.6)" },
];

export const CANCEL_TOKENS: PaletteToken[] = [
  { id: "xx",  label: "xx",  notation: " xx ",  kind: "cancel", color: "bg-rose-950",  border: "border-rose-500",  textColor: "text-rose-300",  glowColor: "rgba(244,63,94,0.6)" },
  { id: "DR>", label: "DR >", notation: " DR > ", kind: "cancel", color: "bg-amber-950", border: "border-amber-400", textColor: "text-amber-200", glowColor: "rgba(251,191,36,0.6)" },
  { id: "DRC", label: "DRC >", notation: " DRC > ", kind: "cancel", color: "bg-amber-950", border: "border-amber-400", textColor: "text-amber-200", glowColor: "rgba(251,191,36,0.6)" },
  { id: ">",   label: ">",   notation: " > ",   kind: "cancel", color: "bg-zinc-800",  border: "border-zinc-500",  textColor: "text-zinc-200",  glowColor: "rgba(161,161,170,0.5)" },
  { id: "~",   label: "~",   notation: "~",     kind: "cancel", color: "bg-zinc-800",  border: "border-zinc-500",  textColor: "text-zinc-200",  glowColor: "rgba(161,161,170,0.5)" },
  { id: "▲",   label: "▲",   notation: "▲",     kind: "cancel", color: "bg-zinc-800",  border: "border-zinc-500",  textColor: "text-zinc-200",  glowColor: "rgba(161,161,170,0.5)" },
  { id: "[",   label: "[",   notation: "[",     kind: "cancel", color: "bg-zinc-800",  border: "border-zinc-500",  textColor: "text-zinc-200",  glowColor: "rgba(161,161,170,0.5)" },
  { id: "]",   label: "]",   notation: "]",     kind: "cancel", color: "bg-zinc-800",  border: "border-zinc-500",  textColor: "text-zinc-200",  glowColor: "rgba(161,161,170,0.5)" },
  { id: "SC",  label: "SC",  notation: " SC ",  kind: "cancel", color: "bg-rose-950",  border: "border-rose-500",  textColor: "text-rose-300",  glowColor: "rgba(244,63,94,0.6)" },
  { id: "OD",  label: "(OD)", notation: "(OD)", kind: "cancel", color: "bg-amber-950", border: "border-amber-400", textColor: "text-amber-200", glowColor: "rgba(251,191,36,0.6)" },
  { id: "CA",  label: "CA",  notation: " CA ",  kind: "cancel", color: "bg-amber-950", border: "border-amber-400", textColor: "text-amber-200", glowColor: "rgba(251,191,36,0.6)" },
];

export const MODIFIER_TOKENS: PaletteToken[] = [
  { id: "CH",    label: "(CH)", notation: "(CH)", kind: "modifier", color: "bg-teal-900",   border: "border-teal-400",   textColor: "text-teal-200",   glowColor: "rgba(45,212,191,0.6)" },
  { id: "PH",    label: "(PC)", notation: "(PC)", kind: "modifier", color: "bg-teal-900",   border: "border-teal-400",   textColor: "text-teal-200",   glowColor: "rgba(45,212,191,0.6)" },
  { id: "DI",    label: "DI",   notation: "DI",   kind: "modifier", color: "bg-amber-950",  border: "border-amber-400",  textColor: "text-amber-200",  glowColor: "rgba(251,191,36,0.6)" },
  { id: "DP",    label: "DP",   notation: "DP",   kind: "modifier", color: "bg-teal-900",   border: "border-teal-400",   textColor: "text-teal-200",   glowColor: "rgba(45,212,191,0.6)" },
  { id: "throw", label: "投げ", notation: "投げ", kind: "modifier", color: "bg-teal-900",   border: "border-teal-400",   textColor: "text-teal-200",   glowColor: "rgba(45,212,191,0.6)" },
  { id: "SA1",   label: "SA1",  notation: "SA1",  kind: "modifier", color: "bg-amber-950",  border: "border-amber-400",  textColor: "text-amber-200",  glowColor: "rgba(251,191,36,0.6)" },
  { id: "SA2",   label: "SA2",  notation: "SA2",  kind: "modifier", color: "bg-amber-950",  border: "border-amber-400",  textColor: "text-amber-200",  glowColor: "rgba(251,191,36,0.6)" },
  { id: "SA3",   label: "SA3",  notation: "SA3",  kind: "modifier", color: "bg-amber-950",  border: "border-amber-400",  textColor: "text-amber-200",  glowColor: "rgba(251,191,36,0.6)" },
  { id: "W!",    label: "(W!)", notation: "(W!)", kind: "modifier", color: "bg-red-900",    border: "border-red-400",    textColor: "text-red-200",    glowColor: "rgba(248,113,113,0.6)" },
  { id: "WSTN",  label: "(W! STN)", notation: "(W! STN)", kind: "modifier", color: "bg-red-800",    border: "border-red-500",    textColor: "text-red-100",    glowColor: "rgba(220,38,38,0.6)" },
];

export const ALL_TOKENS = [
  ...ATTACK_TOKENS,
  ...CROUCH_ATTACK_TOKENS,
  ...STAND_ATTACK_TOKENS,
  ...DIRECTION_TOKENS,
  ...MOTION_TOKENS,
  ...CANCEL_TOKENS,
  ...MODIFIER_TOKENS,
];

export const TOKEN_MAP: Record<string, PaletteToken> = Object.fromEntries(
  ALL_TOKENS.map((t) => [t.id, t])
);

export interface ComboEntry {
  uid: string;
  tokenId: string;
}

export function buildNotation(
  entries: ComboEntry[],
  mode: NotationMode = "en",
  directionMode: DirectionNotationMode = "arrow",
): string {
  return entries
    .map((e) => {
      const token = TOKEN_MAP[e.tokenId];
      return token ? formatTokenNotation(token, mode, directionMode) : toArrowNotation(e.tokenId);
    })
    .join("");
}
