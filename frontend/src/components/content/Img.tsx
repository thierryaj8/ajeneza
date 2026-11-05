import NextImage, { type ImageProps } from "next/image";

/**
 * next/image wrapper. Files uploaded to local disk are served by Express at /uploads,
 * outside Next.js, so they skip the optimizer; Cloudinary URLs are optimized as usual.
 */
export default function Img(props: ImageProps) {
  const src = typeof props.src === "string" ? props.src : "";
  return <NextImage {...props} unoptimized={props.unoptimized ?? src.startsWith("/")} />;
}
