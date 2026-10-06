import { SiteChrome } from "./components/chrome/SiteChrome";
import Home from "./pages/Home";
import Work from "./pages/Work";
import Studio from "./pages/Studio";
import Contact from "./pages/Contact";
import ProjectDetail from "./pages/ProjectDetail";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import NotFound from "./pages/NotFound";

export const routers = [
  {
    path: "/",
    element: <SiteChrome />,
    children: [
      { index: true, element: <Home /> },
      { path: "work", element: <Work /> },
      { path: "work/:slug", element: <ProjectDetail /> },
      { path: "studio", element: <Studio /> },
      { path: "contact", element: <Contact /> },
      { path: "privacy", element: <Privacy /> },
      { path: "terms", element: <Terms /> },
      { path: "*", element: <NotFound /> },
    ],
  },
];

declare global {
  interface Window {
    __routers__: typeof routers;
  }
}

window.__routers__ = routers;
