/*
 * Taxie — widget de chat compartido por todas las páginas.
 *
 * Uso en cada página (justo después del markup #ai-bubble / #ai-chat):
 *   <script src="assets/taxie.js"></script>
 *   <script src="assets/taxie.js" data-profile="docs"></script>
 *   <script src="assets/taxie.js" data-recaptcha="chat_message"></script>
 *
 * data-profile   → "default" | "docs" | "rutas" (textos, chips y prompt propios).
 * data-recaptcha → acción de reCAPTCHA a validar antes de cada envío (opcional).
 *
 * Transporte: window.taxflyWorker({type: "taxie_chat"}) (config.js), que manda el
 * token de Firebase al worker autenticado.
 */
(function() {
  var DATA = {
    "profiles": {
      "default": {
        "historyKey": "taxie_history_",
        "welcome": {
          "es": "¡Hola! Soy **Taxie** 🗽✈️\n\nTu asistente personal para viajes a USA. Puedo ayudarte con:\n\n• 🏰 Destinos y parques temáticos\n• 🛍️ Outlets y compras sin tax\n• 💵 Propinas, impuestos y presupuesto\n• 🏨 Hoteles y transporte\n• 🌤️ Clima y documentación\n\n¿En qué puedo ayudarte hoy?",
          "en": "Hi! I am **Taxie** 🗽✈️\n\nYour personal USA travel guide. I can help you with:\n\n• 🏰 Destinations & theme parks\n• 🛍️ Outlets & tax-free shopping\n• 💵 Tips, taxes & budgeting\n• 🏨 Hotels & transportation\n• 🌤️ Weather & travel documents\n\nWhat can I help you with today?",
          "pt": "Olá! Sou o **Taxie** 🗽✈️\n\nSeu assistente pessoal para viagens aos EUA. Posso te ajudar com:\n\n• 🏰 Destinos e parques temáticos\n• 🛍️ Outlets e compras sem tax\n• 💵 Gorjetas, impostos e orçamento\n• 🏨 Hotéis e transporte\n• 🌤️ Clima e documentação\n\nComo posso te ajudar hoje?"
        },
        "chips": {
          "es": [
            "🗺️ Qué visitar",
            "🛍️ Compras",
            "💰 Propinas en USA",
            "🌡️ Clima del destino",
            "✈️ Aeropuertos",
            "🚗 Alquilar auto"
          ],
          "en": [
            "🗺️ Places to visit",
            "🛍️ Shopping",
            "💰 Tipping in USA",
            "🌡️ Destination weather",
            "✈️ Airports",
            "🚗 Rent a car"
          ],
          "pt": [
            "🗺️ O que visitar",
            "🛍️ Compras",
            "💰 Gorjetas nos EUA",
            "🌡️ Clima do destino",
            "✈️ Aeroportos",
            "🚗 Alugar carro"
          ]
        },
        "sub": {
          "es": "Tu guía de viaje a USA 🗺️",
          "en": "Your USA Travel Guide 🗺️",
          "pt": "Seu guia de viagem aos EUA 🗺️"
        },
        "placeholder": {
          "es": "Preguntale a Taxie sobre tu viaje...",
          "en": "Ask Taxie about your trip...",
          "pt": "Pergunte ao Taxie sobre sua viagem..."
        },
        "error": {
          "es": "Ups, algo falló. Verificá tu conexión e intentá de nuevo.",
          "en": "Oops, something went wrong. Check your connection and try again.",
          "pt": "Ops, algo deu errado. Verifique sua conexão e tente novamente."
        },
        "system": {
          "es": "Eres Taxie, asistente de viajes a USA. Tu tono es claro, directo y amable — ni frío ni demasiado informal. No tenés acceso a datos en vivo (filas en parques, cotizaciones, clima actual, horarios o precios del momento): si te los piden, respondé con lo que sabés y aclará que pueden no estar actualizados. Usás viñetas y **negritas** solo cuando realmente ayudan a organizar la info; si la respuesta es simple, una o dos oraciones directas son suficientes. Nunca empezás con \"¡Claro!\", \"¡Por supuesto!\" ni frases de relleno. Solo respondés sobre viajes a USA; si preguntan otra cosa, lo aclarás brevemente y redirigís. Fecha actual: {date}.",
          "en": "You are Taxie, a USA travel assistant. Your tone is clear, direct and warm — not overly casual, not robotic. You have no access to live data (park wait times, exchange rates, current weather, store hours or up-to-the-minute prices): if asked, answer with what you know and say it may not be current. Use bullet points and **bold** only when they genuinely help organize information; for simple questions, one or two direct sentences are better. Never open with \"Of course!\", \"Great question!\" or filler phrases. Only answer about USA travel; redirect anything off-topic without making it awkward. Today's date: {date}.",
          "pt": "Você é o Taxie, assistente de viagens para os EUA. Seu tom é claro, direto e amigável. Você não tem acesso a dados ao vivo (filas nos parques, cotações, clima atual, horários ou preços do momento): se perguntarem, responda com o que sabe e avise que podem estar desatualizados. Use marcadores e **negritos** só quando realmente ajudam a organizar a informação; para respostas simples, uma ou duas frases diretas são suficientes. Nunca comece com \"Claro!\", \"Com certeza!\" ou frases de preenchimento. Responda apenas sobre viagens aos EUA; se perguntarem outra coisa, redirecione brevemente. Data atual: {date}."
        }
      },
      "docs": {
        "historyKey": "taxie_history_docs_",
        "welcome": {
          "es": "¡Hola! Soy **Taxie** 🗽✈️\n\nTu asistente para documentos y viajes a USA. Puedo ayudarte con:\n\n• 📋 Qué documentos llevar al viaje\n• 🛂 ESTA, visa y requisitos de entrada\n• 🛡️ Seguro de viaje: qué cubrir\n• ✈️ Check-in y boarding passes\n• 🏥 Coberturas médicas en USA\n\n¿En qué puedo ayudarte?",
          "en": "Hi! I'm **Taxie** 🗽✈️\n\nYour travel documents assistant for USA trips. I can help with:\n\n• 📋 What documents to bring\n• 🛂 ESTA, visa and entry requirements\n• 🛡️ Travel insurance: what to cover\n• ✈️ Check-in and boarding passes\n• 🏥 Medical coverage in the USA\n\nWhat can I help you with?",
          "pt": "Olá! Sou o **Taxie** 🗽✈️\n\nSeu assistente de documentos para viagens aos EUA. Posso te ajudar com:\n\n• 📋 Quais documentos levar na viagem\n• 🛂 ESTA, visto e requisitos de entrada\n• 🛡️ Seguro viagem: o que cobrir\n• ✈️ Check-in e boarding passes\n• 🏥 Cobertura médica nos EUA\n\nComo posso te ajudar?"
        },
        "chips": {
          "es": [
            "📋 Qué documentos llevar",
            "🛂 Necesito ESTA o visa?",
            "🛡️ Seguro de viaje",
            "✈️ Check-in online",
            "🏥 Cobertura médica USA"
          ],
          "en": [
            "📋 What docs to bring",
            "🛂 Do I need ESTA or visa?",
            "🛡️ Travel insurance",
            "✈️ Online check-in",
            "🏥 Medical coverage USA"
          ],
          "pt": [
            "📋 Quais documentos levar",
            "🛂 Preciso de ESTA ou visto?",
            "🛡️ Seguro viagem",
            "✈️ Check-in online",
            "🏥 Cobertura médica EUA"
          ]
        },
        "sub": {
          "es": "Documentos y trámites de viaje 🗂️",
          "en": "Travel documents & paperwork 🗂️",
          "pt": "Documentos e trâmites de viagem 🗂️"
        },
        "placeholder": {
          "es": "Preguntale a Taxie sobre tus documentos...",
          "en": "Ask Taxie about your travel documents...",
          "pt": "Pergunte ao Taxie sobre seus documentos..."
        },
        "system": {
          "es": "Eres Taxie, asistente de viajes a USA especializado en documentación de viaje. Tu tono es claro, directo y amable. Ayudás con: documentos necesarios para viajar a USA (ESTA, visa, pasaporte), seguro de viaje, check-in online, boarding passes, coberturas médicas, y cómo organizar documentos importantes. Los requisitos de entrada y visas cambian: si te los piden, respondé con lo que sabés y recomendá confirmarlos en la fuente oficial. Usás viñetas y **negritas** solo cuando realmente ayudan; si la respuesta es simple, una o dos oraciones directas son suficientes. Nunca empezás con \"¡Claro!\", \"¡Por supuesto!\" ni frases de relleno. Solo respondés sobre viajes y documentación. Fecha actual: {date}.",
          "en": "You are Taxie, a USA travel assistant specialized in travel documentation. Your tone is clear, direct and warm. Help with: documents needed to travel to the USA (ESTA, visa, passport), travel insurance, online check-in, boarding passes, medical coverage, and organizing important travel documents. Entry requirements and visas change: if asked, answer with what you know and recommend confirming with the official source. Use bullet points and **bold** only when they genuinely help; for simple questions, one or two direct sentences are better. Never open with \"Of course!\", \"Great question!\" or filler phrases. Only answer about travel and documentation. Today's date: {date}.",
          "pt": "Você é o Taxie, assistente de viagens para os EUA especializado em documentação de viagem. Seu tom é claro, direto e amigável. Ajude com: documentos necessários para viajar aos EUA (ESTA, visto, passaporte), seguro viagem, check-in, boarding passes, coberturas médicas, e como organizar documentos importantes. Os requisitos de entrada e vistos mudam: se perguntarem, responda com o que sabe e recomende confirmar na fonte oficial. Use marcadores e **negritos** só quando realmente ajudam; para respostas simples, uma ou duas frases diretas são suficientes. Nunca comece com \"Claro!\" ou frases de preenchimento. Responda apenas sobre viagens e documentação. Data atual: {date}."
        },
        "error": {
          "es": "Ups, algo falló. Verificá tu conexión e intentá de nuevo.",
          "en": "Oops, something went wrong. Check your connection and try again.",
          "pt": "Ops, algo deu errado. Verifique sua conexão e tente novamente."
        }
      },
      "rutas": {
        "historyKey": "taxie_history_",
        "welcome": {
          "es": "¡Hola! Soy **Taxie** 🗽✈️\n\nTu asistente para planificar rutas en USA. Puedo ayudarte con:\n\n• 🗺️ Planificar recorridos por día\n• 🛍️ Outlets y tiendas que no podés perderte\n• 📍 Qué ver cerca de tu hotel\n• 🚗 Distancias y tiempos estimados\n• 🎡 Parques y atracciones\n\n¿En qué puedo ayudarte hoy?",
          "en": "Hi! I am **Taxie** 🗽✈️\n\nYour assistant for planning routes in the USA. I can help you with:\n\n• 🗺️ Plan day-by-day itineraries\n• 🛍️ Outlets and stores you can't miss\n• 📍 What to see near your hotel\n• 🚗 Distances and estimated times\n• 🎡 Parks and attractions\n\nWhat can I help you with today?",
          "pt": "Olá! Sou o **Taxie** 🗽✈️\n\nSeu assistente para planejar rotas nos EUA. Posso te ajudar com:\n\n• 🗺️ Planejar roteiros por dia\n• 🛍️ Outlets e lojas imperdíveis\n• 📍 O que ver perto do seu hotel\n• 🚗 Distâncias e tempos estimados\n• 🎡 Parques e atrações\n\nComo posso te ajudar hoje?"
        },
        "chips": {
          "es": [
            "🗺️ Armar una ruta por día",
            "🛍️ Outlets en el camino",
            "📍 Qué visitar",
            "🚗 Alquilar auto",
            "⏱️ Distancias y tiempos"
          ],
          "en": [
            "🗺️ Plan a day-by-day route",
            "🛍️ Outlets along the way",
            "📍 What to visit",
            "🚗 Rent a car",
            "⏱️ Distances & drive times"
          ],
          "pt": [
            "🗺️ Montar um roteiro por dia",
            "🛍️ Outlets no caminho",
            "📍 O que visitar",
            "🚗 Alugar carro",
            "⏱️ Distâncias e tempos"
          ]
        },
        "sub": {
          "es": "Tu guia de rutas en USA 🗺️",
          "en": "Your USA Route Guide 🗺️",
          "pt": "Seu guia de rotas nos EUA 🗺️"
        },
        "placeholder": {
          "es": "Preguntale a Taxie sobre tu ruta...",
          "en": "Ask Taxie about your route...",
          "pt": "Pergunte ao Taxie sobre sua rota..."
        },
        "system": {
          "es": "Eres Taxie, asistente de rutas y viajes a USA. Tu tono es claro, directo y amable. No tenés acceso a datos en vivo (tránsito, horarios o precios del momento): si te los piden, respondé con lo que sabés (distancias y tiempos estimados) y aclará que pueden variar. Usás viñetas y **negritas** solo cuando realmente ayudan. Nunca empezás con \"¡Claro!\" ni frases de relleno. Solo respondés sobre viajes y rutas en USA. Fecha actual: {date}.",
          "en": "You are Taxie, a USA travel and route planning assistant. Your tone is clear, direct and warm. You have no access to live data (traffic, current hours or prices): if asked, answer with what you know (estimated distances and drive times) and say they may vary. Use bullet points and **bold** only when they genuinely help. Never open with \"Of course!\" or filler phrases. Only answer about USA travel and routes. Today's date: {date}.",
          "pt": "Você é o Taxie, assistente de rotas e viagens aos EUA. Seu tom é claro, direto e amigável. Você não tem acesso a dados ao vivo (trânsito, horários ou preços do momento): se perguntarem, responda com o que sabe (distâncias e tempos estimados) e avise que podem variar. Use marcadores e **negritos** só quando realmente ajudam. Nunca comece com \"Claro!\" ou frases de preenchimento. Responda apenas sobre viagens e rotas nos EUA. Data atual: {date}."
        },
        "error": {
          "es": "Ups, algo falló. Verificá tu conexión e intentá de nuevo.",
          "en": "Oops, something went wrong. Check your connection and try again.",
          "pt": "Ops, algo deu errado. Verifique sua conexão e tente novamente."
        }
      }
    },
    "shared": {
      "rate": {
        "es": "Hiciste muchas consultas seguidas. Esperá un momento e intentá de nuevo.",
        "en": "Too many requests in a row. Wait a moment and try again.",
        "pt": "Muitas consultas seguidas. Aguarde um momento e tente novamente."
      },
      "login": {
        "es": "Iniciá sesión para hablar con Taxie.",
        "en": "Sign in to chat with Taxie.",
        "pt": "Entre na sua conta para falar com o Taxie."
      }
    }
  };
  var script = document.currentScript;
  var profileName = script && script.getAttribute("data-profile") || "default";
  var rcAction = script && script.getAttribute("data-recaptcha") || "";
  var P = DATA.profiles[profileName] || DATA.profiles["default"];
  var S = DATA.shared;

  var lang = localStorage.getItem("appLang") || "es";
  var perfilId = localStorage.getItem("perfilActivoId") || "default";
  var HISTORY_KEY = P.historyKey + perfilId;
  var chatHistory = [];
  try {
    var saved = localStorage.getItem(HISTORY_KEY);
    if (saved) chatHistory = JSON.parse(saved);
  } catch (e) {
    chatHistory = [];
  }
  var isOpen = false;
  var isLoading = false;
  var hasShownWelcome = false;

  function L() {
    return lang === "en" ? "en" : lang === "pt" ? "pt" : "es";
  }
  function pick(obj) {
    return obj[L()];
  }
  function localeDate() {
    var loc = L() === "pt" ? "pt-BR" : L() === "en" ? "en-US" : "es-AR";
    return (new Date).toLocaleDateString(loc);
  }
  function buildSystem() {
    return pick(P.system).replace("{date}", localeDate());
  }
  function saveHistory() {
    try {
      localStorage.setItem(HISTORY_KEY, JSON.stringify(chatHistory.slice(-40)));
    } catch (e) {}
  }
  function formatBotText(text) {
    var html = text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    html = html.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
    var lines = html.split("\n");
    var result = [];
    var inList = false;
    for (var i = 0; i < lines.length; i++) {
      var line = lines[i].trim();
      var isBullet = /^[\u2022\-\*]\s/.test(line);
      if (isBullet) {
        if (!inList) {
          result.push("<ul>");
          inList = true;
        }
        result.push("<li>" + line.replace(/^[\u2022\-\*]\s+/, "") + "</li>");
      } else {
        if (inList) {
          result.push("</ul>");
          inList = false;
        }
        if (line !== "") result.push("<p>" + line + "</p>");
      }
    }
    if (inList) result.push("</ul>");
    return result.join("");
  }
  function recaptchaOk() {
    if (!rcAction) return Promise.resolve(true);
    var fn = window._rcCheck || (typeof _rcCheck === "function" ? _rcCheck : null);
    if (!fn) return Promise.resolve(true);
    return Promise.resolve(fn(rcAction)).catch(function() {
      return true;
    });
  }
  function callWorker(messages) {
    if (typeof window.taxflyWorker !== "function") return Promise.reject(new Error("taxflyWorker no disponible"));
    return window.taxflyWorker({
      type: "taxie_chat",
      messages: messages,
      max_tokens: 800
    });
  }
  function renderChips(suggestEl) {
    if (!suggestEl) return;
    suggestEl.innerHTML = pick(P.chips).map(function(c) {
      return '<button class="ai-chip">' + c + "</button>";
    }).join("");
    suggestEl.querySelectorAll(".ai-chip").forEach(function(btn) {
      btn.addEventListener("click", function() {
        var inp = document.getElementById("ai-input");
        if (inp) inp.value = btn.textContent;
        if (window._taxieSend) window._taxieSend();
        suggestEl.style.display = "none";
      });
    });
  }

  function init() {
    var bubble = document.getElementById("ai-bubble");
    var chatEl = document.getElementById("ai-chat");
    var messagesEl = document.getElementById("ai-messages");
    var inputEl = document.getElementById("ai-input");
    var sendBtn = document.getElementById("ai-send");
    var suggestEl = document.getElementById("ai-suggestions");
    var headerSub = document.getElementById("ai-header-sub");
    var closeBtn = document.getElementById("ai-close");
    if (!bubble || !chatEl) return;
    if (headerSub) headerSub.textContent = pick(P.sub);
    if (inputEl) inputEl.placeholder = pick(P.placeholder);
    renderChips(suggestEl);

    function closeChat() {
      isOpen = false;
      chatEl.classList.remove("open");
      setTimeout(function() {
        if (!isOpen) chatEl.style.display = "none";
      }, 250);
    }
    function toggleChat() {
      if (isOpen) return closeChat();
      isOpen = true;
      chatEl.style.display = "flex";
      chatEl.offsetHeight;
      chatEl.classList.add("open");
      if (!hasShownWelcome) {
        hasShownWelcome = true;
        if (chatHistory.length > 0) {
          chatHistory.forEach(function(m) {
            addMessage(m.role === "user" ? "user" : "bot", m.content, true);
          });
          if (suggestEl) suggestEl.style.display = "none";
        } else {
          setTimeout(function() {
            addMessage("bot", pick(P.welcome));
          }, 200);
        }
      }
      setTimeout(function() {
        if (inputEl) inputEl.focus();
      }, 300);
    }
    bubble.addEventListener("click", function(e) {
      e.stopPropagation();
      toggleChat();
    });
    if (closeBtn) closeBtn.addEventListener("click", function(e) {
      e.stopPropagation();
      toggleChat();
    });
    document.addEventListener("click", function(e) {
      if (isOpen && !chatEl.contains(e.target) && !bubble.contains(e.target)) closeChat();
    });

    function addMessage(role, text, silent) {
      if (!messagesEl) return;
      var div = document.createElement("div");
      div.className = "ai-msg " + (role === "user" ? "user" : "bot");
      if (role === "user") {
        div.textContent = text;
      } else {
        div.innerHTML = formatBotText(text);
      }
      if (silent) div.style.animation = "none";
      messagesEl.appendChild(div);
      messagesEl.scrollTop = messagesEl.scrollHeight;
    }
    function showTyping() {
      if (!messagesEl) return;
      var div = document.createElement("div");
      div.className = "ai-msg bot typing";
      div.id = "ai-typing";
      div.innerHTML = '<div class="ai-dot"></div><div class="ai-dot"></div><div class="ai-dot"></div>';
      messagesEl.appendChild(div);
      messagesEl.scrollTop = messagesEl.scrollHeight;
    }
    function hideTyping() {
      var el = document.getElementById("ai-typing");
      if (el) el.remove();
    }
    function fail(userMsg) {
      chatHistory.pop();
      hideTyping();
      addMessage("bot", userMsg || pick(P.error));
    }
    function sendMessage() {
      if (!inputEl) return;
      var text = inputEl.value.trim();
      if (!text || isLoading) return;
      inputEl.value = "";
      inputEl.style.height = "auto";
      addMessage("user", text);
      if (suggestEl) suggestEl.style.display = "none";
      isLoading = true;
      if (sendBtn) sendBtn.disabled = true;
      showTyping();
      chatHistory.push({
        role: "user",
        content: text
      });
      recaptchaOk().then(function(ok) {
        if (!ok) return fail();
        var messages = [ {
          role: "system",
          content: buildSystem()
        } ].concat(chatHistory.slice(-14));
        return callWorker(messages).then(function(res) {
          return res.json().catch(function() {
            return {};
          }).then(function(d) {
            if (!res.ok) {
              var msg = res.status === 401 ? pick(S.login) : res.status === 429 ? pick(S.rate) : null;
              console.error("[Taxie]", res.status, d && d.error);
              return fail(msg);
            }
            var reply = d.choices && d.choices[0] && d.choices[0].message && d.choices[0].message.content;
            if (!reply) return fail();
            chatHistory.push({
              role: "assistant",
              content: reply
            });
            saveHistory();
            hideTyping();
            addMessage("bot", reply);
          });
        });
      }).catch(function(e) {
        console.error("[Taxie]", e);
        fail();
      }).then(function() {
        isLoading = false;
        if (sendBtn) sendBtn.disabled = false;
        if (inputEl) inputEl.focus();
      });
    }
    window._taxieSend = sendMessage;
    if (sendBtn) sendBtn.addEventListener("click", sendMessage);
    if (inputEl) {
      inputEl.addEventListener("keydown", function(e) {
        if (e.key === "Enter" && !e.shiftKey) {
          e.preventDefault();
          sendMessage();
        }
      });
      inputEl.addEventListener("input", function() {
        this.style.height = "auto";
        this.style.height = Math.min(this.scrollHeight, 80) + "px";
      });
    }
  }

  window.taxieUpdateLang = function(newLang) {
    lang = newLang;
    var inputEl = document.getElementById("ai-input");
    var headerSub = document.getElementById("ai-header-sub");
    if (inputEl) inputEl.placeholder = pick(P.placeholder);
    if (headerSub) headerSub.textContent = pick(P.sub);
    renderChips(document.getElementById("ai-suggestions"));
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
