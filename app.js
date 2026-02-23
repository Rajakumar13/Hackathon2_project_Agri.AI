/**
 * Agri AI - Frontend application
 * Role selection, dashboards, API calls, i18n, voice control, sample images
 * AI bot asks for role via microphone/speaker on open
 */

const API = "/api";
let currentRole = null;
let currentLang = "en";
let i18n = {};
let recognition = null;
let roleRecognition = null;
let voiceBotActive = false;

// ---------- Stored role/voice input (sessionStorage) ----------
function storeRoleSelection(role, voiceInput) {
  try {
    sessionStorage.setItem("agri_selected_role", role);
    sessionStorage.setItem("agri_voice_input", voiceInput || "");
    sessionStorage.setItem("agri_role_at", new Date().toISOString());
  } catch (_) {}
}

// ---------- Select role (shared by click and voice) ----------
function selectRole(role, voiceInput) {
  const el = document.querySelector(`.role-card[data-role="${role}"]`);
  if (!el) return;
  currentRole = role;
  storeRoleSelection(role, voiceInput);
  document.getElementById("role-screen").classList.add("hidden");
  document.getElementById("dashboard").classList.remove("hidden");
  document.querySelectorAll("[id^='panel-']").forEach((p) => p.classList.add("hidden"));
  const panel = document.getElementById(`panel-${currentRole}`);
  if (panel) panel.classList.remove("hidden");
  const badge = document.getElementById("role-badge");
  badge.textContent = currentRole.charAt(0).toUpperCase() + currentRole.slice(1);
  badge.className = "px-3 py-1 rounded-full text-sm font-medium " +
    (currentRole === "farmer" ? "bg-green-100 text-green-800" : currentRole === "seller" ? "bg-amber-100 text-amber-800" : "bg-sky-100 text-sky-800");
  loadSampleImagesForRole();
  stopRoleVoiceBot();
  setBackgroundForRole(role);
  showChatbotForRole(role);
}

// ---------- Role selection (click) ----------
document.querySelectorAll(".role-card").forEach((el) => {
  el.addEventListener("click", () => selectRole(el.getAttribute("data-role"), null));
});

document.getElementById("back-to-role").addEventListener("click", () => {
  document.getElementById("dashboard").classList.add("hidden");
  document.getElementById("role-screen").classList.remove("hidden");
  currentRole = null;
  stopRoleVoiceBot();
  hideVoiceBotBubble();
  document.getElementById("voice-bot-text").textContent = "Welcome to Agri AI. Are you a Farmer, Seller, or Buyer? Click the button below to answer by voice, or choose a card.";
  showVoiceBotBubble(false);
  setBackgroundForRole(null);
  document.getElementById("chatbot-toggle").classList.add("hidden");
  document.getElementById("chatbot-panel").classList.add("hidden");
});

// ---------- AI Voice bot: ask role using microphone & speaker ----------
const WELCOME_SPEECH = "Welcome to Agri AI. Are you a Farmer, Seller, or Buyer? Please say your role.";
const VOICE_BOT_TEXT = "Welcome to Agri AI. Are you a Farmer, Seller, or Buyer? Say your role aloud.";

function speakWelcome() {
  const u = window.speechSynthesis;
  if (!u) return;
  u.cancel();
  const msg = new SpeechSynthesisUtterance(WELCOME_SPEECH);
  msg.lang = "en-IN";
  msg.rate = 0.9;
  u.speak(msg);
}

function showVoiceBotBubble(listening) {
  const bubble = document.getElementById("voice-bot-bubble");
  const textEl = document.getElementById("voice-bot-text");
  const listeningEl = document.getElementById("voice-bot-listening");
  if (!bubble || !textEl) return;
  bubble.classList.remove("hidden");
  textEl.textContent = VOICE_BOT_TEXT;
  if (listeningEl) listeningEl.classList.toggle("hidden", !listening);
}

function hideVoiceBotBubble() {
  const bubble = document.getElementById("voice-bot-bubble");
  if (bubble) bubble.classList.add("hidden");
}

function stopRoleVoiceBot() {
  if (roleRecognition) {
    try { roleRecognition.stop(); } catch (_) {}
    roleRecognition = null;
  }
  document.getElementById("voice-bot-listening")?.classList.add("hidden");
  voiceBotActive = false;
  document.getElementById("voice-bot-btn-icon").textContent = "🎤";
  document.getElementById("voice-bot-btn-label").textContent = "Ask my role by voice";
}

function startRoleVoiceBot() {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    alert("Voice recognition is not supported in this browser. Try Chrome or Edge.");
    return;
  }
  showVoiceBotBubble(true);
  speakWelcome();
  voiceBotActive = true;
  document.getElementById("voice-bot-btn-icon").textContent = "⏹";
  document.getElementById("voice-bot-btn-label").textContent = "Stop listening";
  roleRecognition = new SpeechRecognition();
  roleRecognition.continuous = true;
  roleRecognition.interimResults = false;
  roleRecognition.lang = "en-IN";
  roleRecognition.onresult = (e) => {
    const last = e.results[e.results.length - 1];
    const transcript = (last[0].transcript || "").trim();
    const text = transcript.toLowerCase();
    let chosen = null;
    if (text.includes("farmer")) chosen = "farmer";
    else if (text.includes("seller")) chosen = "seller";
    else if (text.includes("buyer")) chosen = "buyer";
    if (chosen) {
      stopRoleVoiceBot();
      const roleLabel = chosen.charAt(0).toUpperCase() + chosen.slice(1);
      document.getElementById("voice-bot-text").textContent = `You said: "${transcript}". Role set: ${roleLabel}. Navigating to your dashboard...`;
      document.getElementById("voice-bot-listening")?.classList.add("hidden");
      const u = window.speechSynthesis;
      if (u) {
        u.cancel();
        const msg = new SpeechSynthesisUtterance(`You selected ${roleLabel}. Taking you to your dashboard.`);
        msg.lang = "en-IN";
        msg.rate = 0.9;
        u.speak(msg);
      }
      setTimeout(() => selectRole(chosen, transcript), 800);
    }
  };
  roleRecognition.onerror = () => { showVoiceBotBubble(true); };
  roleRecognition.onend = () => {
    if (voiceBotActive && !currentRole) {
      try { roleRecognition.start(); } catch (_) {}
    }
  };
  try { roleRecognition.start(); } catch (_) {}
}

document.getElementById("toggle-voice-bot").addEventListener("click", () => {
  if (voiceBotActive) {
    stopRoleVoiceBot();
    hideVoiceBotBubble();
  } else {
    startRoleVoiceBot();
  }
});

// On open: AI bot asks for role using speaker (and shows bubble)
setTimeout(() => {
  speakWelcome();
  showVoiceBotBubble(false);
  document.getElementById("voice-bot-text").textContent = "Welcome to Agri AI. Are you a Farmer, Seller, or Buyer? Click the button below to answer by voice, or choose a card.";
}, 600);

// ---------- Role-specific background ----------
function setBackgroundForRole(role) {
  const body = document.getElementById("body-bg") || document.body;
  body.classList.remove("bg-role-farmer", "bg-role-seller", "bg-role-buyer");
  if (role) body.classList.add("bg-role-" + role);
}

// ---------- Chatbot: role-based, right bottom ----------
const CHATBOT_WELCOME = {
  farmer: "Hi! You're in **Farmer** mode. I can help with: crop prediction (soil, season, water), fertilizer recommendations, plant disease detection, and step-by-step cultivation guidance. Ask me anything—e.g. 'best crop for black soil', 'fertilizer for wheat', or 'how to grow rice'.",
  seller: "Hi! You're in **Seller** mode. I can help with: listing your crops and quantity, setting prices, and seeing buyer interest. Ask me how to add crops, set prices, or check notifications.",
  buyer: "Hi! You're in **Buyer** mode. I can help with: finding sellers by crop, location, and budget, and tracking delivery. Ask me how to find crops, match with sellers, or track your order.",
};

function escapeHtml(s) {
  const div = document.createElement("div");
  div.textContent = s;
  return div.innerHTML;
}

function renderMarkdownSimple(text) {
  return escapeHtml(text).replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
}

function appendChatMessage(content, isBot) {
  const container = document.getElementById("chatbot-messages");
  if (!container) return;
  const div = document.createElement("div");
  div.className = "chat-msg " + (isBot ? "bot" : "user");
  div.innerHTML = isBot ? renderMarkdownSimple(content) : escapeHtml(content);
  container.appendChild(div);
  container.scrollTop = container.scrollHeight;
}

function getChatbotReply(userText, role) {
  const t = (userText || "").toLowerCase().trim();
  if (!role) return "Please select your role (Farmer, Seller, or Buyer) first.";
  if (role === "farmer") {
    if (/crop|soil|season|water|predict|recommend|best crop/.test(t)) return "Use the **Crop Prediction** section: choose soil color, previous crop, season, and water availability, then click 'Predict Best Crop'. I'll recommend suitable crops based on your inputs.";
    if (/fertilizer|fertilisers|urea|dap|npk/.test(t)) return "Use **Fertilizer Recommendation**: enter your crop name (and optional disease). You'll get base and corrective fertilizer suggestions for better yield.";
    if (/disease|leaf spot|blight|sick|plant health/.test(t)) return "Use **Disease Detection**: upload a clear photo of the affected leaf or plant. Our AI will suggest a possible diagnosis and remedy. For accurate results, use a well-lit, close-up image.";
    if (/cultivation|grow|sowing|harvest|procedure|steps/.test(t)) return "Use **Cultivation Guide** or **Complete procedure planning**: type the crop name (e.g. rice, wheat) and get step-by-step guidance from land preparation to post-harvest storage.";
    if (/hello|hi|help/.test(t)) return CHATBOT_WELCOME.farmer;
    return "As a farmer, I can help with crop prediction, fertilizers, disease detection, and cultivation steps. Use the cards above, or ask: 'best crop for my soil', 'fertilizer for wheat', or 'how to grow rice'.";
  }
  if (role === "seller") {
    if (/list|add crop|quantity|price|profile/.test(t)) return "Go to **Seller profile & crop quantity**: enter your name, location (lat/lon), then add each crop with name, quantity, unit price, and quality (1–10). Click 'Save profile' to register.";
    if (/buyer|interest|notification|order/.test(t)) return "Check **Buyer interest & notifications**: click 'Refresh' to see buyers interested in your crops. You can respond to them from the list or popup.";
    if (/hello|hi|help/.test(t)) return CHATBOT_WELCOME.seller;
    return "As a seller, I can help you list crops, set prices, and see buyer interest. Ask: 'how to add crops', 'how to set price', or 'check notifications'.";
  }
  if (role === "buyer") {
    if (/find|match|seller|crop|budget|buy/.test(t)) return "Use **Buyer-Seller Match**: enter the crop you want, max budget (₹), and your location (lat, lon). Click 'Find matches' to see nearby sellers with that crop, price, and quality score.";
    if (/delivery|track|tracking|order status/.test(t)) return "Use **Delivery Tracking**: enter your tracking ID (e.g. DEMO001) and click 'Track'. You can also create a new delivery with origin and destination to get a tracking ID.";
    if (/hello|hi|help/.test(t)) return CHATBOT_WELCOME.buyer;
    return "As a buyer, I can help you find sellers and track delivery. Ask: 'how to find wheat', 'match by budget', or 'track my order'.";
  }
  return "Select your role to get relevant help. You can choose Farmer, Seller, or Buyer from the main screen.";
}

function showChatbotForRole(role) {
  const panel = document.getElementById("chatbot-panel");
  const toggle = document.getElementById("chatbot-toggle");
  const messages = document.getElementById("chatbot-messages");
  const title = document.getElementById("chatbot-title");
  if (!panel || !toggle || !messages) return;
  toggle.classList.remove("hidden");
  title.textContent = "Agri AI – " + (role ? role.charAt(0).toUpperCase() + role.slice(1) : "Assistant");
  messages.innerHTML = "";
  if (role && CHATBOT_WELCOME[role]) {
    appendChatMessage(CHATBOT_WELCOME[role], true);
  }
}

document.getElementById("chatbot-toggle").addEventListener("click", () => {
  const panel = document.getElementById("chatbot-panel");
  panel.classList.remove("hidden");
  document.getElementById("chatbot-toggle").classList.add("hidden");
  document.getElementById("chatbot-input").focus();
});
document.getElementById("chatbot-close").addEventListener("click", closeChatbot);

document.getElementById("chatbot-panel").addEventListener("click", (e) => {
  if (e.target.id === "chatbot-panel" || e.target.classList.contains("chatbot-messages")) return;
});

function closeChatbot() {
  document.getElementById("chatbot-panel").classList.add("hidden");
  if (currentRole) document.getElementById("chatbot-toggle").classList.remove("hidden");
}

document.getElementById("chatbot-send").addEventListener("click", sendChatMessage);
document.getElementById("chatbot-input").addEventListener("keydown", (e) => {
  if (e.key === "Enter") sendChatMessage();
});

function sendChatMessage() {
  const input = document.getElementById("chatbot-input");
  const text = (input && input.value || "").trim();
  if (!text) return;
  input.value = "";
  appendChatMessage(text, false);
  const reply = getChatbotReply(text, currentRole);
  setTimeout(() => appendChatMessage(reply, true), 300);
}

// ---------- i18n ----------
async function loadI18n(lang) {
  const res = await fetch(`${API}/i18n/${lang}`);
  i18n = await res.json();
  document.querySelectorAll("[data-i18n]").forEach((el) => {
    const key = el.getAttribute("data-i18n");
    if (i18n[key]) el.textContent = i18n[key];
  });
}

document.getElementById("lang-select").addEventListener("change", (e) => {
  currentLang = e.target.value;
  loadI18n(currentLang);
});

// ---------- Farmer: Crop prediction ----------
document.getElementById("btn-predict-crop").addEventListener("click", async () => {
  const soil_color = document.getElementById("soil-color").value;
  const previous_crop = document.getElementById("previous-crop").value;
  const season = document.getElementById("season").value;
  const water_availability = document.getElementById("water-availability").value;
  const res = await fetch(`${API}/predict-crop`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ soil_color, previous_crop, season, water_availability }),
  });
  const data = await res.json();
  const container = document.getElementById("crop-result");
  container.classList.remove("hidden");
  container.querySelector("p").textContent = data.message || "Recommended crops:";
  const cards = document.getElementById("crop-cards");
  cards.innerHTML = data.recommended_crops.map((c) =>
    `<span class="inline-block px-3 py-1 rounded-full bg-green-100 text-green-800 text-sm font-medium">${c.name}</span>`
  ).join("");
  document.getElementById("fertilizer-crop").value = (data.recommended_crops[0] && data.recommended_crops[0].key) || "";
  const imgBox = document.getElementById("crop-sample-img");
  loadSampleImage("crops", imgBox);
});

// ---------- Farmer: Fertilizer ----------
document.getElementById("btn-fertilizer").addEventListener("click", async () => {
  const crop = document.getElementById("fertilizer-crop").value;
  const disease_detected = document.getElementById("fertilizer-disease").value || null;
  const res = await fetch(`${API}/fertilizer`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ crop, disease_detected }),
  });
  const data = await res.json();
  const container = document.getElementById("fertilizer-result");
  container.classList.remove("hidden");
  const list = [...(data.base_fertilizers || []), ...(data.corrective_fertilizers || [])];
  document.getElementById("fertilizer-list").innerHTML = list.map((f) => `<li>${f}</li>`).join("");
  loadSampleImage("fertilizers", document.getElementById("fert-sample-img"));
});

// ---------- Farmer: Disease detection ----------
document.getElementById("btn-disease").addEventListener("click", async () => {
  const input = document.getElementById("disease-image");
  if (!input.files || !input.files[0]) {
    alert("Please select an image.");
    return;
  }
  const form = new FormData();
  form.append("image", input.files[0]);
  const res = await fetch(`${API}/disease-predict`, { method: "POST", body: form });
  const data = await res.json();
  const container = document.getElementById("disease-result");
  container.classList.remove("hidden");
  container.querySelector("p.font-medium").textContent = `${data.label || "Result"} (${(data.confidence * 100).toFixed(0)}% confidence)`;
  container.querySelector("p.remedy").textContent = data.remedy || "";
  const imgBox = document.getElementById("disease-sample-img");
  if (data.uploaded_url) {
    imgBox.innerHTML = `<img src="${data.uploaded_url}" alt="Uploaded" class="w-full h-full object-cover" />`;
  } else {
    loadSampleImage("diseases", imgBox);
  }
});

// ---------- Farmer: Cultivation guide ----------
document.getElementById("btn-cultivation").addEventListener("click", async () => {
  const crop = document.getElementById("cultivation-crop").value.trim() || "rice";
  const res = await fetch(`${API}/cultivation/${encodeURIComponent(crop)}`);
  const data = await res.json();
  const container = document.getElementById("cultivation-result");
  container.classList.remove("hidden");
  document.getElementById("cultivation-steps").innerHTML = (data.steps || []).map(
    (s) => `<li><strong>${s.title}</strong>: ${s.description} <span class="text-stone-500">(${s.duration})</span></li>`
  ).join("");
  loadSampleImage("cultivation", document.getElementById("cult-sample-img"));
});

// ---------- Farmer: Survey ----------
document.getElementById("btn-survey").addEventListener("click", async () => {
  const q1 = document.getElementById("survey-q1").value;
  const q2 = document.getElementById("survey-q2").value;
  const res = await fetch(`${API}/survey`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      role: currentRole,
      responses: { satisfaction: q1, more_regional_language: q2 },
      timestamp: new Date().toISOString(),
    }),
  });
  const data = await res.json();
  if (data.ok) alert("Survey submitted. Thank you!");
});

// ---------- Seller: Add crop row ----------
document.getElementById("btn-add-crop").addEventListener("click", () => {
  const list = document.getElementById("seller-crops-list");
  const div = document.createElement("div");
  div.className = "flex gap-2 flex-wrap items-center";
  div.innerHTML = `
    <input type="text" class="crop-name rounded border px-2 py-1 text-sm" placeholder="Crop name" />
    <input type="number" class="crop-qty rounded border px-2 py-1 text-sm w-20" placeholder="Qty" />
    <input type="number" class="crop-price rounded border px-2 py-1 text-sm w-24" placeholder="Price/unit" />
    <input type="number" class="crop-quality rounded border px-2 py-1 text-sm w-20" placeholder="Quality 1-10" min="1" max="10" />
  `;
  list.appendChild(div);
});

function getSellerCropsFromForm() {
  const rows = document.getElementById("seller-crops-list").querySelectorAll(".flex.gap-2");
  return Array.from(rows).map((row) => {
    const name = row.querySelector(".crop-name")?.value || "";
    const quantity = parseFloat(row.querySelector(".crop-qty")?.value) || 0;
    const unit_price = parseFloat(row.querySelector(".crop-price")?.value) || 0;
    const quality_score = parseFloat(row.querySelector(".crop-quality")?.value) || 5;
    return { name, quantity, unit_price, quality_score };
  }).filter((c) => c.name);
}

// ---------- Seller: Save profile ----------
let currentSellerId = null;
document.getElementById("btn-save-seller").addEventListener("click", async () => {
  const name = document.getElementById("seller-name").value || "Seller";
  const lat = parseFloat(document.getElementById("seller-lat").value) || 0;
  const lon = parseFloat(document.getElementById("seller-lon").value) || 0;
  const crops = getSellerCropsFromForm();
  const res = await fetch(`${API}/sellers`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, location: { lat, lon }, crops }),
  });
  const data = await res.json();
  currentSellerId = data.id;
  alert("Profile saved. Your ID: " + data.id);
});

// ---------- Seller: Notifications ----------
document.getElementById("btn-refresh-notifications").addEventListener("click", loadNotifications);

async function loadNotifications() {
  const url = currentSellerId ? `${API}/notifications?seller_id=${currentSellerId}` : `${API}/notifications`;
  const res = await fetch(url);
  const items = await res.json();
  const list = document.getElementById("notifications-list");
  if (!items.length) {
    list.innerHTML = "<p class='text-stone-500'>No new buyer interest.</p>";
    return;
  }
  list.innerHTML = items.map((n) =>
    `<div class="p-3 rounded-lg border border-amber-200 bg-amber-50">
      <strong>${n.buyer_name || "Buyer"}</strong> interested in <strong>${n.crop}</strong> (Qty: ${n.quantity}). ${n.message ? `<br/>${n.message}` : ""}
    </div>`
  ).join("");
  if (items.length > 0 && currentSellerId) showPopup(items[0]);
}

function showPopup(notification) {
  const overlay = document.getElementById("popup-overlay");
  const content = document.getElementById("popup-content");
  content.innerHTML = `
    <h4 class="font-semibold text-lg text-amber-800">Buyer interest</h4>
    <p class="mt-2 text-stone-600">${notification.buyer_name || "Buyer"} is interested in <strong>${notification.crop}</strong>, quantity: ${notification.quantity}. ${notification.message || ""}</p>
    <button type="button" id="popup-close" class="mt-4 w-full py-2 rounded-lg bg-amber-500 text-white font-medium">Close</button>
  `;
  overlay.classList.remove("hidden");
  content.querySelector("#popup-close").addEventListener("click", () => overlay.classList.add("hidden"));
}

// ---------- Buyer: Match ----------
document.getElementById("btn-match").addEventListener("click", async () => {
  const crop_wanted = document.getElementById("match-crop").value.trim() || "wheat";
  const max_budget = parseFloat(document.getElementById("match-budget").value) || 50000;
  const lat = parseFloat(document.getElementById("match-lat").value) || 28.6;
  const lon = parseFloat(document.getElementById("match-lon").value) || 77.2;
  const buyers = [{ id: "b1", crop_wanted, max_budget, min_quality: 5, location: { lat, lon } }];
  const sellersRes = await fetch(`${API}/sellers`);
  const sellers = await sellersRes.json();
  if (!sellers.length) {
    document.getElementById("match-result").innerHTML = "<p class='text-stone-500'>No sellers in system. Add seller profile first (as Seller role).</p>";
    document.getElementById("match-result").classList.remove("hidden");
    return;
  }
  const res = await fetch(`${API}/match`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ buyers, sellers, max_distance_km: 200 }),
  });
  const data = await res.json();
  const container = document.getElementById("match-result");
  container.classList.remove("hidden");
  if (!data.matches || !data.matches.length) {
    container.innerHTML = "<p class='text-stone-500'>No matches found. Try different crop or budget.</p>";
    return;
  }
  container.innerHTML = data.matches.slice(0, 5).map((m) =>
    `<div class="p-3 rounded-lg border border-sky-200 bg-sky-50 flex flex-wrap items-center justify-between gap-2">
      <span><strong>${m.seller_name}</strong> — ${m.crop}: ${m.quantity} @ ₹${m.unit_price}/unit (Quality: ${m.match_score}, Distance: ${m.distance_km} km)</span>
      <button type="button" class="express-interest py-1 px-3 rounded bg-sky-600 text-white text-xs" data-seller-id="${m.seller_id}" data-crop="${m.crop}" data-quantity="${m.quantity}">Express interest</button>
    </div>`
  ).join("");
  container.querySelectorAll(".express-interest").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const sellerId = btn.getAttribute("data-seller-id");
      const crop = btn.getAttribute("data-crop");
      const quantity = btn.getAttribute("data-quantity");
      await fetch(`${API}/buyer-interest`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ seller_id: sellerId, buyer_id: "b1", buyer_name: "Demo Buyer", crop, quantity, message: "I would like to purchase." }),
      });
      btn.textContent = "Sent!";
      btn.disabled = true;
    });
  });
});

// ---------- Buyer: Delivery tracking ----------
document.getElementById("btn-create-delivery")?.addEventListener("click", async () => {
  const origin = document.getElementById("delivery-origin")?.value || "Origin";
  const dest = document.getElementById("delivery-dest")?.value || "Destination";
  const res = await fetch(`${API}/delivery`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ origin, destination: dest, status: "created", stages: [
      { name: "Order confirmed", done: true },
      { name: "Dispatched", done: false },
      { name: "In transit", done: false },
      { name: "Delivered", done: false },
    ] }),
  });
  const data = await res.json();
  document.getElementById("tracking-id").value = data.tracking_id || "";
  alert("Delivery created. Tracking ID: " + (data.tracking_id || "—"));
});

document.getElementById("btn-track").addEventListener("click", async () => {
  const tid = document.getElementById("tracking-id").value.trim();
  if (!tid) {
    const res = await fetch(`${API}/delivery`);
    const list = await res.json();
    const ids = Array.isArray(list) ? list.map((d) => d.tracking_id).join(", ") : "—";
    alert("Existing tracking IDs: " + (ids || "None. Create one via API or demo."));
    return;
  }
  const res = await fetch(`${API}/delivery?tracking_id=${encodeURIComponent(tid)}`);
  const data = await res.json();
  const container = document.getElementById("delivery-result");
  container.classList.remove("hidden");
  container.querySelector(".status").textContent = "Status: " + (data.status || "N/A");
  container.querySelector(".stages").innerHTML = (data.stages || []).map((s) =>
    `<li>${s.done ? "✓" : "○"} ${s.name}</li>`
  ).join("");
  loadSampleImage("delivery", document.getElementById("delivery-sample-img"));
});

// ---------- Sample images ----------
async function loadSampleImage(feature, container) {
  if (!container) return;
  try {
    const res = await fetch(`${API}/sample-images?feature=${feature}`);
    const urls = await res.json();
    const url = Array.isArray(urls) ? urls[0] : (urls && urls[0]) || null;
    if (url) {
      container.innerHTML = `<img src="${url}" alt="" class="w-full h-full object-cover" />`;
    } else {
      container.innerHTML = "";
      container.classList.add("img-placeholder");
    }
  } catch (_) {
    container.innerHTML = "";
    container.classList.add("img-placeholder");
  }
}

function loadSampleImagesForRole() {
  if (currentRole === "farmer") {
    loadSampleImage("crops", document.getElementById("crop-sample-img"));
  }
}

// ---------- Procedure planning & voice read ----------
let lastProcedureSteps = [];
document.getElementById("btn-procedure").addEventListener("click", async () => {
  const crop = document.getElementById("procedure-crop").value.trim() || document.getElementById("cultivation-crop").value.trim() || "rice";
  const res = await fetch(`${API}/cultivation/${encodeURIComponent(crop)}`);
  const data = await res.json();
  lastProcedureSteps = data.steps || [];
  const container = document.getElementById("procedure-result");
  container.classList.remove("hidden");
  document.getElementById("procedure-steps").innerHTML = lastProcedureSteps.map(
    (s) => `<li><strong>${s.title}</strong>: ${s.description} <span class="text-stone-500">(${s.duration})</span></li>`
  ).join("");
});

document.getElementById("btn-voice-read").addEventListener("click", () => {
  if (!lastProcedureSteps.length) {
    const ol = document.getElementById("cultivation-steps");
    if (ol && ol.children.length) {
      lastProcedureSteps = Array.from(ol.children).map((li) => {
        const text = li.textContent || "";
        const match = text.match(/^(\d+)\.\s*(.+?):\s*(.+?)\s*\(([^)]+)\)$/);
        return match ? { title: match[2], description: match[3], duration: match[4] } : { title: "Step", description: text, duration: "" };
      });
    }
  }
  if (!lastProcedureSteps.length) {
    speak("Please load cultivation steps or procedure first.");
    return;
  }
  speak("Procedure for crop. " + lastProcedureSteps.map((s, i) => `Step ${i + 1}: ${s.title}. ${s.description}`).join(" "));
});

function speak(text) {
  const u = window.speechSynthesis;
  if (!u) return;
  u.cancel();
  const msg = new SpeechSynthesisUtterance(text);
  msg.lang = currentLang === "en" ? "en-IN" : currentLang === "hi" ? "hi-IN" : "en-IN";
  msg.rate = 0.9;
  u.speak(msg);
}

// ---------- Voice control ----------
function initVoice() {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    document.getElementById("voice-status").textContent = "Speech recognition not supported.";
    return;
  }
  recognition = new SpeechRecognition();
  recognition.continuous = true;
  recognition.lang = currentLang === "en" ? "en-IN" : currentLang === "hi" ? "hi-IN" : "en-IN";
  recognition.onresult = (e) => {
    const last = e.results[e.results.length - 1];
    const text = last[0].transcript.trim().toLowerCase();
    const status = document.getElementById("voice-status");
    if (status) status.textContent = "Heard: " + text;
    if (text.includes("next") || text.includes("अगला")) navigateVoice("next");
    else if (text.includes("back") || text.includes("पीछे")) navigateVoice("back");
    else if (text.includes("crop") || text.includes("फसल")) document.getElementById("btn-predict-crop")?.click();
    else if (text.includes("fertilizer") || text.includes("उर्वरक")) document.getElementById("btn-fertilizer")?.click();
    else if (text.includes("guide") || text.includes("गाइड") || text.includes("procedure")) document.getElementById("btn-cultivation")?.click();
    else if (text.includes("language") || text.includes("भाषा")) document.getElementById("lang-select")?.focus();
    else if (text.includes("read") || text.includes("aloud") || text.includes("सुनाओ")) document.getElementById("btn-voice-read")?.click();
  };
  recognition.onerror = () => {
    const status = document.getElementById("voice-status");
    if (status) status.textContent = "Listening... (say a command)";
  };
}

function navigateVoice(dir) {
  if (dir === "back") document.getElementById("back-to-role")?.click();
}

let voiceActive = false;
document.getElementById("voice-toggle").addEventListener("click", () => {
  voiceActive = !voiceActive;
  const panel = document.getElementById("voice-panel");
  panel.classList.toggle("hidden", !voiceActive);
  if (voiceActive) {
    if (!recognition) initVoice();
    try {
      recognition.start();
      document.getElementById("voice-status").textContent = "Listening... Say a command.";
    } catch (_) {}
  } else {
    try { recognition.stop(); } catch (_) {}
  }
});

// ---------- Init ----------
loadI18n("en");
