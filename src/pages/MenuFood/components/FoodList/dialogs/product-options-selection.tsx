"use client"

import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Check, Info, Loader2, RefreshCw, X } from "lucide-react"

import type { Control } from "react-hook-form"
import type { Option } from "@/types/option"
import { useState } from "react"
import { cn } from "@/utils/utils"

interface ProductOptionsSelectionProps {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    control: Control<any>
    options: Option[]
    selectedOptions: Option[]
    totalCount: number
    isLoadingOptions: boolean
    fetchOptions: () => void
    onSelectOption: (option: Option) => void
    onRemoveOption: (optionId: string) => void
}

// Helper function to check if an option name is duplicated in the list
const isDuplicateName = (options: Option[], name: string) => {
    return options.filter((option) => option.name === name).length > 1
}

export function ProductOptionsSelection({
    control,
    options,
    selectedOptions,
    totalCount,
    isLoadingOptions,
    fetchOptions,
    onSelectOption,
    onRemoveOption,
}: ProductOptionsSelectionProps) {
    const [openOptionSelect, setOpenOptionSelect] = useState(false)

    return (
        <FormField
            control={control}
            name="optionIds"
            render={({ field }) => (
                <FormItem className="flex flex-col">
                    <div className="flex items-center justify-between">
                        <FormLabel>Tùy chọn sản phẩm {totalCount > 0 && `(${totalCount})`}</FormLabel>
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={fetchOptions}
                            disabled={isLoadingOptions}
                            className="h-8 px-2"
                        >
                            <RefreshCw className={cn("h-4 w-4", isLoadingOptions && "animate-spin")} />
                            <span className="sr-only">Làm mới danh sách tùy chọn</span>
                        </Button>
                    </div>

                    <Popover open={openOptionSelect} onOpenChange={setOpenOptionSelect}>
                        <PopoverTrigger asChild>
                            <FormControl>
                                <Button
                                    variant="outline"
                                    role="combobox"
                                    aria-expanded={openOptionSelect}
                                    className={cn("w-full justify-between", !field.value?.length && "text-muted-foreground")}
                                    onClick={() => setOpenOptionSelect(true)}
                                    disabled={isLoadingOptions}
                                >
                                    {isLoadingOptions ? (
                                        <div className="flex items-center">
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Đang tải...
                                        </div>
                                    ) : selectedOptions.length > 0 ? (
                                        `${selectedOptions.length} tùy chọn đã chọn`
                                    ) : (
                                        "Chọn tùy chọn sản phẩm"
                                    )}
                                </Button>
                            </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-full p-0" align="start">
                            <Command>
                                <CommandInput placeholder="Tìm kiếm tùy chọn..." />
                                <CommandList className="max-h-[300px] overflow-y-auto">
                                    <CommandEmpty>Không tìm thấy tùy chọn.</CommandEmpty>
                                    <CommandGroup className="overflow-y-auto">
                                        {options.map((option) => {
                                            const isDuplicate = isDuplicateName(options, option.name)
                                            return (
                                                <CommandItem
                                                    key={option.id}
                                                    value={option.id} // Use ID as value for more reliable matching
                                                    onSelect={() => onSelectOption(option)}
                                                    className="w-full"
                                                >
                                                    <div className="flex items-center justify-between w-full">
                                                        <div className="flex flex-col">
                                                            <div className="flex items-center gap-1">
                                                                <span>{option.name}</span>

                                                            </div>
                                                            {option.description && (
                                                                <span className="text-xs text-muted-foreground">{option.description}</span>
                                                            )}
                                                            {isDuplicate && option.optionItems && option.optionItems.length > 0 && (
                                                                <span className="text-xs text-muted-foreground mt-1">
                                                                    Lựa chọn: {option.optionItems.map((item) => item.name).join(", ")}
                                                                </span>
                                                            )}
                                                        </div>
                                                        <Check
                                                            className={cn(
                                                                "ml-auto h-4 w-4",
                                                                selectedOptions.some((item) => item.id === option.id) ? "opacity-100" : "opacity-0",
                                                            )}
                                                        />
                                                    </div>
                                                </CommandItem>
                                            )
                                        })}
                                    </CommandGroup>
                                </CommandList>
                            </Command>
                        </PopoverContent>
                    </Popover>

                    {/* Display selected options */}
                    {selectedOptions.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-2">
                            {selectedOptions.map((option) => (
                                <Badge key={option.id} variant="secondary" className="flex items-center gap-1">
                                    <span className="flex items-center">
                                        {option.name}
                                        <TooltipProvider>
                                            <Tooltip>
                                                <TooltipTrigger>
                                                    <Info className="h-3 w-3 ml-1 text-muted-foreground cursor-help" />
                                                </TooltipTrigger>
                                                <TooltipContent>

                                                    {option.optionItems && option.optionItems.length > 0 && (
                                                        <p className="mt-1">Lựa chọn: {option.optionItems.map((item) => item.name).join(", ")}</p>
                                                    )}
                                                </TooltipContent>
                                            </Tooltip>
                                        </TooltipProvider>
                                    </span>
                                    <button
                                        type="button"
                                        onClick={() => onRemoveOption(option.id)}
                                        className="rounded-full h-4 w-4 inline-flex items-center justify-center text-muted-foreground hover:text-foreground"
                                    >
                                        <X className="h-3 w-3" />
                                        <span className="sr-only">Remove {option.name}</span>
                                    </button>
                                </Badge>
                            ))}
                        </div>
                    )}

                    {/* Display option details */}
                    {selectedOptions.length > 0 && (
                        <div className="mt-4 space-y-2">
                            {selectedOptions.map((option) => (
                                <div key={option.id} className="border rounded-md p-3">
                                    <div className="font-medium flex items-center gap-2">
                                        {option.name}

                                    </div>
                                    {option.description && <div className="text-sm text-muted-foreground">{option.description}</div>}
                                    {option.optionItems && option.optionItems.length > 0 && (
                                        <div className="mt-2">
                                            <div className="text-sm font-medium">Các lựa chọn:</div>
                                            <div className="grid grid-cols-2 gap-2 mt-1">
                                                {option.optionItems.map((item) => (
                                                    <div key={item.id} className="text-sm flex justify-between">
                                                        <span>{item.name}</span>
                                                        {item.additionalPrice > 0 && (
                                                            <span className="text-muted-foreground">
                                                                +{item.additionalPrice.toLocaleString("vi-VN")}đ
                                                            </span>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}

                    <FormMessage />
                </FormItem>
            )}
        />
    )
}
