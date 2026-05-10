'use client'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import React, {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
} from 'react'

interface PromptOptions {
  label?: string
  description?: string
  defaultValue?: string
  placeholder?: string
  confirmLabel?: string
  cancelLabel?: string
}

type PromptFn = (options?: PromptOptions) => Promise<string | null>

const PromptContext = createContext<PromptFn | null>(null)

export function PromptProvider({ children }: { children: React.ReactNode }) {
  const resolverRef = useRef<((value: string | null) => void) | null>(null)
  const [options, setOptions] = useState<PromptOptions | null>(null)
  const [value, setValue] = useState('')
  const [open, setOpen] = useState(false)

  const prompt = useCallback((opts: PromptOptions = {}): Promise<string | null> => {
    setOptions(opts)
    setValue(opts.defaultValue ?? '')
    setOpen(true)
    return new Promise<string | null>((resolve) => {
      resolverRef.current = resolve
    })
  }, [])

  const handleConfirm = () => {
    setOpen(false)
    resolverRef.current?.(value)
  }

  const handleCancel = () => {
    setOpen(false)
    resolverRef.current?.(null)
  }

  return (
    <PromptContext.Provider value={prompt}>
      {children}
      <Dialog open={open} onOpenChange={(v) => !v && handleCancel()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{options?.label ?? 'Enter a value'}</DialogTitle>
            {options?.description && (
              <DialogDescription>{options.description}</DialogDescription>
            )}
          </DialogHeader>

          <Input
            autoFocus
            value={value}
            placeholder={options?.placeholder ?? ''}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleConfirm()
              if (e.key === 'Escape') handleCancel()
            }}
          />

          <DialogFooter>
            <Button variant="outline" onClick={handleCancel}>
              {options?.cancelLabel ?? 'Cancel'}
            </Button>
            <Button onClick={handleConfirm}>
              {options?.confirmLabel ?? 'OK'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PromptContext.Provider>
  )
}

export function usePrompt(): PromptFn {
  const ctx = useContext(PromptContext)
  if (!ctx) throw new Error('usePrompt must be used within a <PromptProvider>')
  return ctx
}