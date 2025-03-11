const express = require("express");
const { v4: uuidv4 } = require("uuid");
const PocketBase = require("pocketbase").default;

const pb = new PocketBase("http://127.0.0.1:8090");
pb.autoCancellation(false);
const app = express();
app.use(express.json());

const ADMIN_EMAIL = "deepanshu.rai.1501@gmail.com";  
const ADMIN_PASSWORD = "Brutal#Monk1501";  

app.post("/shorten", async (req, res) => {
    try {
        const { url, expiration } = req.body;
        if (!url) return res.status(400).json({ error: "URL is required" });

        const shortCode = uuidv4().slice(0, 6);

        const record = await pb.collection("short_urls").create({
            shortCode,
            url,
            createdAt: new Date().toISOString(),
            expiration: expiration || null
        });

        res.json({ shortCode, id: record.id });
    } catch (error) {
        console.error("Error shortening URL:", error);
        res.status(500).json({ error: "Failed to shorten URL" });
    }
});

app.get("/stats/active", async (req, res) => {
    try {
        const activeUrls = await pb.collection("short_urls").getFullList({
            filter: `expiration = "" OR expiration > "${new Date().toISOString()}"`
        });

        const groupedByDate = activeUrls.reduce((acc, item) => {
            const date = item.createdAt.split("T")[0];
            acc[date] = (acc[date] || 0) + 1;
            return acc;
        }, {});

        res.json({ total: activeUrls.length, breakdown: groupedByDate });
    } catch (error) {
        console.error("Error retrieving stats:", error);
        res.status(500).json({ error: "Failed to retrieve stats" });
    }
});

app.get("/urls/recent", async (req, res) => {
    try {
        const recentUrls = await pb.collection("short_urls").getList(1, 5, { sort: "-createdAt" });

        res.json(recentUrls.items.map(({ shortCode, url }) => ({ shortCode, url })));
    } catch (error) {
        console.error("Error retrieving recent URLs:", error);
        res.status(500).json({ error: "Failed to retrieve recent URLs" });
    }
});

app.post("/urls/batch", async (req, res) => {
    try {
        const urls = req.body.urls;
        if (!Array.isArray(urls) || urls.length === 0) {
            return res.status(400).json({ error: "Invalid input" });
        }

        const createdUrls = await Promise.all(urls.map(async (url) => {
            const shortCode = uuidv4().slice(0, 6);
            const record = await pb.collection("short_urls").create({
                shortCode,
                url,
                createdAt: new Date().toISOString()
            });
            return { shortCode, url, id: record.id };
        }));

        res.json(createdUrls);
    } catch (error) {
        console.error("Batch URL shortening error:", error);
        res.status(500).json({ error: "Failed to shorten URLs in batch" });
    }
});

app.listen(3000, () => console.log("Server running on port 3000"));
