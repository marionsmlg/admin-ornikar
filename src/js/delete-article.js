window.addEventListener("DOMContentLoaded", () => {
  const arrOfIddeleteButtton = document.querySelectorAll(
    "#deleteArticleButton"
  );
  for (let i = 0; i < arrOfIddeleteButtton.length; i++) {
    const deleteButton = arrOfIddeleteButtton[i];
    const cancelButton = document.getElementById("cancel-button");
    const confirmDeleteButton = document.getElementById(
      "confirm-delete-button"
    );
    const modalTitle = document.getElementById("modal-title");
    const articleTitle = document.getElementById(`article-title-${i}`);
    const modal = document.getElementById("delete-article-modal");
    const modalBlock = document.getElementById("modal-block");
    deleteButton.addEventListener("click", () => {
      if (deleteButton.dataset.modalIsOpen === "false") {
        openModal();
      }
    });

    cancelButton.addEventListener("click", () => {
      modal.style.display = "none";
    });

    function openModal() {
      modal.style.display = "flex";
      modalTitle.innerText = `"${articleTitle.innerText}"`;
      confirmDeleteButton.setAttribute("form", `deleteArticle_${i}`);
      deleteButton.dataset.modalIsOpen === "true";
    }

    // window.addEventListener("click", function (event) {
    //   if (event.target === modalBlock) {
    //     modal.style.display = "none";
    //   }
    // });

    // function closeModal() {
    //   modal.style.display = "none";
    //   deleteButton.dataset.modalIsOpen === "false";
    // }
  }
});
