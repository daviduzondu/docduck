import { useState } from 'react'
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

type AlertProperties = {
 title: string
 description: string
 onContinue: () => void
}

export function useAlert({ ...payload }: AlertProperties) {
 const [showAlert, setShowAlert] = useState<boolean>(false)
 const comp = () => <Dialog {...payload} open={showAlert} />

 return { setShowAlert, showAlert, comp }
}

function Dialog({ ...payload }: AlertProperties & { open: boolean }) {
 if (!open) return null
 return (
  <AlertDialog>
   <AlertDialogContent>
    <AlertDialogHeader>
     <AlertDialogTitle>{payload.title}</AlertDialogTitle>
     <AlertDialogDescription>
      This action cannot be undone. This will permanently delete your account
      from our servers.
     </AlertDialogDescription>
    </AlertDialogHeader>
    <AlertDialogFooter>
     <AlertDialogCancel>Cancel</AlertDialogCancel>
     <AlertDialogAction>Continue</AlertDialogAction>
    </AlertDialogFooter>
   </AlertDialogContent>
  </AlertDialog>
 )
}
