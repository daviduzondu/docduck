export function BentoGrid() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Hero Card - 2x2 */}
      <div className="lg:col-span-2 lg:row-span-2 bg-gray-50 rounded-2xl p-8 hover:shadow-lg transition-all duration-300 cursor-pointer group border border-gray-200">
        <div className="mb-6">
          <div className="relative w-full h-48 bg-white rounded-xl border border-gray-200 overflow-hidden">
            {/* Mock editor UI */}
            <div className="absolute top-0 left-0 right-0 h-8 bg-gray-50 border-b border-gray-200 flex items-center px-3 gap-2">
              <div className="w-2 h-2 rounded-full bg-red-400" />
              <div className="w-2 h-2 rounded-full bg-amber-400" />
              <div className="w-2 h-2 rounded-full bg-green-400" />
            </div>
            <div className="absolute top-12 left-4 right-4 space-y-2">
              <div className="h-3 bg-gray-200 rounded w-3/4" />
              <div className="h-3 bg-gray-200 rounded w-full" />
              <div className="h-3 bg-gray-200 rounded w-5/6" />
              <div className="h-3 bg-gray-200 rounded w-2/3" />
            </div>
            {/* Cursors */}
            <div className="absolute top-16 left-12 group-hover:translate-x-2 transition-transform duration-300">
              <svg width="16" height="20" viewBox="0 0 16 20" fill="none">
                <path d="M3 2L13 10L8 12L6 18L3 2Z" fill="#22c55e" />
              </svg>
              <div className="absolute top-4 left-2 px-1.5 py-0.5 rounded text-[8px] font-medium text-white bg-green-500">
                Alex
              </div>
            </div>
            <div className="absolute top-20 left-32 group-hover:translate-x-3 transition-transform duration-300 delay-75">
              <svg width="16" height="20" viewBox="0 0 16 20" fill="none">
                <path d="M3 2L13 10L8 12L6 18L3 2Z" fill="#f59e0b" />
              </svg>
              <div className="absolute top-4 left-2 px-1.5 py-0.5 rounded text-[8px] font-medium text-white bg-amber-500">
                Sarah
              </div>
            </div>
            <div className="absolute top-24 left-20 group-hover:translate-x-4 transition-transform duration-300 delay-150">
              <svg width="16" height="20" viewBox="0 0 16 20" fill="none">
                <path d="M3 2L13 10L8 12L6 18L3 2Z" fill="#3b82f6" />
              </svg>
              <div className="absolute top-4 left-2 px-1.5 py-0.5 rounded text-[8px] font-medium text-white bg-blue-500">
                Maya
              </div>
            </div>
          </div>
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Real-time cursors</h3>
        <p className="text-gray-600 leading-relaxed">See exactly where your teammates are typing. Live cursor presence with name labels and color coding.</p>
      </div>

      {/* Comments Card - 1x1 */}
      <div className="bg-gray-50 rounded-2xl p-6 hover:shadow-lg transition-all duration-300 cursor-pointer group border border-gray-200">
        <div className="mb-4">
          <div className="relative w-full h-24 bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="absolute top-2 left-2 right-2">
              <div className="h-2 bg-gray-200 rounded w-full mb-1" />
              <div className="h-2 bg-gray-200 rounded w-3/4" />
            </div>
            {/* Comment bubble */}
            <div className="absolute bottom-2 right-2 w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center border border-amber-200 group-hover:scale-110 group-hover:-translate-y-1 transition-all duration-300">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M3 4H13M3 8H10M3 12H7" stroke="#f59e0b" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </div>
          </div>
        </div>
        <h3 className="font-semibold text-gray-900 mb-1">Inline comments</h3>
        <p className="text-sm text-gray-600">Select text and add threaded discussions.</p>
      </div>

      {/* Snapshots Card - 1x1 */}
      <div className="bg-gray-50 rounded-2xl p-6 hover:shadow-lg transition-all duration-300 cursor-pointer group border border-gray-200">
        <div className="mb-4">
          <div className="relative w-full h-24 bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="absolute top-2 left-2 right-2 space-y-1.5">
              <div className="flex items-center gap-2 group-hover:translate-x-1 transition-transform duration-300">
                <div className="w-3 h-3 rounded-full bg-violet-400" />
                <div className="h-1.5 bg-gray-200 rounded w-2/3" />
              </div>
              <div className="flex items-center gap-2 group-hover:translate-x-1 transition-transform duration-300 delay-75">
                <div className="w-3 h-3 rounded-full bg-violet-300" />
                <div className="h-1.5 bg-gray-200 rounded w-1/2" />
              </div>
              <div className="flex items-center gap-2 group-hover:translate-x-1 transition-transform duration-300 delay-150">
                <div className="w-3 h-3 rounded-full bg-violet-200" />
                <div className="h-1.5 bg-gray-200 rounded w-3/4" />
              </div>
            </div>
          </div>
        </div>
        <h3 className="font-semibold text-gray-900 mb-1">Version snapshots</h3>
        <p className="text-sm text-gray-600">Auto-saved every 15 minutes.</p>
      </div>

      {/* Search Card - 2 cols, under Comments & Snapshots */}
      <div className="lg:col-span-2 bg-gray-50 rounded-2xl p-6 hover:shadow-lg transition-all duration-300 cursor-pointer group border border-gray-200">
        <div className="flex items-center gap-6">
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 mb-1">Search & replace</h3>
            <p className="text-sm text-gray-600">Find and replace with regex support across your entire document.</p>
          </div>
          <div className="w-32 h-20 bg-white rounded-lg border border-gray-200 overflow-hidden flex-shrink-0 relative group-hover:shadow-md transition-shadow duration-300">
            <div className="absolute top-2 left-2 right-2 h-5 bg-gray-100 rounded flex items-center px-2 group-hover:bg-pink-50 transition-colors duration-300">
              <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                <circle cx="5" cy="5" r="3" stroke="#94a3b8" strokeWidth="1.5" />
                <path d="M7.5 7.5L10 10" stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
              <div className="ml-2 h-1 bg-gray-300 rounded w-1/2" />
            </div>
          </div>
        </div>
      </div>

      {/* Bottom row: Sharing, Privacy, Speed - stretched to fill */}
      <div className="lg:col-span-4 flex flex-col sm:flex-row gap-4">
        <div className="flex-1 bg-gray-50 rounded-2xl p-6 hover:shadow-lg transition-all duration-300 cursor-pointer group border border-gray-200">
          <div className="mb-4">
            <div className="relative w-full h-20 bg-white rounded-lg border border-gray-200 overflow-hidden">
              <div className="absolute top-2 left-2 right-2 h-6 bg-cyan-50 rounded-md border border-cyan-200 flex items-center px-2 group-hover:translate-x-1 transition-transform duration-300">
                <div className="w-3 h-3 rounded-full bg-cyan-400 flex items-center justify-center text-[6px] text-white font-medium">A</div>
                <div className="ml-2 h-1 bg-cyan-200 rounded w-1/3" />
              </div>
            </div>
          </div>
          <h3 className="font-semibold text-gray-900 mb-1">Email sharing</h3>
          <p className="text-sm text-gray-600">Invite by email with viewer or editor roles.</p>
        </div>

        <div className="flex-1 bg-gray-50 rounded-2xl p-6 hover:shadow-lg transition-all duration-300 cursor-pointer group border border-gray-200">
          <div className="mb-4">
            <div className="relative w-full h-20 bg-white rounded-lg border border-gray-200 overflow-hidden flex items-center justify-center">
              <svg width="28" height="28" viewBox="0 0 32 32" fill="none" className="group-hover:scale-110 transition-transform duration-300">
                <rect x="8" y="14" width="16" height="12" rx="3" stroke="#64748b" strokeWidth="2" fill="none" />
                <path d="M12 14V10C12 7 14 6 16 6C18 6 20 7 20 10V14" stroke="#64748b" strokeWidth="2" strokeLinecap="round" />
                <circle cx="16" cy="20" r="2" fill="#64748b" />
              </svg>
            </div>
          </div>
          <h3 className="font-semibold text-gray-900 mb-1">Private by default</h3>
          <p className="text-sm text-gray-600">You control who sees your docs.</p>
        </div>

        <div className="flex-1 bg-gray-50 rounded-2xl p-6 hover:shadow-lg transition-all duration-300 cursor-pointer group border border-gray-200">
          <div className="mb-4">
            <div className="relative w-full h-20 bg-white rounded-lg border border-gray-200 overflow-hidden flex items-center justify-center">
              <svg width="28" height="28" viewBox="0 0 32 32" fill="none" className="group-hover:scale-125 transition-transform duration-300">
                <path d="M18 4L8 16H16L14 28L24 14H16L18 4Z" fill="#eab308" />
              </svg>
            </div>
          </div>
              <h3 className="font-semibold text-gray-900 mb-1">Sub-50ms sync</h3>
              <p className="text-sm text-gray-600">Instant updates across all devices. Built on Y.js CRDTs.</p>
        </div>
      </div>
    </div>
  )
}