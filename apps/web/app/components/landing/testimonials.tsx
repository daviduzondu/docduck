const testimonials = [
  {
    quote: "We switched from Google Docs for our design specs. The real-time cursors actually feel instant, not 'real-time' in that 2-second-delay sense.",
    author: "Chidi Okafor",
    role: "Design lead, 12-person startup",
    color: '#22c55e',
  },
  {
    quote: "I lost an entire section during a late-night edit. Restored it from a snapshot in two clicks. Would've been a rewrite otherwise.",
    author: "Amaka Nwosu",
    role: "Technical writer",
    color: '#f59e0b',
  },
  {
    quote: "Our editorial team uses the inline comments for everything now. No more Slack threads about paragraph three.",
    author: "Tunde Bakare",
    role: "Managing editor at a small magazine",
    color: '#8b5cf6',
  },
]

export function Testimonials() {
  return (
    <section id="testimonials" className="py-20">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-2xl font-semibold tracking-tight text-gray-900">
            Teams that write together
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <div key={i} className="p-6 border border-gray-200 rounded-xl">
              <p className="text-gray-700 mb-4 leading-relaxed">"{t.quote}"</p>
              <div className="flex items-center gap-3">
                <div 
                  className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium"
                  style={{ backgroundColor: t.color }}
                >
                  {t.author[0]}
                </div>
                <div>
                  <div className="font-medium text-sm text-gray-900">{t.author}</div>
                  <div className="text-xs text-gray-500">{t.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}