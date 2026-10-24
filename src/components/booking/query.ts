// عقد الـquery string المشترك لخطوات الحجز (متّفق عليه مع باقي الصفحات):
//   routes.bookingBranch + ?provider=<slug>&services=<s1,s2>[&packages=<p1,p2>][&offer=<id>][&size=suv|large][&ref=<code>]
//   الخطوات التالية بنفس البارامترات + &branch=<id> (+ &car=<id>)
// services = slugs خدمات المزوّد (lib/data/provider-details: johnson-ceramic-pro، interior-detailing …)
//            أو slugs الأصناف الخمسة (wash, ppf, …) للمزوّدين التانيين. &package=<slug> (مفرد) مقبول كمان.
export type BookingQuery = {
  provider?: string;
  services?: string[];
  packages?: string[];
  offer?: string;
  ref?: string;
  size?: string;
  branch?: string;
  car?: string;
};

type SearchParams = Record<string, string | string[] | undefined>;

const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) || undefined;

export function parseBookingQuery(sp: SearchParams): BookingQuery {
  const list = (v: string | string[] | undefined) =>
    (one(v) ?? "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
  const packages = [...new Set([...list(sp.package), ...list(sp.packages)])];
  const size = one(sp.size);
  return {
    provider: one(sp.provider),
    services: list(sp.services),
    packages,
    size: size === "suv" || size === "large" ? size : undefined,
    offer: one(sp.offer),
    ref: one(sp.ref),
    branch: one(sp.branch),
    car: one(sp.car),
  };
}

// يبني الرابط بنفس ترتيب البارامترات + أي بارامترات إضافية (mode, fail …)
export function bookingHref(path: string, q: BookingQuery, extra: Record<string, string | undefined> = {}): string {
  const p = new URLSearchParams();
  if (q.provider) p.set("provider", q.provider);
  if (q.services?.length) p.set("services", q.services.join(","));
  if (q.packages?.length) p.set("packages", q.packages.join(","));
  if (q.offer) p.set("offer", q.offer);
  if (q.size) p.set("size", q.size);
  if (q.ref) p.set("ref", q.ref);
  if (q.branch) p.set("branch", q.branch);
  if (q.car) p.set("car", q.car);
  for (const [k, v] of Object.entries(extra)) if (v) p.set(k, v);
  const s = p.toString().replace(/%2C/g, ",");
  return s ? `${path}?${s}` : path;
}

// سيارة مضافة من «أضف سيارة أخرى» (P-24) قبل ما تتحفظ في الحساب: car=custom~الشركة~الموديل~السنة~الحجم
export function customCarId(c: { make: string; model: string; year: string; size: string }) {
  return ["custom", c.make, c.model, c.year, c.size].join("~");
}
