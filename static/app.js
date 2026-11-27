const chatForm = document.querySelector("#chatForm");
const promptInput = document.querySelector("#promptInput");
const sendButton = document.querySelector("#sendButton");
const conversation = document.querySelector("#conversation");
const messagesElement = document.querySelector("#messages");
const welcome = document.querySelector("#welcome");
const themeButton = document.querySelector("#themeButton");
const themeLabel = document.querySelector("#themeLabel");
const sidebar = document.querySelector("#sidebar");

// `history` stores this page's conversation. `isSending` starts false so the
// first message can be sent, then is reset to false after each request.
let history = [];
let isSending = false;

const themes = [
  { className: "", label: "DOJA Dark" },
  { className: "theme-light", label: "DOJA Light" },
  { className: "theme-ocean", label: "DOJA Ocean" },
];

function setTheme(index) {
  const theme = themes[index % themes.length];
  document.body.classList.remove("theme-light", "theme-ocean");
  if (theme.className) document.body.classList.add(theme.className);
  themeLabel.textContent = theme.label;
  localStorage.setItem("doja-theme", String(index % themes.length));
}

function scrollToBottom() {
  conversation.scrollTop = conversation.scrollHeight;
}

function addMessage(role, content, options = {}) {
  const wrapper = document.createElement("article");
  wrapper.className = `message ${role}${options.error ? " error" : ""}`;

  if (role === "assistant") {
    const avatar = document.createElement("div");
    avatar.className = "message-avatar";
    avatar.textContent = "D";
    wrapper.appendChild(avatar);
  }

  const body = document.createElement("div");
  body.className = "message-body";
  body.textContent = content;
  wrapper.appendChild(body);
  messagesElement.appendChild(wrapper);
  scrollToBottom();
  return wrapper;
}

function resizeInput() {
  promptInput.style.height = "auto";
  promptInput.style.height = `${Math.min(promptInput.scrollHeight, 180)}px`;
}

async function sendMessage(text) {
  const prompt = text.trim();
  if (!prompt || isSending) return;

  isSending = true;
  welcome.hidden = true;
  sendButton.disabled = true;
  promptInput.disabled = true;

  addMessage("user", prompt);
  const typingMessage = addMessage("assistant", "DOJA is thinking…");
  typingMessage.querySelector(".message-body").classList.add("typing");

  try {
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt, history: history.slice(-12) }),
    });

    const data = await response.json().catch(() => ({
      detail: "The server returned an invalid response.",
    }));

    if (!response.ok) {
      throw new Error(data.detail || data.message || `Request failed (${response.status}).`);
    }

    const answer = data.response || "The AI returned an empty response.";
    typingMessage.querySelector(".message-body").textContent = answer;
    typingMessage.querySelector(".message-body").classList.remove("typing");
    history.push(
      { role: "user", content: prompt },
      { role: "assistant", content: answer }
    );
  } catch (error) {
    typingMessage.remove();
    addMessage("assistant", error.message || "Unable to connect to DOJA AI.", { error: true });
  } finally {
    isSending = false;
    sendButton.disabled = false;
    promptInput.disabled = false;
    promptInput.focus();
    scrollToBottom();
  }
}

themeButton.addEventListener("click", () => {
  const current = Number(localStorage.getItem("doja-theme") || "0");
  setTheme(current + 1);
});

document.querySelector("#mobileMenu").addEventListener("click", () => {
  sidebar.classList.toggle("open");
});

promptInput.addEventListener("input", resizeInput);

chatForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const prompt = promptInput.value;
  if (!prompt.trim()) return;
  promptInput.value = "";
  resizeInput();
  sendMessage(prompt);
});

promptInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter" && !event.shiftKey) {
    event.preventDefault();
    chatForm.requestSubmit();
  }
});

document.querySelectorAll("[data-prompt]").forEach((button) => {
  button.addEventListener("click", () => sendMessage(button.dataset.prompt));
});

document.querySelector("#newChatButton").addEventListener("click", () => {
  history = [];
  messagesElement.replaceChildren();
  welcome.hidden = false;
  promptInput.value = "";
  resizeInput();
  sidebar.classList.remove("open");
  promptInput.focus();
});

setTheme(Number(localStorage.getItem("doja-theme") || "0"));
