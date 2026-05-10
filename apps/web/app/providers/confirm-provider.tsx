'use client'

import {
 createContext,
 useContext,
 useRef,
 useState,
 useCallback,
 ReactNode,
} from 'react'
import {
 AlertDialog,
 AlertDialogAction,
 AlertDialogCancel,
 AlertDialogContent,
 AlertDialogDescription,
 AlertDialogFooter,
 AlertDialogHeader,
 AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { buttonVariants } from '@/components/ui/button'

type Variant = 'default' | 'destructive'

interface ConfirmOptions {
 title?: string
 description?: string
 confirmLabel?: string
 cancelLabel?: string
 variant?: Variant
}

type ConfirmFn = (options?: ConfirmOptions) => Promise<boolean>

const ConfirmContext = createContext<ConfirmFn | null>(null)

export function ConfirmProvider({ children }: { children: ReactNode }) {
 const [open, setOpen] = useState(false)
 const [options, setOptions] = useState<ConfirmOptions>({})
 const resolverRef = useRef<((value: boolean) => void) | null>(null)

 const confirm = useCallback((opts: ConfirmOptions = {}): Promise<boolean> => {
  setOptions(opts)
  setOpen(true)
  return new Promise<boolean>((resolve) => {
   resolverRef.current = resolve
  })
 }, [])

 const handleConfirm = () => {
  setOpen(false)
  resolverRef.current?.(true)
 }

 const handleCancel = () => {
  setOpen(false)
  resolverRef.current?.(false)
 }

 return (
  <ConfirmContext.Provider value={confirm}>
   {children}
   <AlertDialog open={open} onOpenChange={(v) => !v && handleCancel()}>
    <AlertDialogContent>
     <AlertDialogHeader>
      <AlertDialogTitle>{options.title ?? 'Are you sure?'}</AlertDialogTitle>
      {options.description && (
       <AlertDialogDescription>{options.description}</AlertDialogDescription>
      )}
     </AlertDialogHeader>
     <AlertDialogFooter>
      <AlertDialogCancel onClick={handleCancel}>
       {options.cancelLabel ?? 'Cancel'}
      </AlertDialogCancel>
      <AlertDialogAction
       onClick={handleConfirm}
       className={buttonVariants({
        variant: options.variant ?? 'default',
       })}
      >
       {options.confirmLabel ?? 'Continue'}
      </AlertDialogAction>
     </AlertDialogFooter>
    </AlertDialogContent>
   </AlertDialog>
  </ConfirmContext.Provider>
 )
}

export function useConfirm(): ConfirmFn {
  const ctx = useContext(ConfirmContext)
  if (!ctx) throw new Error('useConfirm must be used within a <ConfirmProvider>')
  return ctx
}
