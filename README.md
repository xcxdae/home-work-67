# Express + MongoDB Atlas 🚀

Повна система управління користувачами з використанням Express.js і MongoDB Atlas.
Проект використовує **MongoDB Node.js Driver** для прямої роботи з базою даних.

## 📋 Вимоги

- Node.js (v14.0.0 або вище)
- npm або yarn
- Аккаунт MongoDB Atlas (безкоштовно)

## 🔧 Інсталяція

### 1. Встановлення залежностей

```bash
npm install
```

### 2. Налаштування MongoDB Atlas

1. Перейдіть на [mongodb.com/cloud/atlas](https://mongodb.com/cloud/atlas)
2. Реєстрація/вхід в аккаунт
3. Створіть новий проект
4. Створіть кластер (безкоштовний M0)
5. Додайте користувача з паролем
6. Додайте вашу IP адресу до Network Access
7. Отримайте Connection String (URI)

### 3. Налаштування змінних середовища

1. Відкрийте файл `.env`
2. Замініть `MONGODB_URI` на ваш Connection String з Atlas:

```env
MONGODB_URI=mongodb+srv://username:password@cluster-name.mongodb.net/database-name?retryWrites=true&w=majority
PORT=8080
NODE_ENV=development
```

**Порада:** Якщо порт 8080 зайнятий, спробуйте 3000, 3001, 5000 або будь-який інший вільний порт.

**Приклад Connection String з Atlas:**

```
mongodb+srv://your_username:your_password@cluster0.xyz.mongodb.net/users?retryWrites=true&w=majority
```

## ▶️ Запуск

### Режим розробки (з автоперезагруженням):

```bash
npm run dev
```

### Режим продакшену:

```bash
npm start
```

**Очікуваний результат:**

```
✓ Сервер запущений на http://localhost:8080
✓ Документація API: http://localhost:8080/api/docs
✓ MongoDB підключена успішно
```

**❌ Якщо ви бачите помилку `EADDRINUSE`:**

Це означає, що порт зайнятий. Рішення:

1. **Змініть порт** в `.env` файлі:

   ```env
   PORT=3000  # або 3001, 5000, 8081, тощо
   ```

2. **Перезапустіть сервер:**

   ```bash
   npm run dev
   ```

3. **Або знайдіть та закрийте процес**, що використовує порт:
   ```bash
   # На Windows:
   netstat -ano | findstr :8080
   taskkill /PID <PID_NUMBER> /F
   ```

Сервер запуститься на `http://localhost:8080` (або на порту, який ви вказали)

## 📚 API Endpoints

| Метод  | URL              | Опис                       | Приклад                                                                   |
| ------ | ---------------- | -------------------------- | ------------------------------------------------------------------------- |
| GET    | `/api/users`     | Отримати всіх користувачів | `curl http://localhost:8080/api/users`                                    |
| GET    | `/api/users/:id` | Отримати користувача за ID | `curl http://localhost:8080/api/users/507f1f77bcf86cd799439011`           |
| POST   | `/api/users`     | Додати нового користувача  | `curl -X POST http://localhost:8080/api/users`                            |
| PUT    | `/api/users/:id` | Оновити користувача        | `curl -X PUT http://localhost:8080/api/users/507f1f77bcf86cd799439011`    |
| DELETE | `/api/users/:id` | Видалити користувача       | `curl -X DELETE http://localhost:8080/api/users/507f1f77bcf86cd799439011` |

## 📝 Приклади запитів

### Додати користувача (POST):

```bash
curl -X POST http://localhost:8080/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Іван Петренко",
    "email": "ivan@example.com",
    "age": 25,
    "city": "Київ"
  }'
```

**Відповідь:**

```json
{
  "success": true,
  "message": "Користувач успішно створений",
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "Іван Петренко",
    "email": "ivan@example.com",
    "age": 25,
    "city": "Київ",
    "active": true,
    "createdAt": "2024-04-06T10:30:00.000Z",
    "updatedAt": "2024-04-06T10:30:00.000Z"
  }
}
```

### Отримати всіх користувачів (GET):

```bash
curl http://localhost:8080/api/users
```

### Отримати користувача за ID (GET):

```bash
curl http://localhost:8080/api/users/507f1f77bcf86cd799439011
```

### Оновити користувача (PUT):

```bash
curl -X PUT http://localhost:8080/api/users/507f1f77bcf86cd799439011 \
  -H "Content-Type: application/json" \
  -d '{
    "age": 26,
    "city": "Львів"
  }'
```

### Видалити користувача (DELETE):

```bash
curl -X DELETE http://localhost:8080/api/users/507f1f77bcf86cd799439011
```

## 📂 Структура проекту

```
├── config/
│   └── db.js                 # Підключення до MongoDB (Node.js Driver)
├── routes/
│   └── data.js              # API маршрути
├── public/
│   ├── index.html           # Головна сторінка (HTML)
│   ├── styles.css           # Стилі (CSS)
│   └── script.js            # Скрипти (JavaScript)
├── server.js                # Головний файл сервера
├── .env                     # Змінні середовища
├── package.json             # Залежності проекту
├── .gitignore               # Git конфіг
└── README.md                # Цей файл
```

## 🎯 Функціональність

- ✅ Читання даних з MongoDB (GET /api/users)
- ✅ Додавання нових користувачів (POST /api/users)
- ✅ Оновлення даних користувача (PUT /api/users/:id)
- ✅ Видалення користувачів (DELETE /api/users/:id)
- ✅ Веб-інтерфейс для управління користувачами
- ✅ Валідація даних на сервері
- ✅ Обробка помилок
- ✅ CORS підтримка
- ✅ Відокремлені файли структури (HTML, CSS, JS)

## 🏗️ Використані технології

- **Backend:** Node.js + Express.js
- **Database:** MongoDB Atlas + MongoDB Node.js Driver
- **Frontend:** HTML5 + CSS3 + Vanilla JavaScript
- **Utilities:** dotenv, cors, nodemon

## 🔐 Безпека

- Використовуйте сильні паролі для MongoDB
- Не комітьте `.env` файл з реальними паролями (див. `.gitignore`)
- Додайте в Network Access тільки необхідні IP адреси
- Валідуйте всі вхідні дані на сервері
- Використовуйте HTTPS в production

## 🐛 Усунення неполадок

### Помилка: "MongoDB підключена успішно" не з'являється

- Перевірте, чи MongoDB Atlas URI правильний в `.env`
- Переконайтеся, що пароль не містить спеціальних символів (або екранізуйте їх)
- Перевірте, чи вашому IP дозволено доступ до Atlas (Network Access)

### Помилка: "Cannot find module 'express'"

- Переустановіть залежності: `npm install`

### Помилка: "Port 3000 already in use"

- Змініть PORT в `.env` на вільний порт
- Або знайдіть та закройте програму, що використовує порт 3000

### Помилка при додаванні користувача: "Користувач з таким email вже існує"

- Це нормально - один email не може належати двом користувачам
- Використовуйте новий email

### Помилка: "ID користувача невалідний"

- Переконайтеся, що ви використовуєте валідний MongoDB ObjectId
- ID має містити 24 символи hex: `507f1f77bcf86cd799439011`

## 📞 Можливі розширення

- 🔐 JWT аутентифікація та авторизація
- 📄 Пагінація та лімітація результатів
- 🔍 Пошук і фільтрація користувачів
- ⚙️ Сортування результатів
- 🔄 WebSocket для real-time оновлень
- 📊 Статистика та аналітика
- 📧 Відправка email повідомлень
- 🖼️ Завантаження аватарів користувачів

## 🚀 Deployment

### Heroku

```bash
heroku create your-app-name
git push heroku main
```

### Railway.app

```bash
railway up
```

### Vercel (Frontend) + MongoDB Atlas (Backend)

Виконайте інструкції відповідного хостінгу.

## 📞 Контакти та помощь

Якщо у вас виникли питання або проблеми:

1. Перевірте [MongoDB Atlas документацію](https://www.mongodb.com/docs/atlas/)
2. Дивіться розділ "Усунення неполадок" вище
3. Перевірте логи в консолі сервера

## 📄 Ліцензія

ISC

---

Створено для навчання Node.js, Express.js і MongoDB Atlas з використанням MongoDB Node.js Driver.

**Версія:** 1.0.0  
**Останнє оновлення:** 2024-04-06
