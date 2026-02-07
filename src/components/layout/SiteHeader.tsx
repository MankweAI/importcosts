import Link from "next/link";
import { Calculator } from "lucide-react";
import { SignInButton, SignUpButton, SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";

export function SiteHeader() {
    return (
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container flex h-14 max-w-screen-2xl items-center justify-between">
                <div className="flex items-center gap-6">
                    <Link href="/" className="flex items-center gap-2 font-bold">
                        <Calculator className="h-5 w-5 text-primary" />
                        ImportCosts
                    </Link>
                    <nav className="hidden md:flex items-center gap-4 text-sm">
                        <Link href="/calculator" className="text-muted-foreground hover:text-foreground transition-colors">
                            Calculator
                        </Link>
                        <SignedIn>
                            <Link href="/" className="text-muted-foreground hover:text-foreground transition-colors font-medium">
                                Workspace
                            </Link>
                        </SignedIn>
                    </nav>
                </div>

                <div className="flex items-center gap-2">
                    <SignedOut>
                        <SignInButton mode="modal">
                            <Button variant="ghost" size="sm">Sign In</Button>
                        </SignInButton>
                        <SignUpButton mode="modal">
                            <Button size="sm">Get Started</Button>
                        </SignUpButton>
                    </SignedOut>
                    <SignedIn>
                        <Button asChild variant="outline" size="sm" className="mr-2">
                            <Link href="/">My Workspace</Link>
                        </Button>
                        <UserButton afterSignOutUrl="/" />
                    </SignedIn>
                </div>
            </div>
        </header>
    );
}
