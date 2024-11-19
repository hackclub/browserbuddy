chrome.storage.local.get("twitter.inlineShowMore", function (result) {
  if (result["twitter.inlineShowMore"] === true) {
    inlineShowMore();
  }
});
chrome.storage.local.get("twitter.twitterNaming", function (result) {
  if (result["twitter.twitterNaming"] === true) {
    twitterNaming();
  }
});

function inlineShowMore() {
  const collectionHas = (a, b) => {
    for (var i = 0, len = a.length; i < len; i++) if (a[i] == b) return true;
    return false;
  };

  const findParentBySelector = (elm, selector) => {
    var all = document.querySelectorAll(selector);
    var cur = elm.parentNode;
    while (cur && !collectionHas(all, cur)) cur = cur.parentNode;
    return cur;
  };

  const getTweetContent = async (url) => {
    const response = await fetch(url);
    if (!response.ok) {
      console.log(`HTTP error! Status: ${response.status}`);
    }
    const json = await response.json();
    return json.tweet.text;
  };

  const format = (text) => {
    const map = {
      "<": "&lt;",
      ">": "&gt;",
    };
    text = text.replace(/[<>]/gi, (match) => map[match]);
    text = text.replace(
      /@(\w+)/g,
      '<a href="/$1" role="link" style="text-overflow: unset; color: rgb(29, 155, 240); text-decoration: none;">@$1</a>'
    );
    text = text.replace(
      /#(\w+)/g,
      '<a href="/hashtag/$1" role="link" style="text-overflow: unset; color: rgb(29, 155, 240); text-decoration: none;">#$1</a>'
    );
    return text;
  };

  const url = window.location;

  const onDOMChange = (records) => {
    records.forEach((record) => {
      record.addedNodes.forEach((node) => {
        if (!node.querySelector) return;

        let link = node.querySelector(
          "[data-testid='tweet-text-show-more-link']"
        );

        if (link) {
          link.addEventListener("click", async (e) => {
            e.preventDefault();

            const datetime = findParentBySelector(link, "article")
              .querySelector("[datetime]")
              .getAttribute("datetime");
            const url = findParentBySelector(link, "article").querySelector(
              "[datetime]"
            ).parentNode.href;

            const description = await getTweetContent(
              url
                .replace("twitter.com", "api.fxtwitter.com")
                .replace("x.com", "api.fxtwitter.com")
            );

            if (link.parentNode === null) return;
            const tweetText = link.parentNode.querySelector(
              "[data-testid='tweetText']"
            );
            tweetText.innerHTML = format(description);
            tweetText.style.display = "block";

            link.remove();
          });
        }
      });
    });
  };

  var observer = new MutationObserver(onDOMChange);
  observer.observe(document.body, { childList: true, subtree: true });
}

function twitterNaming() {
  let style = document.createElement("style");
  style.innerHTML = `
    @media (min-width: 1300px) {
      .custom-tweet-button {
        visibility: hidden;
        position: relative;
      }
  
      .custom-tweet-button::after {
        content: "Tweet";
        visibility: visible;
        position: relative;
        top: -10px;
      }
    `;
  document.head.appendChild(style);
  replaceLogoAndFavicon();
  observeTitleChanges();
  continuousObserveModifications();

  function replaceLogoAndFavicon() {
    let logo = document.querySelector(
      'svg path[d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"]'
    );
    if (logo) {
      logo.setAttribute(
        "d",
        "M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"
      );
      logo.setAttribute("fill", "#1DA1F2");
    }

    let favicon = document.querySelector('link[rel="shortcut icon"]');
    if (favicon) {
      favicon.href = "https://abs.twimg.com/favicons/twitter.ico";
    }

    let svgPaths = document.querySelectorAll("svg path");

    svgPaths.forEach(function (path) {
      if (window.location.pathname !== "/home") {
        if (path.getAttribute("d").startsWith("M21.591 7.146L12.52 1.157")) {
          path.setAttribute(
            "d",
            "M12 9c-2.209 0-4 1.791-4 4s1.791 4 4 4 4-1.791 4-4-1.791-4-4-4zm0 6c-1.105 0-2-.895-2-2s.895-2 2-2 2 .895 2 2-.895 2-2 2zm0-13.304L.622 8.807l1.06 1.696L3 9.679V19.5C3 20.881 4.119 22 5.5 22h13c1.381 0 2.5-1.119 2.5-2.5V9.679l1.318.824 1.06-1.696L12 1.696zM19 19.5c0 .276-.224.5-.5.5h-13c-.276 0-.5-.224-.5-.5V8.429l7-4.375 7 4.375V19.5z"
          );
        }
      } else {
        if (path.getAttribute("d").startsWith("M21.591 7.146L12.52 1.157")) {
          path.setAttribute(
            "d",
            "M12 1.696L.622 8.807l1.06 1.696L3 9.679V19.5C3 20.881 4.119 22 5.5 22h13c1.381 0 2.5-1.119 2.5-2.5V9.679l1.318.824 1.06-1.696L12 1.696zM12 16.5c-1.933 0-3.5-1.567-3.5-3.5s1.567-3.5 3.5-3.5 3.5 1.567 3.5 3.5-1.567 3.5-3.5 3.5z"
          );
        }
      }
    });

    let titleElement = document.querySelector("title");
    if (titleElement && titleElement.textContent.includes("X")) {
      let regex = / \/ X$/;
      if (regex.test(titleElement.textContent)) {
        titleElement.textContent = titleElement.textContent.replace(
          regex,
          " / Twitter"
        );
      }
    }
  }

  function updateTitle() {
    let titleElement = document.querySelector("title");
    if (titleElement) {
      let regex = / \/ X$/;
      if (regex.test(titleElement.textContent)) {
        titleElement.textContent = titleElement.textContent.replace(
          regex,
          " / Twitter"
        );
      }
    }
  }

  function observeTitleChanges() {
    let targetNode = document.head;

    let config = { childList: true, subtree: true };

    let callback = function (mutationsList, observer) {
      for (let mutation of mutationsList) {
        if (mutation.target.nodeName === "TITLE") {
          updateTitle();
        }
      }
    };

    let observer = new MutationObserver(callback);

    observer.observe(targetNode, config);
  }

  function modifyPostToTweet() {
    const elementInline = document.querySelector(
      'button[data-testid="tweetButtonInline"] div span span'
    );

    const elementModal = document.querySelector(
      'button[data-testid="tweetButton"] div span.css-1jxf684.r-bcqeeo.r-1ttztb7.r-qvutc0.r-poiln3 > span'
    );

    const elementPillLabel = document.querySelector(
      'div[data-testid="pillLabel"].css-1rynq56.r-dnmrzs.r-1udh08x.r-3s2u2q.r-bcqeeo.r-qvutc0.r-37j5jr.r-a023e6.r-rjixqe.r-16dba41.r-1kihuf0.r-13hce6t'
    );

    const elementEmptyState = document.querySelector(
      'div[data-testid="empty_state_body_text"].css-1rynq56.r-bcqeeo.r-qvutc0.r-37j5jr.r-fdjqy7.r-a023e6.r-rjixqe.r-16dba41.r-1nxhmzv'
    );

    const elementHoverLabel = document.querySelector(
      'div[data-testid="HoverLabel"] span.css-1jxf684.r-bcqeeo.r-1ttztb7.r-qvutc0.r-poiln3'
    );

    if (elementInline && elementInline.textContent.includes("Post")) {
      elementInline.textContent = elementInline.textContent.replace(
        "Post",
        "Tweet"
      );
    }

    if (elementHoverLabel && elementHoverLabel.textContent.includes("Post")) {
      elementHoverLabel.textContent = elementHoverLabel.textContent.replace(
        "Post",
        "Tweet"
      );
    }

    if (elementModal && elementModal.textContent.includes("Post")) {
      elementModal.textContent = elementModal.textContent.replace(
        "Post",
        "Tweet"
      );
    }

    if (elementPillLabel && elementPillLabel.textContent.includes("posted")) {
      elementPillLabel.textContent = elementPillLabel.textContent.replace(
        "posted",
        "tweeted"
      );
    }

    if (elementEmptyState) {
      Array.from(elementEmptyState.childNodes).forEach((node) => {
        if (node.nodeType === Node.TEXT_NODE) {
          if (node.textContent.includes("X suspends")) {
            node.textContent = node.textContent.replace(
              "X suspends",
              "Twitter suspends"
            );
          }

          if (node.textContent.includes("posts")) {
            node.textContent = node.textContent.replace("posts", "tweets");
          }
        }
      });
    }

    const elementSidebar = document.querySelector(
      'a[data-testid="SideNav_NewTweet_Button"] span.css-1jxf684.r-bcqeeo.r-1ttztb7.r-qvutc0.r-poiln3'
    );
    if (elementSidebar && elementSidebar.textContent.includes("Post")) {
      elementSidebar.classList.add("custom-tweet-button");
    }
  }

  function modifyTextContent() {
    const elements = document.querySelectorAll(
      "span.css-1jxf684.r-bcqeeo.r-1ttztb7.r-qvutc0.r-poiln3, div.css-146c3p1.r-dnmrzs.r-1udh08x.r-3s2u2q.r-bcqeeo.r-1ttztb7.r-qvutc0.r-37j5jr.r-n6v787.r-1cwl3u0.r-16dba41"
    );

    elements.forEach((element) => {
      switch (element.textContent) {
        case "View post engagements":
          element.textContent = "View tweet engagements";
          break;
        case "Embed post":
          element.textContent = "Embed tweet";
          break;
        case "Live on X":
          element.textContent = "Live on Twitter";
          break;
        case "Sign in to X":
          element.textContent = "Sign in to Twitter";
          break;
        case "View post analytics":
          element.textContent = "View tweet analytics";
          break;
        case "You shared a post":
          element.textContent = "You shared a tweet";
          break;
        case "Post Analytics":
          element.textContent = "Tweet Analytics";
          break;
        case "Share post via …":
          element.textContent = "Share tweet via …";
          break;
        case "Post engagements":
          element.textContent = "Tweet engagements";
          break;
        case "Welcome to X!":
          element.textContent = "Welcome to Twitter!";
          break;
        case "No Reposts yet":
          element.textContent = "No Retweets yet";
          break;
        case "Report post":
          element.textContent = "Report tweet";
          break;
        case "Reposts":
          element.textContent = "Retweets";
          break;
        case "Save post":
          element.textContent = "Save tweet";
          break;
        case "These posts are protected":
          element.textContent = "These tweets are protected";
          break;
        case "Undo repost":
          element.textContent = "Undo retweet";
          break;
        case "X Rules":
          element.textContent = "Twitter Rules";
          break;
        case "Share someone else’s post on your timeline by reposting it. When you do, it’ll show up here.":
          element.textContent =
            "Share someone else’s tweet on your timeline by retweeting it. When you do, it’ll show up here.";
          break;
        default:
          if (element.textContent.includes("Posts")) {
            element.textContent = element.textContent.replace(
              "Posts",
              "Tweets"
            );
          } else if (element.textContent.includes("Repost")) {
            element.textContent = element.textContent.replace(
              "Repost",
              "Retweet"
            );
          } else if (element.textContent.toLowerCase().includes("posts")) {
            element.textContent = element.textContent.replace(
              /posts/g,
              "tweets"
            );
          }
          break;
      }
    });
  }

  function continuousObserveModifications() {
    setInterval(() => {
      modifyTextContent();
      modifyPostToTweet();
      replaceLogoAndFavicon();
    }, 100);
  }

  continuousObserveModifications();
}
