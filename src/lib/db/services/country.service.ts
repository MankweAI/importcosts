/**
 * Country Service
 * CRUD operations for country data
 */

import prisma from "../prisma";
import type { Country } from "@prisma/client";

export type CreateCountryInput = {
    iso2: string;
    iso3?: string;
    name: string;
    region?: string;
};

export async function createCountry(data: CreateCountryInput): Promise<Country> {
    return prisma.country.create({ data });
}

export async function upsertCountry(data: CreateCountryInput): Promise<Country> {
    return prisma.country.upsert({
        where: { iso2: data.iso2 },
        update: { name: data.name, iso3: data.iso3, region: data.region },
        create: data,
    });
}

export async function getCountryByIso2(iso2: string): Promise<Country | null> {
    return prisma.country.findUnique({ where: { iso2 } });
}

export async function getAllCountries(): Promise<Country[]> {
    return prisma.country.findMany({ orderBy: { name: "asc" } });
}

export async function getCountriesByRegion(region: string): Promise<Country[]> {
    return prisma.country.findMany({
        where: { region },
        orderBy: { name: "asc" },
    });
}
