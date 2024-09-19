import { useTranslations } from "next-intl";

export function getSupportersData() {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const t = useTranslations("Supporters");

    return [
        {
            "name": t("supporter1.name"),
            "icon": "/supporters/piyush.png",
            "href": "https://www.youtube.com/@piyushgargdev",
            "message": t("supporter1.message")
        },
        {
            "name": t("supporter2.name"),
            "icon": "/supporters/vedant.jpeg",
            "href": "https://www.youtube.com/@js_cafe",
            "message": t("supporter2.message")
        }
    ]
}

