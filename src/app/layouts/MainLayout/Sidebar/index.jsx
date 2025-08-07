// Import Dependencies
import { useMemo, useState, useContext } from "react";
import { useLocation } from "react-router";

// Local Imports
import { useBreakpointsContext } from "app/contexts/breakpoint/context";
import { useSidebarContext } from "app/contexts/sidebar/context";
import { navigation } from "app/navigation";
import { useDidUpdate } from "hooks";
import { isRouteActive } from "utils/isRouteActive";
import { PrimePanel } from "./PrimePanel";
import AuthContext from "app/contexts/auth/authContext";

// ----------------------------------------------------------------------

export function Sidebar() {
  const { pathname } = useLocation();
  const { name, lgAndDown } = useBreakpointsContext();
  const { isExpanded, close } = useSidebarContext();
  const { user, isInitialized } = useContext(AuthContext);

  const initialSegment = useMemo(
    () => navigation.find((item) => isRouteActive(item.path, pathname)),
    [pathname],
  );

  const [activeSegmentPath, setActiveSegmentPath] = useState(
    initialSegment?.path,
  );

  // Filter navigation sesuai user
  const filteredNavigation = useMemo(() => {
    if (!isInitialized || !user) return [];

    // console.log("✅ Filtering navigation. user.is_admin:", user.is_admin);

    return navigation.map((segment) => {
      if (segment.id === "dashboards" && Array.isArray(segment.childs)) {
        return {
          ...segment,
          childs: segment.childs.filter((child) => {
            // contoh: hanya admin yg boleh lihat daftar-petugas
            if (child.id === "dashboards.daftar-petugas") {
              return !!user.is_admin;
            }
            // Hanya admin yang bisa lihat pasar
            if (child.id === "dashboards.pasar") {
              return !!user.is_admin;
            }
            return true;
          }),
        };
      }
      return segment;
    });
  }, [isInitialized, user]);

  // Temukan segment aktif (setelah difilter)
  const currentSegment = useMemo(() => {
    return filteredNavigation.find((item) => item.path === activeSegmentPath);
  }, [activeSegmentPath, filteredNavigation]);

  useDidUpdate(() => {
    const activePath = filteredNavigation.find((item) =>
      isRouteActive(item.path, pathname),
    )?.path;

    if (!isRouteActive(activeSegmentPath, pathname)) {
      setActiveSegmentPath(activePath);
    }
  }, [pathname, filteredNavigation]);

  useDidUpdate(() => {
    if (lgAndDown && isExpanded) close();
  }, [name]);

  return (
    <PrimePanel
      nav={filteredNavigation}
      activeSegment={activeSegmentPath}
      setActiveSegment={setActiveSegmentPath}
      close={close}
      currentSegment={currentSegment}
      pathname={pathname}
    />
  );
}
