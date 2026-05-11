const API = "https://backend-todo-3d74.onrender.com";

let tareasGlobal = [];
let filtroActual = "todas";

function getToken() {
  return localStorage.getItem("token");
}

function authHeaders() {
  const token = getToken();

  return {
    "Content-Type": "application/json",
    ...(token && { "Authorization": `Bearer ${token}` })
};
}
function toggleTheme() {
  document.body.classList.toggle("dark");

  const isDark = document.body.classList.contains("dark");
  localStorage.setItem("theme", isDark ? "dark" : "light");
}

function loadTheme() {
  if (localStorage.getItem("theme") === "dark") {
    document.body.classList.add("dark");
    document.getElementById("themeToggle").checked = true;
  }
}
function actualizarFechaHora() {
  const ahora = new Date();

  document.getElementById("fechaHora").textContent =
    ahora.toLocaleString("es-MX", {
      weekday: "short",
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit"
    });
}

function logout() {
  localStorage.removeItem("token");

  tareasGlobal = [];

  document.getElementById("lista").innerHTML = "";

  document.getElementById("welcomeMsg").textContent = "";

  document.getElementById("loginBox").style.display = "block";
  document.getElementById("app").style.display = "none";
}
async function register() {

  const nombre = document.getElementById("rnombre").value;
  const email = document.getElementById("remail").value;
  const password = document.getElementById("rpassword").value;

  const res = await fetch(`${API}/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ nombre, email, password })
  });

  const data = await res.json();

  if (res.ok) {
    alert("Usuario creado ✅ ahora inicia sesión");
  } else {
    alert(data.error || "Error al registrar");
  }
}

async function login() {

  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  const res = await fetch(`${API}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password })
  });

  const data = await res.json();


  if (res.ok && data.token) {

    localStorage.setItem("token", data.token);

    document.getElementById("welcomeMsg").textContent =
  "👋 Bienvenido " + email;

  
    document.getElementById("loginBox").style.display = "none";
    document.getElementById("app").style.display = "block";
    cargarTareas();

  } else {
    alert("Login incorrecto ❌");
  }

}

async function cargarTareas() {
  const token = getToken();
  if (!token) {
    document.getElementById("loginBox").style.display = "block";
     document.getElementById("app").style.display = "none";
    return;
  }
  const res = await fetch(`${API}/tareas`, {
    headers: authHeaders()
  });

  if (!res.ok) {
    localStorage.removeItem("token");
    document.getElementById("loginBox").style.display = "block";
     document.getElementById("app").style.display = "none";
    return;
  }

  tareasGlobal = await res.json();

  renderizar();

}
function renderizar() {

  let data = tareasGlobal;

  if (filtroActual === "pendientes") {
    data = data.filter(t => !t.hecha);
  }

  if (filtroActual === "completadas") {
    data = data.filter(t => t.hecha);
  }

  const lista = document.getElementById("lista");
  lista.innerHTML = "";

  data.forEach(t => {

    const li = document.createElement("li");

    const texto = document.createElement("span");
    texto.textContent = t.titulo;
     if (t.hecha) {
      texto.classList.add("done");
     }

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = t.hecha;

    checkbox.onchange = async () => {

      await fetch(`${API}/tareas/${t.id}`, {
        method: "PUT",
        headers: authHeaders(),
        body: JSON.stringify({ hecha: checkbox.checked })
      });

      cargarTareas();

    };
    
    const editBtn = document.createElement("button");
    editBtn.textContent = "✏️";
    editBtn.classList.add("btn-edit");

    editBtn.onclick = async () => {

      const nuevo = prompt("Editar tarea:", t.titulo);

      if (!nuevo) return;

      await fetch(`${API}/tareas/${t.id}`, {
        method: "PUT",
        headers: authHeaders(),
        body: JSON.stringify({ titulo: nuevo })
      });

      cargarTareas();

    };

    const delBtn = document.createElement("button");
    delBtn.textContent = "🗑️";
    delBtn.classList.add("btn-delete");

    delBtn.onclick = async () => {

      await fetch(`${API}/tareas/${t.id}`, {
        method: "DELETE",
        headers: authHeaders()
      });

      cargarTareas();

    };

    li.appendChild(checkbox);
    li.appendChild(texto);
    li.appendChild(editBtn);
    li.appendChild(delBtn);

    lista.appendChild(li);

   });
  document.getElementById("total").textContent = tareasGlobal.length;
  document.getElementById("pendientes").textContent =
    tareasGlobal.filter(t => !t.hecha).length;
  document.getElementById("completadas").textContent =
    tareasGlobal.filter(t => t.hecha).length;
}
function filtro(tipo) {
  filtroActual = tipo;
  renderizar();
}
async function agregarTarea() {

  const input = document.getElementById("tarea");
  const texto = input.value.trim();

  if (!texto) return;

  await fetch(`${API}/tareas`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ titulo: texto })
  });

  input.value = "";
  cargarTareas();

}
window.onload = () => {
  loadTheme();
  actualizarFechaHora();
  setInterval(actualizarFechaHora, 1000);
  const token = getToken();

  const loginBox = document.getElementById("loginBox");
  const app = document.getElementById("app");

  if (token) {
    loginBox.style.display = "none";
    app.style.display = "block";
    cargarTareas();
  } else {
    loginBox.style.display = "block";
    app.style.display = "none"; 

    document.getElementById("welcomeMsg").textContent = "";
  }
};
function togglePassword() {
  const pass = document.getElementById("rpassword");

  if (pass.type === "password") {
    pass.type = "text";
  } else {
    pass.type = "password";
  }
}
function toggleLoginPassword() {
  const pass = document.getElementById("password");

  if (pass.type === "password") {
    pass.type = "text";
  } else {
    pass.type = "password";
  }
}
function logout() {
  localStorage.removeItem("token");

  tareasGlobal = [];

  document.getElementById("lista").innerHTML = "";
  
  document.getElementById("welcomeMsg").textContent = "";
  
  document.getElementById("loginBox").style.display = "block";
  document.getElementById("app").style.display = "none";
}