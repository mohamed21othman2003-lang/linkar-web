import { CRITICAL_SYMBOLS } from "./critical-symbols";

/** أيقونات أول الشاشة جوه الصفحة نفسها (بيتحط مرة واحدة في الـlayout) — Icon بيشاور عليها بـ#i-<name> */
export function CriticalIconSymbols() {
  return <svg aria-hidden width="0" height="0" className="absolute size-0 overflow-hidden" dangerouslySetInnerHTML={{ __html: CRITICAL_SYMBOLS }} />;
}
