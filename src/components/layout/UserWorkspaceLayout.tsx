import { UserButton } from "@clerk/nextjs";
import { WorkspaceSidebar } from "@/components/workspace/Sidebar";
import { currentUser } from "@clerk/nextjs/server";

export async function UserWorkspaceLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const user = await currentUser();

    return (
        <div className="flex h-screen">
            <WorkspaceSidebar />
            <div className="flex-1 flex flex-col overflow-hidden">
                <header className="h-14 border-b flex items-center justify-between px-6 bg-background">
                    <h1 className="font-semibold">Workspace</h1>
                    <div className="flex items-center gap-4">
                        <span className="text-sm text-muted-foreground">
                            {user?.firstName || user?.emailAddresses[0]?.emailAddress}
                        </span>
                        <UserButton afterSignOutUrl="/" />
                    </div>
                </header>
                <main className="flex-1 overflow-y-auto p-6 bg-muted/10">
                    {children}
                </main>
            </div>
        </div>
    );
}
