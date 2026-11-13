// أنواع البيانات بنفس شكل الـAPI المتوقع (هتتحدّث من ملف «لوحة تحكم لينكار» القسم 8 لما يوصل)

export interface Me {
  id: string;
  name: string;
  initial: string;
  role: string;
  scope: string;
  email: string;
  phoneMasked: string;
  /** ISO date */
  memberSince: string;
  passwordChangedDaysAgo: number;
  mfa: { enabled: boolean; method: string };
  /** «module:action» أو «*» */
  permissions: string[];
}

export interface Session {
  id: string;
  device: string;
  city: string;
  /** "now" أو مدة نسبية مختصرة (3h, 2d) لحد ما الخادم يبعت تاريخ */
  lastSeen: string;
  current?: boolean;
}
