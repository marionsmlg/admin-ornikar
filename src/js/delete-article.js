window.addEventListener("DOMContentLoaded", () => {
  const arrOfdeleteButtton = document.getElementsByClassName(
    "js-delete-article-button"
  );
  for (const deleteButton of arrOfdeleteButtton) {
    const cancelButton = document.getElementById("cancel-button");

    const modalTitle = document.getElementById("modal-title");
    const modal = document.getElementById("delete-article-modal");

    const articleId = deleteButton.dataset.articleId;
    const deleteArticleInput = document.getElementById("delete-article-input");
    deleteButton.addEventListener("click", () => {
      modal.style.display = "flex";
      modalTitle.innerText = deleteButton.dataset.articleTitle;
      deleteArticleInput.setAttribute("value", `${articleId}`);
    });

    cancelButton.addEventListener("click", () => {
      modal.style.display = "none";
    });

    // window.addEventListener("click", function (event) {
    //   const modalBlock = document.getElementById("modal-block");
    //   if (event.target === modalBlock) {
    //     modal.style.display = "none";
    //   }
    // });
  }
});
