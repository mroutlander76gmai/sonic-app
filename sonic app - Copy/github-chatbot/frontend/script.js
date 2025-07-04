const form = document.getElementById("chat-form");
const input = document.getElementById("user-input");
const voiceBtn = document.getElementById("voice-btn");
const toggleBtn = document.getElementById("toggle-mode-btn");
const voiceModeDiv = document.getElementById("voice-mode");
const chatBubble = document.querySelector(".chat-bubble");

let mode = "chat";

// Toggle chat ↔ voice
toggleBtn.addEventListener("click", () => {
  if (mode === "chat") {
    mode = "voice";
    form.classList.add("hidden");
    voiceModeDiv.classList.remove("hidden");
    toggleBtn.textContent = "💬";
    toggleBtn.title = "Switch to Chat Mode";
  } else {
    mode = "chat";
    form.classList.remove("hidden");
    voiceModeDiv.classList.add("hidden");
    toggleBtn.textContent = "🗣️";
    toggleBtn.title = "Switch to Voice Mode";
  }
});

// Typing animation
function typeText(el, text, delay = 15) {
  let i = 0;
  el.innerHTML = ""; // Clear before typing
  const interval = setInterval(() => {
    el.innerHTML += text[i++];
    if (i >= text.length) clearInterval(interval);
  }, delay);
}

// Handle text input
form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const message = input.value.trim();
  if (!message) return;

  chatBubble.innerHTML = `<strong>You:</strong> ${message}`;
  input.value = "";

  try {
    const response = await fetch("http://localhost:3000/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message })
    });

    const data = await response.json();
    const reply = data.reply || "No response.";

    setTimeout(() => {
      chatBubble.innerHTML = `<strong>Bot:</strong> `;
      typeText(chatBubble, `Bot: ${reply}`);
      speak(reply);
    }, 600);
  } catch (err) {
    chatBubble.innerHTML = `Server error: ${err.message}`;
  }
});

// Voice recognition
let recognition;
if ("webkitSpeechRecognition" in window || "SpeechRecognition" in window) {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  recognition = new SpeechRecognition();
  recognition.lang = "en-US";
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;

  function addMicListeners() {
    const start = () => {
      recognition.start();
      voiceBtn.classList.add("listening");
      voiceBtn.textContent = "🎙️ Listening...";
    };
    const stop = () => {
      recognition.stop();
      voiceBtn.classList.remove("listening");
      voiceBtn.textContent = "🎤 Speak";
    };

    voiceBtn.addEventListener("mousedown", start);
    voiceBtn.addEventListener("mouseup", stop);
    voiceBtn.addEventListener("touchstart", (e) => {
      e.preventDefault();
      start();
    }, { passive: false });
    voiceBtn.addEventListener("touchend", (e) => {
      e.preventDefault();
      stop();
    }, { passive: false });
  }

  addMicListeners();

  recognition.onresult = async (event) => {
    const transcript = event.results[0][0].transcript;
    chatBubble.innerHTML = `<strong>You:</strong> ${transcript}`;

    try {
      const response = await fetch("http://localhost:3000/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: transcript })
      });

      const data = await response.json();
      const reply = data.reply || "No response.";

      setTimeout(() => {
        chatBubble.innerHTML = `<strong>Bot:</strong> `;
        typeText(chatBubble, `Bot: ${reply}`);
        speak(reply);
      }, 600);
    } catch (err) {
      chatBubble.innerHTML = `Server error: ${err.message}`;
    }
  };

  recognition.onerror = () => {
    voiceBtn.classList.remove("listening");
    voiceBtn.textContent = "🎤 Speak";
  };

  recognition.onend = () => {
    voiceBtn.classList.remove("listening");
    voiceBtn.textContent = "🎤 Speak";
  };
} else {
  voiceBtn.disabled = true;
  voiceBtn.title = "Speech not supported.";
}

// Bot Text-to-Speech
function speak(text) {
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "en-US";
  speechSynthesis.speak(utterance);
}
let rings = 0;
const ringCountEl = document.getElementById("ring-count");
const avatar = document.getElementById("sonic-avatar");
const label = document.getElementById("evolution-label");

function updateRings(amount = 1) {
  rings += amount;
  ringCountEl.textContent = rings;

  // Evolution thresholds
  if (rings >= 500) {
    label.textContent = "Super Sonic!";
    avatar.style.filter = "hue-rotate(90deg)";
  } else if (rings >= 300) {
    label.textContent = "Upgraded Sonic";
    avatar.style.filter = "hue-rotate(45deg)";
  } else if (rings >= 100) {
    label.textContent = "Boosted Sonic";
    avatar.style.filter = "brightness(1.2)";
  } else {
    label.textContent = "Normal Sonic";
    avatar.style.filter = "none";
  }
}

// Spawn rings randomly
function spawnRing() {
  const ring = document.createElement("div");
  ring.classList.add("ring");
  ring.style.left = `${Math.random() * 90 + 5}%`;
  ring.style.top = "100%";

  ring.onclick = () => {
    updateRings(1);
    ring.remove();
  };

  document.getElementById("ring-container").appendChild(ring);

  // Remove after animation
  setTimeout(() => ring.remove(), 6000);
}

// Spawn every 2s
setInterval(spawnRing, 2000);

// Reward rings on text submission
form.addEventListener("submit", () => {
  updateRings(3); // Bonus for sending message
});

// Reward rings on voice
if (recognition) {
  recognition.onresult = async (event) => {
    const transcript = event.results[0][0].transcript;
    chatBubble.innerHTML = `<strong>You:</strong> ${transcript}`;
    updateRings(2); // Bonus for speaking

    try {
      const response = await fetch("http://localhost:3000/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: transcript })
      });

      const data = await response.json();
      const reply = data.reply || "No response.";

      setTimeout(() => {
        chatBubble.innerHTML = `<strong>Bot:</strong> `;
        typeText(chatBubble, `Bot: ${reply}`);
        speak(reply);
      }, 600);
    } catch (err) {
      chatBubble.innerHTML = `Server error: ${err.message}`;
    }
  };
}
