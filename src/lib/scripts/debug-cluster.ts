
import { getClusterWithHsCodes } from "../db/services/productCluster.service";

async function main() {
    const slug = "solar-panels";
    console.log(`Checking cluster: ${slug}`);
    const cluster = await getClusterWithHsCodes(slug);
    console.log("Cluster found:", cluster);
    if (cluster) {
        console.log("HS Maps:", cluster.hsMaps);
    }
}

main().catch(console.error);
