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
                
                relative flex justify-center items-center py-3  h-14 
                font-medium rounded-md cursor-pointer
                transition-colors group
                ${active
                    ? "bg-green-200 text-green-800"
                    : "hover:bg-gray-100 text-gray-500"
                }
                    ${expanded ? `px-6` : `px-2`}
    
            `}
        >
            <span className={`${active ? 'text-green-800' : 'text-gray-500'} ${expanded ? '' : 'px-4'}`}>
                {icon}
            </span>
            <span className={`overflow-hidden transition-all ${expanded ? "w-52 ml-3" : "w-0"} ${active ? 'text-green-800' : 'text-gray-500'}`}>
                {text}
            </span>
            {alert && <div className={`absolute right-2 w-2 h-2 rounded bg-green-50 ${expanded ? "" : "top-2"}`} />}

            {!expanded && (
                <div
                    className={`
            absolute left-full rounded-md px-4 py-2 ml-6
            bg-green-100 text-green-800 text-sm
            invisible opacity-20 -translate-x-3 transition-all
            group-hover:visible group-hover:opacity-100 group-hover:translate-x-0
            whitespace-nowrap overflow-hidden text-ellipsis
        `}
                    style={{ maxWidth: '200px' }} // Adjust this value as needed
                >
                    {text}
                </div>
            )}
        </li>
    )
}