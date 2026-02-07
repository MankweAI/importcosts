import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Settings as SettingsIcon } from "lucide-react";
import Link from "next/link";

export default function SettingsPage() {
    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold tracking-tight">Settings</h2>
                <p className="text-muted-foreground">Manage your account and preferences.</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Account Settings</CardTitle>
                    <CardDescription>Manage your profile and subscription.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="text-center py-12 text-muted-foreground">
                        <SettingsIcon className="mx-auto h-12 w-12 mb-4 opacity-50" />
                        <p>Settings panel</p>
                        <div className="flex flex-col gap-2 mt-4 max-w-xs mx-auto">
                            <Button asChild variant="outline">
                                <Link href="/workspace/settings/organization">Manage Organizations</Link>
                            </Button>
                            <Button asChild variant="outline">
                                <Link href="/workspace/billing">Billing & Plans</Link>
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
