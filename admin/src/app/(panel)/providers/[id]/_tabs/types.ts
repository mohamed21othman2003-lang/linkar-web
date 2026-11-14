import type { ProviderProfile } from "@/lib/api/profile";

// كل تبويب في ملف المزوّد مكوّن مستقل في _tabs/<tab>.tsx بياخد نفس الخصائص دي.
// الرأس والتبويبات ونوافذ إجراءات المنشأة في _components/ProfileView.tsx — التبويب يرسم محتواه بس (تحت شريط التبويبات جوه نفس البطاقة البيضا).
export type ProfileTabProps = {
  profile: ProviderProfile;
  /** صلاحية تعديل مقدّمي الخدمة (القسم 2.5) */
  canEdit: boolean;
};
