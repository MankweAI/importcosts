"use client";

import { Button } from "@/components/ui/button";
import { Download, Save, ArrowRightLeft, Bell } from "lucide-react";
import { useState } from "react";
import { SignInModal } from "./SignInModal";

export function StickyActionBar() {
    const [modalOpen, setModalOpen] = useState(false);
    const [reason, setReason] = useState<'save' | 'export' | 'compare' | 'watchlist'>('save');

    const handleAction = (r: 'save' | 'export' | 'compare' | 'watchlist') => {
        setReason(r);
        setModalOpen(true);
    };

    const handleSignIn = () => {
        // Logic to redirect to auth page, passing returnTo URL
        window.location.href = "/sign-in"; // Placeholder
    };

    return (
        <>
            <div className="fixed bottom-0 left-0 right-0 border-t border-neutral-200 bg-white/90 backdrop-blur-md p-4 dark:border-neutral-800 dark:bg-neutral-950/90 z-40">
                <div className="container mx-auto max-w-6xl flex justify-between items-center overflow-x-auto gap-4">
                    <span className="text-sm font-medium hidden md:inline-block">Take action:</span>

                    <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => handleAction('save')}>
                            <Save className="mr-2 h-4 w-4" />
                            Save
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleAction('export')}>
                            <Download className="mr-2 h-4 w-4" />
                            Export
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleAction('compare')}>
                            <ArrowRightLeft className="mr-2 h-4 w-4" />
                            Compare
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleAction('watchlist')}>
                            <Bell className="mr-2 h-4 w-4" />
                            Watch
                        </Button>
                    </div>
                </div>
            </div>

            <SignInModal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                reason={reason}
                onSignIn={handleSignIn}
            />
        </>
    );
}
