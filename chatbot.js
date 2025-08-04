// VARIABLES GLOBALES
const toggleBtn = document.getElementById('chat-toggle');
const chatContainer = document.getElementById('chatbot-container');
const chatLog = document.getElementById('chat-log');
let bienvenidaMostrada = false;
let formularioActivo = false;
let sessionId = "session-" + Math.random().toString(36).substr(2, 9);
let todosLosProgramas = []; // se llena luego

// BOTÓN FLOTANTE
toggleBtn.addEventListener('click', () => {
  chatContainer.style.display = chatContainer.style.display === 'flex' ? 'none' : 'flex';
  if (!bienvenidaMostrada) {
    mostrarBienvenida();
    bienvenidaMostrada = true;
  }
});

// BIENVENIDA
function mostrarBienvenida() {
  clearChat();
  addMessage("👋 ¡Hola! Bienvenido(a) a GĚRENS. ¿En qué podemos ayudarte?", 'bot');
  chatLog.appendChild(crearBoton("🎓 Ver cursos disponibles", mostrarProgramas));
  chatLog.appendChild(crearBoton("📝 Dejar mis datos", () => mostrarFormulario()));
  chatLog.appendChild(crearBoton("ℹ️ Información sobre GERENS", mostrarInfo));
  scrollToBottom();
}

function mostrarInfo() {
  clearChat();
  addMessage("Somos GERENS, líderes en formación ejecutiva especializada en gestión minera. Contamos con maestrías, diplomados y cursos diseñados para el sector.", 'bot');
  chatLog.appendChild(crearBoton("🔙 Volver al inicio", mostrarBienvenida));
  scrollToBottom();
}

// VER PROGRAMAS POR TIPO
function mostrarProgramas() {
  clearChat();
  addMessage("🎓 ¿Qué tipo de programa te interesa ver?", "bot");
  ["maestría", "diplomado", "programa", "curso"].forEach(tipo => {
    chatLog.appendChild(crearBoton(capitalize(tipo) + "s", () => mostrarListaPorTipo(tipo)));
  });
  chatLog.appendChild(crearBoton("🔙 Volver al inicio", mostrarBienvenida));
  scrollToBottom();
}

function mostrarListaPorTipo(tipo) {
  clearChat();
  const programasFiltrados = todosLosProgramas
    .filter(p => p.tipo === tipo)
    .sort((a, b) => new Date(fechaParseada(a.inicio)) - new Date(fechaParseada(b.inicio)));

  if (programasFiltrados.length === 0) {
    addMessage(`⚠️ No hay ${tipo}s disponibles en este momento.`, 'bot');
    chatLog.appendChild(crearBoton("🔙 Volver", mostrarProgramas));
    return;
  }

  addMessage(`📚 ${capitalize(tipo)}s disponibles:`, "bot");
  programasFiltrados.forEach(p => {
    const msg = document.createElement("div");
    msg.className = "msg bot-msg";
    msg.innerText = `• ${p.programa} (Inicio: ${p.inicio})`;
    const btn = crearBoton("🔎 Ver detalles", () => mostrarDetalle(p.id));
    chatLog.appendChild(msg);
    chatLog.appendChild(btn);
  });

  chatLog.appendChild(crearBoton("🔙 Volver", mostrarProgramas));
  scrollToBottom();
}

function mostrarDetalle(id) {
  const p = todosLosProgramas.find(x => x.id === id);
  if (!p) return;

  clearChat();
  addMessage(`📌 ${p.programa}\n\n🕒 Inicio: ${p.inicio}\n📅 Duración: ${p.duracion}\n🎯 ${p.descripcion || "Descripción no disponible."}`, "bot");

  const sugerencia = document.createElement('div');
  sugerencia.className = 'msg bot-msg';
  sugerencia.innerText = "¿Te interesa este curso? Puedes dejar tus datos y te contactamos.";
  chatLog.appendChild(sugerencia);

  chatLog.appendChild(crearBoton("📝 Dejar mis datos", () => mostrarFormulario(p.programa)));
  chatLog.appendChild(crearBoton("🔙 Volver al inicio", mostrarBienvenida));
  scrollToBottom();
}

// FORMULARIO DE CONTACTO
function mostrarFormulario(programaPreseleccionado = "") {
  if (programaPreseleccionado instanceof PointerEvent || typeof programaPreseleccionado !== 'string') {
    programaPreseleccionado = "";
  }

  clearChat();
  addMessage("📝 Por favor completa tus datos:", "bot");

  const opcionesPrograma = todosLosProgramas
    .map(p => `<option value="${p.programa}" ${p.programa === programaPreseleccionado ? "selected" : ""}>${p.programa}</option>`)
    .sort()
    .join("") + `<option value="No estoy seguro">No estoy seguro</option>`;

  const formDiv = document.createElement('div');
  formDiv.className = "inline-form";
  formDiv.innerHTML = `
    <input type="text" id="nombre" placeholder="Nombre completo" required />
    <input type="text" id="telefono" placeholder="Teléfono" required />
    <input type="email" id="correo" placeholder="Correo electrónico" />
    <label for="programa">Programa de interés:</label>
    <select id="programa">${opcionesPrograma}</select>
    <div class="form-buttons">
      <button class="form-btn" id="enviarForm">Enviar</button>
      <button class="form-btn back" onclick="mostrarBienvenida()">Volver</button>
    </div>
  `;
  chatLog.appendChild(formDiv);
  scrollToBottom();

  document.getElementById('enviarForm').onclick = enviarFormulario;
}

async function enviarFormulario() {
  const nombre = document.getElementById('nombre').value.trim();
  const telefono = document.getElementById('telefono').value.trim();
  const correo = document.getElementById('correo').value.trim();
  const programa = document.getElementById('programa')?.value || "";

  if (!nombre || !telefono) {
    alert("Nombre y teléfono son obligatorios");
    return;
  }

  addMessage("Enviando datos...", "bot");

  try {
    const response = await fetch("https://automations.gerens.edu.pe/webhook/formulario", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nombre,
        telefono,
        correo,
        programa,
        sessionId: "session-" + Date.now(),
        enviar_informacion: true
      })
    });

    const data = await response.json();
    addMessage(data.mensaje || "✅ ¡Datos enviados con éxito!", "bot");
  } catch (error) {
    addMessage("❌ Error al enviar los datos. Intenta más tarde.", "bot");
  }
}

// FUNCIONES AUXILIARES
function addMessage(text, sender) {
  const msg = document.createElement('div');
  msg.className = `msg ${sender}-msg`;
  msg.innerText = text;
  chatLog.appendChild(msg);
  scrollToBottom();
}

function crearBoton(texto, handler) {
  const btn = document.createElement('button');
  btn.className = 'option-btn';
  btn.innerText = texto;
  btn.onclick = handler;
  return btn;
}

function scrollToBottom() {
  chatLog.scrollTop = chatLog.scrollHeight;
}

function clearChat() {
  chatLog.innerHTML = '';
  formularioActivo = false;
}

function capitalize(texto) {
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}

function fechaParseada(texto) {
  const meses = {
    'ene': '01', 'feb': '02', 'mar': '03', 'abr': '04', 'may': '05', 'jun': '06',
    'jul': '07', 'ago': '08', 'sep': '09', 'oct': '10', 'nov': '11', 'dic': '12'
  };
  const partes = texto.toLowerCase().split('-');
  return `${partes[2]}-${meses[partes[1]]}-${partes[0]}`;
}

// CARGAR PROGRAMAS
/*fetch("programas.json")
  .then(res => res.json())
  .then(data => {
    todosLosProgramas = data.map((p, i) => ({ ...p, id: i }));
  });*/

  // CARGAR JSON EXTERNO DESDE GOOGLE DRIVE
fetch("https://raw.githubusercontent.com/AlexanderSaenz/chatbotV2/master/programas.json")
  .then(res => res.json())
  .then(data => {
    todosLosProgramas = data;
  });

