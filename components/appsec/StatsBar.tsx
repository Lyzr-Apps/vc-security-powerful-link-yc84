'use client'

import React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { FiDatabase, FiTrendingUp, FiCpu, FiFlag } from 'react-icons/fi'

interface StatsBarProps {
  totalCompanies: string
  totalVCs: string
  aiEnabled: string
  highOpportunity: string
}

const statConfig = [
  { key: 'totalCompanies' as const, label: 'Total Companies', icon: FiDatabase, color: 'hsl(213,32%,60%)', bg: 'hsla(213,32%,60%,0.12)' },
  { key: 'totalVCs' as const, label: 'VCs Discovered', icon: FiTrendingUp, color: 'hsl(193,43%,65%)', bg: 'hsla(193,43%,65%,0.12)' },
  { key: 'aiEnabled' as const, label: 'AI-Enabled', icon: FiCpu, color: 'hsl(92,28%,60%)', bg: 'hsla(92,28%,60%,0.12)' },
  { key: 'highOpportunity' as const, label: 'High Opportunity', icon: FiFlag, color: 'hsl(14,51%,60%)', bg: 'hsla(14,51%,60%,0.12)' },
]

export default function StatsBar({ totalCompanies, totalVCs, aiEnabled, highOpportunity }: StatsBarProps) {
  const values = { totalCompanies, totalVCs, aiEnabled, highOpportunity }

  return (
    <div className="grid grid-cols-4 gap-3">
      {statConfig.map((stat) => {
        const Icon = stat.icon
        return (
          <Card key={stat.key} className="bg-card border-border">
            <CardContent className="p-4 flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                style={{ backgroundColor: stat.bg }}
              >
                <Icon className="w-5 h-5" style={{ color: stat.color }} />
              </div>
              <div>
                <p className="text-2xl font-semibold font-mono text-foreground">{values[stat.key] || '0'}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
