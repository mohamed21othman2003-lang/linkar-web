// التصدير المشترك (CON5-M00 · تصدير): الخادم يجهّز الملف ويبعت رابط التنزيل على البريد، والتصدير يتسجّل في «سجل التدقيق».
import { delay } from "./errors";
import { auditApi } from "./users";

export type ExportFormat = "xlsx" | "csv" | "pdf";
export type ExportRequest = { module: string; tab?: string; format: ExportFormat; period: string; filters?: Record<string, string> };

export const exportsApi = {
  request: async (r: ExportRequest) => {
    auditApi.record(r.module, r.tab ?? r.module, `${r.format.toUpperCase()} · ${r.period}`);
    return delay({ ok: true });
  },
};
