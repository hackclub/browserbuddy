chrome.storage.local.get("snippets", function (data) {
    (data.snippets || []).forEach((snippet) => {
      document.body.innerHTML = document.body.innerHTML.replace(
        new RegExp(snippet.text, "g"),
        `<span class="highlighted" style="background-color:${snippet.color};">${snippet.text}</span>`
      );
    });
  });
  