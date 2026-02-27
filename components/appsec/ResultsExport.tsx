'use client'

import React from 'react'
import StatsBar from './StatsBar'
import CompanyTable, { CompanyData } from './CompanyTable'
import { Card, CardContent } from '@/components/ui/card'

interface ResultsExportProps {
  companies: CompanyData[]
  totalCompanies: string
  totalVCs: string
  aiEnabled: string
  highOpportunity: string
  summary: string
  loading: boolean
  onExport: () => void
  exporting: boolean
}

function renderMarkdown(text: string) {
  if (!text) return null
  return (
    <div className="space-y-1.5">
      {text.split('\n').map((line, i) => {
        if (line.startsWith('### ')) return <h4 key={i} className="font-semibold text-sm mt-2 mb-1">{line.slice(4)}</h4>
        if (line.startsWith('## ')) return <h3 key={i} className="font-semibold text-base mt-2 mb-1">{line.slice(3)}</h3>
        if (line.startsWith('# ')) return <h2 key={i} className="font-bold text-lg mt-3 mb-1">{line.slice(2)}</h2>
        if (line.startsWith('- ') || line.startsWith('* ')) return <li key={i} className="ml-4 list-disc text-sm">{formatInline(line.slice(2))}</li>
        if (/^\d+\.\s/.test(line)) return <li key={i} className="ml-4 list-decimal text-sm">{formatInline(line.replace(/^\d+\.\s/, ''))}</li>
        if (!line.trim()) return <div key={i} className="h-1" />
        return <p key={i} className="text-sm">{formatInline(line)}</p>
      })}
    </div>
  )
}

function formatInline(text: string) {
  const parts = text.split(/\*\*(.*?)\*\*/g)
  if (parts.length === 1) return text
  return parts.map((part, i) =>
    i % 2 === 1 ? <strong key={i} className="font-semibold">{part}</strong> : part
  )
}

export default function ResultsExport({
  companies,
  totalCompanies,
  totalVCs,
  aiEnabled,
  highOpportunity,
  summary,
  loading,
  onExport,
  exporting,
}: ResultsExportProps) {
  return (
    <div className="space-y-4">
      <StatsBar
        totalCompanies={totalCompanies}
        totalVCs={totalVCs}
        aiEnabled={aiEnabled}
        highOpportunity={highOpportunity}
      />

      {summary && (
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <p className="text-xs font-medium text-[hsl(213,32%,60%)] uppercase tracking-wider mb-2">Research Summary</p>
            <div className="text-muted-foreground">{renderMarkdown(summary)}</div>
          </CardContent>
        </Card>
      )}

      <CompanyTable
        companies={companies}
        loading={loading}
        onExport={onExport}
        exporting={exporting}
      />
    </div>
  )
}
