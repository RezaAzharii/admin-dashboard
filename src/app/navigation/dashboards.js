import { HomeIcon } from "@heroicons/react/24/outline";
import DashboardsIcon from "assets/dualicons/dashboards.svg?react";
import { NAV_TYPE_ROOT, NAV_TYPE_ITEM } from "constants/app.constant";

const ROOT_DASHBOARDS = "/dashboards";

const path = (root, item) => `${root}${item}`;

export const dashboards = {
  id: "dashboards",
  type: NAV_TYPE_ROOT,
  path: "/dashboards",
  title: "Dashboards",
  transKey: "nav.dashboards.dashboards",
  Icon: DashboardsIcon,
  childs: [
    {
      id: "dashboards.home",
      path: path(ROOT_DASHBOARDS, "/home"),
      type: NAV_TYPE_ITEM,
      title: "Home",
      transKey: "nav.dashboards.home",
      Icon: HomeIcon,
    },
    {
      id: "dashboards.pasar",
      path: path(ROOT_DASHBOARDS, "/pasar"),
      type: NAV_TYPE_ITEM,
      title: "Pasar",
      transKey: "nav.dashboards.pasar",
    },
    {
      id: "dashboards.daftar-petugas",
      path: path(ROOT_DASHBOARDS, "/daftar-petugas"),
      type: NAV_TYPE_ITEM,
      title: "Petugas",
      transKey: "nav.dashboards.petugas",
    },
    {
      id:"dashboards.inputharga",
      path: path(ROOT_DASHBOARDS,"/inputharga"),
      type: NAV_TYPE_ITEM,
      title: "inputharga",
      transkey:"nav.dashboards.inputharga"
    },
    {
      id: "dashboards.bahanpokok",
      path: path(ROOT_DASHBOARDS,"/bahanpokok"),
      type: NAV_TYPE_ITEM,
      title:"bahanpokok",
      transkey:"nav.dashboards.bahanpokok"
    }
  ],
};
