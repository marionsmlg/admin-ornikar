document.addEventListener("DOMContentLoaded", async () => {
  const editor = new EditorJS({
    autofocus: true,
    holdId: "editorjs",
    logLevel: "ERROR",

    tools: {
      header: { class: Header, inlineToolbar: ["link"] },
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

  let saveBtn = document.querySelector("button");

  saveBtn.addEventListener("click", function () {
    editor
      .save()
      .then((outputData) => {
        const edjsParser = edjsHTML();
        let result = edjsParser.parse(outputData).join("\n");
        console.log("Article data :", result);
      })
      .catch((error) => {
        console.log("Saving failed:", error);
      });
  });
});
