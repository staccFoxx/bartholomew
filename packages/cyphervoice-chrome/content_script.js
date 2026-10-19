// CypherVoice In-Browser Web Audio Cloaking Interceptor
(function () {
  console.log("[CypherVoice] Biometric Audio Privacy Interceptor active.");

  let shieldActive = true;
  let activePreset = "standard";

  chrome.storage?.local.get(["shieldActive", "preset"], (res) => {
    if (res.shieldActive !== undefined) shieldActive = res.shieldActive;
    if (res.preset) activePreset = res.preset;
  });

  chrome.runtime?.onMessage.addListener((msg, sender, sendResponse) => {
    if (msg.action === "SET_SHIELD_STATE") {
      shieldActive = msg.shieldActive;
      console.log(`[CypherVoice] Shield state updated: ${shieldActive}`);
    } else if (msg.action === "SET_PRESET") {
      activePreset = msg.preset;
      console.log(`[CypherVoice] Preset updated: ${activePreset}`);
    }
  });

  // Intercept getUserMedia to apply in-flight psychoacoustic masking
  if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
    const origGetUserMedia = navigator.mediaDevices.getUserMedia.bind(navigator.mediaDevices);

    navigator.mediaDevices.getUserMedia = async function (constraints) {
      const stream = await origGetUserMedia(constraints);
      if (!constraints.audio || !shieldActive) {
        return stream;
      }

      try {
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        const source = audioCtx.createMediaStreamSource(stream);
        
        // Create Biquad Filter Bank to mask voiceprint harmonics without ruining intelligibility
        const biquad = audioCtx.createBiquadFilter();
        biquad.type = "peaking";
        biquad.frequency.value = 2800; // Human formant region
        biquad.Q.value = 3.5;
        biquad.gain.value = -4.0; // Duck biometric speaker embedding peak

        // Low-frequency dither oscillator
        const ditherOsc = audioCtx.createOscillator();
        ditherOsc.type = "triangle";
        ditherOsc.frequency.value = 19.5; // Sub-audible dither
        const ditherGain = audioCtx.createGain();
        ditherGain.gain.value = 0.004;
        ditherOsc.connect(ditherGain);
        ditherOsc.start();

        const dest = audioCtx.createMediaStreamDestination();
        source.connect(biquad);
        ditherGain.connect(biquad);
        biquad.connect(dest);

        console.log("[CypherVoice] Microphone stream wrapped with biometric cloaking filter.");
        return dest.stream;
      } catch (err) {
        console.warn("[CypherVoice] Could not inject Web Audio cloak filter, falling back to raw stream:", err);
        return stream;
      }
    };
  }
})();
