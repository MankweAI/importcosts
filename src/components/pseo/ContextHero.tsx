import { Badge } from "@/components/ui/badge";
import { RouteContext } from "@/types/pseo";

interface ContextHeroProps {
    title: string;
    subtitle: string;
    routeContext: RouteContext;
}

export function ContextHero({ title, subtitle, routeContext }: ContextHeroProps) {
    return (
        <div className="mb-8 space-y-4 text-center md:text-left">
            <div className="flex flex-wrap justify-center md:justify-start gap-2">
                <Badge variant="secondary" className="text-xs uppercase tracking-wider">
                    Origin: {routeContext.originIso}
                </Badge>
                <Badge variant="secondary" className="text-xs uppercase tracking-wider">
                    Destination: ZA
                </Badge>
                {routeContext.hs6 && (
                    <Badge variant="outline" className="text-xs font-mono">
                        HS: {routeContext.hs6}
                    </Badge>
                )}
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight md:text-4xl lg:text-5xl">
                {title}
            </h1>
            <p className="text-lg text-neutral-600 dark:text-neutral-400 max-w-2xl">
                {subtitle}
            </p>
        </div>
    );
}
