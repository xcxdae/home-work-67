require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { connectDB, closeDB } = require("./config/db");
const dataRoutes = require("./routes/data");

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static("public"));

connectDB();

app.use("/api", dataRoutes);

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/public/index.html");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✓ Сервер запущений на http://localhost:${PORT}`);
  console.log(`✓ Документація API: http://localhost:${PORT}/api/docs`);
});

process.on("SIGINT", async () => {
  console.log("\n\n🛑 Завершення програми...");
  await closeDB();
  process.exit(0);
});
