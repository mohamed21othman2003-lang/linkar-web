// أسماء الـtokens اللي في globals.css (القيم نفسها بتتقري من الـCSS)

export const BRAND_COLORS = [
  "deep-charcoal", "solid-black", "neon-green", "nature-green",
  "cool-gray", "state-gray", "slate-blue", "olive-khaki",
  "promotional-red", "brik-red", "neon-active", "green-active",
  "cool-gray-active", "green-dark", "surface-soft", "white",
];

export const V3_COLORS = [
  "v3-text-meta", "v3-rating-star", "v3-card-dark", "v3-chip-dark",
  "v3-text-on-dark", "v3-card-stroke", "v3-box-light", "v3-heart-lime",
  "v3-text-on-lime",
];

export const SEMANTIC_COLORS: Record<string, string[]> = {
  bg: [
    "bg-canvas", "bg-surface", "bg-subtle", "bg-muted", "bg-strong", "bg-inverse",
    "bg-inverse-subtle", "bg-brand", "bg-brand-hover", "bg-brand-pressed", "bg-brand-subtle",
    "bg-success-subtle", "bg-warning-subtle", "bg-danger", "bg-danger-subtle",
    "bg-info-subtle", "bg-overlay", "bg-glass",
  ],
  text: [
    "text-primary", "text-secondary", "text-tertiary", "text-disabled", "text-inverse",
    "text-on-brand", "text-brand", "text-success", "text-warning", "text-danger",
    "text-info", "text-link", "text-on-image", "text-on-image-muted",
  ],
  border: [
    "border-default", "border-subtle", "border-strong", "border-inverse", "border-focus",
    "border-brand", "border-danger", "border-success", "border-glass",
  ],
  icon: [
    "icon-primary", "icon-secondary", "icon-tertiary", "icon-inverse", "icon-brand",
    "icon-on-brand", "icon-danger", "icon-rating", "icon-on-image",
  ],
};

// v2/Web/* — [اسم الـutility, اسم النمط في الفيجما, المقاس/السطر, الوزن]
export const TYPE_SCALE: [string, string, string, string][] = [
  ["text-display-xl", "v2/Web/Display XL", "64/96", "Bold"],
  ["text-display-l", "v2/Web/Display L", "52/78", "Bold"],
  ["text-h2", "v2/Web/H2", "32/48", "Bold"],
  ["text-h3", "v2/Web/H3", "26/40", "Bold"],
  ["text-h4", "v2/Web/H4", "22/34", "Bold"],
  ["text-h5", "v2/Web/H5", "18/28", "Bold"],
  ["text-body-l", "v2/Web/Body L", "18/30", "Light"],
  ["text-body-m", "v2/Web/Body M", "16/28", "Light"],
  ["text-body-s", "v2/Web/Body S", "14/24", "Light"],
  ["text-label-l", "v2/Web/Label L", "16/26", "Medium"],
  ["text-label-m", "v2/Web/Label M", "14/22", "Medium"],
  ["text-caption", "v2/Web/Caption", "14/22", "Light"],
  ["text-overline", "v2/Web/Overline", "14/22", "Medium"],
  ["text-micro", "v2/Dash/Micro", "12/20", "Medium"],
];

// جملة العينة من صفحة Brand kit في الفيجما
export const TYPE_SAMPLE = "قارن مراكز العناية بسيارتك";

export const RADII = ["xs", "sm", "md", "lg", "xl", "2xl", "3xl", "full"];
export const SHADOWS = ["elevation-1", "elevation-2", "elevation-3", "focus-ring"];
export const SIZES = [
  "icon-xs", "icon-sm", "icon-md", "icon-lg",
  "control-sm", "control-md", "control-lg", "control-xl",
];
