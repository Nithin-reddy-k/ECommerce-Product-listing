import dotenv from "dotenv";

dotenv.config()


export const CONFIG = {
    PORT: Number(process.env.PORT || 3000),
    MASTER_CONNECTION_STRING: `postgresql://${process.env.POSTGRES_USER}:${process.env.POSTGRES_PASSWORD}@localhost:5433/${process.env.POSTGRES_DB}`,
    REPLICA_CONNECTION_STRING: `postgresql://${process.env.POSTGRES_USER}:${process.env.POSTGRES_PASSWORD}@localhost:5434/${process.env.POSTGRES_DB}`
    
}
