import { auth } from "@clerk/nextjs/server";
import { getUserOrgs } from "@/lib/db/services/org.service";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Building2, Plus, Users } from "lucide-react";
import { createOrganizationAction } from "@/app/actions/org.actions";

export default async function OrganizationSettingsPage() {
    const { userId } = await auth();
    if (!userId) return null;

    const orgs = await getUserOrgs(userId);

    return (
        <div className="space-y-8 max-w-4xl mx-auto">
            <div>
                <h2 className="text-2xl font-bold tracking-tight">Organization Settings</h2>
                <p className="text-muted-foreground">Manage your teams and memberships.</p>
            </div>

            {/* Create Org */}
            <Card>
                <CardHeader>
                    <CardTitle>Create New Organization</CardTitle>
                    <CardDescription>
                        Create a team to share calculations and manage billing together.
                        <br />
                        <span className="text-xs text-primary font-medium">Available on PRO plan.</span>
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {/* @ts-ignore: Server Action type compatibility */}
                    <form action={createOrganizationAction} className="flex gap-4 items-end">
                        <div className="grid w-full max-w-sm items-center gap-1.5">
                            <Input
                                name="name"
                                placeholder="Acme Imports Pty Ltd"
                                required
                                minLength={3}
                            />
                        </div>
                        <Button type="submit">
                            <Plus className="h-4 w-4 mr-2" />
                            Create Organization
                        </Button>
                    </form>
                </CardContent>
            </Card>

            {/* Your Orgs */}
            <Card>
                <CardHeader>
                    <CardTitle>Your Organizations</CardTitle>
                    <CardDescription>Teams you are a member of.</CardDescription>
                </CardHeader>
                <CardContent>
                    {orgs.length === 0 ? (
                        <div className="text-center py-6 text-muted-foreground border-2 border-dashed rounded-lg">
                            <Building2 className="mx-auto h-8 w-8 mb-2 opacity-50" />
                            <p>You haven't joined any organizations yet.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {orgs.map((org) => {
                                const role = org.memberships.find(m => m.userId === userId)?.role;
                                const sub = org.subscriptions[0];
                                return (
                                    <div key={org.id} className="flex items-center justify-between p-4 border rounded-lg bg-card hover:bg-accent/50 transition-colors">
                                        <div className="flex items-center gap-4">
                                            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                                                <Building2 className="h-5 w-5 text-primary" />
                                            </div>
                                            <div>
                                                <p className="font-medium">{org.name}</p>
                                                <div className="flex gap-2 mt-1">
                                                    <Badge variant="secondary" className="text-xs">{role}</Badge>
                                                    <Badge variant={sub?.tier === 'FREE' ? 'outline' : 'default'} className="text-xs">
                                                        {sub?.tier || "FREE"}
                                                    </Badge>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Button variant="outline" size="sm" asChild>
                                                {/* Placeholder for future specific ID page */}
                                                <a href="#">Manage</a>
                                            </Button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
