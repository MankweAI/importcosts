"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { LayoutDashboard, Route, Bell, Settings, Calculator } from "lucide-react";

const navItems = [
    { href: "/", label: "Overview", icon: LayoutDashboard },
    { href: "/workspace/routes", label: "Import Routes", icon: Route },
    { href: "/workspace/watchlist", label: "Watchlist", icon: Bell },
    { href: "/workspace/settings", label: "Settings", icon: Settings },
];

export function WorkspaceSidebar() {
    const pathname = usePathname();

    return (
        <aside className="w-64 border-r bg-muted/30 flex flex-col">
            <div className="p-4 border-b">
                <Link href="/" className="flex items-center gap-2 font-bold text-lg">
                    <Calculator className="h-5 w-5 text-primary" />
                    ImportCosts
                </Link>
            </div>
            <nav className="flex-1 p-4 space-y-1">
                {navItems.map((item) => {
                    const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                                isActive
                                    ? "bg-primary text-primary-foreground"
                                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                            )}
                        >
                            <item.icon className="h-4 w-4" />
                            {item.label}
                        </Link>
                    );
                })}
            </nav>
            <div className="p-4 border-t text-xs text-muted-foreground">
                © 2026 ImportCosts
            </div>
        </aside>
    );
}
