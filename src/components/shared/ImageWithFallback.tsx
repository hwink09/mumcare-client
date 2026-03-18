import { useState } from "react";
import { resolveImageUrl } from "@/lib/image";

interface ImageWithFallbackProps {
  src: string;
  alt: string;
  className?: string;
}

export function ImageWithFallback({
  src,
  alt,
  className = "",
}: ImageWithFallbackProps) {
  const [isError, setIsError] = useState(false);

  const fallbackImage =
    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Crect fill='%23f3f4f6' width='100' height='100'/%3E%3Ctext x='50' y='50' font-size='12' fill='%239ca3af' text-anchor='middle' dy='.3em'%3EImage not found%3C/text%3E%3C/svg%3E";

  const processedSrc = resolveImageUrl(src || "");

  return (
    <img
      src={isError || !processedSrc ? fallbackImage : processedSrc}
      alt={alt}
      className={className}
      onError={() => setIsError(true)}
    />
  );
}
