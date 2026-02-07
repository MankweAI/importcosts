"use client";

import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const tiers = [
    {
        name: "Free",
        price: "R0",
        period: "/month",
        description: "For individuals exploring import costs.",
        features: [
            "3 Saved Calculations",
            "Basic Duty Estimates",
            "Personal Workspace",
            "Standard Support",
        ],
        cta: "Current Plan",
        current: true,
    },
    {
        name: "SME",
        price: "R450",
        period: "/month",
        description: "For small businesses importing regularly.",
        features: [
            "Unlimited Saved Calculations",
            "Export Official PDF Reports",
            "HS Code Watchlist (5 items)",
            "Priority Support",
        ],
        cta: "Upgrade to SME",
        popular: true,
    },
    {
        name: "Pro",
        price: "R1,200",
        period: "/month",
        description: "For teams and serious importers.",
        features: [
            "Everything in SME",
            "Team/Organization Support",
            "Unlimited Watchlist",
            "API Access",
        ],
        cta: "Contact Sales",
    },
];

export function PricingPage() {
    return (
        <div className="py-24 px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
                <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                    Simple, transparent pricing
                </h2>
                <p className="mt-4 text-lg text-muted-foreground">
                    Choose the plan that fits your import volume.
                </p>
            </div>

            <div className="grid grid-cols-1 gap-8 lg:grid-cols-3 max-w-7xl mx-auto">
                {tiers.map((tier) => (
                    <Card
                        key={tier.name}
                        className={cn("flex flex-col", tier.popular && "border-primary shadow-lg scale-105")}
                    >
                        <CardHeader>
                            {tier.popular && (
                                <div className="text-primary text-sm font-semibold mb-2">MOST POPULAR</div>
                            )}
                            <CardTitle className="text-2xl">{tier.name}</CardTitle>
                            <CardDescription>{tier.description}</CardDescription>
                        </CardHeader>
                        <CardContent className="flex-1">
                            <div className="mb-6">
                                <span className="text-4xl font-bold">{tier.price}</span>
                                <span className="text-muted-foreground">{tier.period}</span>
                            </div>
                            <ul className="space-y-3">
                                {tier.features.map((feature) => (
                                    <li key={feature} className="flex items-center text-sm text-muted-foreground">
                                        <Check className="h-4 w-4 text-primary mr-2 flex-shrink-0" />
                                        {feature}
                                    </li>
                                ))}
                            </ul>
                        </CardContent>
                        <CardFooter>
                            <Button
                                className="w-full"
                                variant={tier.current ? "outline" : tier.popular ? "default" : "secondary"}
                                disabled={tier.current}
                            >
                                {tier.cta}
                            </Button>
                        </CardFooter>
                    </Card>
                ))}
            </div>
        </div>
    );
}
