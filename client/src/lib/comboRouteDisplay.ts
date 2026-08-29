export function formatComboRouteForDisplay(route: string, description: string): string {
  const setupFrame = getSetupFrameFromDescription(description);
  const shouldPrefixRoute =
    setupFrame !== "+19" || description.trim().match(/^\+19(?:後|から)/);

  if (!setupFrame || !shouldPrefixRoute || route.startsWith(`[${setupFrame}]`)) {
    return route;
  }

  return `[${setupFrame}] > ${route}`;
}

export type SetupFrameFilter = "+5" | "+19" | "+36" | "+37" | "+38" | "+39";

const setupFrameFilters: SetupFrameFilter[] = ["+5", "+19", "+36", "+37", "+38", "+39"];

export function getSetupFrameFromDescription(description: string): SetupFrameFilter | null {
  const setupFrame = description.includes("+19")
    ? "+19"
    : description.trim().match(/^(\+(?:5|36|37|38|39))(?:後|から)/)?.[1];
  return setupFrameFilters.includes(setupFrame as SetupFrameFilter) ? setupFrame as SetupFrameFilter : null;
}

export function canFilterSetupFrame(knockdown: string): knockdown is SetupFrameFilter {
  return setupFrameFilters.includes(knockdown as SetupFrameFilter);
}
