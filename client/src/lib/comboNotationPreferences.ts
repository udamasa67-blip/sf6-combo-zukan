import { formatOdNotationForDisplay } from "@/lib/notationTranslator";
import type { DirectionNotationMode, NotationMode } from "@/lib/sf6ClickBuilderNotation";

const DIRECTION_ARROW: Record<string, string> = {
  "1": "↙",
  "2": "↓",
  "3": "↘",
  "4": "←",
  "5": "N",
  "6": "→",
  "7": "↖",
  "8": "↑",
  "9": "↗",
  "22": "↓↓",
  "44": "←←",
  "66": "→→",
  "236": "↓↘→",
  "214": "↓↙←",
  "623": "→↓↘",
  "421": "←↓↙",
  "41236": "←↙↓↘→",
  "63214": "→↘↓↙←",
  "236236": "↓↘→↓↘→",
  "214214": "↓↙←↓↙←",
  "2828": "↓↑↓↑",
  "360": "1回転",
  "720": "2回転",
};

const ATTACK_JP: Record<string, string> = {
  LP: "弱P",
  MP: "中P",
  HP: "強P",
  LK: "弱K",
  MK: "中K",
  HK: "強K",
  P: "P",
  PP: "PP",
  PPP: "PPP",
  K: "K",
  KK: "KK",
  KKK: "KKK",
};

const directionPattern = /(?<![A-Za-z])(?:236236|214214|41236|63214|2828|623|421|236|214|720|360|66|44|22|[1-9])(?=(?:LP|MP|HP|LK|MK|HK|PPP|KKK|PP|KK|P|K|j\.|\b|~|>|\s|\[|$))/g;
const attackPattern = /(?<![A-Z])(?:LP|MP|HP|LK|MK|HK|PPP|KKK|PP|KK|P|K)(?![A-Z])/g;

function formatDirectionSegment(segment: string, directionMode: DirectionNotationMode) {
  if (directionMode === "number") return segment;

  return segment.replace(directionPattern, (match, offset: number) => {
    if (match === "5" && /^(?:LP|MP|HP|LK|MK|HK|P|K)/.test(segment.slice(offset + match.length))) {
      return "";
    }
    return DIRECTION_ARROW[match] ?? match;
  });
}

function formatAttackSegment(segment: string, notationMode: NotationMode) {
  if (notationMode === "en") return segment;
  return segment.replace(attackPattern, (match) => ATTACK_JP[match] ?? match);
}

function formatSegment(segment: string, directionMode: DirectionNotationMode, notationMode: NotationMode, insideBracket: boolean) {
  const directionFormatted = insideBracket
    ? segment
    : formatDirectionSegment(segment, directionMode);
  return formatAttackSegment(directionFormatted, notationMode);
}

function splitBracketSegments(value: string) {
  const segments: Array<{ value: string; insideBracket: boolean }> = [];
  let start = 0;
  let insideBracket = false;

  for (let index = 0; index < value.length; index += 1) {
    const char = value[index];

    if (char === "[" && !insideBracket) {
      if (index > start) {
        segments.push({ value: value.slice(start, index), insideBracket: false });
      }
      start = index;
      insideBracket = true;
      continue;
    }

    if (char === "]" && insideBracket) {
      segments.push({ value: value.slice(start, index + 1), insideBracket: true });
      start = index + 1;
      insideBracket = false;
    }
  }

  if (start < value.length) {
    segments.push({ value: value.slice(start), insideBracket });
  }

  return segments;
}

export function formatComboNotationPreference(
  route: string,
  directionMode: DirectionNotationMode,
  notationMode: NotationMode,
) {
  const normalizedRoute = formatOdNotationForDisplay(route);

  return splitBracketSegments(normalizedRoute)
    .map((segment) => formatSegment(segment.value, directionMode, notationMode, segment.insideBracket))
    .join("");
}
