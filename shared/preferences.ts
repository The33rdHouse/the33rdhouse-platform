export const tabs = ["overview", "registry", "ledger", "audit-lab"] as const;
export type Tab = (typeof tabs)[number];
export function readPreferences(raw: string | null): { tab: Tab } {
  try {
    const value: unknown = JSON.parse(raw ?? "null");
    if (
      value &&
      typeof value === "object" &&
      Object.keys(value).length === 1 &&
      "tab" in value &&
      tabs.includes(value.tab as Tab)
    )
      return { tab: value.tab as Tab };
  } catch {
    /* Storage is optional and never authoritative. */
  }
  return { tab: "overview" };
}
