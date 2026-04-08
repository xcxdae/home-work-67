const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const router = express.Router();
const { getDB } = require("../config/db");
const { requireAuth } = require("../middleware/auth");
const { ObjectId } = require("mongodb");

router.post("/register", async (req, res) => {
  try {
    const db = getDB();
    const { name, email, password, age, city } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        error: "Ім'я, email та пароль обов'язкові",
      });
    }

    const existingUser = await db.collection("users").findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: "Користувач з таким email вже існує",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = {
      name,
      email,
      password: hashedPassword,
      age: age ? parseInt(age) : null,
      city: city || null,
      active: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db.collection("users").insertOne(newUser);

    res.status(201).json({
      success: true,
      message: "Користувач успішно зареєстрований",
      data: {
        _id: result.insertedId,
        name,
        email,
        age,
        city,
        active: true,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

router.post("/login", async (req, res) => {
  try {
    const db = getDB();
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: "Email та пароль обов'язкові",
      });
    }

    const user = await db.collection("users").findOne({ email });
    if (!user) {
      return res.status(401).json({
        success: false,
        error: "Невірні облікові дані",
      });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        error: "Невірні облікові дані",
      });
    }

    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET || "your-secret-key",
      { expiresIn: "24h" },
    );

    res.json({
      success: true,
      message: "Успішний вхід",
      data: {
        token,
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          age: user.age,
          city: user.city,
        },
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

router.get("/users", async (req, res) => {
  try {
    const db = getDB();
    const { fields } = req.query;

    let projection = {};
    if (fields) {
      const fieldArray = fields.split(",");
      fieldArray.forEach((field) => {
        projection[field.trim()] = 1;
      });
    }

    const users = await db
      .collection("users")
      .find({}, { projection })
      .toArray();

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
    const { name, email, password, age, city } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        error: "Ім'я, email та пароль обов'язкові",
      });
    }

    const existingUser = await db.collection("users").findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: "Користувач з таким email вже існує",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = {
      name,
      email,
      password: hashedPassword,
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
        password: undefined, // Не повертаємо пароль
      },
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
});

router.post("/users/bulk", async (req, res) => {
  try {
    const db = getDB();
    const users = req.body;

    if (!Array.isArray(users) || users.length === 0) {
      return res.status(400).json({
        success: false,
        error: "Масив користувачів обов'язковий та не може бути порожнім",
      });
    }

    for (let i = 0; i < users.length; i++) {
      const { name, email, password } = users[i];
      if (!name || !email || !password) {
        return res.status(400).json({
          success: false,
          error: `Користувач ${i + 1}: Ім'я, email та пароль обов'язкові`,
        });
      }
      const duplicateInBatch = users.find(
        (u, index) => u.email === email && index !== i,
      );
      if (duplicateInBatch) {
        return res.status(400).json({
          success: false,
          error: `Дублікат email в запиті: ${email}`,
        });
      }
      const existingUser = await db.collection("users").findOne({ email });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          error: `Користувач з email ${email} вже існує`,
        });
      }
    }

    const usersToInsert = await Promise.all(
      users.map(async (user) => ({
        name: user.name,
        email: user.email,
        password: await bcrypt.hash(user.password, 10),
        age: user.age ? parseInt(user.age) : null,
        city: user.city || null,
        active: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      })),
    );

    const result = await db.collection("users").insertMany(usersToInsert);

    res.status(201).json({
      success: true,
      message: `${result.insertedCount} користувачів успішно створено`,
      data: {
        insertedIds: result.insertedIds,
        insertedCount: result.insertedCount,
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

router.put("/users", async (req, res) => {
  try {
    const db = getDB();
    const { filter, update } = req.body;

    if (!filter || !update) {
      return res.status(400).json({
        success: false,
        error: "Фільтр та дані для оновлення обов'язкові",
      });
    }

    const updateData = { $set: { ...update, updatedAt: new Date() } };

    const result = await db.collection("users").updateMany(filter, updateData);

    res.json({
      success: true,
      message: `${result.modifiedCount} користувачів успішно оновлено`,
      data: {
        matchedCount: result.matchedCount,
        modifiedCount: result.modifiedCount,
      },
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
});

router.put("/users/:id/replace", async (req, res) => {
  try {
    const db = getDB();

    if (!ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        error: "ID користувача невалідний",
      });
    }

    const { name, email, age, city, active } = req.body;

    if (!name || !email) {
      return res.status(400).json({
        success: false,
        error: "Ім'я та email обов'язкові для заміни",
      });
    }

    const replacement = {
      name,
      email,
      age: age ? parseInt(age) : null,
      city: city || null,
      active: active !== undefined ? active : true,
      createdAt: new Date(), // Reset createdAt on replace
      updatedAt: new Date(),
    };

    const result = await db
      .collection("users")
      .replaceOne({ _id: new ObjectId(req.params.id) }, replacement);

    if (result.matchedCount === 0) {
      return res.status(404).json({
        success: false,
        error: "Користувач не знайдений",
      });
    }

    res.json({
      success: true,
      message: "Користувач успішно замінений",
      data: {
        _id: req.params.id,
        ...replacement,
      },
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

router.delete("/users", async (req, res) => {
  try {
    const db = getDB();
    const { filter } = req.body;

    if (!filter) {
      return res.status(400).json({
        success: false,
        error: "Фільтр для видалення обов'язковий",
      });
    }

    const result = await db.collection("users").deleteMany(filter);

    res.json({
      success: true,
      message: `${result.deletedCount} користувачів успішно видалено`,
      data: {
        deletedCount: result.deletedCount,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

router.get("/users/cursor/count", async (req, res) => {
  try {
    const db = getDB();
    const cursor = db.collection("users").find({ active: true });
    let count = 0;

    await cursor.forEach(() => {
      count++;
    });

    res.json({
      success: true,
      message:
        "Кількість активних користувачів підрахована з використанням курсора",
      data: { activeUsersCount: count },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

router.get("/users/stats", async (req, res) => {
  try {
    const db = getDB();
    const stats = await db
      .collection("users")
      .aggregate([
        {
          $match: { active: true },
        },
        {
          $group: {
            _id: null,
            totalUsers: { $sum: 1 },
            averageAge: { $avg: "$age" },
            minAge: { $min: "$age" },
            maxAge: { $max: "$age" },
            cities: { $addToSet: "$city" },
            cityCount: {
              $sum: {
                $cond: { if: { $ne: ["$city", null] }, then: 1, else: 0 },
              },
            },
          },
        },
      ])
      .toArray();

    if (stats.length === 0) {
      return res.json({
        success: true,
        message: "Статистика користувачів",
        data: { totalUsers: 0 },
      });
    }

    const data = stats[0];
    data.uniqueCities = data.cities.filter((city) => city !== null).length;
    delete data.cities;

    res.json({
      success: true,
      message: "Статистика активних користувачів",
      data,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

router.get("/posts", requireAuth, async (req, res) => {
  try {
    const db = getDB();
    const { author, published, tags } = req.query;

    let filter = {};
    if (author) filter.author = new ObjectId(author);
    if (published !== undefined) filter.published = published === "true";
    if (tags) {
      const tagArray = tags.split(",");
      filter.tags = { $in: tagArray };
    }

    const posts = await db
      .collection("posts")
      .find(filter)
      .sort({ createdAt: -1 })
      .toArray();

    res.json({
      success: true,
      count: posts.length,
      data: posts,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

router.get("/posts/:id", requireAuth, async (req, res) => {
  try {
    const db = getDB();

    if (!ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        error: "ID поста невалідний",
      });
    }

    const post = await db.collection("posts").findOne({
      _id: new ObjectId(req.params.id),
    });

    if (!post) {
      return res.status(404).json({
        success: false,
        error: "Пост не знайдений",
      });
    }

    res.json({
      success: true,
      data: post,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

router.post("/posts", requireAuth, async (req, res) => {
  try {
    const db = getDB();
    const { title, content, tags } = req.body;

    if (!title || !content) {
      return res.status(400).json({
        success: false,
        error: "Заголовок та зміст обов'язкові",
      });
    }

    const newPost = {
      title,
      content,
      author: new ObjectId(req.user._id),
      tags: tags || [],
      likes: [],
      published: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db.collection("posts").insertOne(newPost);

    res.status(201).json({
      success: true,
      message: "Пост успішно створений",
      data: {
        _id: result.insertedId,
        ...newPost,
      },
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
});

router.put("/posts/:id", requireAuth, async (req, res) => {
  try {
    const db = getDB();

    if (!ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        error: "ID поста невалідний",
      });
    }

    const post = await db.collection("posts").findOne({
      _id: new ObjectId(req.params.id),
    });

    if (!post) {
      return res.status(404).json({
        success: false,
        error: "Пост не знайдений",
      });
    }

    if (post.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        error: "Немає прав на редагування цього поста",
      });
    }

    const { title, content, tags, published } = req.body;

    const updateData = {};
    if (title) updateData.title = title;
    if (content) updateData.content = content;
    if (tags) updateData.tags = tags;
    if (published !== undefined) updateData.published = published;
    updateData.updatedAt = new Date();

    const result = await db
      .collection("posts")
      .findOneAndUpdate(
        { _id: new ObjectId(req.params.id) },
        { $set: updateData },
        { returnDocument: "after" },
      );

    res.json({
      success: true,
      message: "Пост успішно оновлений",
      data: result.value,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
});

router.delete("/posts/:id", requireAuth, async (req, res) => {
  try {
    const db = getDB();

    if (!ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        error: "ID поста невалідний",
      });
    }

    const post = await db.collection("posts").findOne({
      _id: new ObjectId(req.params.id),
    });

    if (!post) {
      return res.status(404).json({
        success: false,
        error: "Пост не знайдений",
      });
    }

    if (post.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        error: "Немає прав на видалення цього поста",
      });
    }

    await db
      .collection("posts")
      .deleteOne({ _id: new ObjectId(req.params.id) });

    res.json({
      success: true,
      message: "Пост успішно видалений",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

router.post("/posts/:id/like", requireAuth, async (req, res) => {
  try {
    const db = getDB();

    if (!ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        error: "ID поста невалідний",
      });
    }

    const post = await db.collection("posts").findOne({
      _id: new ObjectId(req.params.id),
    });

    if (!post) {
      return res.status(404).json({
        success: false,
        error: "Пост не знайдений",
      });
    }

    const userId = new ObjectId(req.user._id);
    const isLiked = post.likes.some(
      (id) => id.toString() === userId.toString(),
    );

    if (isLiked) {
      await db
        .collection("posts")
        .updateOne(
          { _id: new ObjectId(req.params.id) },
          { $pull: { likes: userId } },
        );
      res.json({
        success: true,
        message: "Лайк знято",
      });
    } else {
      await db
        .collection("posts")
        .updateOne(
          { _id: new ObjectId(req.params.id) },
          { $push: { likes: userId } },
        );
      res.json({
        success: true,
        message: "Пост лайкнуто",
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

router.get("/posts/cursor/count", requireAuth, async (req, res) => {
  try {
    const db = getDB();
    const cursor = db.collection("posts").find({ published: true });
    let count = 0;

    await cursor.forEach(() => {
      count++;
    });

    res.json({
      success: true,
      message:
        "Кількість опублікованих постів підрахована з використанням курсора",
      data: { publishedPostsCount: count },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

router.get("/posts/stats", requireAuth, async (req, res) => {
  try {
    const db = getDB();
    const stats = await db
      .collection("posts")
      .aggregate([
        {
          $match: { published: true },
        },
        {
          $group: {
            _id: null,
            totalPosts: { $sum: 1 },
            totalLikes: { $sum: { $size: "$likes" } },
            averageLikes: { $avg: { $size: "$likes" } },
            tags: { $push: "$tags" },
          },
        },
        {
          $project: {
            totalPosts: 1,
            totalLikes: 1,
            averageLikes: 1,
            allTags: {
              $reduce: {
                input: "$tags",
                initialValue: [],
                in: { $concatArrays: ["$$value", "$$this"] },
              },
            },
          },
        },
        {
          $project: {
            totalPosts: 1,
            totalLikes: 1,
            averageLikes: 1,
            uniqueTags: { $size: { $setUnion: "$allTags" } },
          },
        },
      ])
      .toArray();

    if (stats.length === 0) {
      return res.json({
        success: true,
        message: "Статистика постів",
        data: { totalPosts: 0 },
      });
    }

    res.json({
      success: true,
      message: "Статистика опублікованих постів",
      data: stats[0],
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
      "POST /api/register": "Реєстрація нового користувача",
      "POST /api/login": "Вхід користувача (отримання JWT токена)",
      "GET /api/users":
        "Отримати всіх користувачів (з підтримкою проекції через ?fields=name,email)",
      "GET /api/users/:id": "Отримати користувача за ID",
      "POST /api/users": "Додати нового користувача (insertOne)",
      "POST /api/users/bulk": "Додати декількох користувачів (insertMany)",
      "PUT /api/users/:id": "Оновити користувача (updateOne)",
      "PUT /api/users": "Оновити декількох користувачів (updateMany)",
      "PUT /api/users/:id/replace": "Замінити користувача (replaceOne)",
      "DELETE /api/users/:id": "Видалити користувача (deleteOne)",
      "DELETE /api/users": "Видалити декількох користувачів (deleteMany)",
      "GET /api/users/cursor/count":
        "Підрахувати активних користувачів з використанням курсора",
      "GET /api/users/stats":
        "Отримати статистичні дані користувачів (агрегація)",
      "GET /api/posts": "Отримати всі пости (авторизований)",
      "GET /api/posts/:id": "Отримати пост за ID (авторизований)",
      "POST /api/posts": "Створити новий пост (авторизований)",
      "PUT /api/posts/:id": "Оновити пост (авторизований, тільки автор)",
      "DELETE /api/posts/:id": "Видалити пост (авторизований, тільки автор)",
      "POST /api/posts/:id/like": "Лайкнути/зняти лайк з поста (авторизований)",
      "GET /api/posts/cursor/count":
        "Підрахувати опублікованих постів з курсором (авторизований)",
      "GET /api/posts/stats":
        "Отримати статистику постів (агрегація, авторизований)",
    },
  });
});

module.exports = router;
