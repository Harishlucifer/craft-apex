import { createContext, useContext } from "react";

/* ------------------------------------------------------------------ */
/*  RouterAdapter – framework-agnostic routing abstraction             */
/*                                                                      */
/*  Each portal injects its own adapter:                                */
/*    • Next.js portals → NextRouterAdapter                            */
/*    • Vite portals    → ReactRouterAdapter                           */
/* ------------------------------------------------------------------ */

export interface RouterAdapter {
  /** A Link component for client-side navigation */
  Link: React.ComponentType<{
    href: string;
    children: React.ReactNode;
    className?: string;
    style?: React.CSSProperties;
    title?: string;
    onClick?: (e: React.MouseEvent) => void;
    [key: string]: unknown;
  }>;
  /** Hook that returns navigation helpers */
  useRouter: () => {
    push: (url: string) => void;
    replace: (url: string) => void;
    back: () => void;
  };
  /** Hook that returns the current pathname */
  usePathname: () => string;
}

const RouterAdapterContext = createContext<RouterAdapter | null>(null);

/* ------------------------------------------------------------------ */
/*  Provider                                                            */
/* ------------------------------------------------------------------ */

export function RouterAdapterProvider({
  adapter,
  children,
}: {
  adapter: RouterAdapter;
  children: React.ReactNode;
}) {
  return (
    <RouterAdapterContext.Provider value={adapter}>
      {children}
    </RouterAdapterContext.Provider>
  );
}

/* ------------------------------------------------------------------ */
/*  Consumer hooks                                                      */
/* ------------------------------------------------------------------ */

function useAdapter(): RouterAdapter {
  const ctx = useContext(RouterAdapterContext);
  if (!ctx) {
    throw new Error(
      "RouterAdapter not found. Wrap your app with <RouterAdapterProvider>."
    );
  }
  return ctx;
}

/** Framework-agnostic Link component */
export function useAdapterLink() {
  return useAdapter().Link;
}

/** Framework-agnostic useRouter hook */
export function useAdapterRouter() {
  return useAdapter().useRouter();
}

/** Framework-agnostic usePathname hook */
export function useAdapterPathname() {
  return useAdapter().usePathname();
}
