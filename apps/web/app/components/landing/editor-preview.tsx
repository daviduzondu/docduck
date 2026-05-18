'use client'

import { useState, useEffect } from 'react'

const collaborators = [
  { name: 'Alex', color: '#22c55e' },
  { name: 'Sarah', color: '#f59e0b' },
  { name: 'Mike', color: '#8b5cf6' },
  { name: 'Emma', color: '#ec4899' },
]

export function EditorPreview() {
  const [text, setText] = useState('')
  const fullText = "A collaborative text editing experience like no other."
  const [cursorIndex, setCursorIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      if (cursorIndex <= fullText.length) {
        setText(fullText.slice(0, cursorIndex))
        setCursorIndex(prev => prev + 1)
      } else {
        setTimeout(() => {
          setCursorIndex(0)
          setText('')
        }, 2000)
      }
    }, 40)
    return () => clearInterval(interval)
  }, [cursorIndex])

  return (
    <div className="max-w-3xl mx-auto mt-12">
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-gray-50">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-400" />
            <div className="w-3 h-3 rounded-full bg-amber-400" />
            <div className="w-3 h-3 rounded-full bg-green-400" />
          </div>
          <div className="flex -space-x-2">
            {collaborators.map((c) => (
              <div
                key={c.name}
                className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-medium text-white border-2 border-white"
                style={{ backgroundColor: c.color }}
                title={c.name}
              >
                {c.name[0]}
              </div>
            ))}
          </div>
        </div>
        
        <div className="relative p-10 min-h-[200px] bg-white">
          <div className="max-w-xl mx-auto text-xl text-gray-800 font-normal">
            {text}
            <span className="inline-block w-0.5 h-6 bg-gray-400 ml-0.5 align-middle animate-pulse" />
          </div>
          <div className="absolute bottom-4 left-10 right-10 flex items-center justify-between text-xs text-gray-400">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span>4 collaborators online</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}