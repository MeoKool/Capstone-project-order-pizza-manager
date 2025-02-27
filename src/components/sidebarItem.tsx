import type React from "react"
import { useSidebar } from "./context/SidebarContext"

interface SidebarItemProps {
    icon: React.ReactNode
    text: string
    active?: boolean
    alert?: boolean
}

export function SidebarItem({ icon, text, active = false, alert = false }: SidebarItemProps) {
    const { expanded } = useSidebar()
    return (
        <li
            className={`
                relative flex items-center py-3 h-14 
                font-medium rounded-md cursor-pointer
                transition-colors group
                ${active
                    ? "bg-green-200 text-green-800"
                    : expanded ? "hover:bg-gray-200 text-gray-500" : "text-gray-500 hover:bg-gray-200"
                }
                ${expanded ? 'px-6 justify-start' : 'px-2 justify-center'}
            `}
        >
            <span className={`${active ? 'text-green-800' : 'text-gray-500'} ${expanded ? '' : 'text-xl'}`}>
                {icon}
            </span>
            {expanded && (
                <span className={`ml-3 truncate ${active ? 'text-green-800' : 'text-gray-500'}`}>
                    {text}
                </span>
            )}
            {alert && <div className={`absolute right-2 w-2 h-2 rounded bg-green-400 ${expanded ? "" : "top-2"}`} />}
            {/*  */}
            {!expanded && (
                <div
                    className={`
                        fixed left-12 rounded-md px-2 py-4 ml-6
                        bg-green-100 text-green-800 text-base
                        invisible opacity-20 -translate-x-3 transition-all
                        group-hover:visible group-hover:opacity-100 group-hover:translate-x-0
                        whitespace-nowrap z-50 
                        flex
                    `}
                >
                    <span>{icon}</span> <span className="ml-2">{text}</span>
                </div>
            )}
        </li>
    )
}