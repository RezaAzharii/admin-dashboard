// Import Dependencies
import { Navigate } from "react-router";

// Local Imports
import { AppLayout } from "app/layouts/AppLayout";
import { DynamicLayout } from "app/layouts/DynamicLayout";
import AuthGuard from "middleware/AuthGuard";

// ----------------------------------------------------------------------

const protectedRoutes = {
  id: "protected",
  Component: AuthGuard,
  children: [
    // The dynamic layout supports both the main layout and the sideblock.
    {
      Component: DynamicLayout,
      children: [
        {
          index: true,
          element: <Navigate to="/dashboards" />,
        },
        {
          path: "dashboards",
          children: [
            {
              index: true,
              element: <Navigate to="/dashboards/home" />,
            },
            {
              path: "home",
              lazy: async () => ({
                Component: (await import("app/pages/dashboards/home")).default,
              }),
            },
            {
              index: true,
              element: <Navigate to="/dashboards/pasar" />,
            },
            {
              path: "pasar",
              lazy: async () => ({
                Component: (await import("app/pages/dashboards/pasar")).default,
              }),
            },
            {
              index: true,
              element: <Navigate to="/dashboards/daftar-petugas" />,
            },
            {
              path: "daftar-petugas",
              auth: { adminOnly: true },
              lazy: async () => ({
                Component: (await import("app/pages/dashboards/petugas"))
                  .default,
              }),
            },
            {
              index: true,
              element: <Navigate to="/dashboards/inputharga" />,
            },
            {
              path: "inputharga",
              lazy: async () => ({
                Component: (await import("app/pages/dashboards/inputharga"))
                  .default,
              }),
            },
            {
              index: true,
              element: <Navigate to="/dashboards/bahanpokok" />,
            },
            {
              path: "bahanpokok",
              lazy: async () => ({
                Component: (await import("app/pages/dashboards/bahanpokok"))
                  .default,
              }),
            },
          ],
        },
      ],
    },
    // The app layout supports only the main layout. Avoid using it for other layouts.
    {
      Component: AppLayout,
      children: [
        {
          path: "settings",
          lazy: async () => ({
            Component: (await import("app/pages/settings/Layout")).default,
          }),
          children: [
            {
              index: true,
              element: <Navigate to="/settings/general" />,
            },
            {
              path: "general",
              lazy: async () => ({
                Component: (await import("app/pages/settings/sections/General"))
                  .default,
              }),
            },
            {
              path: "appearance",
              lazy: async () => ({
                Component: (
                  await import("app/pages/settings/sections/Appearance")
                ).default,
              }),
            },
          ],
        },
      ],
    },
  ],
};

export { protectedRoutes };
