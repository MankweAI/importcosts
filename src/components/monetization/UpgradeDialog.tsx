"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Check, Lock } from "lucide-react";
import Link from "next/link";

interface UpgradeDialogProps {
    isOpen: boolean;
    onClose: () => void;
    featureName: string; // e.g., "Unlimited Saves"
}

export function UpgradeDialog({ isOpen, onClose, featureName }: UpgradeDialogProps) {
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <div className="mx-auto bg-primary/10 p-3 rounded-full w-fit mb-4">
                        <Lock className="h-6 w-6 text-primary" />
                    </div>
                    <DialogTitle className="text-center text-xl">Upgrade to Unlock</DialogTitle>
                    <DialogDescription className="text-center">
                        You've reached the limit for {featureName}. Upgrade to the SME plan to remove limits and get more features.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                            <Check className="h-4 w-4 text-green-600" />
                        </div>
                        <div className="text-sm">
                            <span className="font-medium block">Unlimited Calculations</span>
                            <span className="text-muted-foreground">Never delete a saved route again.</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                            <Check className="h-4 w-4 text-green-600" />
                        </div>
                        <div className="text-sm">
                            <span className="font-medium block">Official PDF Reports</span>
                            <span className="text-muted-foreground">Download professional cost breakdowns.</span>
                        </div>
                    </div>
                </div>

                <DialogFooter className="flex-col sm:flex-col gap-2">
                    <Button className="w-full" asChild>
                        <Link href="/workspace/billing">View Plans & Pricing</Link>
                    </Button>
                    <Button variant="ghost" className="w-full" onClick={onClose}>
                        Maybe Later
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
