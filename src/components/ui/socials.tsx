import {
  DiscordIcon,
  GithubIcon,
  Linkedin01Icon,
  Mail01Icon,
  NewTwitterIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import type { IconSvgElement } from "@hugeicons/react";

import Social from "@/components/ui/social";
import { user } from "@/lib/utils";

const socials: { tip: string; link: string; icon: IconSvgElement }[] = [
  {
    tip: "@hemantwasthere",
    link: "https://github.com/hemantwasthere",
    icon: GithubIcon,
  },
  {
    tip: "@hemantwasthere",
    link: "https://www.linkedin.com/in/hemantwasthere",
    icon: Linkedin01Icon,
  },
  {
    tip: `@${user.username}`,
    link: `https://discord.com/users/${user.id}`,
    icon: DiscordIcon,
  },
  {
    tip: "@hemantwasthere",
    link: "https://x.com/hemantwasthere",
    icon: NewTwitterIcon,
  },
  {
    tip: "hemant.is.there@gmail.com",
    link: "mailto:hemant.is.there@gmail.com",
    icon: Mail01Icon,
  },
];

const Socials: React.FC = () => {
  return (
    <div className="flex gap-1 sm:gap-3">
      {socials.map(({ tip, link, icon }) => (
        <Social key={link} tip={tip} link={link}>
          {/* `social_svg` paints the strokes with the accent colour. */}
          <HugeiconsIcon
            icon={icon}
            size={24}
            strokeWidth={1.5}
            className="social_svg"
          />
        </Social>
      ))}
    </div>
  );
};

export default Socials;
