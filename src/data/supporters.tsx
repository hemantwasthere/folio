import { useTranslations } from "next-intl";

/**
 * A hook, not a plain getter — it reads translations, so it must follow the
 * rules of hooks. Naming it `use*` makes that contract enforceable instead of
 * suppressed.
 */
export function useSupportersData() {
  const t = useTranslations("Supporters");

  return [
    {
      name: t("supporter1.name"),
      icon: "/supporters/piyush.png",
      href: "https://x.com/piyushgarg_dev",
      message: t("supporter1.message"),
    },
    {
      name: t("supporter2.name"),
      icon: "/supporters/akira.jpeg",
      href: "https://x.com/akiraonstarknet",
      message: t("supporter2.message"),
    },
    {
      name: t("supporter3.name"),
      icon: "/supporters/manu.jpg",
      href: "https://x.com/mannupaaji",
      message: t("supporter3.message"),
    },
  ];
}
