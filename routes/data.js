const express = require("express");
const router = express.Router();
const { getDB } = require("../config/db");
const { ObjectId } = require("mongodb");

router.get("/users", async (req, res) => {
  try {
    const db = getDB();
    const users = await db.collection("users").find({}).toArray();

    res.json({
      success: true,
      count: users.length,
      data: users,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

router.get("/users/:id", async (req, res) => {
  try {
    const db = getDB();

    if (!ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        error: "ID користувача невалідний",
      });
    }

    const user = await db.collection("users").findOne({
      _id: new ObjectId(req.params.id),
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: "Користувач не знайдений",
      });
    }

    res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

router.post("/users", async (req, res) => {
  try {
    const db = getDB();
    const { name, email, age, city } = req.body;

    if (!name || !email) {
      return res.status(400).json({
        success: false,
        error: "Ім'я та email обов'язкові",
      });
    }

    const existingUser = await db.collection("users").findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: "Користувач з таким email вже існує",
      });
    }

    const newUser = {
      name,
      email,
      age: age ? parseInt(age) : null,
      city: city || null,
      active: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db.collection("users").insertOne(newUser);

    res.status(201).json({
      success: true,
      message: "Користувач успішно створений",
      data: {
        _id: result.insertedId,
        ...newUser,
      },
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
});

router.put("/users/:id", async (req, res) => {
  try {
    const db = getDB();

    if (!ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        error: "ID користувача невалідний",
      });
    }

    const { name, email, age, city, active } = req.body;

    const updateData = {};
    if (name) updateData.name = name;
    if (email) updateData.email = email;
    if (age !== undefined) updateData.age = age ? parseInt(age) : null;
    if (city !== undefined) updateData.city = city || null;
    if (active !== undefined) updateData.active = active;
    updateData.updatedAt = new Date();

    const result = await db
      .collection("users")
      .findOneAndUpdate(
        { _id: new ObjectId(req.params.id) },
        { $set: updateData },
        { returnDocument: "after" },
      );

    if (!result.value) {
      return res.status(404).json({
        success: false,
        error: "Користувач не знайдений",
      });
    }

    res.json({
      success: true,
      message: "Користувач успішно оновлений",
      data: result.value,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
});

router.delete("/users/:id", async (req, res) => {
  try {
    const db = getDB();

    if (!ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        error: "ID користувача невалідний",
      });
    }

    const result = await db
      .collection("users")
      .findOneAndDelete({ _id: new ObjectId(req.params.id) });

    if (!result.value) {
      return res.status(404).json({
        success: false,
        error: "Користувач не знайдений",
      });
    }

    res.json({
      success: true,
      message: "Користувач успішно видалений",
      data: result.value,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

router.get("/docs", (req, res) => {
  res.json({
    message: "API Документація",
    endpoints: {
      "GET /api/users": "Отримати всіх користувачів",
      "GET /api/users/:id": "Отримати користувача за ID",
      "POST /api/users": "Додати нового користувача",
      "PUT /api/users/:id": "Оновити користувача",
      "DELETE /api/users/:id": "Видалити користувача",
    },
  });
});

module.exports = router;
