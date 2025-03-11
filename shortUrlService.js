const express = require("express");
const { v4: uuidv4 } = require("uuid");
const PocketBase = require("pocketbase").default;


const app = express();
const pb = new PocketBase("http://127.0.0.1:8090");
pb.autoCancellation(false);

async function adminLogin() {
  try {
    await pb.admins.authWithPassword("deepanshu.rai.012002@gmail.com", "Brutal#Monk1501");
    console.log("✅ Admin authenticated successfully");
  } catch (error) {
    console.error("❌ Admin login failed:", error);
    process.exit(1);
  }
}
adminLogin();

app.use(express.json());

app.post("/shorten", async (req, res) => {
  try {
    const { url, expiration } = req.body;
    if (!url) return res.status(400).json({ error: "URL is required" });

    const shortCode = uuidv4().slice(0, 6);
    await pb.collection("short_urls").create({
      shortCode,
      url,
      createdAt: new Date().toISOString(),
      expiration: expiration || null,
    });

    res.json({ shortCode });
  } catch (error) {
    console.error("❌ Error in /shorten:", error);
    res.status(500).json({ error: "Failed to shorten URL", details: error.message });
  }
});

app.get("/stats/active", async (req, res) => {
  try {
    const activeUrls = await pb.collection("short_urls").getFullList({
        filter: `expiration = "" OR expiration > "${new Date().toISOString()}"`,
        
    });

    const groupedByDate = activeUrls.reduce((acc, item) => {
      const date = item.created.split("T")[0];
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {});

    res.json({ total: activeUrls.length, breakdown: groupedByDate });
  } catch (error) {
    console.error("❌ Error in /stats/active:", error);
    res.status(500).json({ error: "Failed to retrieve stats", details: error.message });
  }
});

app.get("/urls/recent", async (req, res) => {
  try {
    const recentUrls = await pb.collection("short_urls").getList(1, 5, {
      sort: "-created",
    });

    res.json(recentUrls.items.map(({ shortCode, url }) => ({ shortCode, url })));
  } catch (error) {
    console.error("❌ Error in /urls/recent:", error);
    res.status(500).json({ error: "Failed to retrieve recent URLs", details: error.message });
  }
});

app.post("/urls/batch", async (req, res) => {
  try {
    const { urls } = req.body;
    if (!Array.isArray(urls) || urls.length === 0)
      return res.status(400).json({ error: "URLs must be provided as an array" });

    const createdUrls = await Promise.all(
      urls.map(async (url) => {
        try {
          const shortCode = uuidv4().slice(0, 6);
          await pb.collection("short_urls").create({
            shortCode,
            url,
            createdAt: new Date().toISOString(),
          });
          return { shortCode, url };
        } catch (error) {
          console.error(`❌ Failed to create short URL for ${url}:`, error);
          return { error: `Failed to create short URL for ${url}` };
        }
      })
    );

    res.json(createdUrls);
  } catch (error) {
    console.error("❌ Error in /urls/batch:", error);
    res.status(500).json({ error: "Failed to shorten URLs in batch", details: error.message });
  }
});

app.listen(3000, () => console.log("🚀 Server running on port 3000"));
