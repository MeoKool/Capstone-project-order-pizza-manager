"use client"

import { createContext, useState, useContext, type ReactNode } from "react"

interface SidebarContextType {
    expanded: boolean
    toggleSidebar: () => void
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined)

export function SidebarProvider({ children }: { children: ReactNode }) {
    const [expanded, setExpanded] = useState(true)

    const toggleSidebar = () => {
        setExpanded((curr) => !curr)
    }

    return <SidebarContext.Provider value={{ expanded, toggleSidebar }}>{children}</SidebarContext.Provider>
}

export function useSidebar() {
    const context = useContext(SidebarContext)
    if (context === undefined) {
        throw new Error("useSidebar must be used within a SidebarProvider")
    }
    return context
}

