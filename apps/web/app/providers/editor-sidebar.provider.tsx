'use client'
import { Dispatch, SetStateAction, useContext, useState } from "react";
import { createContext } from "react";

export type View = 'comments' | 'history' | 'search' | undefined;
type ViewContextType = {
 view: View
 setView: Dispatch<SetStateAction<View>>
}

const ViewContext = createContext<ViewContextType | undefined>(undefined);

export function EditorSidebarProvider({ children }: { children: React.ReactNode }) {
 const [view, setView] = useState<View>(undefined);
 
 return <ViewContext.Provider value={{ view, setView }}>
  {children}
 </ViewContext.Provider>
}

export function useEditorSidebarView(){
 const context = useContext(ViewContext);
 if (!context) throw new Error("useEditorSidebarView must be used within EditorSidebarProvider");
 return context;
}