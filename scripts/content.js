(function () {
  const { speechDisplay } = window.injectElements();

  const SpeechRecognition =
    window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) return;

  const recognition = new SpeechRecognition();
  recognition.continuous = true;
  recognition.interimResults = true;
  recognition.lang = "en-US";

  let isRecognizing = false;
  recognition.onresult = (event) => {
    let transcript = "";
    for (let i = event.resultIndex; i < event.results.length; i++) {
      transcript += event.results[i][0].transcript;
    }
    speechDisplay.textContent = transcript;

    clearTimeout(window.debounceTimer);
    window.debounceTimer = setTimeout(() => {
      window.actions(transcript);
    }, 1000);
  };

  document.addEventListener("keydown", (e) => {
    if (e.key.toLowerCase() === "x") {
      if (isRecognizing) {
        recognition.stop();
        isRecognizing = false;
      } else {
        recognition.start();
        isRecognizing = true;
      }
    }
  });

  document.querySelector(".voice-input").addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      window.actions(e.target.value);
    }
  });

  recognition.onend = () => {
    isRecognizing = false;
  };
  recognition.onerror = () => {
    isRecognizing = false;
  };
})();
