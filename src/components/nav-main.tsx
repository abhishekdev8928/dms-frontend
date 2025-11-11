import * as React from "react"
import { NavLink } from "react-router-dom"
import { cn } from "@/lib/utils"

interface NavItem {
  title: string
  url: string
  icon?: React.ElementType
}

interface NavMainProps {
  items: NavItem[]
}

export function NavMain({ items }: NavMainProps) {
  return (
    <nav className="space-y-1">
      {items.map((item) => {
        const Icon = item.icon
        return (
          <NavLink
            key={item.title}
            to={item.url}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground",
                isActive ? "bg-accent text-accent-foreground" : "text-muted-foreground"
              )
            }
          >
            {Icon && <Icon className="h-4 w-4" />}
            <span>{item.title}</span>
          </NavLink>
        )
      })}
    </nav>
  )
}
