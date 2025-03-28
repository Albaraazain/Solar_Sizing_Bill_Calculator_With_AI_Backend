import {
  Sun,
  DollarSign,
  Zap,
  ArrowRight,
  ChevronRight,
  TreePine,
  PiggyBank,
  BarChart3,
  Calendar,
  Leaf,
} from "lucide-react"
import { quoteApi } from "../../api/services/quoteApi.js"

export class QuotePage {
  constructor() {
    this.state = {
      quote: null,
      loading: true,
      error: null
    }
    
    // Bind methods
    this.handleDownloadPDF = this.handleDownloadPDF.bind(this)
    this.init = this.init.bind(this)
    this.render = this.render.bind(this)
    this.cleanup = this.cleanup.bind(this)

    // Set as current component for router cleanup
    if (window.router) {
      window.router.currentComponent = this
    }

    // Initialize
    this.init()
  }

  async init() {
    try {
      // Get quote ID from URL params
      const urlParams = new URLSearchParams(window.location.search)
      const quoteId = urlParams.get('id')

      if (!quoteId) {
        throw new Error('No quote ID provided')
      }

      const response = await quoteApi.getQuoteById(quoteId)
      this.state.quote = response.data
    } catch (error) {
      console.error('Error fetching quote:', error)
      this.state.error = error.message
    } finally {
      this.state.loading = false
      this.render() // Re-render with updated state
    }
  }

  async handleDownloadPDF() {
    try {
      await quoteApi.generatePDF(this.state.quote)
      // PDF download will be handled by the backend response
    } catch (error) {
      console.error('Error generating PDF:', error)
      // Show error notification
    }
  }

  cleanup() {
    // Remove any event listeners
    const app = document.getElementById('app')
    if (app) {
      const downloadBtn = app.querySelector('[data-action="download-pdf"]')
      if (downloadBtn) {
        downloadBtn.removeEventListener('click', this.handleDownloadPDF)
      }

      // Clean up other event listeners
      const scheduleBtn = app.querySelector('[data-action="schedule"]')
      const financingBtn = app.querySelector('[data-action="financing"]')
      
      if (scheduleBtn) {
        scheduleBtn.removeEventListener('click', () => window.router.push('/schedule'))
      }
      
      if (financingBtn) {
        financingBtn.removeEventListener('click', () => window.router.push('/financing'))
      }

      // Clear content
      app.innerHTML = ''
    }

    // Remove self from router
    if (window.router && window.router.currentComponent === this) {
      window.router.currentComponent = null
    }
  }

  renderLoading() {
    return `
      <div class="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div class="text-center">
          <div class="animate-spin rounded-full h-16 w-16 border-b-2 border-emerald-500 mx-auto mb-4"></div>
          <div class="text-gray-600">Loading quote details...</div>
        </div>
      </div>
    `
  }

  renderError() {
    return `
      <div class="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div class="text-center">
          <div class="text-xl font-semibold text-gray-800 mb-2">Error</div>
          <div class="text-gray-600">${this.state.error || 'Something went wrong'}</div>
          <button 
            class="mt-4 px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors"
            data-action="home"
          >
            Go Back Home
          </button>
        </div>
      </div>
    `
  }

  attachEventListeners() {
    const app = document.getElementById('app')
    if (!app) return

    // PDF download
    const downloadBtn = app.querySelector('[data-action="download-pdf"]')
    if (downloadBtn) {
      downloadBtn.addEventListener('click', this.handleDownloadPDF)
    }

    // Navigation buttons
    const scheduleBtn = app.querySelector('[data-action="schedule"]')
    const financingBtn = app.querySelector('[data-action="financing"]')
    const homeBtn = app.querySelector('[data-action="home"]')
    
    if (scheduleBtn) {
      scheduleBtn.addEventListener('click', () => window.router.push('/schedule'))
    }
    
    if (financingBtn) {
      financingBtn.addEventListener('click', () => window.router.push('/financing'))
    }

    if (homeBtn) {
      homeBtn.addEventListener('click', () => window.router.push('/'))
    }
  }

  render() {
    const app = document.getElementById('app')
    if (!app) return

    if (this.state.loading) {
      app.innerHTML = this.renderLoading()
      return
    }

    if (this.state.error || !this.state.quote) {
      app.innerHTML = this.renderError()
      this.attachEventListeners()
      return
    }

    const quote = this.state.quote

    app.innerHTML = `
      <div class="flex flex-col min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 text-gray-800">
        <div class="max-w-7xl mx-auto w-full p-4 md:p-6">
          <!-- Header -->
          <header class="flex justify-between items-center mb-6 md:mb-8">
            <div class="flex items-center gap-3">
              <div class="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white p-2 rounded-lg shadow-md">
                ${DollarSign()}
              </div>
              <div>
                <h1 class="text-2xl font-bold">Solar System Quote</h1>
                <div class="text-sm text-gray-500">Reference #${quote.referenceNumber}</div>
              </div>
            </div>
            <button 
              class="bg-emerald-500 text-white px-4 py-2 rounded-lg hover:bg-emerald-600 transition-colors flex items-center gap-2"
              data-action="download-pdf"
            >
              <span>Download PDF</span>
              ${ArrowRight()}
            </button>
          </header>

          <!-- Main Content -->
          <div class="grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-6">
            <!-- System Overview -->
            <div class="md:col-span-4 bg-white rounded-2xl p-4 md:p-6 shadow-lg border border-gray-100">
              <div class="flex justify-between items-center mb-4">
                <div class="flex items-center gap-3">
                  <div class="bg-emerald-100 p-2 rounded-lg">
                    ${Sun()}
                  </div>
                  <div class="font-semibold text-gray-800">System Overview</div>
                </div>
              </div>

              <div class="text-4xl font-bold mb-4 text-gray-900 flex items-end gap-2">
                ${quote.systemDetails.systemSize} <span class="text-lg text-gray-500 font-normal">kW</span>
              </div>

              <div class="space-y-4">
                <div class="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <div class="text-sm">Number of Panels</div>
                  <div class="text-sm font-medium bg-emerald-100 px-3 py-1 rounded-full text-emerald-700">
                    ${quote.systemDetails.panelCount} panels
                  </div>
                </div>

                <div class="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <div class="text-sm">Panel Type</div>
                  <div class="text-sm font-medium bg-emerald-100 px-3 py-1 rounded-full text-emerald-700">
                    ${quote.systemDetails.panelType}
                  </div>
                </div>

                <div class="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <div class="text-sm">Inverter Type</div>
                  <div class="text-sm font-medium bg-emerald-100 px-3 py-1 rounded-full text-emerald-700">
                    ${quote.systemDetails.inverterType}
                  </div>
                </div>

                <div class="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <div class="text-sm">Required Roof Area</div>
                  <div class="text-sm font-medium bg-emerald-100 px-3 py-1 rounded-full text-emerald-700">
                    ${quote.systemDetails.roofArea} sq ft
                  </div>
                </div>

                <div class="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <div class="text-sm">Warranty Period</div>
                  <div class="text-sm font-medium bg-emerald-100 px-3 py-1 rounded-full text-emerald-700">
                    ${quote.systemDetails.warranty}
                  </div>
                </div>
              </div>
            </div>

            <!-- Production Analysis -->
            <div class="md:col-span-4 bg-white rounded-2xl p-4 md:p-6 shadow-lg border border-gray-100">
              <div class="flex justify-between items-center mb-4">
                <div class="flex items-center gap-3">
                  <div class="bg-emerald-100 p-2 rounded-lg">
                    ${Zap()}
                  </div>
                  <div class="font-semibold text-gray-800">Production Analysis</div>
                </div>
              </div>

              <div class="text-4xl font-bold mb-4 text-gray-900 flex items-end gap-2">
                ${quote.production.annual.toLocaleString()} <span class="text-lg text-gray-500 font-normal">kWh/year</span>
              </div>

              <div class="space-y-4 mb-6">
                <div>
                  <div class="text-xs text-gray-500 mb-1">Annual Production vs Consumption</div>
                  <div class="h-2 bg-gray-100 rounded-full relative">
                    <div class="h-full w-[85%] bg-gradient-to-r from-emerald-400 to-emerald-600 rounded-full"></div>
                  </div>
                  <div class="flex justify-between text-xs text-gray-500 mt-1">
                    <span>0 kWh</span>
                    <span>15,000 kWh</span>
                  </div>
                </div>
              </div>

              <div class="h-40 relative mb-4">
                <div class="absolute inset-0">
                  ${quote.production.monthly.map((data, i) => `
                    <div
                      class="absolute bottom-0 bg-emerald-500/20 border-t-2 border-emerald-500 transition-all hover:bg-emerald-500/30"
                      style="
                        left: ${(i / 12) * 100}%;
                        width: ${100 / 12}%;
                        height: ${(data.production / 1400) * 100}%
                      "
                    >
                      <div class="absolute -top-5 left-1/2 -translate-x-1/2 text-xs text-gray-500">${data.month}</div>
                    </div>
                  `).join('')}
                </div>
              </div>

              <div class="grid grid-cols-2 gap-4">
                <div class="bg-emerald-50 p-3 rounded-lg border border-emerald-100">
                  <div class="text-sm text-emerald-800 font-medium mb-1">Daily Average</div>
                  <div class="text-lg font-bold text-emerald-700">${quote.production.daily} kWh</div>
                </div>
                <div class="bg-emerald-50 p-3 rounded-lg border border-emerald-100">
                  <div class="text-sm text-emerald-800 font-medium mb-1">Performance Ratio</div>
                  <div class="text-lg font-bold text-emerald-700">${quote.production.performanceRatio * 100}%</div>
                </div>
              </div>
            </div>

            <!-- Financial Summary -->
            <div class="md:col-span-4 bg-white rounded-2xl p-4 md:p-6 shadow-lg border border-gray-100">
              <div class="flex justify-between items-center mb-4">
                <div class="flex items-center gap-3">
                  <div class="bg-emerald-100 p-2 rounded-lg">
                    ${PiggyBank()}
                  </div>
                  <div class="font-semibold text-gray-800">Financial Summary</div>
                </div>
              </div>

              <div class="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <div class="text-sm text-gray-500 mb-1">System Cost</div>
                  <div class="text-2xl font-bold text-gray-900">Rs. ${quote.financial.systemCost.toLocaleString()}</div>
                </div>
                <div>
                  <div class="text-sm text-gray-500 mb-1">Annual Savings</div>
                  <div class="text-2xl font-bold text-emerald-600">Rs. ${quote.financial.annualSavings.toLocaleString()}</div>
                </div>
              </div>

              <div class="mb-6">
                <div class="flex justify-between items-center mb-2">
                  <div class="text-sm font-medium text-gray-800">Payback Period</div>
                  <div class="text-sm font-medium text-emerald-600">${quote.financial.paybackPeriod} years</div>
                </div>
                <div class="h-3 bg-gray-100 rounded-full mb-1 overflow-hidden">
                  <div
                    class="h-full bg-gradient-to-r from-emerald-400 to-emerald-600 rounded-full relative"
                    style="width: ${(quote.financial.paybackPeriod / 10) * 100}%"
                  >
                    <div class="absolute inset-0 bg-emerald-400/30 animate-pulse"></div>
                  </div>
                </div>
                <div class="flex justify-between text-xs text-gray-500">
                  <span>0 years</span>
                  <span>10 years</span>
                </div>
              </div>

              <div class="bg-emerald-50 p-4 rounded-xl border border-emerald-100 mb-4">
                <div class="flex items-center justify-between mb-2">
                  <div class="text-sm font-medium text-emerald-800">25-Year Savings</div>
                  <div class="text-sm text-emerald-600">ROI: ${quote.financial.roi}%</div>
                </div>
                <div class="text-2xl font-bold text-emerald-700">
                  Rs. ${(quote.financial.savingsTimeline[24].cumulativeSavings).toLocaleString()}
                </div>
              </div>

              <div class="h-24 relative">
                ${quote.financial.savingsTimeline.map((data, i) => `
                  <div
                    class="absolute bottom-0 bg-emerald-500/20 border-t-2 border-emerald-500"
                    style="
                      left: ${(i / 25) * 100}%;
                      width: ${100 / 25}%;
                      height: ${(data.cumulativeSavings / quote.financial.savingsTimeline[24].cumulativeSavings) * 100}%
                    "
                  ></div>
                `).join('')}
              </div>
            </div>

            <!-- Environmental Impact -->
            <div class="md:col-span-6 bg-white rounded-2xl p-4 md:p-6 shadow-lg border border-gray-100">
              <div class="flex justify-between items-center mb-6">
                <div class="flex items-center gap-3">
                  <div class="bg-emerald-100 p-2 rounded-lg">
                    ${Leaf()}
                  </div>
                  <div class="font-semibold text-gray-800">Environmental Impact</div>
                </div>
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div class="bg-emerald-50 p-4 rounded-xl border border-emerald-100">
                  <div class="flex items-center gap-2 mb-3">
                    ${TreePine()}
                    <div class="text-sm font-medium text-emerald-800">CO₂ Offset</div>
                  </div>
                  <div class="text-2xl font-bold text-emerald-700">${quote.environmental.co2Offset} tons/year</div>
                  <div class="text-sm text-emerald-600 mt-1">Equivalent to ${quote.environmental.treesEquivalent} trees</div>
                </div>

                <div class="bg-emerald-50 p-4 rounded-xl border border-emerald-100">
                  <div class="flex items-center gap-2 mb-3">
                    ${BarChart3()}
                    <div class="text-sm font-medium text-emerald-800">Carbon Reduction</div>
                  </div>
                  <div class="text-2xl font-bold text-emerald-700">${quote.environmental.carbonFootprintReduction} kg</div>
                  <div class="text-sm text-emerald-600 mt-1">Annual carbon footprint reduction</div>
                </div>

                <div class="bg-emerald-50 p-4 rounded-xl border border-emerald-100">
                  <div class="flex items-center gap-2 mb-3">
                    ${Calendar()}
                    <div class="text-sm font-medium text-emerald-800">System Lifetime</div>
                  </div>
                  <div class="text-2xl font-bold text-emerald-700">25+ years</div>
                  <div class="text-sm text-emerald-600 mt-1">Of clean energy production</div>
                </div>
              </div>
            </div>

            <!-- Actions -->
            <div class="md:col-span-6 bg-white rounded-2xl p-4 md:p-6 shadow-lg border border-gray-100">
              <div class="flex justify-between items-center mb-6">
                <div class="flex items-center gap-3">
                  <div class="bg-emerald-100 p-2 rounded-lg">
                    ${ChevronRight()}
                  </div>
                  <div class="font-semibold text-gray-800">Next Steps</div>
                </div>
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button 
                  class="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white p-4 rounded-xl flex items-center justify-between transition-all shadow-md hover:shadow-lg"
                  data-action="schedule"
                >
                  <div>
                    <div class="font-medium mb-1">Schedule Site Visit</div>
                    <div class="text-sm text-emerald-100">Get your installation started</div>
                  </div>
                  ${ArrowRight()}
                </button>

                <button
                  class="bg-white border border-emerald-200 text-emerald-700 p-4 rounded-xl flex items-center justify-between transition-all hover:bg-emerald-50 shadow-sm hover:shadow"
                  data-action="financing"
                >
                  <div>
                    <div class="font-medium mb-1">Financing Options</div>
                    <div class="text-sm text-emerald-600">Explore payment plans</div>
                  </div>
                  ${ArrowRight()}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    `

    this.attachEventListeners()
  }
}