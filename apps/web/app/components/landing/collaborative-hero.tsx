'use client'

import { useState, useEffect, useRef, useCallback } from 'react'

// ─── Text config ─────────────────────────────────────────────────────────────

const LINES = [
  'A collaborative',
  'text editing experience',
  'like no other',
]

type FixType = 'insert' | 'replace'

interface CharFix {
  type: FixType
  index: number
  wrongChar?: string
  cursorId: number
}

const FIXES: CharFix[] = [
  { type: 'insert',  index: 8,  cursorId: 1 },
  { type: 'replace', index: 22, wrongChar: 'e', cursorId: 2 },
  { type: 'insert',  index: 31, cursorId: 3 },
]
const FIX_MAP = new Map(FIXES.map((f) => [f.index, f]))

const CURSOR_META: Record<number, { name: string; color: string }> = {
  1: { name: 'Chidi',  color: '#22c55e' },
  2: { name: 'Amaka',  color: '#f59e0b' },
  3: { name: 'Tunde',  color: '#3b82f6' },
  4: { name: 'Ngozi',   color: '#ef4444' },
  5: { name: 'Emeka',  color: '#8b5cf6' },
}

interface LiveCursor {
  id: number
  name: string
  color: string
  x: number
  y: number
  action: 'typing' | 'dancing'
  phase: 'idle' | 'moving' | 'acting' | 'dancing'
}

// ─── CollaborativeHero ───────────────────────────────────────────────────────

export function CollaborativeHero() {
  const containerRef = useRef<HTMLDivElement>(null)
  const charRefs    = useRef<(HTMLSpanElement | null)[]>([])
  const tidRef      = useRef<ReturnType<typeof setTimeout>[]>([])

  const [fixed,     setFixed]     = useState<Set<number>>(new Set())
  const [carets,    setCarets]    = useState<Map<number, string>>(new Map())
  const [cursors,   setCursors]   = useState<LiveCursor[]>([])
  const hoverRef    = useRef<ReturnType<typeof setInterval> | null>(null)
  const intervalIds = useRef<ReturnType<typeof setInterval>[]>([])

  const getPos = useCallback((index: number) => {
    const el  = charRefs.current[index]
    const box = containerRef.current
    if (!el || !box) return { x: 0, y: 0, h: 60 }
    const er = el.getBoundingClientRect()
    const br = box.getBoundingClientRect()
    return { x: er.left - br.left, y: er.top - br.top, h: er.height }
  }, [])

  const after = useCallback((ms: number, fn: () => void) => {
    const id = setTimeout(fn, ms)
    tidRef.current.push(id)
  }, [])

  useEffect(() => {
    let dead = false
    tidRef.current = []
    intervalIds.current = []

    const guard = (fn: () => void) => () => { if (!dead) fn() }

    const addCursor = (c: LiveCursor) =>
      !dead && setCursors((p) => [...p, c])

    const moveCursor = (id: number, x: number, y: number) =>
      !dead && setCursors((p) =>
        p.map((c) => (c.id === id ? { ...c, x, y, phase: 'moving' } : c))
      )

    const actCursor = (id: number) =>
      !dead && setCursors((p) =>
        p.map((c) => (c.id === id ? { ...c, phase: 'acting' } : c))
      )

    const showCaret = (idx: number, color: string) =>
      !dead && setCarets((m) => new Map(m).set(idx, color))

    const hideCaret = (idx: number) =>
      !dead && setCarets((m) => { const n = new Map(m); n.delete(idx); return n })

    const revealChar = (idx: number) => {
      if (dead) return
      setFixed((s)   => new Set([...s, idx]))
    }

    function seq() {
      if (dead) return

      setFixed(new Set())
      setCarets(new Map())
      setCursors([])

      const APPROACH: Record<number, { dx: number; dy: number }> = {
        1: { dx: -200, dy: -55 },
        2: { dx:  170, dy: -70 },
        3: { dx: -150, dy:  55 },
      }

      after(800, guard(() => {
        FIXES.forEach(({ index, cursorId }) => {
          const { x, y } = getPos(index)
          const meta = CURSOR_META[cursorId]
          if (!meta) return
          const { name, color } = meta
          const { dx, dy } = APPROACH[cursorId]!
          addCursor({ id: cursorId, name, color, x: x + dx, y: y + dy, action: 'typing', phase: 'idle' })
        })
        after(50, guard(() => {
          FIXES.forEach(({ index, cursorId }) => {
            const { x, y } = getPos(index)
            moveCursor(cursorId, x, y)
          })
        }))
      }))

      after(1750, guard(() => { actCursor(1); showCaret(8,  CURSOR_META[1]!.color) }))
      after(1900, guard(() => { actCursor(2); showCaret(22, CURSOR_META[2]!.color) }))
      after(2050, guard(() => { actCursor(3); showCaret(31, CURSOR_META[3]!.color) }))

      after(2450, guard(() => { hideCaret(8);  revealChar(8)  }))
      after(2600, guard(() => { hideCaret(22); revealChar(22) }))
      after(2750, guard(() => { hideCaret(31); revealChar(31) }))

      after(2900, guard(() => { setCarets(new Map()) }))

      after(3200, guard(() => {
        setCursors((p) => p.map((c) => ({ ...c, action: 'dancing', phase: 'dancing' })))
        
        const centerPos = getPos(25)
        addCursor({ id: 4, name: CURSOR_META[4]!.name, color: CURSOR_META[4]!.color, x: centerPos.x + 150, y: centerPos.y - 80, action: 'dancing', phase: 'dancing' })
        addCursor({ id: 5, name: CURSOR_META[5]!.name, color: CURSOR_META[5]!.color, x: centerPos.x - 150, y: centerPos.y + 80, action: 'dancing', phase: 'dancing' })
      }))

      after(4000, guard(() => {
        const territories: Record<number, { dx: number; dy: number; range: number; interval: number }> = {
          1: { dx: -220, dy: -60,  range: 80,  interval: 2200 },
          2: { dx: 220,  dy: -40,  range: 90,  interval: 2800 },
          3: { dx: -200, dy: 80,   range: 70,  interval: 1900 },
          4: { dx: 200,  dy: 100,  range: 100, interval: 3200 },
          5: { dx: 0,    dy: -120, range: 85,  interval: 2500 },
        }

        const basePos = getPos(25)
        const allCursorIds = [1, 2, 3, 4, 5]
        allCursorIds.forEach((cursorId) => {
          const t = territories[cursorId]
          const homeX = basePos.x + t.dx
          const homeY = basePos.y + t.dy
          
          moveCursor(cursorId, homeX, homeY)

          const intervalId = setInterval(() => {
            if (dead) return
            const offsetX = homeX + (Math.random() - 0.5) * t.range
            const offsetY = homeY + (Math.random() - 0.5) * (t.range * 0.6)
            moveCursor(cursorId, offsetX, offsetY)
          }, t.interval)
          
          intervalIds.current.push(intervalId)
        })
      }))
    }

    const boot = setTimeout(() => seq(), 400)
    tidRef.current.push(boot)

    return () => {
      dead = true
      tidRef.current.forEach(clearTimeout)
      if (hoverRef.current) clearInterval(hoverRef.current)
      intervalIds.current.forEach(clearInterval)
    }
  }, [after, getPos])

  let globalIdx = 0

  return (
    <>
      <style>{`
        @keyframes caretBlink {
          0%, 100% { opacity: 1; }
          50%      { opacity: 0; }
        }
        @keyframes charFadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
      `}</style>

      <div ref={containerRef} className="relative select-none mb-6">
        {LINES.map((line, lineIdx) => {
          const lineStart = globalIdx
          globalIdx += line.length

          return (
            <div
              key={lineIdx}
              className="block text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-gray-900 leading-[1.05] font-[family-name:var(--font-inter)]"
            >
              {line.split('').map((char, localIdx) => {
                const idx  = lineStart + localIdx
                const fix  = FIX_MAP.get(idx)
                const isDone = fixed.has(idx)

                let displayChar = char
                const style: React.CSSProperties = {}

                if (fix?.type === 'insert' && !isDone) {
                  style.opacity = 0
                } else if (fix?.type === 'replace' && !isDone) {
                  displayChar = fix.wrongChar ?? char
                  style.color = '#ef4444'
                  style.textDecoration = 'underline wavy #ef4444'
                  style.textUnderlineOffset = '4px'
                }

                if (isDone) {
                  style.animation = 'charFadeIn 0.15s ease-out both'
                }

                return (
                  <span
                    key={idx}
                    ref={(el) => { charRefs.current[idx] = el }}
                    className="relative inline-block transition-colors duration-200"
                    style={style}
                  >
                    {displayChar === ' ' ? '\u00A0' : displayChar}
                  </span>
                )
              })}
            </div>
          )
        })}

        {Array.from(carets.entries()).map(([idx, color]) => {
          const { x, y, h } = getPos(idx)
          return (
            <div
              key={`caret-${idx}`}
              className="absolute pointer-events-none z-20 rounded-full"
              style={{
                left: x,
                top: y,
                width: 3,
                height: h,
                backgroundColor: color,
                animation: 'caretBlink 0.65s step-end infinite',
              }}
            />
          )
        })}

        {cursors.map((cursor) => (
          <div
            key={cursor.id}
            className="absolute pointer-events-none z-10"
            style={{
              left: cursor.x,
              top: cursor.y,
              transition:
                'left 0.85s cubic-bezier(0.25,0.46,0.45,0.94), ' +
                'top 0.85s cubic-bezier(0.25,0.46,0.45,0.94)',
            }}
          >
            <svg
              width="30"
              height="36"
              viewBox="0 0 30 36"
              fill="none"
              style={{
                filter: 'drop-shadow(0 3px 8px rgba(0,0,0,0.22))',
                transform: 'translate(-5px, -3px)',
              }}
            >
              <path
                d="M5 3L5 29L12 22L16 32L19.5 30.5L15.5 21H24.5L5 3Z"
                fill={cursor.color}
                stroke="white"
                strokeWidth="2"
                strokeLinejoin="round"
              />
            </svg>

            <div
              className="absolute top-7 left-5 px-2.5 py-1 rounded-md text-sm font-semibold text-white whitespace-nowrap shadow-lg"
              style={{ backgroundColor: cursor.color }}
            >
              {cursor.name}
              {cursor.phase === 'acting' && cursor.action === 'typing' && (
                <span className="ml-1 opacity-75">typing...</span>
              )}
              {cursor.phase === 'dancing' && (
                <span className="ml-1 opacity-75">editing...</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </>
  )
}