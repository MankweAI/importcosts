import { getCalcRunsForUser } from "@/lib/db/services/calcRun.service";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Calculator, Route, Bell, ArrowRight } from "lucide-react";

export async function DashboardOverview({ userId }: { userId: string }) {
    const recentCalcs = userId ? await getCalcRunsForUser(userId, 5) : [];

    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-2xl font-bold tracking-tight">Welcome back</h2>
                <p className="text-muted-foreground">Here's what's happening with your imports.</p>
            </div>

            {/* Stats Grid */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Saved Routes</CardTitle>
                        <Route className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{recentCalcs.length}</div>
                        <p className="text-xs text-muted-foreground">Total calculated imports</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Watchlist Items</CardTitle>
                        <Bell className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">0</div>
                        <p className="text-xs text-muted-foreground">Active monitors</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Quick Actions</CardTitle>
                        <Calculator className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <Button asChild size="sm" className="w-full">
                            <Link href="/calculator">
                                New Calculation
                                <ArrowRight className="ml-2 h-4 w-4" />
                            </Link>
                        </Button>
                    </CardContent>
                </Card>
            </div>

            {/* Recent Activity */}
            <Card>
                <CardHeader>
                    <CardTitle>Recent Import Calculations</CardTitle>
                </CardHeader>
                <CardContent>
                    {recentCalcs.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                            <Calculator className="mx-auto h-12 w-12 mb-4 opacity-50" />
                            <p>No saved calculations yet.</p>
                            <Button asChild variant="link">
                                <Link href="/calculator">Run your first calculation →</Link>
                            </Button>
                        </div>
                    ) : (
                        <ul className="divide-y">
                            {recentCalcs.map((calc: any) => (
                                <li key={calc.id}>
                                    <Link href={`/calculator/${calc.id}`} className="py-3 flex items-center justify-between hover:bg-muted/50 rounded-md px-2 transition-colors cursor-pointer -mx-2 block">
                                        <div>
                                            <p className="font-medium">{calc.inputs?.hsCode || "Unknown HS"}</p>
                                            <p className="text-sm text-muted-foreground">
                                                {new Date(calc.createdAt).toLocaleDateString()}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold">R {(calc.outputs?.total || 0).toFixed(2)}</p>
                                        </div>
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
