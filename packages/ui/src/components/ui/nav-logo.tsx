"use client"

import * as React from "react"
import { useSidebar } from "@repo/ui/components/ui/sidebar"
import { cn } from "@repo/ui/lib/utils"

export function NavLogo({
  tenantLogo,
  tenantIcon,
  tenantName,
  className,
  ...props
}: {
  tenantLogo?: string
  tenantIcon?: string
  tenantName?: string
  className?: string
} & React.HTMLAttributes<HTMLDivElement>) {
  const { state } = useSidebar()
  const isCollapsed = state === "collapsed"

  return (
    <div 
      className={cn(
        "flex items-center justify-center transition-all duration-200",
        className
      )}
      {...props}
    >
      {isCollapsed ? (
        // Show only icon when collapsed
        tenantIcon ? (
          <img 
            src={tenantIcon} 
            alt={tenantName || 'Tenant Icon'} 
            className="w-8 h-8 p-1 rounded-sm object-contain"
          />
        ) : (
          // Fallback to first letter of tenant name if no icon
          <div className="w-8 h-8 p-1 rounded-sm bg-primary text-primary-foreground flex items-center justify-center text-sm font-semibold">
            {tenantName?.charAt(0)?.toUpperCase() || 'T'}
          </div>
        )
      ) : (
        // Show full logo when expanded
        tenantLogo ? (
          <img 
            src={tenantLogo} 
            alt={tenantName || 'Tenant Logo'} 
            className="w-full h-14 px-3 rounded-sm object-contain"
          />
        ) : (
          // Fallback to tenant name if no logo
          <div className="px-3 py-2 text-lg font-semibold text-center">
            {tenantName || 'Tenant'}
          </div>
        )
      )}
    </div>
  )
}