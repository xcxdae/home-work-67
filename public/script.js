const API_URL = "/api";

document.addEventListener("DOMContentLoaded", () => {
  loadUsers();
});

async function loadUsers() {
  try {
    showStatus("Завантаження користувачів...", "loading");
    const response = await fetch(`${API_URL}/users`);
    const result = await response.json();

    if (result.success) {
      displayUsers(result.data);
      showStatus(`Завантажено ${result.count} користувачів`, "success");
    } else {
      showStatus("Помилка при завантаженні: " + result.error, "error");
    }
  } catch (error) {
    showStatus("Помилка підключення: " + error.message, "error");
  }
}

async function addUser() {
  const name = document.getElementById("name").value.trim();
  const email = document.getElementById("email").value.trim();
  const age = document.getElementById("age").value;
  const city = document.getElementById("city").value.trim();

  if (!name || !email) {
    showStatus("Будь ласка, заповніть ім'я та email", "error");
    return;
  }

  try {
    showStatus("Додавання користувача...", "loading");
    const response = await fetch(`${API_URL}/users`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name,
        email,
        age: age ? parseInt(age) : undefined,
        city,
      }),
    });

    const result = await response.json();

    if (result.success) {
      showStatus("✓ Користувач успішно додан!", "success");
      clearForm();
      loadUsers();
    } else {
      showStatus("Помилка: " + result.error, "error");
    }
  } catch (error) {
    showStatus("Помилка при додаванні: " + error.message, "error");
  }
}

async function deleteUser(id) {
  if (!confirm("Ви впевнені, що хочете видалити користувача?")) return;

  try {
    showStatus("Видалення користувача...", "loading");
    const response = await fetch(`${API_URL}/users/${id}`, {
      method: "DELETE",
    });

    const result = await response.json();

    if (result.success) {
      showStatus("✓ Користувач успішно видалений!", "success");
      loadUsers();
    } else {
      showStatus("Помилка: " + result.error, "error");
    }
  } catch (error) {
    showStatus("Помилка при видаленні: " + error.message, "error");
  }
}

function displayUsers(users) {
  const usersList = document.getElementById("usersList");

  if (users.length === 0) {
    usersList.innerHTML = `
      <div class="empty-state" style="grid-column: 1/-1;">
        <p>📭 Немає користувачів</p>
        <p>Додайте першого користувача за допомогою форми вище</p>
      </div>
    `;
    return;
  }

  usersList.innerHTML = users
    .map(
      (user) => `
    <div class="user-card">
      <h3>👤 ${escapeHtml(user.name)}</h3>
      <div class="user-info">
        <strong>Email:</strong> ${escapeHtml(user.email)}
      </div>
      ${user.age ? `<div class="user-info"><strong>Вік:</strong> ${user.age}</div>` : ""}
      ${user.city ? `<div class="user-info"><strong>Місто:</strong> ${escapeHtml(user.city)}</div>` : ""}
      <div class="user-info">
        <strong>ID:</strong> <small>${user._id}</small>
      </div>
      <div class="user-info">
        <strong>Створено:</strong> ${new Date(user.createdAt).toLocaleDateString("uk-UA")}
      </div>
      <div class="user-actions">
        <button class="btn-delete" onclick="deleteUser('${user._id}')">🗑️ Видалити</button>
      </div>
    </div>
  `,
    )
    .join("");
}

function clearForm() {
  document.getElementById("name").value = "";
  document.getElementById("email").value = "";
  document.getElementById("age").value = "";
  document.getElementById("city").value = "";
  document.getElementById("status").textContent = "";
  document.getElementById("status").style.display = "none";
}

function showStatus(message, type) {
  const status = document.getElementById("status");
  status.textContent = message;
  status.className = "status-" + type;
  setTimeout(() => {
    if (type === "success" || type === "error") {
      status.style.display = "none";
    }
  }, 5000);
}

function escapeHtml(text) {
  const map = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;",
  };
  return text.replace(/[&<>"']/g, (m) => map[m]);
}
