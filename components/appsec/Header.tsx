'use client'

import React from 'react'
import { FiShield } from 'react-icons/fi'
import { Switch } from '@/components/ui/switch'

interface HeaderProps {
  sampleMode: boolean
  onSampleModeChange: (val: boolean) => void
}

export default function Header({ sampleMode, onSampleModeChange }: HeaderProps) {
  return (
    <header className="h-14 border-b border-border bg-card flex items-center justify-between px-5 shrink-0">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-[hsl(213,32%,52%)] flex items-center justify-center">
          <FiShield className="w-4 h-4 text-white" />
        </div>
        <h1 className="text-base font-semibold text-foreground tracking-tight">AppSec Competitive Intelligence Hub</h1>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-xs text-muted-foreground">Sample Data</span>
        <Switch checked={sampleMode} onCheckedChange={onSampleModeChange} />
      </div>
    </header>
  )
}
