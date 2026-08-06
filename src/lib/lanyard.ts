import { useLanyard } from "react-use-lanyard";

import { user } from "@/lib/utils";

/**
 * Live Discord presence over Lanyard's websocket. The user id comes from
 * `user` so it stays a single source of truth rather than being repeated here.
 */
export function useStatus() {
  return useLanyard({ userId: user.id, socket: true });
}
