import Social from "@/components/atoms/Social";
import { user } from "@/lib/utils";

const Socials: React.FC = () => {
  return (
    <div className="flex gap-[.75rem]">
      <Social tip="@hemantwasthere" link="https://github.com/hemantwasthere">
        <svg
          width="24px"
          height="24px"
          className="social_svg"
          strokeWidth="1.5"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          color="#dba895"
        >
          <path
            d="M16 22.027v-2.87a3.37 3.37 0 00-.94-2.61c3.14-.35 6.44-1.54 6.44-7a5.44 5.44 0 00-1.5-3.75 5.07 5.07 0 00-.09-3.77s-1.18-.35-3.91 1.48a13.38 13.38 0 00-7 0c-2.73-1.83-3.91-1.48-3.91-1.48A5.07 5.07 0 005 5.797a5.44 5.44 0 00-1.5 3.78c0 5.42 3.3 6.61 6.44 7a3.37 3.37 0 00-.94 2.58v2.87M9 20.027c-3 .973-5.5 0-7-3"
            stroke="#dba895"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          ></path>
        </svg>
      </Social>
      <Social tip={`@${user.username}`} link={`https://discord.com/users/${user.id}`}>
        <svg
          width="24px"
          height="24px"
          className="social_svg"
          viewBox="0 0 24 24"
          strokeWidth="1.5"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          color="#dba895"
        >
          <path
            d="M5.5 16c5 2.5 8 2.5 13 0M15.5 17.5l1 2s4.171-1.328 5.5-3.5c0-1 .53-8.147-3-10.5-1.5-1-4-1.5-4-1.5l-1 2h-2"
            stroke="#dba895"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          ></path>
          <path
            d="M8.528 17.5l-1 2s-4.171-1.328-5.5-3.5c0-1-.53-8.147 3-10.5 1.5-1 4-1.5 4-1.5l1 2h2"
            stroke="#dba895"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          ></path>
          <path
            d="M8.5 14c-.828 0-1.5-.895-1.5-2s.672-2 1.5-2 1.5.895 1.5 2-.672 2-1.5 2zM15.5 14c-.828 0-1.5-.895-1.5-2s.672-2 1.5-2 1.5.895 1.5 2-.672 2-1.5 2z"
            stroke="#dba895"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          ></path>
        </svg>
      </Social>
      <Social
        tip="hemant.is.there@gmail.com"
        link="mailto:hemant.is.there@gmail.com"
      >
        <svg
          width="24px"
          height="24px"
          className="social_svg"
          strokeWidth="1.5"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          color="#dba895"
        >
          <path
            d="M7 9l5 3.5L17 9"
            stroke="#dba895"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          ></path>
          <path
            d="M2 17V7a2 2 0 012-2h16a2 2 0 012 2v10a2 2 0 01-2 2H4a2 2 0 01-2-2z"
            stroke="#dba895"
            strokeWidth="1.5"
          ></path>
        </svg>
      </Social>
      <Social tip="@xebec" link="https://www.buymeacoffee.com/xebec">
        <svg
          width="24px"
          height="24px"
          className="social_svg"
          viewBox="0 0 24 24"
          strokeWidth="1.5"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          color="#dba895"
        >
          <path
            d="M17 11.6V15a6 6 0 01-6 6H9a6 6 0 01-6-6v-3.4a.6.6 0 01.6-.6h12.8a.6.6 0 01.6.6zM12 9c0-1 .714-2 2.143-2v0A2.857 2.857 0 0017 4.143V3.5M8 9v-.5a3 3 0 013-3v0a2 2 0 002-2V3"
            stroke="#dba895"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          ></path>
          <path
            d="M16 11h2.5a2.5 2.5 0 010 5H17"
            stroke="#dba895"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          ></path>
        </svg>
      </Social>
    </div>
  );
};

export default Socials;
