"use client"

import * as React from "react"
import { Check, ChevronsUpDown, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"

interface HsResult {
    hs6: string;
    title: string;
    label: string;
    confidence: number;
}

interface HsHelperProps {
    value?: string;
    onSelect: (hsCode: string) => void;
    className?: string;
}

export function HsHelper({ value, onSelect, className }: HsHelperProps) {
    const [open, setOpen] = React.useState(false)
    const [query, setQuery] = React.useState("")
    const [results, setResults] = React.useState<HsResult[]>([])
    const [loading, setLoading] = React.useState(false)

    const [mounted, setMounted] = React.useState(false)

    // Debounce Search
    React.useEffect(() => {
        setMounted(true) // Hydration Fix
        const timer = setTimeout(() => {
            if (query.length >= 2) {
                fetchResults(query);
            }
        }, 300);
        return () => clearTimeout(timer);
    }, [query]);

    // Hydration Fallback (renders static button first)
    if (!mounted) {
        return (
            <Button
                variant="outline"
                role="combobox"
                className={cn("w-full justify-between font-normal", !value && "text-muted-foreground", className)}
            >
                {value ? value : "Search product or HS code..."}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
        )
    }

    const fetchResults = async (q: string) => {
        setLoading(true);
        try {
            const res = await fetch(`/api/hs/suggest?q=${encodeURIComponent(q)}`);
            if (res.ok) {
                const data = await res.json();
                setResults(data.results || []);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    }

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className={cn("w-full justify-between font-normal", !value && "text-muted-foreground", className)}
                >
                    {value ? value : "Search product or HS code..."}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[300px] p-0" align="start">
                <Command shouldFilter={false}>
                    <CommandInput
                        placeholder="Type 'solar' or '8541'..."
                        value={query}
                        onValueChange={setQuery}
                    />
                    <CommandList>
                        {loading && (
                            <div className="py-6 text-center text-sm text-muted-foreground flex justify-center">
                                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            </div>
                        )}

                        {!loading && results.length === 0 && query.length >= 2 && (
                            <CommandEmpty>No HS code found.</CommandEmpty>
                        )}

                        {!loading && results.length > 0 && (
                            <CommandGroup heading="Suggestions">
                                {results.map((item) => (
                                    <CommandItem
                                        key={item.hs6}
                                        value={item.hs6}
                                        onSelect={(currentValue) => {
                                            onSelect(item.hs6);
                                            setOpen(false);
                                            setQuery(""); // Reset query? Or keep?
                                        }}
                                    >
                                        <Check
                                            className={cn(
                                                "mr-2 h-4 w-4",
                                                value === item.hs6 ? "opacity-100" : "opacity-0"
                                            )}
                                        />
                                        <div className="flex flex-col">
                                            <span className="font-semibold flex items-center gap-2">
                                                {item.hs6}
                                                <span className={cn(
                                                    "text-[10px] px-1.5 py-0.5 rounded-full border",
                                                    item.confidence > 0.9 ? "bg-green-100 text-green-700 border-green-200" :
                                                        item.confidence > 0.7 ? "bg-blue-100 text-blue-700 border-blue-200" :
                                                            "bg-amber-100 text-amber-700 border-amber-200"
                                                )}>
                                                    {item.confidence > 0.9 ? "High" : item.confidence > 0.7 ? "Med" : "Low"}
                                                </span>
                                            </span>
                                            <span className="text-xs text-muted-foreground truncate max-w-[220px]">
                                                {item.title}
                                            </span>
                                        </div>
                                    </CommandItem>
                                ))}
                            </CommandGroup>
                        )}
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    )
}
