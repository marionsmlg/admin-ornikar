document.addEventListener("DOMContentLoaded", async () => {
  const articleContent = document.getElementById("article-content");
  const initialData = articleContent.value;
  const editor = new EditorJS({
    autofocus: true,
    holder: "editorjs",
    logLevel: "ERROR",

    tools: {
      header: {
        class: Header,
        inlineToolbar: ["bold"],
        config: {
          placeholder: "Entrer un titre",
          levels: [2, 3, 4],
          defaultLevel: 2,
        },
      },
    },
    embed: {
      class: Embed,
      inlineToolbar: false,
      config: {
        services: { youtube: true, coub: true },
      },
    },
    paragraph: { class: Paragraph },

    onReady: async () => {
      if (articleContent.dataset.articleMode === "edit") {
        await editor.blocks.renderFromHTML(initialData);
      }
    },
  });

  const submitArticleButton = document.getElementById("submit-article-btn");
  const articleForm = document.getElementById("article-form");

  submitArticleButton.addEventListener("click", function (event) {
    event.preventDefault();

    editor.save().then((outputData) => {
      const edjsParser = edjsHTML();
      let result = edjsParser.parse(outputData).join("\n");
      articleContent.value = result;

      articleForm.submit();
    });
  });
});
