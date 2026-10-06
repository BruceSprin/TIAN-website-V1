import { useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { usePageTheme } from "@/hooks/usePageTheme";

const NotFound = () => {
  const { t } = useTranslation();
  const location = useLocation();
  usePageTheme("dark");

  useEffect(() => {
    console.error("404: route not found:", location.pathname);
  }, [location.pathname]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-ink px-6 text-center text-paper">
      <h1 className="text-giant text-signal">404</h1>
      <p className="body-lg mt-6 text-paper/70">{t("notFound.body")}</p>
      <Link
        to="/"
        className="label mt-10 inline-flex items-center gap-2 border-b border-paper pb-1 transition-colors hover:text-signal"
      >
        {t("notFound.actions.backHome")} &rarr;
      </Link>
    </main>
  );
};

export default NotFound;
