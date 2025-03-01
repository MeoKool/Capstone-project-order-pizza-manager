import { Search } from "lucide-react"
import { Input } from "./input"

interface SearchBarProps {
    placeholder: string
    value: string
    onChange: (value: string) => void
}

export function SearchBar({ placeholder, value, onChange }: SearchBarProps) {
    return (
        <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
                type="search"
                placeholder={placeholder}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="pl-8 w-full"
            />
        </div>
    )
}

