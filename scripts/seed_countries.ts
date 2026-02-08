
import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import fs from "fs";
import path from "path";

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function seedCountries() {
    console.log("🌍 Seeding Countries...");

    const jsonPath = path.join(__dirname, "..", "data", "countries.json");
    if (!fs.existsSync(jsonPath)) {
        throw new Error(`Country data not found at ${jsonPath}`);
    }

    const countries = JSON.parse(fs.readFileSync(jsonPath, "utf-8"));
    console.log(`Loaded ${countries.length} countries.`);

    let created = 0;
    for (const c of countries) {
        await prisma.country.upsert({
            where: { iso2: c.iso2 },
            update: { name: c.name },
            create: {
                iso2: c.iso2,
                name: c.name,
                region: "World" // Placeholder
            }
        });
        created++;
    }

    console.log(`✅ Upserted ${created} countries.`);
}

seedCountries()
    .catch(console.error)
    .finally(async () => {
        await prisma.$disconnect();
        await pool.end();
    });
