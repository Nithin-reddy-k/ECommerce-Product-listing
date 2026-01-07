import pkg from "pg";
import { CONFIG } from "./config.js";

const { Pool } = pkg;


export const masterPool = new Pool({
    connectionString: CONFIG.MASTER_CONNECTION_STRING
});

export const replicaPool = new Pool({
    connectionString: CONFIG.REPLICA_CONNECTION_STRING
});