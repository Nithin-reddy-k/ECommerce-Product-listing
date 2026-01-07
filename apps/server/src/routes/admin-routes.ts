import { Router } from "express";
import { masterPool, replicaPool } from "../db.js";

const adminRouter: Router = Router();


adminRouter.get("/users", async (req, res) => {

    const users = await replicaPool.query(`
            SELECT * FROM users
            WHERE role='user';
        `);

    res.json({ users: users.rows, msg: "sucessfull" });

});


adminRouter.get("/products", async (req, res) => {

    const products = await replicaPool.query(`
            SELECT * FROM products;
        `);
    
    res.json({
        products: products.rows,
        msg: "successfull"
    });

});


adminRouter.post("/product", async (req, res) => {

    const productDetails = req.body;

    const values = [
        productDetails.title,
        productDetails.description,
        productDetails.image_url,
        productDetails.price,
        productDetails.quantity
    ]

    const query = `
        INSERT INTO products (title, description, image_url, price, quantity)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *;
    `;
    
    const response = await masterPool.query(query, values);
    const resposeBody = response.rows;

    res.json({
        resposeBody,
        msg: "successfull"
    });
});


adminRouter.delete("/product/:id", async (req, res) => {

    const {id} = req.params;

    const response = await masterPool.query(`
            DELETE FROM products WHERE id='${id}'
            RETURNING *;
        `)

    const resposeBody = response.rows;    

    res.json({
        response,
        msg: "successfull"
    });
});

adminRouter.get("/product/:id", async (req, res) => {
    const { id } = req.params;

    const response = await masterPool.query(`
            SELECT * FROM products WHERE id='${id}';
        `)

    const responseBody = response.rows;
    
    res.json({
        responseBody,
        msg: "successfull"
    });
    
});

adminRouter.put("/product/:id", async (req, res) => {
    const { id } = req.params;
    const { title, description, image_url, price, quantity } = req.body;

    const values = [
        title, description, image_url, price, quantity
    ];

    const query = `
        UPDATE products
        SET title = $1,
            description = $2,
            image_url = $3, 
            price = $4,
            quantity = $5
        WHERE id='${id}'
        RETURNING *;
    `

    const response = await masterPool.query(query, values);
    const responseBody = response.rows;

    res.json({
        responseBody, 
        msg: "succssfull"
    });
});

export default adminRouter;