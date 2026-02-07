import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/db/prisma";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bell, Plus, Trash2 } from "lucide-react";

async function getWatchItems(userId: string) {
    return prisma.watchItem.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
    });
}

export default async function WatchlistPage() {
    const { userId } = await auth();
    const watchItems = userId ? await getWatchItems(userId) : [];

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Watchlist</h2>
                    <p className="text-muted-foreground">Monitor HS codes and routes for tariff changes.</p>
                </div>
                <Button disabled>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Item (Coming Soon)
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Active Monitors</CardTitle>
                    <CardDescription>
                        Get notified when tariff rates change for your watched items.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {watchItems.length === 0 ? (
                        <div className="text-center py-12 text-muted-foreground">
                            <Bell className="mx-auto h-12 w-12 mb-4 opacity-50" />
                            <p>Your watchlist is empty.</p>
                            <p className="text-sm mt-2">
                                After running a calculation, click "Watch this Route" to monitor it.
                            </p>
                        </div>
                    ) : (
                        <ul className="divide-y">
                            {watchItems.map((item) => (
                                <li key={item.id} className="py-4 flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <Badge variant="secondary">{item.type}</Badge>
                                        <div>
                                            <p className="font-medium">{item.ref}</p>
                                            <p className="text-sm text-muted-foreground">
                                                Added {new Date(item.createdAt).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>
                                    <Button variant="ghost" size="icon" className="text-destructive">
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </li>
                            ))}
                        </ul>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
