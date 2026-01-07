import { readFileSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";

import { masterPool } from "./db.js";


export async function seedDb() {
    
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    
    const sqlPath = path.resolve(__dirname, "../src/sql/seed.sql");

    try {
        const sql = readFileSync(sqlPath, "utf-8");

        await masterPool.query(sql);
        console.log("Database is populated - seed.sql executed sucessfully")
    } catch (error) {
        console.log("Failed to run seed.sql", error);
        throw error;
    }
};