import { auth } from "@clerk/nextjs/server";
import { getCalcRunsForUser } from "@/lib/db/services/calcRun.service";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, Trash2 } from "lucide-react";

export default async function RoutesPage() {
    const { userId } = await auth();
    const routes = userId ? await getCalcRunsForUser(userId, 50) : [];

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Import Routes</h2>
                    <p className="text-muted-foreground">All your saved landed cost calculations.</p>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Saved Calculations</CardTitle>
                    <CardDescription>Click a row to view details or re-run the calculation.</CardDescription>
                </CardHeader>
                <CardContent>
                    {routes.length === 0 ? (
                        <div className="text-center py-12 text-muted-foreground">
                            <p>No saved routes yet.</p>
                            <p className="text-sm">Run a calculation and click "Save to Workspace" to see it here.</p>
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Date</TableHead>
                                    <TableHead>HS Code</TableHead>
                                    <TableHead>Origin</TableHead>
                                    <TableHead className="text-right">Landed Cost</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="w-[100px]">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {routes.map((route: any) => (
                                    <TableRow key={route.id} className="cursor-pointer hover:bg-muted/50">
                                        <TableCell className="text-muted-foreground text-sm">
                                            {new Date(route.createdAt).toLocaleDateString()}
                                        </TableCell>
                                        <TableCell className="font-medium">
                                            {route.inputs?.hsCode || "N/A"}
                                        </TableCell>
                                        <TableCell>
                                            {route.inputs?.originCountry || "Unknown"}
                                        </TableCell>
                                        <TableCell className="text-right font-bold">
                                            R {(route.outputs?.total || 0).toFixed(2)}
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className="text-xs">
                                                {route.confidence || "MEDIUM"}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-1">
                                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                                    <FileText className="h-4 w-4" />
                                                </Button>
                                                <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive">
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
