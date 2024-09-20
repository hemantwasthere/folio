import { useTranslations } from "next-intl";

import Blogwork from "../atoms/Blogwork";

const BlogGrid = () => {
  const t = useTranslations("Blog");

  return (
    <div className="flex justify-center mb-16">
      <div
        className="grid gap-[0.2rem] md:gap-[0.8rem] flex-col justify-center items-center grid-cols-[1fr_1fr_1fr] md:grid-cols-[repeat(auto-fill,_minmax(250px,_1fr))] w-[min(100%,_75rem)] md:w-[min(90%,_72rem)] blog_grid"
        style={{
          gridAutoRows: "230px",
        }}
      >
        <Blogwork
          src="frost"
          blog={t("blog1.blog")}
          subtitle={t("blog1.subtitle")}
          tall
          subtitle="docker networking"
          link="https://blog.hemant.lol/docker"
        />
        <Blogwork
          blog="deep"
          subtitle="graphql"
          link="https://blog.hemant.lol/graphql"
        />
        <Blogwork
          src="rain"
          blog={t("blog3.blog")}
          subtitle={t("blog3.subtitle")}
          tall
          subtitle="kafka"
          link="https://blog.hemant.lol/kafka"
        />
        <Blogwork
          blog="purp"
          subtitle="whisper"
          link="https://blog.hemant.lol/whisper"
        />
        <Blogwork
          src="makima"
          blog={t("blog5.blog")}
          subtitle={t("blog5.subtitle")}
          tall
          subtitle="cloudflare"
          link="https://blog.hemant.lol/cloudflare"
        />
        <Blogwork
          src="ghost"
          blog={t("blog6.blog")}
          subtitle={t("blog6.subtitle")}
          tall
          subtitle="moving gradients"
          link="https://blog.hemant.lol/moving-gradients"
        />
        <Blogwork
          src="yoru"
          blog={t("blog7.blog")}
          subtitle={t("blog7.subtitle")}
          tall
          shrink
          commission
          subtitle="grid"
          link="https://blog.hemant.lol/grid"
        />
        <Blogwork
          src="nisu"
          blog={t("blog8.blog")}
          subtitle={t("blog8.subtitle")}
          tall
          subtitle="zustand"
          link="https://blog.hemant.lol/zustand"
        />
        <Blogwork
          blog="lost"
          subtitle="dnd"
          link="https://blog.hemant.lol/drag-n-drop"
        />
        <Blogwork
          blog="momi"
          subtitle="evolution"
          link="https://blog.hemant.lol/evolution-of-frontend-development"
        />
      </div>
    </div>
  );
};

export default BlogGrid;
