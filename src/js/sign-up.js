window.addEventListener("DOMContentLoaded", () => {
  const signUpForm = document.getElementById("sign-up-form");
  signUpForm.addEventListener("submit", function (event) {
    const formData = new FormData(this);
    const password = formData.get("password");
    const confirmPassword = formData.get("confirmPassword");
    const commentPasswordNotMatch =
      document.getElementById("password-not-match");
    if (password !== confirmPassword) {
      event.preventDefault();
      commentPasswordNotMatch.style.display = "flex";
    }
  });
});
