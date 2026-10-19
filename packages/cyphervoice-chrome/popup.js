// CypherVoice Popup Controller
document.addEventListener("DOMContentLoaded", () => {
  const toggleBtn = document.getElementById("toggleShieldBtn");
  const statusText = document.getElementById("shieldStatusText");
  const presetSelect = document.getElementById("presetSelect");
  const vuDb = document.getElementById("vuDb");
  const canvas = document.getElementById("vuCanvas");
  const ctx = canvas.getContext("2d");

  let isShieldActive = true;
  let activePreset = "standard";

  // Load storage state
  chrome.storage?.local.get(["shieldActive", "preset"], (res) => {
    if (res.shieldActive !== undefined) isShieldActive = res.shieldActive;
    if (res.preset) activePreset = res.preset;
    updateUI();
  });

  function updateUI() {
    if (isShieldActive) {
      statusText.textContent = "ACTIVE";
      statusText.className = "status-val active";
      toggleBtn.textContent = "PROTECTION ON";
      toggleBtn.className = "btn-toggle on";
    } else {
      statusText.textContent = "BYPASS";
      statusText.className = "status-val bypassed";
      toggleBtn.textContent = "PROTECTION OFF";
      toggleBtn.className = "btn-toggle off";
    }
    presetSelect.value = activePreset;
  }

  toggleBtn.addEventListener("click", () => {
    isShieldActive = !isShieldActive;
    chrome.storage?.local.set({ shieldActive: isShieldActive });
    updateUI();
    // Notify active tabs
    chrome.tabs?.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]?.id) {
        chrome.tabs.sendMessage(tabs[0].id, {
          action: "SET_SHIELD_STATE",
          shieldActive: isShieldActive,
          preset: activePreset
        });
      }
    });
  });

  presetSelect.addEventListener("change", (e) => {
    activePreset = e.target.value;
    chrome.storage?.local.set({ preset: activePreset });
    chrome.tabs?.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]?.id) {
        chrome.tabs.sendMessage(tabs[0].id, {
          action: "SET_PRESET",
          preset: activePreset
        });
      }
    });
  });

  // Animated VU meter simulation
  function renderVU() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (!isShieldActive) {
      vuDb.textContent = "0.0 dB (Bypassed)";
      requestAnimationFrame(renderVU);
      return;
    }

    const t = Date.now() * 0.005;
    const level = 0.4 + 0.3 * Math.sin(t) + 0.1 * Math.sin(t * 3.7);
    const fillWidth = Math.max(0, Math.min(canvas.width, level * canvas.width));

    ctx.fillStyle = "#00e5a3";
    ctx.fillRect(0, 0, fillWidth, canvas.height);

    const db = (-30.0 + level * 20.0).toFixed(1);
    vuDb.textContent = `${db} dB`;

    requestAnimationFrame(renderVU);
  }
  renderVU();
});
