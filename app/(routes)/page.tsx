import Footer from "@/components/molecules/Footer";
import About from "@/components/organisms/About";
import Blog from "@/components/organisms/Blog";
import Hero from "@/components/organisms/Hero";
import Repos from "@/components/organisms/Repos";
import Supporters from "@/components/organisms/Supporters";
import Timeline from "@/components/organisms/Timeline";
import { timelines } from "@/data/timeline";
import { getUserLocale } from "@/services/locale";

export default async function Home() {
  const currentLocale = await getUserLocale()

  return (
    <div className="">
      <Hero />
      <About currentLocale={currentLocale} />
      <Blog />
      <Repos />
      <Supporters />
      <Footer />
      {/* <Timeline timeline={timelines} /> */}
    </div>
  );
}
