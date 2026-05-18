import Link from 'next/link'

export function LandingFooter() {
  return (
    <footer className="py-8 border-t border-gray-200">
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex items-center justify-between">
          <Link href="/" className="text-xl font-bold hover:opacity-85 transition-opacity">
            DocDuck
          </Link>
          <p className="text-sm text-gray-400">© {new Date().getFullYear()} DocDuck. Built with Y.js & Tiptap.</p>
        </div>
      </div>
    </footer>
  )
}