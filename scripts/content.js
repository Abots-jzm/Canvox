(function () {
	const { speechDisplay } = window.injectElements();

	const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
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
			const wasASidebarAction = window.sidebarActionsRouter(transcript);
			if (wasASidebarAction) return;

			//dashboard
			if (/^https?:\/\/(?:[^/]+\.)?instructure\.com\/$/i.test(window.location.href)) {
				window.dashboardActionsRouter(transcript);
			}
		}, 1000);
	};

	document.addEventListener("keydown", (e) => {
		if (e.key.toLowerCase() === "m") {
			if (isRecognizing) {
				recognition.stop();
				isRecognizing = false;
			} else {
				recognition.start();
				isRecognizing = true;
			}
		}
	});

	recognition.onend = () => {
		isRecognizing = false;
	};
	recognition.onerror = () => {
		isRecognizing = false;
	};
})();
