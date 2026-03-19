import { io } from "socket.io-client";
import type { CurrentUser } from "@/hooks/useAuth";
import { SOCKET_URL } from "@/utils/constants";

const STAFF_ROLE_SET = new Set(["staff", "admin", "manager"]);

export const createChatSocket = () => io(SOCKET_URL);

export const isStaffRole = (role?: string | null) => STAFF_ROLE_SET.has(role ?? "");

export const getChatUserId = (user?: CurrentUser | null) =>
  user?._id || user?.id || user?.email || null;

export const getChatDisplayName = (
  user?: Pick<CurrentUser, "firstName" | "lastName"> | null,
  fallback = "Client",
) => {
  const name = [user?.firstName, user?.lastName].filter(Boolean).join(" ").trim();
  return name || fallback;
};
