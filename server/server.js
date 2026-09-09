const express = require("express");
const cors = require("cors");
const fetch = require("node-fetch");

const app = express();
app.use(cors());
app.use(express.json());

app.post("/route", async (req, res) => {
    try {
    const response = await fetch("http://localhost:8002/route", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(req.body),
    });

    const data = await response.json();
    res.json(data);
  } catch (err) {
    console.error("Backend fetch failed:", err);
    res
      .status(500)
      .json({ error: "Backend fetch failed", details: err.toString() });
  }
});

app.listen(3000, () => console.log("Proxy running on port 3000"));
