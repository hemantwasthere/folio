import { Suspense } from "react";

import Footer from "@/components/layout/Footer";
import About from "@/components/sections/about/About";
import Blog from "@/components/sections/blog/Blog";
import Hero from "@/components/sections/hero/Hero";
import Repos from "@/components/sections/repos/Repos";
import ReposSection from "@/components/sections/repos/ReposSection";
import Supporters from "@/components/sections/supporters/Supporters";
import { getUserLocale } from "@/services/locale";

export default async function Home() {
  const currentLocale = await getUserLocale();

  return (
    <div>
      <Hero />
      <About currentLocale={currentLocale} />
      <Blog />
      {/* Repos are fetched on the server; the shimmer streams until GitHub answers. */}
      <Suspense fallback={<Repos repos={null} />}>
        <ReposSection />
      </Suspense>
      <Supporters />
      <Footer />
      {/* Timeline is parked for now — see components/sections/timeline/Timeline.tsx */}
    </div>
  );
}
