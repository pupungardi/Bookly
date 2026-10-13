"use client"

import React from "react"
import { motion } from "motion/react"
import { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface NavItem {
  name: string
  id: string
  icon: LucideIcon
}

interface NavBarProps {
  items: NavItem[]
  activeTab: string
  onTabChange: (id: string) => void
  className?: string
}

export function NavBar({ items, activeTab, onTabChange, className }: NavBarProps) {
  return (
    <div
      className={cn(
        "fixed inset-x-0 bottom-4 z-50 flex justify-center px-4 pb-[env(safe-area-inset-bottom)]",
        className,
      )}
    >
      <div className="flex w-full max-w-md items-center justify-between gap-1 rounded-[28px] border border-white/70 bg-white/55 p-1.5 shadow-[0_12px_40px_rgba(28,25,23,0.18),inset_0_1px_0_rgba(255,255,255,0.9)] backdrop-blur-2xl backdrop-saturate-150">
        {items.map((item) => {
          const Icon = item.icon
          const isActive = activeTab === item.id

          return (
            <button
              key={item.id}
              type="button"
              aria-label={item.name}
              aria-current={isActive ? "page" : undefined}
              onClick={() => onTabChange(item.id)}
              className={cn(
                "relative flex min-w-0 flex-1 cursor-pointer items-center justify-center rounded-[22px] px-3 py-2.5 text-xs font-medium transition-all duration-200",
                "text-stone-500 hover:text-stone-900",
                isActive && "text-emerald-700",
              )}
            >
              {isActive && (
                <motion.div
                  layoutId="active-nav-pill"
                  className="absolute inset-0 rounded-[20px] border border-white/80 bg-white/70 shadow-[0_4px_14px_rgba(28,25,23,0.1),inset_0_1px_0_rgba(255,255,255,0.9)]"
                  initial={false}
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}
              <span className="relative flex items-center gap-2">
                <Icon aria-hidden="true" size={18} strokeWidth={isActive ? 2.4 : 2} />
                <span className="hidden sm:inline">{item.name}</span>
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
