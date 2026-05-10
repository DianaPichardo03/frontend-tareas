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
    "Authorization": token ? `Bearer ${token}` : ""
  };
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

   console.log(data);

  if (data.token) {
    localStorage.setItem("token", data.token);

    document.getElementById("loginBox").style.display = "none";
    document.getElementById("app").style.display = "block";
    
    cargarTareas();

  } else {
    alert(data.error ||"Login incorrecto ❌");
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
  const token = getToken();

  if (token) {
    document.getElementById("loginBox").style.display = "none";
    document.getElementById("app").style.display = "block";
    cargarTareas();
  } else {
    document.getElementById("loginBox").style.display = "block";
    document.getElementById("app").style.display = "block";
  }
};