'use client'

import React from 'react'
import { FiDatabase } from 'react-icons/fi'
import { HiOutlineBeaker } from 'react-icons/hi'
import { cn } from '@/lib/utils'

export type ViewType = 'research' | 'results'

interface SidebarProps {
  activeView: ViewType
  onViewChange: (view: ViewType) => void
  hasResults: boolean
}

const navItems: { id: ViewType; label: string; icon: React.ReactNode }[] = [
  { id: 'research', label: 'Research Dashboard', icon: <HiOutlineBeaker className="w-4 h-4" /> },
  { id: 'results', label: 'Results & Export', icon: <FiDatabase className="w-4 h-4" /> },
]

export default function Sidebar({ activeView, onViewChange, hasResults }: SidebarProps) {
  return (
    <aside className="w-52 border-r border-border bg-[hsl(220,16%,14%)] flex flex-col shrink-0">
      <div className="p-3">
        <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-2 px-2">Navigation</p>
        <nav className="space-y-1">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id)}
              className={cn(
                "w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-sm transition-colors",
                activeView === item.id
                  ? "bg-[hsl(213,32%,52%)] text-white font-medium"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              )}
            >
              {item.icon}
              <span>{item.label}</span>
            </button>
          ))}
        </nav>
      </div>

      <div className="mt-auto p-3 border-t border-border">
        <div className="px-2">
          <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-2">Agents</p>
          <div className="space-y-1.5">
            <AgentItem name="Research Orchestrator" role="Manager" />
            <AgentItem name="VC Discovery" role="Discovery" />
            <AgentItem name="Portfolio Mapper" role="Mapping" />
            <AgentItem name="Company Analyst" role="Analysis" />
            <AgentItem name="Export Agent" role="Export" />
          </div>
        </div>
      </div>
    </aside>
  )
}

function AgentItem({ name, role }: { name: string; role: string }) {
  return (
    <div className="flex items-center gap-2">
      <div className="w-1.5 h-1.5 rounded-full bg-[hsl(92,28%,60%)]" />
      <div>
        <p className="text-[11px] text-foreground leading-tight">{name}</p>
        <p className="text-[9px] text-muted-foreground">{role}</p>
      </div>
    </div>
  )
}
