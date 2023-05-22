document.addEventListener("DOMContentLoaded", async () => {
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
  });

  const createArticleButton = document.getElementById("create-article-btn");
  const createArticleForm = document.getElementById("create-article-form");
  const inputContent = document.createElement("input");
  inputContent.setAttribute("type", "hidden");
  inputContent.setAttribute("name", "content");
  createArticleForm.appendChild(inputContent);

  createArticleButton.addEventListener("click", function (event) {
    event.preventDefault();

    editor.save().then((outputData) => {
      const edjsParser = edjsHTML();
      let result = edjsParser.parse(outputData).join("\n");
      inputContent.setAttribute("value", `${result}`);

      createArticleForm.submit();
    });
  });
});
