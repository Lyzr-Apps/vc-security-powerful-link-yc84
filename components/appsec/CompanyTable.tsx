'use client'

import React, { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { FiSearch, FiChevronDown, FiChevronRight, FiChevronUp, FiDownload, FiFilter } from 'react-icons/fi'
import { FiLoader } from 'react-icons/fi'

export interface CompanyData {
  company_name: string
  vc_investors: string
  category: string
  founding_year: string
  total_funding: string
  latest_valuation: string
  estimated_revenue: string
  core_offerings: string
  business_model: string
  pricing_strategy: string
  customer_segments: string
  competitive_moat: string
  ai_capabilities: string
  integration_ecosystem: string
  differentiators_vs_checkmarx_tromzo: string
  opportunity_flag: string
  opportunity_details: string
}

interface CompanyTableProps {
  companies: CompanyData[]
  loading: boolean
  onExport: () => void
  exporting: boolean
}

type SortField = 'company_name' | 'category' | 'total_funding' | 'estimated_revenue' | 'opportunity_flag' | 'ai_capabilities' | 'business_model' | 'competitive_moat'
type SortDir = 'asc' | 'desc'

function getOpportunityColor(flag: string): string {
  const upper = (flag ?? '').toUpperCase()
  if (upper.includes('HIGH')) return 'hsl(14,51%,60%)'
  if (upper.includes('MEDIUM')) return 'hsl(92,28%,60%)'
  return 'hsl(219,14%,65%)'
}

function getOpportunityBg(flag: string): string {
  const upper = (flag ?? '').toUpperCase()
  if (upper.includes('HIGH')) return 'hsla(14,51%,60%,0.15)'
  if (upper.includes('MEDIUM')) return 'hsla(92,28%,60%,0.15)'
  return 'hsla(219,14%,65%,0.1)'
}

function getCategoryColor(idx: number): string {
  const colors = [
    'hsl(213,32%,60%)',
    'hsl(193,43%,65%)',
    'hsl(92,28%,60%)',
    'hsl(311,20%,60%)',
    'hsl(14,51%,60%)',
  ]
  return colors[idx % colors.length]
}

function getCategoryBg(idx: number): string {
  const colors = [
    'hsla(213,32%,60%,0.15)',
    'hsla(193,43%,65%,0.15)',
    'hsla(92,28%,60%,0.15)',
    'hsla(311,20%,60%,0.15)',
    'hsla(14,51%,60%,0.15)',
  ]
  return colors[idx % colors.length]
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

export default function CompanyTable({ companies, loading, onExport, exporting }: CompanyTableProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [opportunityFilter, setOpportunityFilter] = useState('all')
  const [aiFilter, setAiFilter] = useState('all')
  const [sortField, setSortField] = useState<SortField>('company_name')
  const [sortDir, setSortDir] = useState<SortDir>('asc')
  const [expandedRow, setExpandedRow] = useState<number | null>(null)

  const categories = useMemo(() => {
    const cats = new Set<string>()
    if (Array.isArray(companies)) {
      companies.forEach((c) => { if (c?.category) cats.add(c.category) })
    }
    return Array.from(cats)
  }, [companies])

  const filtered = useMemo(() => {
    if (!Array.isArray(companies)) return []
    let result = [...companies]

    if (searchTerm) {
      const lower = searchTerm.toLowerCase()
      result = result.filter((c) => (c?.company_name ?? '').toLowerCase().includes(lower))
    }
    if (categoryFilter !== 'all') {
      result = result.filter((c) => c?.category === categoryFilter)
    }
    if (opportunityFilter !== 'all') {
      result = result.filter((c) => (c?.opportunity_flag ?? '').toUpperCase().includes(opportunityFilter.toUpperCase()))
    }
    if (aiFilter !== 'all') {
      result = result.filter((c) => {
        const has = (c?.ai_capabilities ?? '').toLowerCase()
        if (aiFilter === 'yes') return has !== 'none' && has !== 'no' && has !== 'n/a' && has.length > 0
        return has === 'none' || has === 'no' || has === 'n/a' || has.length === 0
      })
    }

    result.sort((a, b) => {
      const aVal = (a?.[sortField] ?? '').toLowerCase()
      const bVal = (b?.[sortField] ?? '').toLowerCase()
      if (aVal < bVal) return sortDir === 'asc' ? -1 : 1
      if (aVal > bVal) return sortDir === 'asc' ? 1 : -1
      return 0
    })

    return result
  }, [companies, searchTerm, categoryFilter, opportunityFilter, aiFilter, sortField, sortDir])

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortField(field)
      setSortDir('asc')
    }
  }

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <FiChevronDown className="w-3 h-3 opacity-30" />
    return sortDir === 'asc' ? <FiChevronUp className="w-3 h-3" /> : <FiChevronDown className="w-3 h-3" />
  }

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <Skeleton key={i} className="h-12 w-full rounded-md" />
        ))}
      </div>
    )
  }

  if (!Array.isArray(companies) || companies.length === 0) {
    return (
      <Card className="bg-card border-border">
        <CardContent className="p-12 text-center">
          <FiSearch className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground text-sm">Configure your research parameters and click Run Research to begin</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-3">
      {/* Filter Bar */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search companies..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 bg-card border-border h-9 text-sm"
          />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-[180px] h-9 bg-card border-border text-sm">
            <FiFilter className="w-3 h-3 mr-1 text-muted-foreground" />
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map((cat) => (
              <SelectItem key={cat} value={cat}>{cat}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={opportunityFilter} onValueChange={setOpportunityFilter}>
          <SelectTrigger className="w-[160px] h-9 bg-card border-border text-sm">
            <SelectValue placeholder="Opportunity" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Flags</SelectItem>
            <SelectItem value="HIGH">HIGH</SelectItem>
            <SelectItem value="MEDIUM">MEDIUM</SelectItem>
            <SelectItem value="LOW">LOW</SelectItem>
          </SelectContent>
        </Select>
        <Select value={aiFilter} onValueChange={setAiFilter}>
          <SelectTrigger className="w-[140px] h-9 bg-card border-border text-sm">
            <SelectValue placeholder="AI Capability" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All AI</SelectItem>
            <SelectItem value="yes">AI-Enabled</SelectItem>
            <SelectItem value="no">No AI</SelectItem>
          </SelectContent>
        </Select>
        <p className="text-xs text-muted-foreground">{filtered.length} results</p>
      </div>

      {/* Table */}
      <Card className="bg-card border-border overflow-hidden">
        <ScrollArea className="max-h-[calc(100vh-320px)]">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-secondary/50">
                <th className="w-8 px-2 py-2.5"></th>
                <th className="text-left px-3 py-2.5">
                  <button onClick={() => handleSort('company_name')} className="flex items-center gap-1 font-medium text-foreground hover:text-[hsl(213,32%,60%)] transition-colors">
                    Company <SortIcon field="company_name" />
                  </button>
                </th>
                <th className="text-left px-3 py-2.5 hidden xl:table-cell">
                  <span className="font-medium text-foreground">VC Investors</span>
                </th>
                <th className="text-left px-3 py-2.5">
                  <button onClick={() => handleSort('category')} className="flex items-center gap-1 font-medium text-foreground hover:text-[hsl(213,32%,60%)] transition-colors">
                    Category <SortIcon field="category" />
                  </button>
                </th>
                <th className="text-left px-3 py-2.5">
                  <button onClick={() => handleSort('total_funding')} className="flex items-center gap-1 font-medium text-foreground hover:text-[hsl(213,32%,60%)] transition-colors">
                    Funding <SortIcon field="total_funding" />
                  </button>
                </th>
                <th className="text-left px-3 py-2.5 hidden lg:table-cell">
                  <button onClick={() => handleSort('estimated_revenue')} className="flex items-center gap-1 font-medium text-foreground hover:text-[hsl(213,32%,60%)] transition-colors">
                    Revenue <SortIcon field="estimated_revenue" />
                  </button>
                </th>
                <th className="text-left px-3 py-2.5 hidden lg:table-cell">
                  <span className="font-medium text-foreground">Core Offering</span>
                </th>
                <th className="text-left px-3 py-2.5 hidden xl:table-cell">
                  <button onClick={() => handleSort('competitive_moat')} className="flex items-center gap-1 font-medium text-foreground hover:text-[hsl(213,32%,60%)] transition-colors">
                    Moat <SortIcon field="competitive_moat" />
                  </button>
                </th>
                <th className="text-left px-3 py-2.5 hidden md:table-cell">
                  <button onClick={() => handleSort('ai_capabilities')} className="flex items-center gap-1 font-medium text-foreground hover:text-[hsl(213,32%,60%)] transition-colors">
                    AI <SortIcon field="ai_capabilities" />
                  </button>
                </th>
                <th className="text-left px-3 py-2.5">
                  <button onClick={() => handleSort('opportunity_flag')} className="flex items-center gap-1 font-medium text-foreground hover:text-[hsl(213,32%,60%)] transition-colors">
                    Opportunity <SortIcon field="opportunity_flag" />
                  </button>
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((company, idx) => {
                const isExpanded = expandedRow === idx
                const catIdx = categories.indexOf(company?.category ?? '')
                return (
                  <React.Fragment key={idx}>
                    <tr
                      className={`border-b border-border cursor-pointer transition-colors hover:bg-secondary/30 ${idx % 2 === 0 ? 'bg-card' : 'bg-background'}`}
                      onClick={() => setExpandedRow(isExpanded ? null : idx)}
                    >
                      <td className="px-2 py-2.5 text-center">
                        {isExpanded ? <FiChevronDown className="w-4 h-4 text-muted-foreground" /> : <FiChevronRight className="w-4 h-4 text-muted-foreground" />}
                      </td>
                      <td className="px-3 py-2.5 font-medium text-foreground max-w-[160px] truncate">{company?.company_name ?? '-'}</td>
                      <td className="px-3 py-2.5 text-muted-foreground text-xs max-w-[160px] truncate hidden xl:table-cell">{company?.vc_investors ?? '-'}</td>
                      <td className="px-3 py-2.5">
                        <Badge variant="outline" className="text-[10px] border-none font-normal" style={{ backgroundColor: getCategoryBg(catIdx >= 0 ? catIdx : 0), color: getCategoryColor(catIdx >= 0 ? catIdx : 0) }}>
                          {company?.category ?? '-'}
                        </Badge>
                      </td>
                      <td className="px-3 py-2.5 font-mono text-xs text-foreground">{company?.total_funding ?? '-'}</td>
                      <td className="px-3 py-2.5 font-mono text-xs text-muted-foreground hidden lg:table-cell">{company?.estimated_revenue ?? '-'}</td>
                      <td className="px-3 py-2.5 text-xs text-muted-foreground max-w-[180px] truncate hidden lg:table-cell">{company?.core_offerings ?? '-'}</td>
                      <td className="px-3 py-2.5 text-xs text-muted-foreground max-w-[120px] truncate hidden xl:table-cell">{company?.competitive_moat ?? '-'}</td>
                      <td className="px-3 py-2.5 hidden md:table-cell">
                        <span className="text-xs" style={{ color: ((company?.ai_capabilities ?? '').toLowerCase() !== 'none' && (company?.ai_capabilities ?? '').toLowerCase() !== 'no' && (company?.ai_capabilities ?? '').length > 0) ? 'hsl(92,28%,60%)' : 'hsl(219,14%,65%)' }}>
                          {((company?.ai_capabilities ?? '').toLowerCase() !== 'none' && (company?.ai_capabilities ?? '').toLowerCase() !== 'no' && (company?.ai_capabilities ?? '').length > 0) ? 'Yes' : 'No'}
                        </span>
                      </td>
                      <td className="px-3 py-2.5">
                        <Badge variant="outline" className="text-[10px] border-none font-semibold" style={{ backgroundColor: getOpportunityBg(company?.opportunity_flag ?? ''), color: getOpportunityColor(company?.opportunity_flag ?? '') }}>
                          {company?.opportunity_flag ?? '-'}
                        </Badge>
                      </td>
                    </tr>
                    {isExpanded && (
                      <tr className="bg-secondary/20">
                        <td colSpan={10} className="p-0">
                          <div className="px-6 py-4 space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                              <DetailSection title="Company Overview">
                                <DetailField label="Founded" value={company?.founding_year} />
                                <DetailField label="Total Funding" value={company?.total_funding} mono />
                                <DetailField label="Latest Valuation" value={company?.latest_valuation} mono />
                                <DetailField label="Est. Revenue" value={company?.estimated_revenue} mono />
                                <DetailField label="Business Model" value={company?.business_model} />
                              </DetailSection>

                              <DetailSection title="Offerings & Strategy">
                                <DetailField label="Core Offerings" value={company?.core_offerings} long />
                                <DetailField label="Pricing Strategy" value={company?.pricing_strategy} long />
                                <DetailField label="Customer Segments" value={company?.customer_segments} long />
                              </DetailSection>

                              <DetailSection title="Competitive Position">
                                <DetailField label="Competitive Moat" value={company?.competitive_moat} long />
                                <DetailField label="AI Capabilities" value={company?.ai_capabilities} long />
                                <DetailField label="Integration Ecosystem" value={company?.integration_ecosystem} long />
                              </DetailSection>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <DetailSection title="Differentiators vs Checkmarx/Tromzo">
                                <div className="text-sm text-muted-foreground">
                                  {renderMarkdown(company?.differentiators_vs_checkmarx_tromzo ?? '')}
                                </div>
                              </DetailSection>

                              <DetailSection title="Opportunity Details">
                                <div className="flex items-center gap-2 mb-2">
                                  <Badge variant="outline" className="text-xs border-none font-semibold" style={{ backgroundColor: getOpportunityBg(company?.opportunity_flag ?? ''), color: getOpportunityColor(company?.opportunity_flag ?? '') }}>
                                    {company?.opportunity_flag ?? '-'}
                                  </Badge>
                                </div>
                                <div className="text-sm text-muted-foreground">
                                  {renderMarkdown(company?.opportunity_details ?? '')}
                                </div>
                              </DetailSection>
                            </div>

                            <div>
                              <DetailSection title="VC Investors">
                                <p className="text-sm text-muted-foreground">{company?.vc_investors ?? '-'}</p>
                              </DetailSection>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                )
              })}
            </tbody>
          </table>
        </ScrollArea>
      </Card>

      {/* Export FAB */}
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          onClick={onExport}
          disabled={exporting || !Array.isArray(companies) || companies.length === 0}
          className="h-12 px-5 rounded-full shadow-lg bg-[hsl(213,32%,52%)] hover:bg-[hsl(213,32%,45%)] text-white"
        >
          {exporting ? (
            <>
              <FiLoader className="w-4 h-4 mr-2 animate-spin" />
              Exporting...
            </>
          ) : (
            <>
              <FiDownload className="w-4 h-4 mr-2" />
              Export CSV
            </>
          )}
        </Button>
      </div>
    </div>
  )
}

function DetailSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-card rounded-md border border-border p-3">
      <p className="text-xs font-medium text-[hsl(213,32%,60%)] uppercase tracking-wider mb-2">{title}</p>
      <div className="space-y-1.5">{children}</div>
    </div>
  )
}

function DetailField({ label, value, mono, long }: { label: string; value?: string; mono?: boolean; long?: boolean }) {
  return (
    <div>
      <p className="text-[11px] text-muted-foreground">{label}</p>
      <p className={`text-sm text-foreground ${mono ? 'font-mono' : ''} ${long ? '' : ''}`}>{value ?? '-'}</p>
    </div>
  )
}
