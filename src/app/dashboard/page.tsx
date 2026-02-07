import { auth, currentUser } from "@clerk/nextjs/server";
import { getCalcRunsForUser } from "@/lib/db/services/calcRun.service";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";

export default async function DashboardPage() {
    const { userId } = await auth();
    const user = await currentUser();

    if (!userId) {
        return <div>Please sign in to view your dashboard.</div>;
    }

    const recents = await getCalcRunsForUser(userId);

    return (
        <div className="container mx-auto py-10 px-4 space-y-8">
            <header className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Workspace</h1>
                    <p className="text-muted-foreground">Welcome back, {user?.firstName || "Importer"}.</p>
                </div>
            </header>

            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Calculations</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{recents.length}</div>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Recent Import Costs</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Date</TableHead>
                                <TableHead>Product / Input</TableHead>
                                <TableHead>Total Cost</TableHead>
                                <TableHead>Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {recents.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={4} className="text-center h-24 text-muted-foreground">
                                        No saved calculations yet.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                recents.map((run: any) => (
                                    <TableRow key={run.id}>
                                        <TableCell>{formatDistanceToNow(run.createdAt)} ago</TableCell>
                                        <TableCell className="font-medium">
                                            {/* Extract HS or Description from Inputs JSON */}
                                            {run.inputs?.hsCode || "Unknown SKU"}
                                        </TableCell>
                                        <TableCell>
                                            {/* Extract Total from Outputs JSON */}
                                            R {(run.outputs?.total || 0).toFixed(2)}
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline">Saved</Badge>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
