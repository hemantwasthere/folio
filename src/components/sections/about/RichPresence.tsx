"use client";

import Image from "next/image";
import Link from "next/link";
import posthog from "posthog-js";
import { useEffect, useState } from "react";

import Tooltip from "@/components/ui/Tooltip";
import { useStatus } from "@/lib/lanyard";
import { cn, user } from "@/lib/utils";
import type { LanyardData } from "react-use-lanyard";

// Hoisted so it stays referentially stable across renders instead of churning
// the presence effect's dependency list.
const images: { [key: string]: string } = {
  "CLIP STUDIO PAINT": "https://i.imgur.com/IUVs3RB.png",
};

const RichPresence: React.FC = () => {
  const [isMounted, setIsMounted] = useState(false);
  const [activity, setActivity] = useState(`@${user.username}`);
  const [details, setDetails] = useState<string>("Fetching...");

  const [timeCurr, setTimeCurr] = useState("");
  const [elapsedTime, setElapsedTime] = useState("");
  const [musicProgress, setMusicProgress] = useState("0");

  const [isActivity, setIsActivity] = useState(false);
  const [activityNumber, setActivityNumber] = useState(0);
  const [isSpotify, setIsSpotify] = useState(false);
  const [state, setState] = useState("");
  const [activityImage, setActivityImage] = useState("");
  const [songLink, setSongLink] = useState("");
  const [smallImage, setSmallImage] = useState("");
  const { status: data } = useStatus();

  // Presence shows live, clock-dependent content, so it can only render after
  // mount without desyncing from the server-rendered HTML.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => setIsMounted(true), []);

  const localTime = () =>
    setTimeCurr(
      new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" })
    );

  useEffect(() => {
    const interval = setInterval(() => localTime(), 1000);
    return () => clearInterval(interval);
  }, []);

  const getElapsedTime = (timestampStart: number | undefined) => {
    if (!timestampStart) return;
    const elapsedMs = new Date().getTime() - timestampStart;
    // shrimple but hacky way of getting time from ms
    let elapsed = new Date(elapsedMs).toISOString().slice(11, 19) + " elapsed";
    setElapsedTime(elapsed);
    if (elapsed.slice(0, 2) === "00") {
      elapsed = elapsed.slice(-13);
      setElapsedTime(elapsed);
    }
  };

  const getMusicProgress = (spotify: LanyardData["spotify"] | undefined) => {
    const start = spotify?.timestamps?.start;
    const end = spotify?.timestamps?.end;
    if (start === undefined || end === undefined) return;

    const spotifyTotal = end - start;
    const progress = 100 - (100 * (end - Date.now())) / spotifyTotal;
    setMusicProgress(progress.toString());
  };

  // Mirrors the Lanyard websocket payload into local state; the writes are the
  // point of the effect, not an accidental cascade.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setActivityImage(
      `https://cdn.discordapp.com/avatars/${user.id}/${data?.discord_user.avatar}.png?size=512`
    );

    if (data?.listening_to_spotify) setIsSpotify(true);
    else setIsSpotify(false);

    if (!!data?.activities[0]) setIsActivity(true);
    else setIsActivity(false);

    if (data?.activities[1]) setActivityNumber(1);
    else setActivityNumber(0);

    const tick = () => {
      if (isSpotify) getMusicProgress(data?.spotify);
      else if (isActivity)
        getElapsedTime(data?.activities[activityNumber]?.timestamps?.start);
      else if (!isActivity) localTime();
    };

    if (isSpotify) {
      if (!data?.spotify) return;
      const { song, artist, album, album_art_url } = data?.spotify;
      setActivity(song);
      setDetails("by " + artist.replace(/;/g, ","));
      setState(song === album ? "" : "from " + album);
      setActivityImage(album_art_url);
      setSongLink(`https://open.spotify.com/track/${data?.spotify.track_id}`);
      setSmallImage("");
      tick();
    } else if (isActivity) {
      if (!data?.activities[activityNumber]) return;
      const { name, details, state, assets } = data?.activities[activityNumber];
      setActivity(name);
      setDetails(details!);
      setState(state);
      setActivityImage(
        assets
          ? `https://cdn.discordapp.com/app-assets/${data?.activities[activityNumber]?.application_id}/${data?.activities[activityNumber]?.assets?.large_image}.webp?size=512`
          : images[name] || "/question_mark.png"
      );
      if (assets && assets.small_image) {
        setSmallImage(
          `https://cdn.discordapp.com/app-assets/${data?.activities[activityNumber]?.application_id}/${data?.activities[activityNumber]?.assets?.small_image}.webp?size=512`
        );
      } else {
        setSmallImage("");
      }
      tick();
    } else if (!isActivity) {
      setActivity(`@${user.username}`);
      setDetails(
        data?.discord_status === "dnd"
          ? "Do Not Disturb"
          : (data?.discord_status ?? "")
      );

      setActivityImage(
        data?.discord_user.avatar
          ? `https://cdn.discordapp.com/avatars/${user.id}/${data?.discord_user.avatar}.png?size=512`
          : "/question_mark.png"
      );

      setSmallImage("");
      tick();
    }
    // Known wrinkle: isSpotify/isActivity/activityNumber are both written and
    // read here, so a new payload runs this twice — once with the previous
    // flags, then again once they settle. It converges (React bails out on
    // equal values) but the right fix is to derive them from `data` during
    // render instead of storing them as state.
  }, [activityNumber, data, isActivity, isSpotify]);

  if (!isMounted) return null;

  return (
    <div>
      <h2 className="md:hidden">activity</h2>
      <div className=" gap-9 items-center font-jetbrains grid grid-cols-12">
        <div className="mt-1 relative w-[100px] h-[100px] md:w-[135px] md:h-[135px] col-span-4">
          <Image
            src={activityImage}
            alt={activity}
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
              src={smallImage ?? "/question_mark.png"}
              alt={activity}
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
                <h3 className="font-spacegrotesk ">{activity}</h3>
              </Tooltip>
            </Link>
          ) : (
            <h3 className="font-spacegrotesk ">{activity}</h3>
          )}
          <h5 className="">
            {details
              ? details.length > 28
                ? details.slice(0, 25) + "..."
                : details
              : ""}
          </h5>
          <h5 className="">{state || ""}</h5>
          <h5 className="">{!isActivity && timeCurr}</h5>
          {isSpotify ? (
            <progress max="100" value={musicProgress} />
          ) : isActivity ? (
            <h5>{elapsedTime}</h5>
          ) : (
            ""
          )}
        </div>
      </div>
    </div>
  );
};

export default RichPresence;
