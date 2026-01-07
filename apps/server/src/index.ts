import greet from "@ecommerce/common";
import express from "express";
import { CONFIG } from "./config.js";
import { initDb } from "./init-db.js";
import { seedDb } from "./seed-db.js";
import adminRouter from "./routes/admin-routes.js";

const app = express()

app.use(express.json());

app.get("/", (req, res) => {
    const result = greet("From server...")

    res.send(result);
})

app.use("/api/admin", adminRouter);

async function start() {
    await initDb();
    // await seedDb();
    
    app.listen(CONFIG.PORT, () => {
        console.log(`API runnign on port:${CONFIG.PORT}`)
    });

};


start();