function isOnLoginPage() {
  const path = window.location.pathname;
  return path.includes("/login") || path.includes("/login/") || path.includes("/login?") || path.includes("/login#");
}

function wasALoginAction(transcript) {
  if (!onLoginPage()) return false;

  // return true;
}
