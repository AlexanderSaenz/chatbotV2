const toggleBtn = document.getElementById('chat-toggle');
const chatContainer = document.getElementById('chatbot-container');
const chatLog = document.getElementById('chat-log');
let bienvenidaMostrada = false;
let formularioActivo = false;

const programas = {
  maestria: [
    "• Maestría en Gestión Minera (Inicio: 04-abr-2025)",
    "• MBA Global STEM (Inicio: 15-ago-2025)"
  ],
  diplomado: [
    "• Diplomado en Gestión de Datos (Inicio: 29-ago-2025)"
  ],
  programa: [
    "• Gestión de Operaciones Subterráneas (Inicio: 18-jul-2025)"
  ],
  curso: [
    "• Costos y Finanzas Mineras (Inicio: 31-ene-2025)",
    "• IA para Minería (Inicio: 25-ago-2025)"
  ]
};

// Mostrar u ocultar el chatbot
toggleBtn.addEventListener('click', () => {
  if (chatContainer.style.display === 'flex') {
    chatContainer.style.display = 'none';
  } else {
    chatContainer.style.display = 'flex';
    if (!bienvenidaMostrada) {
      mostrarBienvenida();
      bienvenidaMostrada = true;
    }
  }
});

function mostrarBienvenida() {
  addMessage(`👋 ¡Hola! Bienvenido(a) a GERENS.\nSelecciona una opción para empezar:`, 'bot');
  mostrarOpciones();
}

// Mostrar opciones del menú principal
function mostrarOpciones() {
  const opciones = [
    { texto: "📘 Ver maestrías", tipo: "maestria" },
    { texto: "📗 Ver diplomados", tipo: "diplomado" },
    { texto: "📙 Ver programas de especialización", tipo: "programa" },
    { texto: "📕 Ver cursos", tipo: "curso" },
    { texto: "📝 Dejar mis datos", tipo: "formulario" }
  ];

  opciones.forEach(op => {
    const btn = document.createElement('button');
    btn.innerText = op.texto;
    btn.className = 'option-btn';
    btn.onclick = () => manejarOpcion(op.tipo);
    chatLog.appendChild(btn);
  });

  chatLog.scrollTop = chatLog.scrollHeight;
}

function manejarOpcion(tipo) {
  if (tipo === "formulario") {
    mostrarFormulario();
    return;
  }

  const items = programas[tipo] || [];
  if (items.length === 0) {
    addMessage(`⚠️ No hay ${tipo}s disponibles en este momento.`, 'bot');
  } else {
    addMessage(`📋 Estos son nuestros ${tipo}s disponibles:\n${items.join("\n")}`, 'bot');
  }

  // Volver a mostrar menú después
  setTimeout(() => {
    addMessage(`¿Deseas ver otra opción?`, 'bot');
    mostrarOpciones();
  }, 1000);
}

// Agregar mensaje al chat
function addMessage(text, sender) {
  const msg = document.createElement('div');
  msg.className = `msg ${sender}-msg`;
  msg.innerText = text;
  chatLog.appendChild(msg);
  chatLog.scrollTop = chatLog.scrollHeight;
}

// Mostrar formulario
function mostrarFormulario() {
  if (formularioActivo) return;
  formularioActivo = true;

  const formDiv = document.createElement('div');
  formDiv.className = "inline-form";
  formDiv.innerHTML = `
    <input type="text" id="nombre" placeholder="Nombre completo" required />
    <input type="text" id="telefono" placeholder="Teléfono" required />
    <input type="email" id="correo" placeholder="Correo electrónico" />
    <input type="text" id="programa" placeholder="Programa de interés" />
    <button class="form-btn" id="enviarForm">Enviar</button>
  `;
  chatLog.appendChild(formDiv);
  chatLog.scrollTop = chatLog.scrollHeight;

  document.getElementById('enviarForm').onclick = enviarFormulario;
}

// Enviar formulario al webhook
async function enviarFormulario() {
  const nombre = document.getElementById('nombre').value.trim();
  const telefono = document.getElementById('telefono').value.trim();
  const correo = document.getElementById('correo').value.trim();
  const programa = document.getElementById('programa').value.trim();

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

  formularioActivo = false;
}
