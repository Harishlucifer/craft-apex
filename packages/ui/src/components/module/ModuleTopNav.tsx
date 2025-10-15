import * as React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '@repo/shared-state/stores';
import { transformModulesToNavigation, SidebarNavItem } from '../../utils/moduleTransformer';
import {
  Menubar,
  MenubarMenu,
  MenubarTrigger,
  MenubarContent,
  MenubarItem,
  MenubarSub,
  MenubarSubTrigger,
  MenubarSubContent,
} from '@repo/ui/components/ui/menubar';

function useNavItems(): SidebarNavItem[] {
  const { setupData } = useAuthStore();
  return React.useMemo(() => {
    return transformModulesToNavigation(setupData?.module || null);
  }, [setupData?.module]);
}

// Recursive renderer for nested menu items
function RenderMenuItems({ items }: { items: SidebarNavItem[] }) {
  const location = useLocation();
  const isActive = (url: string) => location.pathname === url || location.pathname.startsWith(url + '/');

  return (
    <>
      {items.map((item) => {
        const hasChildren = item.items && item.items.length > 0;
        if (hasChildren) {
          return (
            <MenubarSub key={item.title}>
              <MenubarSubTrigger>
                <span className={isActive(item.url) ? 'font-semibold' : ''}>{item.title}</span>
              </MenubarSubTrigger>
              <MenubarSubContent>
                <RenderMenuItems items={item.items!} />
              </MenubarSubContent>
            </MenubarSub>
          );
        }
        return (
          <MenubarItem key={item.title} asChild>
            <Link to={item.url} className={isActive(item.url) ? 'font-semibold' : ''}>
              {item.title}
            </Link>
          </MenubarItem>
        );
      })}
    </>
  );
}

export function ModuleTopNav() {
  const items = useNavItems();

  return (
    <Menubar className="w-full">
      {items.map((top) => {
        const hasChildren = top.items && top.items.length > 0;
        return (
          <MenubarMenu key={top.title}>
            <MenubarTrigger>
              <span>{top.title}</span>
            </MenubarTrigger>
            <MenubarContent>
              {hasChildren ? (
                <RenderMenuItems items={top.items!} />
              ) : (
                <MenubarItem asChild>
                  <Link to={top.url}>{top.title}</Link>
                </MenubarItem>
              )}
            </MenubarContent>
          </MenubarMenu>
        );
      })}
    </Menubar>
  );
}