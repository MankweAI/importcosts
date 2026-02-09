"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";

interface SignInModalProps {
    isOpen: boolean;
    onClose: () => void;
    reason: 'save' | 'export' | 'compare' | 'watchlist';
    onSignIn: () => void; // Redirect to auth
}

const REASON_CONTENT = {
    save: {
        title: "Save your calculation",
        desc: "Create a free account to save this scenario and return to it later."
    },
    export: {
        title: "Export your results",
        desc: "Create a free account to download a formal PDF or CSV breakdown."
    },
    compare: {
        title: "Compare scenarios",
        desc: "Create a free account to compare imports from different countries side-by-side."
    },
    watchlist: {
        title: "Watch tariff changes",
        desc: "Get notified when duties or VAT rules change for this product."
    }
}

export function SignInModal({ isOpen, onClose, reason, onSignIn }: SignInModalProps) {
    const content = REASON_CONTENT[reason];

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>{content.title}</DialogTitle>
                    <DialogDescription>
                        {content.desc}
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    <div className="flex items-start gap-3">
                        <div className="mt-1 bg-green-100 p-1 rounded-full dark:bg-green-900/30">
                            <Check className="h-3 w-3 text-green-600 dark:text-green-400" />
                        </div>
                        <p className="text-sm">Save unlimited calculations</p>
                    </div>
                    <div className="flex items-start gap-3">
                        <div className="mt-1 bg-green-100 p-1 rounded-full dark:bg-green-900/30">
                            <Check className="h-3 w-3 text-green-600 dark:text-green-400" />
                        </div>
                        <p className="text-sm">Export professional PDF reports</p>
                    </div>
                    <div className="flex items-start gap-3">
                        <div className="mt-1 bg-green-100 p-1 rounded-full dark:bg-green-900/30">
                            <Check className="h-3 w-3 text-green-600 dark:text-green-400" />
                        </div>
                        <p className="text-sm">Track HS code changes</p>
                    </div>
                </div>

                <DialogFooter className="flex-col sm:justify-between gap-2">
                    <Button onClick={onSignIn} className="w-full">Sign In / Register</Button>
                    <Button variant="ghost" onClick={onClose} className="w-full">Not now</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
