"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

import Tooltip from "@/components/atoms/Tooltip";
import { useStatus } from "@/lib/lanyard";
import { cn, user } from "@/lib/utils";

const RichPresence: React.FC = () => {
  const [isMounted, setIsMounted] = useState(false);
  let [activity, setActivity] = useState(`@${user.username}`);
  let [details, setDetails] = useState<string>("Fetching...");

  const [timeCurr, setTimeCurr] = useState("");
  const [elapsedTime, setElapsedTime] = useState("");
  const [musicProgress, setMusicProgress] = useState("0");

  const [isActivity, setIsActivity] = useState(false);
  const [activityNumber, setActivityNumber] = useState(0);
  const [isSpotify, setIsSpotify] = useState(false);
  let [state, setState] = useState("");
  let [activityImage, setActivityImage] = useState("");
  const [songLink, setSongLink] = useState("");
  const [smallImage, setSmallImage] = useState("");
  const [musicDuration, setMusicDuration] = useState("");
  const [customStatus, setCustomStatus] = useState("");
  const { status: data } = useStatus();

  useEffect(() => setIsMounted(true), []);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const images: { [key: string]: string } = {
    "CLIP STUDIO PAINT": "https://i.imgur.com/IUVs3RB.png",
  };

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
    let elapsedMs = new Date().getTime() - timestampStart;
    // shrimple but hacky way of getting time from ms
    let elapsed = new Date(elapsedMs).toISOString().slice(11, 19) + " elapsed";
    setElapsedTime(elapsed);
    if (elapsed.slice(0, 2) === "00") {
      elapsed = elapsed.slice(-13);
      setElapsedTime(elapsed);
    }
  };

  const getMusicProgress = (spotify: any) => {
    let spotifyTotal = spotify?.timestamps?.end - spotify?.timestamps?.start;
    let progress =
      100 -
      (100 * (spotify?.timestamps?.end - new Date().getTime())) / spotifyTotal;
    // setMusicDuration(
    //   new Date(new Date().getTime() - spotify.timestamps.start)
    //     .toISOString()
    //     .slice(14, 19) +
    //     " / " +
    //     new Date(spotifyTotal).toISOString().slice(14, 19)
    // );
    setMusicProgress(progress.toString());
  };

  useEffect(() => {
    setActivityImage(
      `https://cdn.discordapp.com/avatars/${user.id}/${data?.discord_user.avatar}.png?size=512`
    );

    if (data?.listening_to_spotify) setIsSpotify(true);
    else setIsSpotify(false);

    if (!!data?.activities[0]) setIsActivity(true);
    else setIsActivity(false);

    if (data?.activities[0]?.name === "Custom Status") {
      setCustomStatus(
        `${data?.activities[0]?.emoji?.name} ${data?.activities[0]?.state}`
      );
    } else {
      setCustomStatus("");
    }

    if (data?.activities[1]) {
      // setIsActivity(true);
      setActivityNumber(1);
    } else {
      // setIsActivity(false);
      setActivityNumber(0);
    }

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
          : data?.discord_status!
      );
      setActivityImage(
        `https://cdn.discordapp.com/avatars/${user.id}/${data?.discord_user.avatar}.png?size=512`
      );
      setSmallImage("");
      tick();
    }
  }, [activityNumber, customStatus, data, images, isActivity, isSpotify]);

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
              src={smallImage}
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
            >
              <Tooltip tip="Open Spotify">
                <h3 className="font-spacegrotesk ">{activity}</h3>
              </Tooltip>
            </Link>
          ) : (
            <h3 className="font-spacegrotesk ">{activity}</h3>
          )}
          {/* <h5 className="hidden md:block">
            {(!isSpotify && !isActivity && customStatus) || ""}
          </h5> */}
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
            <>
              <progress className="" max="100" value={musicProgress} />
              {/* <h5>{musicDuration || ""}</h5> */}
            </>
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
