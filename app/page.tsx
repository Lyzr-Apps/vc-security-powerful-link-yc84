'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { callAIAgent } from '@/lib/aiAgent'
import Header from '@/components/appsec/Header'
import Sidebar, { ViewType } from '@/components/appsec/Sidebar'
import ResearchDashboard from '@/components/appsec/ResearchDashboard'
import ResultsExport from '@/components/appsec/ResultsExport'
import { CompanyData } from '@/components/appsec/CompanyTable'

// --- Agent IDs ---
const MANAGER_AGENT_ID = '69a20ebc23280dbe33411587'
const EXPORT_AGENT_ID = '69a20ea2affa763185fc3884'

// --- Sample Data ---
const SAMPLE_COMPANIES: CompanyData[] = [
  {
    company_name: 'Snyk',
    vc_investors: 'Accel, GV, Boldstart Ventures, Tiger Global',
    category: 'Developer Security',
    founding_year: '2015',
    total_funding: '$849M',
    latest_valuation: '$7.4B',
    estimated_revenue: '$300M ARR',
    core_offerings: 'Developer-first security platform for open source, code, containers, and IaC',
    business_model: 'Freemium SaaS with enterprise tiers',
    pricing_strategy: 'Free tier for individuals, Team at $25/dev/mo, Enterprise custom',
    customer_segments: 'Developers, DevOps teams, AppSec teams at mid-market and enterprise',
    competitive_moat: 'Largest vulnerability database, deep developer workflow integration, strong brand in DevSecOps',
    ai_capabilities: 'AI-powered auto-fix suggestions, DeepCode AI for code analysis',
    integration_ecosystem: 'GitHub, GitLab, Bitbucket, Jira, VS Code, IntelliJ, Docker, Kubernetes',
    differentiators_vs_checkmarx_tromzo: 'Developer-centric UX vs Checkmarx enterprise focus. Broader open source coverage. More modern cloud-native approach vs legacy SAST.',
    opportunity_flag: 'HIGH',
    opportunity_details: 'Major competitor with massive market share. Track their AI investments and enterprise expansion closely.',
  },
  {
    company_name: 'Semgrep',
    vc_investors: 'Sequoia Capital, Redpoint Ventures, Felicis',
    category: 'Static Analysis',
    founding_year: '2020',
    total_funding: '$100M',
    latest_valuation: '$500M',
    estimated_revenue: '$30M ARR',
    core_offerings: 'Lightweight static analysis engine with custom rule authoring for security and code quality',
    business_model: 'Open-core SaaS',
    pricing_strategy: 'OSS engine free, Semgrep Cloud Team/Enterprise tiers',
    customer_segments: 'Security engineers, platform engineering teams',
    competitive_moat: 'Open-source community adoption, fast scanning, custom rule ecosystem',
    ai_capabilities: 'AI-assisted rule generation, Semgrep Assistant for triage',
    integration_ecosystem: 'GitHub Actions, GitLab CI, Jenkins, VS Code',
    differentiators_vs_checkmarx_tromzo: 'Much faster scan times than Checkmarx. Open-source core reduces lock-in. Different positioning from Tromzo -- focuses on finding vs prioritizing.',
    opportunity_flag: 'MEDIUM',
    opportunity_details: 'Growing competitor in SAST space. Their open-source strategy could commoditize traditional SAST vendors.',
  },
  {
    company_name: 'Apiiro',
    vc_investors: 'Greylock Partners, Kleiner Perkins, General Atlantic',
    category: 'Application Security Posture Management',
    founding_year: '2019',
    total_funding: '$175M',
    latest_valuation: '$1B',
    estimated_revenue: '$45M ARR',
    core_offerings: 'Risk-based application security posture management connecting code to cloud',
    business_model: 'Enterprise SaaS',
    pricing_strategy: 'Per-application or per-developer enterprise licensing',
    customer_segments: 'CISOs, AppSec leads, security architects at large enterprises',
    competitive_moat: 'Code-to-runtime risk graph, binary analysis without agents',
    ai_capabilities: 'AI-driven risk scoring, automated security design review',
    integration_ecosystem: 'GitHub, Azure DevOps, Jira, ServiceNow, CI/CD pipelines',
    differentiators_vs_checkmarx_tromzo: 'Most direct competitor to Tromzo in ASPM space. Stronger code analysis vs Tromzo application-level view. More enterprise-focused than Checkmarx platform play.',
    opportunity_flag: 'HIGH',
    opportunity_details: 'Direct ASPM competitor to Tromzo. Monitor closely for feature parity and enterprise wins.',
  },
  {
    company_name: 'Endor Labs',
    vc_investors: 'Lightspeed Venture Partners, Dell Technologies Capital, Sierra Ventures',
    category: 'Software Supply Chain Security',
    founding_year: '2021',
    total_funding: '$70M',
    latest_valuation: '$350M',
    estimated_revenue: '$15M ARR',
    core_offerings: 'Dependency lifecycle management and software supply chain security',
    business_model: 'SaaS platform',
    pricing_strategy: 'Usage-based per-repository pricing',
    customer_segments: 'Security teams managing open source risk, compliance teams',
    competitive_moat: 'Deep dependency reachability analysis, function-level vulnerability assessment',
    ai_capabilities: 'AI-powered dependency risk scoring, automated remediation paths',
    integration_ecosystem: 'GitHub, Bitbucket, CI/CD pipelines, SBOM generators',
    differentiators_vs_checkmarx_tromzo: 'Deeper SCA capabilities than Checkmarx. Complements rather than competes with Tromzo prioritization layer. Novel reachability approach.',
    opportunity_flag: 'MEDIUM',
    opportunity_details: 'Adjacent space -- could become acquisition target or partnership opportunity for SCA enhancement.',
  },
  {
    company_name: 'Ox Security',
    vc_investors: 'IBM Ventures, Evolution Equity Partners, Team8',
    category: 'AppSec Pipeline Security',
    founding_year: '2021',
    total_funding: '$60M',
    latest_valuation: '$250M',
    estimated_revenue: '$12M ARR',
    core_offerings: 'Active ASPM platform for managing application security across the SDLC',
    business_model: 'Enterprise SaaS',
    pricing_strategy: 'Per-pipeline or per-developer enterprise contracts',
    customer_segments: 'DevSecOps teams, security operations, CI/CD pipeline owners',
    competitive_moat: 'Pipeline Bill of Materials (PBOM), active pipeline security posture',
    ai_capabilities: 'AI-driven pipeline risk assessment, automated security policy enforcement',
    integration_ecosystem: 'Jenkins, GitHub Actions, Azure DevOps, Jira, major cloud providers',
    differentiators_vs_checkmarx_tromzo: 'Overlaps with Tromzo in ASPM but focuses more on pipeline/supply chain angle. Less direct competition with Checkmarx SAST/DAST.',
    opportunity_flag: 'LOW',
    opportunity_details: 'Niche player in pipeline security. Limited direct competitive threat but worth monitoring.',
  },
]

// --- Progress stages ---
const PROGRESS_STAGES = [
  'Discovering VCs across selected categories...',
  'Mapping portfolio companies in AppSec/security...',
  'Analyzing company financials, moats, and AI capabilities...',
  'Aggregating results into unified dataset...',
]

// --- Error Boundary ---
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: string }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props)
    this.state = { hasError: false, error: '' }
  }
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error: error.message }
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
          <div className="text-center p-8 max-w-md">
            <h2 className="text-xl font-semibold mb-2">Something went wrong</h2>
            <p className="text-muted-foreground mb-4 text-sm">{this.state.error}</p>
            <button
              onClick={() => this.setState({ hasError: false, error: '' })}
              className="px-4 py-2 bg-[hsl(213,32%,52%)] text-white rounded-md text-sm"
            >
              Try again
            </button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}

// --- Main Page ---
export default function Page() {
  const [activeView, setActiveView] = useState<ViewType>('research')
  const [sampleMode, setSampleMode] = useState(false)
  const [companies, setCompanies] = useState<CompanyData[]>([])
  const [totalCompanies, setTotalCompanies] = useState('')
  const [totalVCs, setTotalVCs] = useState('')
  const [aiEnabled, setAiEnabled] = useState('')
  const [highOpportunity, setHighOpportunity] = useState('')
  const [summary, setSummary] = useState('')
  const [loading, setLoading] = useState(false)
  const [exporting, setExporting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [progressStage, setProgressStage] = useState('')
  const [progressPercent, setProgressPercent] = useState(0)
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null)

  // Sample mode toggle
  useEffect(() => {
    if (sampleMode) {
      setCompanies(SAMPLE_COMPANIES)
      setTotalCompanies('5')
      setTotalVCs('14')
      setAiEnabled('5')
      setHighOpportunity('2')
      setSummary('Sample research data showing 5 AppSec companies across Developer Security, Static Analysis, ASPM, Supply Chain Security, and Pipeline Security categories. All companies demonstrate AI capabilities and are backed by top-tier VCs.')
    } else {
      setCompanies([])
      setTotalCompanies('')
      setTotalVCs('')
      setAiEnabled('')
      setHighOpportunity('')
      setSummary('')
    }
  }, [sampleMode])

  const startProgressSimulation = useCallback(() => {
    let stageIdx = 0
    setProgressStage(PROGRESS_STAGES[0])
    setProgressPercent(10)

    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current)
    }

    progressIntervalRef.current = setInterval(() => {
      stageIdx = (stageIdx + 1) % PROGRESS_STAGES.length
      setProgressStage(PROGRESS_STAGES[stageIdx])
      setProgressPercent((prev) => Math.min(prev + 15, 90))
    }, 15000)
  }, [])

  const stopProgressSimulation = useCallback(() => {
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current)
      progressIntervalRef.current = null
    }
    setProgressPercent(100)
  }, [])

  // Cleanup interval on unmount
  useEffect(() => {
    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current)
      }
    }
  }, [])

  // Robust JSON parsing: handles stringified JSON, nested objects, and various response shapes
  const safeParse = (val: unknown): any => {
    if (!val) return null
    if (typeof val === 'object') return val
    if (typeof val === 'string') {
      try { return JSON.parse(val) } catch { return null }
    }
    return null
  }

  const extractCompaniesData = useCallback((result: any): { data: any; companiesList: CompanyData[] } => {
    console.log('[AppSec Hub] Full raw result:', JSON.stringify(result, null, 2))

    // Strategy: try multiple paths to find the companies array
    const candidates: any[] = []

    // Path 1: result.response.result (standard path)
    const rr = result?.response?.result
    if (rr) {
      const parsed = safeParse(rr)
      if (parsed) candidates.push(parsed)
    }

    // Path 2: result.response itself
    if (result?.response && typeof result.response === 'object') {
      candidates.push(result.response)
    }

    // Path 3: result.response.message might be stringified JSON
    const msg = result?.response?.message
    if (typeof msg === 'string') {
      const parsed = safeParse(msg)
      if (parsed) candidates.push(parsed)
    }

    // Path 4: result.raw_response
    if (result?.raw_response) {
      const parsed = safeParse(result.raw_response)
      if (parsed) candidates.push(parsed)
      // Also try parsed.response.result
      if (parsed?.response?.result) {
        const inner = safeParse(parsed.response.result)
        if (inner) candidates.push(inner)
      }
    }

    // Path 5: result itself
    if (result && typeof result === 'object') {
      candidates.push(result)
    }

    // Try each candidate for a companies array
    for (const candidate of candidates) {
      if (Array.isArray(candidate?.companies) && candidate.companies.length > 0) {
        // Validate first entry has company_name
        const first = candidate.companies[0]
        if (first && (first.company_name || first.name)) {
          // Normalize: if field is "name" instead of "company_name", remap
          const normalized = candidate.companies.map((c: any) => ({
            company_name: c.company_name || c.name || '',
            vc_investors: c.vc_investors || c.investors || '',
            category: c.category || '',
            founding_year: c.founding_year || c.founded || '',
            total_funding: c.total_funding || c.funding || '',
            latest_valuation: c.latest_valuation || c.valuation || '',
            estimated_revenue: c.estimated_revenue || c.revenue || '',
            core_offerings: c.core_offerings || c.offerings || c.products || '',
            business_model: c.business_model || '',
            pricing_strategy: c.pricing_strategy || c.pricing || '',
            customer_segments: c.customer_segments || c.customers || '',
            competitive_moat: c.competitive_moat || c.moat || '',
            ai_capabilities: c.ai_capabilities || c.ai || '',
            integration_ecosystem: c.integration_ecosystem || c.integrations || '',
            differentiators_vs_checkmarx_tromzo: c.differentiators_vs_checkmarx_tromzo || c.differentiators || '',
            opportunity_flag: c.opportunity_flag || c.flag || '',
            opportunity_details: c.opportunity_details || c.opportunity || '',
          }))
          console.log('[AppSec Hub] Found companies via candidate:', normalized.length)
          return { data: candidate, companiesList: normalized }
        }
      }
    }

    // Deep recursive search for any array with company_name fields
    const deepSearch = (obj: any, depth: number): any[] | null => {
      if (depth > 6 || !obj || typeof obj !== 'object') return null
      if (Array.isArray(obj)) {
        if (obj.length > 0 && obj[0] && (obj[0].company_name || obj[0].name)) return obj
        return null
      }
      for (const key of Object.keys(obj)) {
        const val = obj[key]
        // Try parsing string values
        if (typeof val === 'string' && val.length > 20) {
          try {
            const p = JSON.parse(val)
            const found = deepSearch(p, depth + 1)
            if (found) return found
          } catch { /* skip */ }
        }
        if (typeof val === 'object' && val !== null) {
          const found = deepSearch(val, depth + 1)
          if (found) return found
        }
      }
      return null
    }

    const deepFound = deepSearch(result, 0)
    if (deepFound && deepFound.length > 0) {
      console.log('[AppSec Hub] Found companies via deep search:', deepFound.length)
      const normalized = deepFound.map((c: any) => ({
        company_name: c.company_name || c.name || '',
        vc_investors: c.vc_investors || c.investors || '',
        category: c.category || '',
        founding_year: c.founding_year || c.founded || '',
        total_funding: c.total_funding || c.funding || '',
        latest_valuation: c.latest_valuation || c.valuation || '',
        estimated_revenue: c.estimated_revenue || c.revenue || '',
        core_offerings: c.core_offerings || c.offerings || c.products || '',
        business_model: c.business_model || '',
        pricing_strategy: c.pricing_strategy || c.pricing || '',
        customer_segments: c.customer_segments || c.customers || '',
        competitive_moat: c.competitive_moat || c.moat || '',
        ai_capabilities: c.ai_capabilities || c.ai || '',
        integration_ecosystem: c.integration_ecosystem || c.integrations || '',
        differentiators_vs_checkmarx_tromzo: c.differentiators_vs_checkmarx_tromzo || c.differentiators || '',
        opportunity_flag: c.opportunity_flag || c.flag || '',
        opportunity_details: c.opportunity_details || c.opportunity || '',
      }))
      return { data: candidates[0] || {}, companiesList: normalized }
    }

    console.warn('[AppSec Hub] No companies found in any path')
    return { data: candidates[0] || {}, companiesList: [] }
  }, [])

  const handleRunResearch = async (categories: string[], targets: string[], deepAnalysis: boolean) => {
    setLoading(true)
    setError(null)
    setSampleMode(false)
    startProgressSimulation()

    const message = `Research the AppSec competitive landscape with the following parameters:
- VC Categories: ${categories.join(', ')}
- Custom targets to include: ${targets.join(', ')}
- Analysis depth: ${deepAnalysis ? 'Deep' : 'Standard'}
Discover top VCs in each category, map their portfolio companies in AppSec/security, and perform ${deepAnalysis ? 'deep' : 'standard'} analysis on each company including financials, moat, AI capabilities, and differentiation vs Checkmarx/Tromzo.`

    try {
      const result = await callAIAgent(message, MANAGER_AGENT_ID)

      stopProgressSimulation()

      if (result.success) {
        const { data, companiesList } = extractCompaniesData(result)

        console.log('[AppSec Hub] Extracted companies count:', companiesList.length)

        if (companiesList.length === 0) {
          // Still switch to results but show an error inline
          setError('Research completed but no company data could be extracted. Check browser console for the raw response.')
          setLoading(false)
          return
        }

        setCompanies(companiesList)
        setTotalCompanies(data?.total_companies ?? String(companiesList.length))
        setTotalVCs(data?.total_vcs_discovered ?? '0')
        setAiEnabled(data?.ai_enabled_count ?? String(companiesList.filter((c: CompanyData) => {
          const ai = (c.ai_capabilities ?? '').toLowerCase()
          return ai && ai !== 'none' && ai !== 'no' && ai !== 'n/a'
        }).length))
        setHighOpportunity(data?.high_opportunity_count ?? String(companiesList.filter((c: CompanyData) =>
          (c.opportunity_flag ?? '').toUpperCase().includes('HIGH')
        ).length))
        setSummary(data?.summary ?? `Research complete. Found ${companiesList.length} companies across the AppSec landscape.`)
        setActiveView('results')
      } else {
        console.error('[AppSec Hub] Agent returned failure:', result?.error, result)
        setError(result?.error ?? 'Research failed. Please try again.')
      }
    } catch (err) {
      stopProgressSimulation()
      console.error('[AppSec Hub] Unexpected error:', err)
      setError(err instanceof Error ? err.message : 'An unexpected error occurred.')
    } finally {
      setLoading(false)
    }
  }

  const handleExport = async () => {
    if (!Array.isArray(companies) || companies.length === 0) return

    setExporting(true)

    const exportMessage = `Generate a CSV file from this competitive intelligence data: ${JSON.stringify(companies)}`

    try {
      const result = await callAIAgent(exportMessage, EXPORT_AGENT_ID)
      console.log('[AppSec Hub] Export result:', JSON.stringify(result, null, 2))

      if (result.success) {
        // Try top-level module_outputs first
        let files = result?.module_outputs?.artifact_files
        // Fallback: check response.module_outputs
        if (!Array.isArray(files) || files.length === 0) {
          files = (result?.response as any)?.module_outputs?.artifact_files
        }
        // Fallback: check raw_response
        if (!Array.isArray(files) || files.length === 0) {
          try {
            const raw = typeof result?.raw_response === 'string' ? JSON.parse(result.raw_response) : result?.raw_response
            files = raw?.module_outputs?.artifact_files
          } catch { /* skip */ }
        }

        if (Array.isArray(files) && files.length > 0) {
          const url = files[0]?.file_url
          if (url) {
            window.open(url, '_blank')
          }
        }
      }
    } catch (err) {
      console.error('[AppSec Hub] Export error:', err)
    } finally {
      setExporting(false)
    }
  }

  const hasResults = Array.isArray(companies) && companies.length > 0

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-background text-foreground flex flex-col">
        <Header sampleMode={sampleMode} onSampleModeChange={setSampleMode} />
        <div className="flex flex-1 overflow-hidden">
          <Sidebar
            activeView={activeView}
            onViewChange={setActiveView}
            hasResults={hasResults}
          />
          <main className="flex-1 overflow-y-auto p-4">
            {activeView === 'research' && (
              <ResearchDashboard
                onRunResearch={handleRunResearch}
                loading={loading}
                progressStage={progressStage}
                progressPercent={progressPercent}
                error={error}
              />
            )}
            {activeView === 'results' && (
              <ResultsExport
                companies={companies}
                totalCompanies={totalCompanies}
                totalVCs={totalVCs}
                aiEnabled={aiEnabled}
                highOpportunity={highOpportunity}
                summary={summary}
                loading={loading}
                onExport={handleExport}
                exporting={exporting}
              />
            )}
          </main>
        </div>
      </div>
    </ErrorBoundary>
  )
}
