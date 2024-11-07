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
          link="https://blog.hemant.lol/docker"
        />
        <Blogwork
          src="deep"
          blog={t("blog2.blog")}
          subtitle={t("blog2.subtitle")}
          link="https://blog.hemant.lol/graphql"
        />
        <Blogwork
          src="rain"
          blog={t("blog3.blog")}
          subtitle={t("blog3.subtitle")}
          tall
          link="https://blog.hemant.lol/kafka"
        />
        <Blogwork
          src="purp"
          blog={t("blog4.blog")}
          subtitle={t("blog4.subtitle")}
          link="https://blog.hemant.lol/whisper"
        />
        <Blogwork
          src="makima"
          blog={t("blog5.blog")}
          subtitle={t("blog5.subtitle")}
          tall
          link="https://blog.hemant.lol/cloudflare"
        />
        <Blogwork
          src="ghost"
          blog={t("blog6.blog")}
          subtitle={t("blog6.subtitle")}
          tall
          link="https://blog.hemant.lol/moving-gradients"
        />
        <Blogwork
          src="yoru"
          blog={t("blog7.blog")}
          subtitle={t("blog7.subtitle")}
          tall
          shrink
          commission
          link="https://blog.hemant.lol/grid"
        />
        <Blogwork
          src="nisu"
          blog={t("blog8.blog")}
          subtitle={t("blog8.subtitle")}
          tall
          link="https://blog.hemant.lol/zustand"
        />
        <Blogwork
          src="lost"
          blog={t("blog9.blog")}
          subtitle={t("blog9.subtitle")}
          link="https://blog.hemant.lol/drag-n-drop"
        />
        <Blogwork
          src="momi"
          blog={t("blog10.blog")}
          subtitle={t("blog10.subtitle")}
          link="https://blog.hemant.lol/evolution-of-frontend-development"
        />
      </div>
    </div>
  );
};

export default BlogGrid;
