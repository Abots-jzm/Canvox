import { tts } from "../model/tts.js";

function isOnLoginPage() {
	const path = window.location.pathname;
	return path.includes("/login") || path.includes("/login/") || path.includes("/login?") || path.includes("/login#");
}

async function useLoginGPT(transcript) {
	const response = await fetch("https://glacial-sea-18791-40c840bc91e9.herokuapp.com/api/login", {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({
			transcript,
		}),
	});
	const data = await response.json();

	return data;
}

function insertLoginDetails(userDetails) {
	if (!userDetails) return;

	const usernameField = document.querySelector("#pseudonym_session_unique_id");
	const passwordField = document.querySelector("#pseudonym_session_password");

	if (usernameField && userDetails.username) {
		usernameField.value = userDetails.username;
	}

	if (passwordField && userDetails.password) {
		passwordField.value = userDetails.password;
	}
}

function wasALoginAction(transcript) {
	if (!onLoginPage()) return false;

	const response = useLoginGPT(transcript);
	if (!response) return false;

	if (response === "submit") {
		const loginButton = document.querySelector(".Button--login");
		if (loginButton) {
			loginButton.click();
		}
	} else if (response === "persist") {
		const rememberMeCheckbox = document.querySelector("#pseudonym_session_remember_me");
		if (rememberMeCheckbox) {
			rememberMeCheckbox.checked = !rememberMeCheckbox.checked;
		}
	} else if (response.username || response.password) {
		insertLoginDetails(response);
	} else {
		return false;
	}

	return true;
}

export { wasALoginAction };
