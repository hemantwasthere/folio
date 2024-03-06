/* eslint-disable @next/next/no-img-element */
"use client";

import { motion } from "framer-motion";
import Head from "next/head";
import Link from "next/link";
import React, { useEffect, useState } from "react";

import { cn } from "@/lib/utils";

interface BlogworkProps {
  blog: string;
  subtitle?: string;
  tall?: boolean;
  shrink?: boolean;
  commission?: boolean;
  link?: string;
}

const Blogwork: React.FC<BlogworkProps> = ({
  blog = "",
  subtitle = "Click anywhere to dismiss!",
  tall = false,
  shrink = false,
  commission = false,
  link = "https://blog.hemant.social",
}) => {
  const [clicked, setClicked] = useState(false);

  function onKeyDown(e: KeyboardEvent) {
    if (e.key === "Escape") {
      setClicked(false);
    }
  }

  function disableRightClick(event: { preventDefault: () => void }) {
    if (commission) {
      event.preventDefault();
    }
  }

  useEffect(() => {
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  return (
    <>
      <Head>
        {clicked ? <title>Hemant · {blog}</title> : <title>Hemant</title>}
      </Head>

      <div
        className={cn(
          "relative border-none p-0 h-full w-full rounded-none md:rounded-[4px] overflow-hidden bg-elevation_one transition-[all_0.3s_var(--bezier-one)] cursor-pointer select-none bg-cover bg-no-repeat bg-center blog_card focus-within:offset_ring",
          {
            blog_tall: tall,
            blog_shrink: shrink,
          }
        )}
        style={{ backgroundImage: `url(blog/sketchy_anime/${blog}.jpeg` }}
        aria-label={blog}
        onClick={() => setClicked(true)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            setClicked(true);
          }
        }}
        role="button"
        tabIndex={0}
      />

      {clicked && (
        <motion.div
          className="blog_img_modal bg-blend-overlay flex flex-col justify-center items-center fixed left-0 top-[50%] w-full h-full z-20 cursor-pointer select-none bg-elevation_six backdrop-blur-[12px]"
          onClick={() => setClicked(false)}
          onContextMenu={disableRightClick}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.3, ease: "linear" } }}
          transition={{ duration: 0.3, ease: "linear" }}
        >
          <motion.div
            initial={{
              opacity: 0,
              y: "5%",
              transitionProperty: "opacity, y",
            }}
            animate={{
              opacity: 1,
              y: "0%",
              transition: { duration: 0.3, ease: "linear" },
            }}
            exit={{
              opacity: 0,
              y: "100%",
              transition: { duration: 0.3, ease: "linear" },
            }}
            transition={{ duration: 0.3, ease: "linear" }}
            // we want same animation when the modal gets closed
            // so we use the same transition for exit and initial

            className="flex flex-col justify-center items-center"
          >
            <h3 className="m-[1vh] text-[3.5vh] font-[500] text-text_primary">
              {blog}
            </h3>

            <img
              className="max-h-[83vh] h-auto max-w-[86vw] rounded-[2vh] flex justify-center items-center"
              src={`/blog/sketchy_anime/${blog}.jpeg`}
              alt={blog}
            />

            <Link
              href={link}
              target="_blank"
              className="offset_ring rounded-md m-[1vh] text-[2vh] mt-[2vh] flex items-center gap-2 text-text_secondary group hover:brightness-[1.3]"
            >
              {subtitle}
              <svg
                width="24px"
                height="24px"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                id="open"
                className="open_new_window_icon h-[20px] transition-[filter_.3s_var(--bezier-one)] group-hover:brightness-[1.3] group-hover:ml-2"
              >
                <path
                  d="M21 3h-6m6 0l-9 9m9-9v6"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                ></path>
                <path
                  d="M21 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h6"
                  stroke="#BDA3A2"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                ></path>
              </svg>
            </Link>
          </motion.div>
        </motion.div>
      )}
    </>
  );
};

export default Blogwork;
