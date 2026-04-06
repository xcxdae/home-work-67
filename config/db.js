const { MongoClient, ServerApiVersion } = require("mongodb");

let db = null;
let client = null;

const connectDB = async () => {
  try {
    client = new MongoClient(process.env.MONGODB_URI, {
      serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
      },
    });

    await client.connect();

    await client.db("admin").command({ ping: 1 });

    db = client.db("users");

    console.log(`✓ MongoDB підключена успішно`);
    return db;
  } catch (error) {
    console.error(`✗ Помилка підключення MongoDB: ${error.message}`);
    process.exit(1);
  }
};

const getDB = () => {
  if (!db) {
    throw new Error("Database is not connected");
  }
  return db;
};

const closeDB = async () => {
  if (client) {
    await client.close();
    console.log("✓ MongoDB з'єднання закрито");
  }
};

module.exports = {
  connectDB,
  getDB,
  closeDB,
};
