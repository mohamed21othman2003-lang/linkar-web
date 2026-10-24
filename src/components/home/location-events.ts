// تواصل بسيط بين أجزاء الرئيسية (الهيرو، «تغيير» في اخترنا لك، نافذة الموقع) من غير state مشترك
export const LOCATION_OPEN = "linkar:location-open";
export const LOCATION_SET = "linkar:location-set";
export const LOCATION_STORAGE_KEY = "linkar_location_prompt";

export function openLocationModal() {
  window.dispatchEvent(new Event(LOCATION_OPEN));
}

export function announceLocation(label: string) {
  window.dispatchEvent(new CustomEvent<string>(LOCATION_SET, { detail: label }));
}
