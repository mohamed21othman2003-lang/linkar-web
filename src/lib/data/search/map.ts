// رسومات الخرائط (مش مكتبة خرائط حيّة): الطرق والحدائق والأحياء بنفس إحداثيات الفيجما
//  - search    = Map canvas في W2-30m (769:16337) — 860×780
//  - providers = Map في W2-26m (694:2635) — 800×780
export type MapRect = { x: number; y: number; w: number; h: number; r?: number; rot?: number; kind: "road" | "main" | "park" | "block" };
export type MapLabel = { x: number; y: number; w: number; text_ar: string; text_en: string; sea?: boolean }; // w = عرض النص في الفيجما (الحافة اليمنى = x + w)
export type MapGeometry = {
  w: number;
  h: number;
  sea: { x: number; y: number; w: number; h: number };
  rects: MapRect[];
  labels: MapLabel[];
};

const names = {
  rawdah: ["الروضة", "Al Rawdah"],
  zahra: ["الزهراء", "Al Zahra"],
  salamah: ["السلامة", "Al Salamah"],
  hamra: ["الحمراء", "Al Hamra"],
  mohammadiyah: ["المحمدية", "Al Mohammadiyah"],
  khalidiyah: ["الخالدية", "Al Khalidiyah"],
  naeem: ["النعيم", "Al Naeem"],
  sea: ["البحر الأحمر", "Red Sea"],
} as const;
const widths: Record<keyof typeof names, number> = { rawdah: 39, zahra: 39, salamah: 46, hamra: 40, mohammadiyah: 54, khalidiyah: 46, naeem: 36, sea: 64 };
const label = (x: number, y: number, k: keyof typeof names, sea = false): MapLabel => ({ x, y, w: widths[k], text_ar: names[k][0], text_en: names[k][1], sea });

export const mapGeometry: Record<"search" | "providers", MapGeometry> = {
  search: {
    w: 860,
    h: 780,
    sea: { x: -20, y: -20, w: 230, h: 820 },
    rects: [
      { kind: "road", x: 140, y: 170, w: 900, h: 14 },
      { kind: "road", x: 140, y: 430, w: 900, h: 10 },
      { kind: "road", x: 140, y: 640, w: 900, h: 8 },
      { kind: "road", x: 330, y: 0, w: 12, h: 780 },
      { kind: "road", x: 560, y: 0, w: 8, h: 780 },
      { kind: "road", x: 770, y: 0, w: 10, h: 780 },
      { kind: "park", x: 600, y: 470, w: 150, h: 110, r: 18 },
      { kind: "block", x: 380, y: 220, w: 150, h: 170, r: 14 },
      { kind: "block", x: 620, y: 220, w: 120, h: 170, r: 14 },
    ],
    labels: [
      label(604, 120, "rawdah"),
      label(379, 470, "zahra"),
      label(798, 300, "salamah"),
      label(232, 250, "hamra"),
      label(790, 690, "mohammadiyah"),
      label(36, 380, "sea"),
    ],
  },
  providers: {
    w: 800,
    h: 780,
    sea: { x: -10, y: -20, w: 155, h: 820 },
    rects: [
      { kind: "park", x: 520, y: 70, w: 150, h: 110, r: 18 },
      { kind: "park", x: 260, y: 560, w: 180, h: 120, r: 18 },
      { kind: "park", x: 600, y: 520, w: 120, h: 160, r: 18 },
      { kind: "main", x: 140, y: 250, w: 700, h: 18 },
      { kind: "main", x: 140, y: 470, w: 700, h: 14, rot: -4 },
      { kind: "main", x: 330, y: -20, w: 18, h: 840 },
      { kind: "main", x: 560, y: -20, w: 14, h: 840, rot: 3 },
      { kind: "road", x: 140, y: 120, w: 700, h: 8, rot: 2 },
      { kind: "road", x: 140, y: 360, w: 700, h: 8 },
      { kind: "road", x: 140, y: 640, w: 700, h: 8, rot: -2 },
      { kind: "road", x: 240, y: -20, w: 8, h: 840 },
      { kind: "road", x: 450, y: -20, w: 8, h: 840, rot: -2 },
      { kind: "road", x: 680, y: -20, w: 8, h: 840 },
    ],
    labels: [
      label(404, 300, "rawdah"),
      label(229, 190, "zahra"),
      label(609, 200, "salamah"),
      label(200, 400, "khalidiyah"),
      label(618, 420, "naeem"),
      label(222, 740, "hamra"),
      label(642, 80, "mohammadiyah"),
      label(50, 414, "sea", true),
    ],
  },
};
