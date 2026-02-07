"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FileText, Save, Check } from "lucide-react";
import { CalcOutput } from "@/lib/calc/types";
import { ReportPreviewDialog } from "./ReportPreviewDialog";
import { useUser, useClerk } from "@clerk/nextjs";
import { saveCalculation } from "@/app/actions";
import { UpgradeDialog } from "@/components/monetization/UpgradeDialog";

import { useRouter } from "next/navigation"; // Added import

interface ReportCTAProps {
    result: CalcOutput;
}

export function ReportCTA({ result }: ReportCTAProps) {
    const [showPreview, setShowPreview] = useState(false);
    const [showUpgrade, setShowUpgrade] = useState(false);
    const { isSignedIn, user } = useUser();
    const { openSignIn } = useClerk();
    const [isSaving, setIsSaving] = useState(false);
    const [isSaved, setIsSaved] = useState(false);
    const router = useRouter(); // Added router

    // Mock Input for MVP - In production, input should be passed down
    const mockInput = {
        hsCode: "8541.40",
        customsValue: result.landedCostTotal / 1.2, // Rough reverse
        quantity: 1
    };

    const handleSave = async () => {
        // If not signed in, open Clerk modal/page
        // Note: After sign-in, Clerk might redirect to /workspace (global setting), 
        // which means the user might lose the current calc logic.
        // Ideally, we'd capture this state, but for MVP we rely on Clerk default behavior 
        // or user manually saving after login if they stay on page.
        if (!isSignedIn) {
            openSignIn(); // This respects env vars or can accept redirectUrl
            return;
        }

        setIsSaving(true);
        const res = await saveCalculation(mockInput, result);
        setIsSaving(false);

        if (res.success) {
            router.push("/"); // Redirect to dashboard
        } else if (res.error && res.error.toLowerCase().includes("limit")) {
            setShowUpgrade(true);
        } else if (res.error) {
            // Fallback for other errors (e.g. auth or network)
            alert(res.error);
        }
    };

    return (
        <>
            <Card className="bg-primary/5 border-primary/20 overflow-hidden relative">
                <div className="absolute top-0 right-0 p-8 opacity-5">
                    <FileText className="w-32 h-32" />
                </div>

                <div className="p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="space-y-1">
                        <h3 className="font-semibold text-primary flex items-center gap-2">
                            <FileText className="h-5 w-5" />
                            Official Landed Cost Report
                        </h3>
                        <p className="text-sm text-muted-foreground max-w-md">
                            Need a record? {isSignedIn ? `Save this to your workspace, ${user?.firstName}.` : "Sign in to save this calculation and generate a PDF."}
                        </p>
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto">
                        <Button
                            variant="outline"
                            onClick={handleSave}
                            disabled={isSaved || isSaving}
                            className="bg-white text-xs sm:text-sm"
                        >
                            {isSaved ? <Check className="h-4 w-4 mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                            {isSaved ? "Saved" : isSignedIn ? "Save to Workspace" : "Sign In to Save"}
                        </Button>

                        <Button onClick={() => setShowPreview(true)} className="shadow-lg text-xs sm:text-sm">
                            Preview PDF
                        </Button>
                    </div>
                </div>
            </Card>

            <ReportPreviewDialog
                isOpen={showPreview}
                onClose={() => setShowPreview(false)}
                result={result}
                hsCode={mockInput.hsCode}
                originCountry={"Import Origin"}
            />

            <UpgradeDialog
                isOpen={showUpgrade}
                onClose={() => setShowUpgrade(false)}
                featureName="Saved Calculations"
            />
        </>
    );
}
