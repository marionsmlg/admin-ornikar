document.addEventListener("DOMContentLoaded", async () => {
  const inputArticleContent = document.getElementById("article-content");
  const initialData = inputArticleContent.value;
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
      await editor.blocks.renderFromHTML(initialData);
    },
  });

  const saveArticleButton = document.getElementById("save-article-btn");
  const editArticleForm = document.getElementById("edit-article-form");
  saveArticleButton.addEventListener("click", function (event) {
    event.preventDefault();

    editor.save().then((outputData) => {
      const edjsParser = edjsHTML();
      let result = edjsParser.parse(outputData).join("\n");
      inputArticleContent.value = result;

      editArticleForm.submit();
    });
  });
});
