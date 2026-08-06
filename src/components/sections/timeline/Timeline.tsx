import { format, parse } from "date-fns";
import { ExternalLink } from "lucide-react";

import Link from "next/link";

interface Timeline {
  date: Date | string;
  title: string;
  description?: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  link?: {
    text: string;
    url: string;
  };
}

interface TimelineProps {
  timeline: Timeline[];
}

export default function Timeline({ timeline: rawTimeline }: TimelineProps) {
  const timeline = rawTimeline.map((event) => ({
    ...event,
    date: parse(event.date.toString(), "MM-dd-yyyy", new Date()),
  }));

  return (
    <div className="flex flex-grow min-h-screen pt-16 pb-12">
      <div className="flex-grow flex flex-col justify-center max-w-sm sm:max-w-2xl w-full mx-auto px-0 sm:px-16">
        <div className="title flex justify-start mt-0 md:justify-center">
          <h2 className="inline-block mb-4">
            <span className="text-accent">Time</span>line
          </h2>
        </div>
        <ul className="-mb-8" role="list">
          {timeline.map(
            ({ date, title, description, icon: EventIcon, link }, index) => (
              <li className="my-1" key={title}>
                <div className="relative pb-8">
                  {index !== timeline.length - 1 && (
                    <span
                      aria-hidden="true"
                      className="absolute top-1 left-1/2 w-0.5 h-full -ml-px bg-elevation_three"
                    />
                  )}
                  <div className="timeline_card relative">
                    <div className="relative flex items-center justify-center w-12 h-12 bg-primary-500 bg-opacity-15 backdrop-filter backdrop-blur-sm saturate-200 mx-2 px-1 rounded-full">
                      <EventIcon
                        aria-hidden="true"
                        className="w-6 h-6 text-primary-500"
                      />
                    </div>
                    <div className="min-w-0">
                      <h1 className="flex flex-wrap justify-between mb-2 text-gray-500 dark:text-text_primary text-lg tracking-tight font-bold">
                        <span>{title}</span>
                        <span className="flex-1 sm:hidden" />
                        <p className="bio_span">{format(date, "PPP")}</p>
                      </h1>
                      <p className="my-2 text-gray-400 text-base">
                        {description}
                      </p>
                      {link && (
                        <Link
                          className="mt-2 flex items-center gap-2 text-accent border-2 border-accent/5 w-fit px-3 py-1 rounded-lg hover:border-accent transition-all duration-300 outline-none "
                          href={link.url}
                          rel="noopener noreferrer"
                          target="_blank"
                        >
                          {link.text}
                          <ExternalLink size={15} className="ml-3" />
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              </li>
            )
          )}
        </ul>
      </div>
    </div>
  );
}
