import { useEffect, useMemo, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { ChevronDown } from "lucide-react";
import { cn } from "@craft-apex/ui";
import { buildMenu, type MenuItem } from "../menu";
import { useModuleStore } from "../module-store";

const cleanLink = (l: string) => l.split("?")[0]!.split("#")[0]!;

const isLink = (l?: string) => !!l && l !== "/#" && l !== "#";

function pathMatches(pathname: string, link: string) {
  if (!isLink(link)) return false;
  const l = cleanLink(link);
  return pathname === l || pathname.startsWith(l + "/");
}

/** Does this item (or any descendant) contain the active route? */
function containsActive(item: MenuItem, pathname: string): boolean {
  if (pathMatches(pathname, item.link)) return true;
  if (item.subItems?.some((s) => containsActive(s, pathname))) return true;
  if (item.childItems?.some((c) => containsActive(c, pathname))) return true;
  return false;
}

function Leaf({ item, depth }: { item: MenuItem; depth: number }) {
  return (
    <li>
      <NavLink
        to={isLink(item.link) ? item.link : "#"}
        target={item.target || undefined}
        className={({ isActive }) =>
          cn(
            "block truncate rounded-md px-3 py-2 text-sm text-sidebar-foreground/75 transition-colors hover:bg-sidebar-accent hover:text-sidebar-foreground",
            depth === 1 && "pl-7",
            depth === 2 && "pl-11",
            isActive &&
              isLink(item.link) &&
              "bg-sidebar-accent font-medium text-sidebar-foreground"
          )
        }
      >
        {item.label}
      </NavLink>
    </li>
  );
}

/** Level 2: either a leaf, or an expandable node with level-3 childItems. */
function SubItem({
  item,
  pathname,
}: {
  item: MenuItem;
  pathname: string;
}) {
  const hasChildren = item.isChildItem && (item.childItems?.length ?? 0) > 0;
  const [open, setOpen] = useState(() =>
    hasChildren ? containsActive(item, pathname) : false
  );

  useEffect(() => {
    if (hasChildren && containsActive(item, pathname)) setOpen(true);
  }, [pathname, hasChildren, item]);

  if (!hasChildren) return <Leaf item={item} depth={1} />;

  return (
    <li>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={cn(
          "flex w-full items-center justify-between rounded-md px-3 py-2 pl-7 text-sm text-sidebar-foreground/75 transition-colors hover:bg-sidebar-accent hover:text-sidebar-foreground",
          containsActive(item, pathname) && "text-sidebar-foreground"
        )}
      >
        <span className="truncate">{item.label}</span>
        <ChevronDown
          className={cn("h-4 w-4 shrink-0 transition-transform", open && "rotate-180")}
        />
      </button>
      {open && (
        <ul className="mt-1 space-y-1">
          {item.childItems!.map((c) => (
            <Leaf key={c.id} item={c} depth={2} />
          ))}
        </ul>
      )}
    </li>
  );
}

/** Level 1: accordion — opening one closes the others (legacy behavior). */
function TopItem({
  item,
  pathname,
  openId,
  setOpenId,
}: {
  item: MenuItem;
  pathname: string;
  openId: string | null;
  setOpenId: (id: string | null) => void;
}) {
  const hasSub = (item.subItems?.length ?? 0) > 0;
  const open = openId === item.id;

  if (!hasSub) return <Leaf item={item} depth={0} />;

  return (
    <li>
      <button
        type="button"
        onClick={() => setOpenId(open ? null : item.id)}
        className={cn(
          "flex w-full items-center justify-between rounded-md px-3 py-2 text-sm text-sidebar-foreground/80 transition-colors hover:bg-sidebar-accent hover:text-sidebar-foreground",
          containsActive(item, pathname) && "text-sidebar-foreground"
        )}
      >
        <span className="truncate">{item.label}</span>
        <ChevronDown
          className={cn("h-4 w-4 shrink-0 transition-transform", open && "rotate-180")}
        />
      </button>
      {open && (
        <ul className="mt-1 space-y-1">
          {item.subItems!.map((s) => (
            <SubItem key={s.id} item={s} pathname={pathname} />
          ))}
        </ul>
      )}
    </li>
  );
}

export function Sidebar({ brand }: { brand: string }) {
  const modules = useModuleStore((s) => s.modules);
  const { pathname } = useLocation();
  const menu = useMemo(() => buildMenu(modules), [modules]);

  // Accordion: which top-level menu is expanded. Auto-open the branch that
  // contains the current route (legacy auto-expands active ancestors).
  const [openId, setOpenId] = useState<string | null>(null);
  useEffect(() => {
    const active = menu.find((m) => containsActive(m, pathname));
    if (active) setOpenId(active.id);
  }, [pathname, menu]);

  return (
    <aside className="flex h-screen w-64 shrink-0 flex-col bg-sidebar text-sidebar-foreground">
      <div className="flex h-14 items-center px-5 text-lg font-semibold">
        {brand}
      </div>
      <nav className="flex-1 overflow-y-auto px-3 pb-6">
        <ul className="space-y-1">
          {menu.length === 0 ? (
            <li className="px-3 py-2 text-sm text-sidebar-foreground/50">
              No modules available
            </li>
          ) : (
            menu.map((m) => (
              <TopItem
                key={m.id}
                item={m}
                pathname={pathname}
                openId={openId}
                setOpenId={setOpenId}
              />
            ))
          )}
        </ul>
      </nav>
    </aside>
  );
}
