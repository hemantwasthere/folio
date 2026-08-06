"use client";

import Image from "next/image";
import Link from "next/link";
import posthog from "posthog-js";
import { useEffect, useState } from "react";
import type { LanyardData } from "react-use-lanyard";

import Tooltip from "@/components/ui/Tooltip";
import { useStatus } from "@/lib/lanyard";
import { cn, user } from "@/lib/utils";

type Activity = LanyardData["activities"][number];

/** Activities Discord ships without an asset we can resolve. */
const FALLBACK_IMAGES: Record<string, string> = {
  "CLIP STUDIO PAINT": "https://i.imgur.com/IUVs3RB.png",
};

const PLACEHOLDER = "/question_mark.png";

const avatarUrl = (hash: string | null | undefined) =>
  hash
    ? `https://cdn.discordapp.com/avatars/${user.id}/${hash}.png?size=512`
    : PLACEHOLDER;

const assetUrl = (applicationId: string | undefined, asset: string) =>
  `https://cdn.discordapp.com/app-assets/${applicationId}/${asset}.webp?size=512`;

/** "hh:mm:ss elapsed", dropping the hours segment while it is still zero. */
function formatElapsed(ms: number) {
  const stamp = new Date(ms).toISOString().slice(11, 19);
  return `${stamp.startsWith("00:") ? stamp.slice(3) : stamp} elapsed`;
}

type Presence = {
  title: string;
  details: string;
  state: string;
  image: string;
  smallImage: string;
  songLink: string;
};

/**
 * Pure projection of a Lanyard payload onto what the card renders. Kept out of
 * the component (and out of state) so a new payload is a plain re-render rather
 * than a cascade of setState calls.
 */
function derivePresence(
  data: LanyardData | undefined,
  activity: Activity | undefined
): Presence {
  const base = { state: "", smallImage: "", songLink: "" };

  if (!data) {
    return {
      ...base,
      title: `@${user.username}`,
      details: "Fetching...",
      image: PLACEHOLDER,
    };
  }

  if (data.listening_to_spotify && data.spotify) {
    const { song, artist, album, album_art_url, track_id } = data.spotify;
    return {
      ...base,
      title: song,
      details: `by ${artist.replace(/;/g, ",")}`,
      state: song === album ? "" : `from ${album}`,
      image: album_art_url,
      songLink: `https://open.spotify.com/track/${track_id}`,
    };
  }

  if (activity) {
    const { name, details, state, assets, application_id } = activity;
    return {
      ...base,
      title: name,
      details: details ?? "",
      state: state ?? "",
      image: assets?.large_image
        ? assetUrl(application_id, assets.large_image)
        : (FALLBACK_IMAGES[name] ?? PLACEHOLDER),
      smallImage: assets?.small_image
        ? assetUrl(application_id, assets.small_image)
        : "",
    };
  }

  return {
    ...base,
    title: `@${user.username}`,
    details:
      data.discord_status === "dnd"
        ? "Do Not Disturb"
        : (data.discord_status ?? ""),
    image: avatarUrl(data.discord_user?.avatar),
  };
}

const RichPresence: React.FC = () => {
  const { status: data } = useStatus();

  // Single clock driving every live value on the card. Previously the elapsed
  // counter and the Spotify bar were only recomputed when a websocket message
  // arrived, so they sat frozen between presence changes.
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    const tick = () => setNow(Date.now());

    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, []);

  // Discord keeps a custom status in slot 0, so a real activity lands in slot 1.
  const activities = data?.activities ?? [];
  const activity = activities[1] ?? activities[0];

  const isSpotify = Boolean(data?.listening_to_spotify && data?.spotify);
  const isActivity = Boolean(activities[0]);

  const { title, details, state, image, smallImage, songLink } = derivePresence(
    data,
    activity
  );

  const start = data?.spotify?.timestamps?.start;
  const end = data?.spotify?.timestamps?.end;
  const musicProgress =
    now !== null && start !== undefined && end !== undefined && end > start
      ? Math.min(100, Math.max(0, ((now - start) / (end - start)) * 100))
      : 0;

  const elapsed =
    now !== null && activity?.timestamps?.start
      ? formatElapsed(now - activity.timestamps.start)
      : "";

  // `now` is null until the clock starts on mount, which doubles as the guard
  // against rendering time-dependent markup during SSR.
  if (now === null) return null;

  const localTime = new Date(now).toLocaleString("en-US", {
    timeZone: "Asia/Kolkata",
  });

  return (
    <div>
      <h2 className="md:hidden">activity</h2>
      <div className=" gap-9 items-center font-jetbrains grid grid-cols-12">
        <div className="mt-1 relative w-[100px] h-[100px] md:w-[135px] md:h-[135px] col-span-4">
          <Image
            src={image}
            alt={title}
            fill
            className={cn("rounded-[20px] relative select-none", {
              "animate-[spin_40s_linear_infinite] rounded-[100%]": isSpotify,
            })}
            style={{
              transition: "all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
            }}
          />

          {smallImage && (
            <Image
              src={smallImage}
              alt={title}
              width={40}
              height={40}
              className="rounded-[100%] absolute -right-3 -bottom-3 outline-[6px] outline-bg_color bg-bg_color"
            />
          )}
        </div>

        <div className="col-span-6 sm:col-span-8">
          {isSpotify ? (
            <Link
              className="rounded-[4px] py-2 underline decoration-bg_color hover:decoration-text_primary offset_ring"
              href={songLink}
              target="_blank"
              rel="noreferrer"
              style={{ transition: ".3s cubic-bezier(0.25, 0.46, 0.45, 0.94)" }}
              onClick={() => {
                posthog.capture("Spotify link clicked", {
                  Clicked: true,
                });
              }}
            >
              <Tooltip tip="Open Spotify" tabIndex={2}>
                <h3 className="font-spacegrotesk ">{title}</h3>
              </Tooltip>
            </Link>
          ) : (
            <h3 className="font-spacegrotesk ">{title}</h3>
          )}
          <h5 className="">
            {details.length > 28 ? `${details.slice(0, 25)}...` : details}
          </h5>
          <h5 className="">{state}</h5>
          <h5 className="">{!isActivity && localTime}</h5>
          {isSpotify ? (
            <progress max="100" value={musicProgress} />
          ) : isActivity ? (
            <h5>{elapsed}</h5>
          ) : (
            ""
          )}
        </div>
      </div>
    </div>
  );
};

export default RichPresence;
