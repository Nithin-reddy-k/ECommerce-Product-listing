import { readFileSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";

import { masterPool } from "./db.js";


export async function initDb() {
    
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    
    const sqlPath = path.resolve(__dirname, "../src/sql/init.sql");

    try {
        const sql = readFileSync(sqlPath, "utf-8");

        await masterPool.query(sql);
        console.log("Database initialized - init.sql executed sucessfully")
    } catch (error) {
        console.log("Failed to run init.sql", error);
        throw error;
    }
};