// W2-26 · كل مقدّمي الخدمة (691:2364) + W2-26m · خريطة (694:2635)
import type { MapPoint } from "./types";

const T = (ar: string, en: string) => ({ text_ar: ar, text_en: en });

export const providersPage = {
  title: T("مقدّمو الخدمة في جدة", "Service providers in Jeddah"),
  crumb: T("مقدّمو الخدمة", "Service providers"),
  description: T(
    "مقدّمو خدمة معتمدون، مرتّبون حسب المسافة من موقعك. اختر مقدّم الخدمة لترى خدماته وأسعاره لسيارتك، ثم احجز وادفع مباشرة.",
    "Certified providers, sorted by distance from you. Pick a provider to see its services and prices for your car, then book and pay directly.",
  ),
  // إجمالي مقدّمي الخدمة في المنطقة (الفيجما: «25 مقدّم خدمة» · «تعرض 12 من 25»)
  total: 25,
  page_size: 12,
  // ترتيب «الأقرب إليك» زي الفيجما (من بداية السطر)
  order: ["bareeq", "xpel", "nanoshield", "nukhba", "crystal", "golden-wash", "3m", "3seven", "autoshabo", "lamaa", "v-kool", "llumar"],
  // مكان الدبابيس على خريطة W2-26m (لوحة 800×780)
  pins: {
    bareeq: { x: 470, y: 280 },
    nanoshield: { x: 300, y: 420 },
    nukhba: { x: 500, y: 410 },
    crystal: { x: 190, y: 300 },
    "golden-wash": { x: 610, y: 330 },
    "3m": { x: 260, y: 520 },
    "3seven": { x: 190, y: 610 },
    lamaa: { x: 380, y: 640 },
    xpel: { x: 360, y: 200 },
  } as Record<string, MapPoint>,
  map_selected: "xpel",
  me: { x: 429, y: 339 } as MapPoint,
};
