import { Router } from "express";
import { masterPool, replicaPool } from "../db.js";

const adminRouter: Router = Router();


adminRouter.get("/users", async (req, res) => {

    try {
        const users = await replicaPool.query(`
            SELECT * FROM users
            WHERE role='user';
        `);    
        
        if(!users) {
            return res.status(409).json({ msg: "Some error occured"});
        }

        const response = users.rows;
        return res.json({ users: response, msg: "sucessfull" });
    
    } catch (error) {
        return res.status(403).json({ err: error, msg: "Some error occurred"});
    }

});


adminRouter.get("/products", async (req, res) => {

    try {
        const products = await replicaPool.query(`
            SELECT * FROM products;
        `);

        if(!products) {
            return res.status(409).json({ msg: "Some error occurred"});
        }

        const response = products.rows;
        return res.status(200).json({ products: response, msg: "Successfull"});

    } catch (error) {
        return res.status(403).json({ msg: "Some error occurred" });
    }

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

    try {
        const response = await masterPool.query(query, values);

        if(!response) {
            return res.status(409).json({ msg: "Some error occurred" });
        }

        const resposeBody = response.rows;
        return res.status(200).json({ response: resposeBody, msg: "Successfull" });

    } catch (error) {
        return res.status(403).json({ msg: "Some error occurred" });
    }
    
});


adminRouter.delete("/product/:id", async (req, res) => {

    const {id} = req.params;

    try {
        const response = await masterPool.query(`
            DELETE FROM products WHERE id='${id}'
            RETURNING *;
        `)

        if(!response) {
            return res.status(409).json({ msg: "Some error occurred" });
        }

        const resposeBody = response.rows;
        return res.status(200).json({ response: resposeBody, msg: "Successfull" });
    } catch (error) {
        return res.status(403).json({ msg: "Some error occurred" });

    };

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

    try {
        const response = await masterPool.query(query, values);

        if(!response) {
            return res.status(409).json({ msg: "Some error occurred" });
        }

        const responseBody = response.rows;
        return res.status(200).json({ response: responseBody, msg: "Successfull"});
    } catch (error) {
        return res.status(403).json({ msg: "Some error occurred" });
    };

});

export default adminRouter;