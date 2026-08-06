import Footer from "@/components/layout/Footer";
import About from "@/components/sections/about/About";
import Blog from "@/components/sections/blog/Blog";
import Hero from "@/components/sections/hero/Hero";
import Repos from "@/components/sections/repos/Repos";
import Supporters from "@/components/sections/supporters/Supporters";
import { getUserLocale } from "@/services/locale";

export default async function Home() {
  const currentLocale = await getUserLocale();

  return (
    <div>
      <Hero />
      <About currentLocale={currentLocale} />
      <Blog />
      <Repos />
      <Supporters />
      <Footer />
      {/* Timeline is parked for now — see components/sections/timeline/Timeline.tsx */}
    </div>
  );
}
