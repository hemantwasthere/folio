import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

class DiscordUser {
  constructor(
    public username: string,
    public id: string
  ) {}
}

export const user = new DiscordUser("dreadedguy", "756858570602971186");
