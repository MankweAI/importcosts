/**
 * LinkBlock.tsx
 *
 * Reusable component for displaying a group of contextual internal links.
 */

import Link from "next/link";
import { ChevronRight } from "lucide-react";

export interface LinkBlockProps {
    title: string;
    icon: React.ReactNode;
    links: { label: string; href: string; description?: string }[];
    emptyText: string;
}

export function LinkBlock({ title, icon, links, emptyText }: LinkBlockProps) {
    if (links.length === 0) return null;

    return (
        <div className="space-y-3">
            <h3 className="text-sm font-semibold text-neutral-700 dark:text-neutral-300 flex items-center gap-2">
                {icon}
                {title}
            </h3>
            <ul className="space-y-2">
                {links.map((link, i) => (
                    <li key={i}>
                        <Link
                            href={link.href}
                            className="group block rounded-lg border border-neutral-150 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-3 hover:border-blue-300 dark:hover:border-blue-700 hover:shadow-sm transition-all"
                        >
                            <span className="text-sm font-medium text-blue-700 dark:text-blue-400 group-hover:underline flex items-center justify-between">
                                {link.label}
                                <ChevronRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity text-blue-400" />
                            </span>
                            {link.description && (
                                <span className="block text-xs text-neutral-500 dark:text-neutral-500 mt-0.5 line-clamp-1">
                                    {link.description}
                                </span>
                            )}
                        </Link>
                    </li>
                ))}
            </ul>
        </div>
    );
}
