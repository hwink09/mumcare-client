const BACKEND_URL = "http://localhost:8017";

export const extractImageUrl = (value: unknown): string => {
  if (typeof value === "string") return value.trim();

  if (value && typeof value === "object") {
    const candidate = value as {
      url?: unknown;
      secure_url?: unknown;
      path?: unknown;
      src?: unknown;
      location?: unknown;
      image?: unknown;
    };

    return extractImageUrl(
      candidate.url ??
      candidate.secure_url ??
      candidate.path ??
      candidate.src ??
      candidate.location ??
      candidate.image,
    );
  }

  return "";
};

export const normalizeImageList = (value: unknown): string[] => {
  if (Array.isArray(value)) {
    return value.map(extractImageUrl).filter((item): item is string => Boolean(item));
  }

  const single = extractImageUrl(value);
  return single ? [single] : [];
};

export const resolveImageUrl = (value: string): string => {
  const normalized = value.trim().replace(/\\/g, "/");
  if (!normalized) return "";

  if (
    normalized.startsWith("http://") ||
    normalized.startsWith("https://") ||
    normalized.startsWith("data:") ||
    normalized.startsWith("blob:")
  ) {
    return normalized;
  }

  if (normalized.startsWith("/uploads")) {
    return `${BACKEND_URL}${normalized}`;
  }

  if (normalized.startsWith("uploads/")) {
    return `${BACKEND_URL}/${normalized}`;
  }

  return normalized;
};
