// مسار تشغيل اللوحة تحت دومين تاني (مثلاً linkar.ido.sa/admin) — بيتحدد وقت البناء من NEXT_PUBLIC_BASE_PATH.
// Link و router و redirect بيضيفوه لوحدهم؛ withBase للحاجات اللي Next مابيلمسهاش (fetch، صور public، sprite الأيقونات).
export const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
export const withBase = (path: string) => `${BASE_PATH}${path}`;
