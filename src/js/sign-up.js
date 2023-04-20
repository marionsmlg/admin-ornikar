window.addEventListener("DOMContentLoaded", () => {
  const signUpButton = document.getElementById("sign-up-button");
  const password = document.getElementById("password");
  const confirmPassword = document.getElementById("confirm-password");
  const commentPasswordNotMatch = document.getElementById("password-not-match");
  signUpButton.addEventListener("click", (event) => {
    if (password.value !== confirmPassword.value) {
      event.preventDefault();
      commentPasswordNotMatch.style.display = "flex";
    }
  });
});
