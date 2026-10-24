import type { DemoUser } from "./types";

// العميل التجريبي في كل شاشات الحساب (W2-60 وما بعدها): «محمد سالم» · 1,250 نقطة
export const demoUser: DemoUser = {
  id: "u-1001",
  name_ar: "محمد سالم",
  name_en: "Mohammed Salem",
  first_name_ar: "محمد",
  first_name_en: "Mohammed",
  initial_ar: "م",
  initial_en: "M",
  phone: "055 123 4567",
  email: "mohammed.salem@example.com",
  points: 1250,
  is_new: false,
};

// عميل جديد — لحالات الشاشات الفاضية (W2-xx-0)
export const newUser: DemoUser = {
  ...demoUser,
  id: "u-1002",
  points: 0,
  is_new: true,
};
