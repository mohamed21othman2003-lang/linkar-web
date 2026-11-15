import { getImageProps, type ImageProps } from "next/image";

// نفس استخدام next/image (src · width/height أو fill · sizes · quality …) ونفس الروابط المحسّنة (/_next/image + srcset)،
// بس بيرسم <img> عادي: next/image نفسه client component — كل صورة كانت بتتعمل لها hydration وبياناتها بتتبعت تاني
// للمتصفح (44 صورة في الرئيسية). من غير placeholder/onLoad (مش مستخدمين في المشروع).
export default function Img(props: ImageProps) {
  const { props: img } = getImageProps(props);
  // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text -- alt جاي من props
  return <img {...img} />;
}
