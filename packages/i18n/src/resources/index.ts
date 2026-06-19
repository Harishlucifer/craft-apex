import { common as enCommon } from "./en/common";
import { common as arCommon } from "./ar/common";
import { common as hiCommon } from "./hi/common";
import { common as taCommon } from "./ta/common";
import { login as enLogin } from "./en/login";
import { login as arLogin } from "./ar/login";
import { login as hiLogin } from "./hi/login";
import { login as taLogin } from "./ta/login";
import { layout as enLayout } from "./en/layout";
import { layout as arLayout } from "./ar/layout";
import { layout as hiLayout } from "./hi/layout";
import { layout as taLayout } from "./ta/layout";
import { menu as enMenu } from "./en/menu";
import { menu as arMenu } from "./ar/menu";
import { menu as hiMenu } from "./hi/menu";
import { menu as taMenu } from "./ta/menu";
import { pages as enPages } from "./en/pages";
import { pages as arPages } from "./ar/pages";
import { pages as hiPages } from "./hi/pages";
import { pages as taPages } from "./ta/pages";
import { dashboard as enDashboard } from "./en/dashboard";
import { dashboard as arDashboard } from "./ar/dashboard";
import { dashboard as hiDashboard } from "./hi/dashboard";
import { dashboard as taDashboard } from "./ta/dashboard";
import { lead as enLead } from "./en/lead";
import { lead as arLead } from "./ar/lead";
import { lead as hiLead } from "./hi/lead";
import { lead as taLead } from "./ta/lead";
import { application as enApplication } from "./en/application";
import { application as arApplication } from "./ar/application";
import { application as hiApplication } from "./hi/application";
import { application as taApplication } from "./ta/application";
import { settings as enSettings } from "./en/settings";
import { settings as arSettings } from "./ar/settings";
import { settings as hiSettings } from "./hi/settings";
import { settings as taSettings } from "./ta/settings";

export const resources = {
  en: {
    common: enCommon,
    login: enLogin,
    layout: enLayout,
    menu: enMenu,
    pages: enPages,
    dashboard: enDashboard,
    lead: enLead,
    application: enApplication,
    settings: enSettings,
  },
  ar: {
    common: arCommon,
    login: arLogin,
    layout: arLayout,
    menu: arMenu,
    pages: arPages,
    dashboard: arDashboard,
    lead: arLead,
    application: arApplication,
    settings: arSettings,
  },
  hi: {
    common: hiCommon,
    login: hiLogin,
    layout: hiLayout,
    menu: hiMenu,
    pages: hiPages,
    dashboard: hiDashboard,
    lead: hiLead,
    application: hiApplication,
    settings: hiSettings,
  },
  ta: {
    common: taCommon,
    login: taLogin,
    layout: taLayout,
    menu: taMenu,
    pages: taPages,
    dashboard: taDashboard,
    lead: taLead,
    application: taApplication,
    settings: taSettings,
  },
} as const;

export const namespaces = [
  "common",
  "login",
  "layout",
  "menu",
  "pages",
  "dashboard",
  "lead",
  "application",
  "settings",
] as const;
export const defaultNamespace = "common" as const;
