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
        const data = result?.response?.result
        const companiesData = Array.isArray(data?.companies) ? data.companies : []
        setCompanies(companiesData as CompanyData[])
        setTotalCompanies(data?.total_companies ?? String(companiesData.length))
        setTotalVCs(data?.total_vcs_discovered ?? '0')
        setAiEnabled(data?.ai_enabled_count ?? '0')
        setHighOpportunity(data?.high_opportunity_count ?? '0')
        setSummary(data?.summary ?? '')
        setActiveView('results')
      } else {
        setError(result?.error ?? 'Research failed. Please try again.')
      }
    } catch (err) {
      stopProgressSimulation()
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

      if (result.success) {
        const files = result?.module_outputs?.artifact_files
        if (Array.isArray(files) && files.length > 0) {
          const url = files[0]?.file_url
          if (url) {
            window.open(url, '_blank')
          }
        }
      }
    } catch (err) {
      // Silent fail for export -- the table remains visible
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
