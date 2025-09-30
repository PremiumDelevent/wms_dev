const express = require("express");

function createHelloRouter() {
    const router = express.Router();
    router.get("/hello", (_req, res) => {
        try {
            res.json({ message: "Hello, World!" });
        } catch (error) {
            console.error("❌ Error en /hello:", error.message);
            res.status(500).json({ error: "Error en el endpoint /hello" });
        }
    });
    return router;
}

module.exports = createHelloRouter;