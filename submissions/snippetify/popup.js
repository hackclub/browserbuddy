document.addEventListener("DOMContentLoaded", function () {
  let snippetList = document.getElementById("snippetList");

  chrome.storage.local.get("snippets", function (data) {
    snippetList.innerHTML = "";

    (data.snippets || []).forEach((snippet, index) => {
      let li = document.createElement("li");
      li.style.backgroundColor = snippet.color;
      li.classList.add("snippet");

      let headingInput = document.createElement("input");
      headingInput.type = "text";
      headingInput.value = snippet.heading;
      headingInput.classList.add("heading-input");

      headingInput.addEventListener("change", function () {
        chrome.storage.local.get("snippets", function (data) {
          let snippets = data.snippets || [];
          snippets[index].heading = headingInput.value;
          chrome.storage.local.set({ snippets: snippets });
        });
      });

      // highlighted text container
      let textContainer = document.createElement("div");
      textContainer.classList.add("text-container");

      let text = document.createElement("span");
      text.classList.add("highlighted-text");

      let fullText = snippet.text;
      let truncatedText = fullText.length > 150 ? fullText.substring(0, 140) + "..." : fullText;
      text.innerHTML = truncatedText;

      let readMore = document.createElement("a");
      readMore.textContent = " read more";
      readMore.href = "#";
      readMore.classList.add("read-more");
      readMore.style.display = fullText.length > 150 ? "inline" : "none";

      let isExpanded = false;
      readMore.addEventListener("click", function (event) {
        event.preventDefault();
        isExpanded = !isExpanded;
        text.innerHTML = isExpanded ? fullText : truncatedText;
        readMore.textContent = isExpanded ? " read less" : " read more";
      });

      textContainer.appendChild(text);
      // textContainer.appendChild(document.createElement("br")); 
      textContainer.appendChild(readMore);

      // button container (stacked vertically)
      let buttonContainer = document.createElement("div");
      buttonContainer.classList.add("button-container");

      let link = document.createElement("a");
      link.href = snippet.url;
      link.textContent = "🔗";
      link.target = "_blank";
      link.classList.add("icon-button");

      let removeBtn = document.createElement("button");
      removeBtn.textContent = "×";
      removeBtn.classList.add("delete-btn");
      removeBtn.onclick = function () {
        chrome.storage.local.get("snippets", function (data) {
          let snippets = data.snippets || [];
          snippets.splice(index, 1);
          chrome.storage.local.set({ snippets: snippets }, function () {
            location.reload();
          });
        });
      };

      buttonContainer.appendChild(link);
      buttonContainer.appendChild(removeBtn);

      let snippetRow = document.createElement("div");
      snippetRow.classList.add("snippet-row");
      snippetRow.appendChild(textContainer);
      snippetRow.appendChild(buttonContainer);

      li.appendChild(headingInput);
      li.appendChild(snippetRow);
      snippetList.appendChild(li);
    });
  });
});
