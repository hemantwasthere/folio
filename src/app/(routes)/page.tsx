import { Suspense } from "react";

import Footer from "@/components/layout/footer";
import About from "@/components/sections/about/about";
import Blog from "@/components/sections/blog/blog";
import Hero from "@/components/sections/hero/hero";
import Repos from "@/components/sections/repos/repos";
import ReposSection from "@/components/sections/repos/repos-section";
import Signatures from "@/components/sections/signatures/signatures";
import Synth from "@/components/sections/synth/synth";
// import Supporters from "@/components/sections/supporters/supporters";
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
      {/* Supporters is parked for now — the component and its data are still in
          the tree, uncomment the import above to bring it back. */}
      {/* <Supporters /> */}
      <Synth />
      <Signatures />
      <Footer />
      {/* Timeline is parked for now — see components/sections/timeline/timeline.tsx */}
    </div>
  );
}
