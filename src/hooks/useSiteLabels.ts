import { useTranslation } from "react-i18next";
import type { WorkCategory } from "@/data/works";

/**
 * Primary navigation labels. The paths stay language-independent so they can be
 * used as stable React keys; only the labels translate.
 *
 * The rail, the mobile menu and the footer all read this one list. About and
 * contact were dropped from it — those pages are still routed and still carry
 * their own labels in `contact.*` and `nav.studio`.
 */
export function useNavItems() {
  const { t } = useTranslation();
  return [{ label: t("nav.work"), path: "/work" }];
}

/**
 * Work category labels. Every key is enumerated statically so the i18n scanner
 * can see all of them — a dynamic `t(\`work.category.${c}\`)` would hide them.
 */
export function useCategoryLabel() {
  const { t } = useTranslation();
  return (category: WorkCategory) =>
    category === "packaging"
      ? t("work.category.packaging")
      : category === "gamepv"
        ? t("work.category.gamepv")
        : category === "aigc"
          ? t("work.category.aigc")
          : category === "short3d"
            ? t("work.category.short3d")
            : category === "compositing"
              ? t("work.category.compositing")
              : t("work.category.bilibili");
}
