
import { PrismaClient } from "@prisma/client";
import "dotenv/config";

const prisma = new PrismaClient();

async function main() {
    const targetSlug = "/import-duty-vat-landed-cost/solar-panels/from/cn/to/za";
    console.log(`Checking for slug: ${targetSlug}`);

    const exactMatch = await prisma.seoPage.findUnique({
        where: { slug: targetSlug },
    });

    if (exactMatch) {
        console.log("Exact match found:", exactMatch);
    } else {
        console.log("No exact match found.");
    }

    console.log("Checking for similar slugs (contains 'solar-panels')...");
    const similar = await prisma.seoPage.findMany({
        where: {
            slug: {
                contains: "solar-panels",
            },
        },
        take: 10,
    });

    if (similar.length > 0) {
        console.log("Found similar pages:");
        similar.forEach((p) => console.log(`- ${p.slug} (ID: ${p.id})`));
    } else {
        console.log("No pages found containing 'solar-panels'.");
    }
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
