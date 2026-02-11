"use client";

import { Button } from "@/components/ui/button";
import { Share2, FileDown, Check, Loader2 } from "lucide-react";
import { usePSEOCalculatorStore } from "@/store/usePSEOCalculatorStore";
import { useState, useEffect, useCallback } from "react";

export function DealActions() {
    const { status, inputs, result } = usePSEOCalculatorStore();
    const [copied, setCopied] = useState(false);
    const [isClient, setIsClient] = useState(false);
    const [pdfGenerating, setPdfGenerating] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);

    if (status !== 'success' || !result) return null;

    const handleShare = () => {
        const params = new URLSearchParams();
        if (inputs.invoiceValue) params.set("val", inputs.invoiceValue.toString());
        if (inputs.hsCode) params.set("hs", inputs.hsCode);
        if (inputs.quantity && inputs.quantity !== 1) params.set("qty", inputs.quantity.toString());
        if (inputs.currency && inputs.currency !== "USD") params.set("cur", inputs.currency);
        if (inputs.exchangeRate) params.set("fx", inputs.exchangeRate.toString());
        if (inputs.freightCost) params.set("frt", inputs.freightCost.toString());
        if (inputs.insuranceCost) params.set("ins", inputs.insuranceCost.toString());
        if (inputs.incoterm && inputs.incoterm !== "FOB") params.set("inc", inputs.incoterm);
        if (inputs.importerType && inputs.importerType !== "VAT_REGISTERED") params.set("imp", inputs.importerType);
        if (inputs.targetSellingPrice) params.set("tsp", inputs.targetSellingPrice.toString());
        if (inputs.targetMarginPercent) params.set("tmg", inputs.targetMarginPercent.toString());

        const url = `${window.location.origin}${window.location.pathname}?${params.toString()}`;
        navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleDownloadPdf = useCallback(async () => {
        if (pdfGenerating) return;
        setPdfGenerating(true);
        try {
            const [{ pdf }, { ProjectBriefDocument }] = await Promise.all([
                import("@react-pdf/renderer"),
                import("./ProjectBriefPdf"),
            ]);
            const blob = await pdf(
                // @ts-ignore - JSX element type
                <ProjectBriefDocument inputs={inputs} result={result} />
            ).toBlob();
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `import-brief-${inputs.hsCode || "estimate"}.pdf`;
            a.click();
            URL.revokeObjectURL(url);
        } catch (err) {
            console.error("PDF generation failed:", err);
        } finally {
            setPdfGenerating(false);
        }
    }, [inputs, result, pdfGenerating]);

    return (
        <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleShare} className="rounded-lg gap-1.5 text-xs">
                {copied ? <Check className="h-3.5 w-3.5" /> : <Share2 className="h-3.5 w-3.5" />}
                {copied ? "Copied!" : "Share"}
            </Button>

            {isClient && (
                <Button
                    variant="outline"
                    size="sm"
                    onClick={handleDownloadPdf}
                    disabled={pdfGenerating}
                    className="rounded-lg gap-1.5 text-xs"
                >
                    {pdfGenerating ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <FileDown className="h-3.5 w-3.5" />}
                    {pdfGenerating ? "Generating..." : "Brief"}
                </Button>
            )}
        </div>
    );
}
