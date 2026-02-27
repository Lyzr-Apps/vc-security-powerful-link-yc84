'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Progress } from '@/components/ui/progress'
import { FiTarget, FiLayers, FiX } from 'react-icons/fi'
import { FiLoader } from 'react-icons/fi'
import { HiOutlineBeaker } from 'react-icons/hi'
import { BiBuildings } from 'react-icons/bi'

interface ResearchDashboardProps {
  onRunResearch: (categories: string[], targets: string[], deepAnalysis: boolean) => void
  loading: boolean
  progressStage: string
  progressPercent: number
  error: string | null
}

const VC_CATEGORIES = [
  { id: 'general', label: 'General Top-Tier', desc: 'a16z, Sequoia, Accel, etc.' },
  { id: 'ai_security', label: 'AI & Security Focused', desc: 'Insight Partners, Cyberstarts, etc.' },
  { id: 'appsec', label: 'AppSec-Specific', desc: 'Specialized application security VCs' },
]

export default function ResearchDashboard({ onRunResearch, loading, progressStage, progressPercent, error }: ResearchDashboardProps) {
  const [selectedCategories, setSelectedCategories] = useState<string[]>(['general', 'ai_security', 'appsec'])
  const [targets, setTargets] = useState<string[]>(['Tromzo', 'Checkmarx'])
  const [targetInput, setTargetInput] = useState('')
  const [deepAnalysis, setDeepAnalysis] = useState(true)

  const toggleCategory = (id: string) => {
    setSelectedCategories((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    )
  }

  const addTarget = () => {
    const trimmed = targetInput.trim()
    if (trimmed && !targets.includes(trimmed)) {
      setTargets((prev) => [...prev, trimmed])
      setTargetInput('')
    }
  }

  const removeTarget = (t: string) => {
    setTargets((prev) => prev.filter((item) => item !== t))
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      addTarget()
    }
  }

  const handleRun = () => {
    const catLabels = selectedCategories.map(
      (id) => VC_CATEGORIES.find((c) => c.id === id)?.label ?? id
    )
    onRunResearch(catLabels, targets, deepAnalysis)
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 h-full">
      {/* Left Column - 60% */}
      <div className="lg:col-span-3 space-y-4">
        {/* VC Category Selector */}
        <Card className="bg-card border-border">
          <CardHeader className="pb-2 pt-4 px-4">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <FiLayers className="w-4 h-4 text-[hsl(213,32%,60%)]" />
              VC Category Selection
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <div className="flex flex-wrap gap-2">
              {VC_CATEGORIES.map((cat) => {
                const isActive = selectedCategories.includes(cat.id)
                return (
                  <button
                    key={cat.id}
                    onClick={() => toggleCategory(cat.id)}
                    disabled={loading}
                    className={`px-3 py-2 rounded-md border text-sm transition-all ${isActive ? 'bg-[hsl(213,32%,52%)] border-[hsl(213,32%,52%)] text-white' : 'bg-secondary border-border text-muted-foreground hover:border-[hsl(213,32%,52%)] hover:text-foreground'}`}
                  >
                    <span className="font-medium">{cat.label}</span>
                    <span className="block text-[10px] opacity-70 mt-0.5">{cat.desc}</span>
                  </button>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Custom Targets Input */}
        <Card className="bg-card border-border">
          <CardHeader className="pb-2 pt-4 px-4">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <FiTarget className="w-4 h-4 text-[hsl(193,43%,65%)]" />
              Custom Targets
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4 space-y-3">
            <div className="flex gap-2">
              <Input
                placeholder="Add a company or VC name..."
                value={targetInput}
                onChange={(e) => setTargetInput(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={loading}
                className="bg-background border-border h-9 text-sm flex-1"
              />
              <Button
                onClick={addTarget}
                disabled={loading || !targetInput.trim()}
                variant="outline"
                size="sm"
                className="h-9 border-border"
              >
                Add
              </Button>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {targets.map((t) => (
                <Badge key={t} variant="secondary" className="px-2 py-1 text-xs bg-secondary text-foreground">
                  {t}
                  <button onClick={() => removeTarget(t)} className="ml-1.5 hover:text-destructive transition-colors" disabled={loading}>
                    <FiX className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
              {targets.length === 0 && (
                <p className="text-xs text-muted-foreground">No custom targets added</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Analysis Depth */}
        <Card className="bg-card border-border">
          <CardContent className="px-4 py-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-foreground">Analysis Depth</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {deepAnalysis
                    ? 'Deep: Full financial, competitive, and strategic analysis per company'
                    : 'Standard: Basic company profiles and funding data'}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">{deepAnalysis ? 'Deep' : 'Standard'}</span>
                <Switch checked={deepAnalysis} onCheckedChange={setDeepAnalysis} disabled={loading} />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Run Button */}
        <Button
          onClick={handleRun}
          disabled={loading || selectedCategories.length === 0}
          className="w-full h-11 bg-[hsl(213,32%,52%)] hover:bg-[hsl(213,32%,45%)] text-white font-medium"
        >
          {loading ? (
            <>
              <FiLoader className="w-4 h-4 mr-2 animate-spin" />
              Research in Progress...
            </>
          ) : (
            <>
              <HiOutlineBeaker className="w-4 h-4 mr-2" />
              Run Research
            </>
          )}
        </Button>

        {/* Error Display */}
        {error && (
          <Card className="bg-destructive/10 border-destructive/30">
            <CardContent className="p-3">
              <p className="text-sm text-destructive">{error}</p>
              <Button variant="outline" size="sm" className="mt-2 text-xs border-destructive/30 text-destructive hover:bg-destructive/10" onClick={handleRun}>
                Retry
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Right Column - 40% */}
      <div className="lg:col-span-2 space-y-4">
        {/* Research Summary Panel */}
        <Card className="bg-card border-border">
          <CardHeader className="pb-2 pt-4 px-4">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <BiBuildings className="w-4 h-4 text-[hsl(92,28%,60%)]" />
              Research Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4 space-y-3">
            <div className="space-y-2">
              <SummaryRow label="Categories Selected" value={String(selectedCategories.length)} highlight={selectedCategories.length > 0} />
              <SummaryRow label="Custom Targets" value={String(targets.length)} highlight={targets.length > 0} />
              <SummaryRow label="Analysis Depth" value={deepAnalysis ? 'Deep' : 'Standard'} highlight={deepAnalysis} />
            </div>
            <div className="border-t border-border pt-3">
              <p className="text-xs text-muted-foreground">
                {selectedCategories.length > 0
                  ? `Research will discover top VCs in ${selectedCategories.length} ${selectedCategories.length === 1 ? 'category' : 'categories'}, map their AppSec portfolio companies, and perform ${deepAnalysis ? 'deep' : 'standard'} analysis on each.`
                  : 'Select at least one VC category to configure your research scope.'}
              </p>
              {targets.length > 0 && (
                <p className="text-xs text-muted-foreground mt-1.5">
                  Additionally analyzing {targets.length} custom target{targets.length > 1 ? 's' : ''}: {targets.join(', ')}
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Progress Panel */}
        {loading && (
          <Card className="bg-card border-border">
            <CardHeader className="pb-2 pt-4 px-4">
              <CardTitle className="text-sm font-medium">Research Progress</CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4 space-y-3">
              <Progress value={progressPercent} className="h-2" />
              <div className="flex items-center gap-2">
                <FiLoader className="w-3.5 h-3.5 animate-spin text-[hsl(213,32%,60%)]" />
                <p className="text-sm text-foreground">{progressStage}</p>
              </div>
              <p className="text-[11px] text-muted-foreground">
                This process may take several minutes as agents discover VCs, map portfolios, and analyze companies.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Agent Pipeline Visualization */}
        <Card className="bg-card border-border">
          <CardHeader className="pb-2 pt-4 px-4">
            <CardTitle className="text-sm font-medium">Agent Pipeline</CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <div className="space-y-2">
              <PipelineStep step={1} label="VC Discovery" desc="Find top VCs by category" active={loading && progressStage.includes('Discovering')} />
              <PipelineStep step={2} label="Portfolio Mapping" desc="Map portfolio companies in AppSec" active={loading && progressStage.includes('Mapping')} />
              <PipelineStep step={3} label="Company Analysis" desc="Deep-dive each company" active={loading && progressStage.includes('Analyzing')} />
              <PipelineStep step={4} label="Aggregation" desc="Compile unified dataset" active={loading && progressStage.includes('Aggregating')} />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function SummaryRow({ label, value, highlight }: { label: string; value: string; highlight: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className={`text-sm font-mono font-medium ${highlight ? 'text-foreground' : 'text-muted-foreground'}`}>{value}</span>
    </div>
  )
}

function PipelineStep({ step, label, desc, active }: { step: number; label: string; desc: string; active: boolean }) {
  return (
    <div className={`flex items-center gap-3 px-2 py-1.5 rounded-md transition-colors ${active ? 'bg-[hsla(213,32%,52%,0.12)]' : ''}`}>
      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium shrink-0 ${active ? 'bg-[hsl(213,32%,52%)] text-white' : 'bg-secondary text-muted-foreground'}`}>
        {step}
      </div>
      <div>
        <p className={`text-sm ${active ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>{label}</p>
        <p className="text-[10px] text-muted-foreground">{desc}</p>
      </div>
      {active && <FiLoader className="w-3.5 h-3.5 animate-spin text-[hsl(213,32%,60%)] ml-auto" />}
    </div>
  )
}
