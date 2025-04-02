// // Populate the Todo List (Example items, can be saved to storage in the actual extension)
// const todoItems = ['Learn JavaScript', 'Build a Chrome Extension', 'Contribute to Open Source'];
// const todoList = document.getElementById('todoList');
// todoItems.forEach(item => {
//   const li = document.createElement('li');
//   li.textContent = item;
//   todoList.appendChild(li);
// });

//Define Popups Array
const popups = {};

async function fetchTitleAndFavicon(url) {
  try {
    const response = await fetch('http://zymono.com/gettitleandfavicon', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ url }),
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching data:', error);
    return null;
  }
}

function getBaseUrl(url) {
  // If the URL is not provided, use the current page's URL
  if (!url) {
    url = window.location.href;
  }

  // Parse the URL to get its components
  const parsedURL = new URL(url);

  // Combine the protocol, hostname, and port (if applicable) to form the base URL
  const baseUrl = `${parsedURL.protocol}//${parsedURL.hostname}${parsedURL.port ? ':' + parsedURL.port : ''}`;

  return baseUrl;
}
try {
  if (!String(window.location).includes('inte')) {
    chrome.storage.sync.get(['stack'], result => {
      if (!result.stack == true) {
        document.getElementById('stackoverflow').remove()
      }
    })
    chrome.storage.sync.get(['replit'], result => {
      if (!result.replit == true) {
        document.getElementById('replit').remove()
      }
    })
    chrome.storage.sync.get(['github'], result => {
      if (!result.github == true) {
        document.getElementById('github').remove()
        document.getElementById('githubbtn').remove()
      }
    })
    chrome.storage.sync.get(['snippet'], result => {
      if (!result.snippet == true) {
        document.getElementById('snippetbtn').remove()
      }
    })
    chrome.storage.sync.get(['lighthouse'], result => {
      if (!result.lighthouse == true) {
        document.getElementById('lighthouse').remove()
      }
    })
    chrome.storage.sync.get(['codepen'], result => {
      if (!result.codepen == true) {
        document.getElementById('codepen').remove()
      }
    })
    chrome.storage.sync.get(['playground'], result => {
      if (!result.playground == true) {
        document.getElementById('playground').remove()
      }
    })
    chrome.storage.sync.get(['openai'], result => {
      if (!result.openai == true) {
        document.getElementById('openai').remove()
      }
    })
  }
} catch { }

try {
  chrome.storage.sync.get(['tabs'], result => {
    if (result.tabs) {
      const tabs = JSON.parse(result.tabs)

      tabs.forEach(function (tab, index) {
        const tabElement = document.createElement('a')
        const tabsDiv = document.getElementById('tabs')
        tabElement.href = tab

        fetchTitleAndFavicon(tab)
          .then(data => {
            if (String(data.favicon).includes('https://') || String(data.favicon).includes('http://')) {
              tabElement.innerHTML = `<img src="${data.favicon}" height="32px" width="32px"> ${data.title}`
              tabElement.classList.add('button')
              tabElement.classList.add('del')
              tabsDiv.append(tabElement)
            } else if (String(data.favicon).includes('chrome-extension') || String(data.favicon).includes('found')) {
              console.log('chrome')
              tabElement.innerHTML = `<img src="/images/DevPortal.png" height="32px" width="32px"> ${data.title}`
              tabElement.classList.add('button')
              tabElement.classList.add('del')
              tabsDiv.append(tabElement)
            } else {
              console.log('ese')
              tabElement.innerHTML = `<img src="${getBaseUrl(tab)}${data.favicon}" height="32px" width="32px"> ${data.title}`
              tabElement.classList.add('button')
              tabElement.classList.add('del')
              tabsDiv.append(tabElement)
            }
          })
      })
    }
  })
} catch { }

// setTimeout(function() {
// document.querySelectorAll('.del').addEventListener('load', function() {
//   const tabs = document.querySelectorAll('.del')

//   tabs.forEach(function(tab) {
//     tab.addEventListener('contextmenu', function() {
//       event.preventDefault();
//       alert('hello')
//       chrome.storage.sync.get(['tabs'], result => {
//         if (result.tabs) {

//         }
//         })
//     })
//   })
// })
/* The above code is using JavaScript to set a timeout of 200 milliseconds before executing the code
inside the function. */
// }, 200)
// chrome.storage.sync.get(['goal'], result => {
//   if (result.goal) {
//     fetchTitleAndFavicon(result.goal)
//     .then(data => {
//       if (String(data.favicon).includes('https://') || String(data.favicon).includes('http://')) {
//         console.log(result.goal)
//           document.getElementById('goal').innerHTML = `<img src="${data.favicon}" height="32px" width="32px"> ${data.title}`
//       } else if (String(data.favicon).includes('chrome-extension') || String(data.favicon).includes('found')) {
//         console.log('chrome')
//           document.getElementById('goal').innerHTML = `<img src="/images/DevPortal.png" height="32px" width="32px"> ${data.title}`
//       } else {
//         console.log('ese')
//           document.getElementById('goal').innerHTML = `<img src="${getBaseUrl(result.goal)}${data.favicon}" height="32px" width="32px"> ${data.title}`
//       }
//     })



//   }
// })
// }

let search;
chrome.storage.sync.get(['searchEngine'], result => {
  search = result.searchEngine || 'https://www.google.com/search?q=';
  console.log(search)
});

// document.addEventListener('keyup', function(event) {
//   if (event.key === 'Shift') {
//     shiftKeyPressed = false;
//     chrome.storage.sync.get(['goal'], result => {
//       if (result.goal) {
//         fetchTitleAndFavicon(result.goal)
//         .then(data => {
//           if (String(data.favicon).includes('https://') || String(data.favicon).includes('http://')) {
//             console.log(result.goal)
//               document.getElementById('goal').innerHTML = `<img src="${data.favicon}" height="32px" width="32px"> ${data.title}`
//           } else if (String(data.favicon).includes('chrome-extension') || String(data.favicon).includes('found')) {
//             console.log('chrome')
//               document.getElementById('goal').innerHTML = `<img src="/images/DevPortal.png" height="32px" width="32px"> ${data.title}`
//           } else {
//             console.log('ese')
//               document.getElementById('goal').innerHTML = `<img src="${getBaseUrl(result.goal)}${data.favicon}" height="32px" width="32px"> ${data.title}`
//           }
//         })
//       }
//     })

//     document.getElementById('goal').addEventListener('click', function() {

//     })
//   }
// });
// document.addEventListener('keydown', function(event) {
//   if (event.key === 'Shift') {
//     shiftKeyPressed = true;
//     document.getElementById('goal').addEventListener('click', function() {
//       const prompt = window.prompt('Enter a url for your goal.', 'E.g. https://edx.org/school/google/')

//       if (prompt == 'delete') {
//         chrome.storage.sync.remove(['goal'])
//         location.reload()
//       }

//       if (prompt) {
//         chrome.storage.sync.set({ goal: prompt }, () => {
//           location.reload()
//         })
//       }
//     })
//   }
// });

try {
  if (String(search).includes('ai')) {
    document.getElementById('o').innerText = 'Ask'
  }
  document.getElementById('o').addEventListener('click', function () {
    window.location = `${search}${document.getElementById('i').value}`
  })
  document.getElementById('so').addEventListener('click', function () {
    window.location = `https://stackoverflow.com/search?q=${document.getElementById('soi').value}`
  })
  document.getElementById('ro').addEventListener('click', function () {
    window.location = `https://replit.com/search?query=${document.getElementById('ri').value}&category=Files&hasCurrentUser=true`
  })
  document.getElementById('gho').addEventListener('click', function () {
    window.location = `https://github.com/search?q=${document.getElementById('ghi').value}&category=Files`
  })
  document.getElementById('lgr').addEventListener('click', function () {
    window.location = `https://googlechrome.github.io/lighthouse/viewer/?psiurl=${encodeURIComponent(document.getElementById('lurl').value)}&strategy=desktop&category=performance&category=accessibility&category=best-practices&category=seo&category=pwa&utm_source=lh-chrome-ext`
  })


  // document.getElementById('goal').addEventListener('click', function() {
  //   const prompt = window.prompt('Enter a url for your goal.', 'E.g. https://edx.org/school/google/')

  //   if (prompt == 'delete') {
  //     chrome.storage.sync.remove(['goal'])
  //     location.reload()
  //   }

  //   if (prompt) {
  //     chrome.storage.sync.set({ goal: prompt }, () => {
  //       location.reload()
  //     })
  //   }
  // })

  // document.getElementById('cpo').addEventListener('click', function() {
  //   // window.location = `https://github.com/search?q=${document.getElementById('cpi').value}&category=Files`
  //   fetch("https://codepen.io/pen/define", {
  //     method: "POST",
  //     target: "_blank",
  //     headers: {
  //       "Content-Type": "application/json"
  //     },
  //     body: JSON.stringify({
  //       title: "New Dev Pen!",
  //       description: "New Codepen project created with the Zymono Developer Portal.",
  //       html: document.getElementById('cpi').value
  //     })
  //   })
  // })
} catch { }

// try {
// if (!window.localStorage.getItem('github')) {
//     document.getElementById('githubbtn').remove()
// }
// } catch {}


try {
  document.getElementById("i").addEventListener("keypress", function (event) {
    if (event.keyCode === 13 || event.which === 13) {
      // The Enter key was pressed
      var inputValue = event.target.value;
      window.location = `${search}${document.getElementById('i').value}`
    }
  });
  document.getElementById("soi").addEventListener("keypress", function (event) {
    if (event.keyCode === 13 || event.which === 13) {
      // The Enter key was pressed
      var inputValue = event.target.value;
      window.location = `https://stackoverflow.com/search?q=${document.getElementById('soi').value}`
    }
  });
  document.getElementById("ri").addEventListener("keypress", function (event) {
    if (event.keyCode === 13 || event.which === 13) {
      // The Enter key was pressed
      var inputValue = event.target.value;
      window.location = `https://replit.com/search?query=${document.getElementById('ri').value}&category=Files&hasCurrentUser=true`
    }
  });
  document.getElementById("ghi").addEventListener("keypress", function (event) {
    if (event.keyCode === 13 || event.which === 13) {
      // The Enter key was pressed
      var inputValue = event.target.value;
      window.location = `https://github.com/search?q=${document.getElementById('ghi').value}&category=Files`
    }
  });
  document.getElementById('cpi').addEventListener('keyup', function () {
    document.getElementById('cpb').value = `{"title": "New Dev Pen!", "html": "${document.getElementById('cpi').value}"}`
  })

  document.getElementById('purl').addEventListener('keyup', function () {
    document.getElementById('pform').action = document.getElementById('purl').value
  })
  document.getElementById('ptype').addEventListener('keyup', function () {
    document.getElementById('pform').method = document.getElementById('ptype').value
  })
  //   document.getElementById("cpi").addEventListener("keypress", function(event) {
  //     if (event.keyCode === 13 || event.which === 13) {
  //         // The Enter key was pressed
  //         var inputValue = event.target.value;
  //         fetch("https://codepen.io/pen/define", {
  //           method: "POST",
  //           target: "_blank",
  //           headers: {
  //             "Content-Type": "application/json"
  //           },
  //           body: JSON.stringify({
  //             title: "New Dev Pen!",
  //             description: "New Codepen project created with the Zymono Developer Portal.",
  //             html: document.getElementById('cpi').value
  //           })
  //         })
  //     }
  // });
} catch { }

window.onload = function () {
  document.getElementById('i').focus();
  document.getElementById('i').click()
};
// let i = false;
// document.addEventListener('keydown', function(event) {
//   const pressedKey = event.key;
//   if (!i) {
//     document.getElementById('i').value == event.key
//   document.getElementById('i').focus();
//   document.getElementById('i').click()

//   i = true;
//   return
//   }

// });
// const accessToken = "<your_access_token>";

// const fetchData = async () => {
//   const url = "https://api.dropboxapi.com/2/file_requests/list_v2";
//   const limit = 1000;

//   try {
//     const response = await fetch(url, {
//       method: "POST",
//       headers: {
//         Authorization: `Bearer ${accessToken}`,
//         "Content-Type": "application/json"
//       },
//       body: JSON.stringify({ limit })
//     });

//     if (!response.ok) {
//       throw new Error(`Request failed with status: ${response.status}`);
//     }

//     const data = await response.json();
//     console.log(data); // Use the response data as needed
//   } catch (error) {
//     console.error("Error fetching data:", error);
//   }
// };

// fetchData();

try {
  chrome.storage.sync.get(['news'], result => {
    if (result.news) {
      const apiUrl = 'https://hacker-news.firebaseio.com/v0/topstories.json?print=pretty';
      const articleBaseUrl = 'https://hacker-news.firebaseio.com/v0/item/';

      fetch(apiUrl)
        .then((response) => response.json())
        .then((data) => {
          // Shuffle the article IDs randomly
          const shuffledIds = data.sort(() => Math.random() - 0.5).slice(0, 30);

          const articlesContainer = document.getElementById('cards');
          const promises = shuffledIds.map((id) =>
            fetch(`${articleBaseUrl}${id}.json`).then((response) => response.json())
          );

          Promise.all(promises)
            .then((articles) => {
              console.log(articles)
              articles = articles.filter((article) => article && article.type === 'story' && article.text);

              articles.slice(0, 3).forEach((article) => {
                const trimmedText = article.text.length > 300 ? `${article.text.slice(0, 300)}...` : article.text;

                const articleElement = document.createElement('article');
                articleElement.className = 'news';
                articleElement.innerHTML = `
                  <div class="news-header">
                    <div>
                      <span><img src="/images/DevPortal.png" /></span>
                      <h3>${article.title}</h3>
                    </div>
                  </div>
                  <div class="news-body">
                    <span>${trimmedText}</span>
                  </div>
                  <div class="news-footer">
                    <a href="#news-${article.id}">Read more</a>
                  </div>
                `;
                articlesContainer.insertBefore(articleElement, document.getElementById('insert'));
              });
            })
            .catch((error) => console.error('Error fetching articles:', error));
        })
        .catch((error) => console.error('Error fetching article IDs:', error));
    }
  })
} catch { }

window.addEventListener('hashchange', handleHashChange);

function handleHashChange() {
  console.log(window.location.hash)
  const articleBaseUrl = 'https://hacker-news.firebaseio.com/v0/item/';
  // This function will be called whenever the hash in the URL changes.
  // You can add your logic here to respond to the hash change.
  if (String(window.location.hash).includes('news-')) {
    const hash = String(window.location.hash).split('news-')

    const id = hash[1]
    console.log(id)

    fetch(`${articleBaseUrl}${id}.json`)
      .then((response) => response.json())
      .then((article) => {
        console.log(article)

        let button = ``

        if (article.id) {
          button += `<a href="https://news.ycombinator.com/item?id=${article.id}" target="_blank" class="popupfield"
      style="background-color: #8484ff; text-align: center; text-decoration: none; width: 100%;">
                  View Post
                </a>`
        }

        if (article.url) {
          button += `<a href="${article.url}" target="_blank" class="popupfield"
      style="background-color: #8484ff; text-align: center; text-decoration: none; width: 100%;">
                  Go to URL
                </a>`
        }


        const html = `
    <div id="todo-popup" class="my-popup nf" style="display:block;">
    <div class="popup-content">
      <span class="close" id="close">&times;</span>
      <h2>This tab is managed by an integration</h2>
      <form>
        <h1>${article.title}</h1>
        <p>${article.text}</p>
        ${button}
      </form>
    </div>
  </div>`


        document.querySelector('body').innerHTML += html
        document.getElementById('close').addEventListener('click', function () {
          document.getElementById('close').parentElement.parentElement.remove()
          window.location = '#'
        })
      })
      .catch((error) => {
        console.error('Error fetching data:', error);
        // Optionally, you can alert an error message if something goes wrong during the fetch.
        alert('Error fetching data. Please try again later.');
      });

  }

  if (String(window.location.hash).includes('popup-')) {
    const hash = String(window.location.hash).split('popup-')
    console.log(popups[hash[1]])

    const html = `
    <div id="popup-${popups[hash[1]].id}" class="my-popup nf" style="display:block;">
    <div class="popup-content">
      <span class="close" id="close">&times;</span>
      <h2>This tab is managed by an integration</h2>
      <form>
        <h1>${new URLSearchParams(location.search).get('title') || popups[hash[1]].title}</h1>
        ${new URLSearchParams(location.search).get('content') || popups[hash[1]].content}
      </form>
    </div>
  </div>`


        document.querySelector('body').innerHTML += html
        document.getElementById('close').addEventListener('click', function () {
          document.getElementById('close').parentElement.parentElement.remove()
          window.location = '#'
        })
  }
  // Or call a specific function to handle the hash change
  // handleHashChangeLogic(window.location.hash);
}

/* <article class="news">
<div class="news-header">
  <div>
    <span><img src="https://asset.brandfetch.io/ido8Wu58rI/idh6-gIMsD.svg" /></span>
    <h3>News</h3>
  </div>
</div>
            
<div class="news-body">
  <span>
    Hello I am a news article
                </span>
</div>
<div class="news-footer">
  <a href="https://replit.com/">Open Replit</a>
</div>
</article> */

// GET REPLIT USER INFO

try {
  chrome.storage.sync.get(['replpfp', 'replname', 'replbio', 'replurl'], result => {
    if (result.replpfp) {
      document.getElementById('replpfp').src = result.replpfp
      document.getElementById('replurl').href = result.replurl + '?newRepl'
      document.getElementById('replname').innerText = `Replit: ${result.replname}`
    }
  })

  // script.js
  const developerJokes = [
    "Why do programmers prefer dark mode? Because light attracts bugs!",
    "Why did the developer go broke? Because he used up all his cache!",
    "Why did the developer quit his job? He didn't get arrays.",
    "Why do programmers always mix up Christmas and Halloween? Because Oct 31 == Dec 25!",
    "Why do developers prefer to work in the dark? Because light travels faster than sound, and they want to appear bright until you hear them speak.",
    "Why don't programmers like nature? It has too many bugs.",
    "Why do developers prefer dark chocolate? Because it's byte-sized!",
    "Why was the JavaScript developer sad? Because he didn't `null`ify his feelings.",
    "Why do C# developers keep their windows open? Because they want to catch all the exceptions!",
    "Why did the developer break up with his git repository? It had too many conflicts and couldn't commit.",
    "Why do developers always mix up their left and right? Because they're always using `=` instead of `==`.",
    "Why do Java developers wear glasses? Because they can't C#!",
    "Why do developers always bring their umbrellas? In case it starts raining functions.",
    "Why do programmers always mix up Christmas and Halloween? Because Oct 31 == Dec 25!",
    "Why don't developers get along with their managers? Because they don't appreciate their constant refactoring.",
    "Why don't front-end developers like nature? It has too many bugs they can't style.",
    "Why was the developer's computer cold? It left its Windows open!",
    "Why did the developer go broke? Because he didn't have enough cache flow!",
    "Why do developers prefer dark mode? Because light attracts bugs!",
    "Why do developers prefer Git in their version control? Because they can branch out easily when they have commitment issues.",
    "Why do programmers always mix up their Halloween and Christmas decorations? Because Oct 31 == Dec 25!",
    "Why don't programmers like to play hide and seek? Because good players are hard to find.",
    "Use Toggled at toggled.tech",
    "Why do programmers always mix up Christmas and Halloween? Because Oct 31 == Dec 25!",
    "Why did the developer start using tabs instead of spaces? Because he wanted to break free!",
    'Why do developers prefer dark themes? Because they find them more "comforting" during debugging sessions.',
    "Why was the computer cold? It left its Windows open!",
    "Why do Java developers always wear glasses? Because they don't C#!",
    'Why do developers bring their umbrellas? Because they expect some "JavaScript" showers.',
    "Why was the web developer so cold? His stylesheets were in the Arctic.",
    'Why do C# developers keep their windows open? Because they want to "catch" all the bugs.',
    `Why did the developer go broke? Because he didn't get "arrays" in life.`,
  ];

  // Add more jokes here (up to 31)

  chrome.storage.sync.get(['jokes'], result => {
    if (result.jokes) {
      function getJokeOfTheDay() {
        const currentDate = new Date();
        const jokeIndex = currentDate.getDate() % developerJokes.length;
        return developerJokes[jokeIndex];
      }

      function displayJoke() {
        const jokeContainer = document.getElementById('joke-container');
        // let joke = localStorage.getItem('developer_joke');
        const joke = getJokeOfTheDay();

        jokeContainer.innerHTML = `<p>${joke}</p>`;
      }

      displayJoke();
    }
  })


  // Check if dark mode is enabled
  function isDarkModeEnabled() {
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  }

  // Check if light mode is enabled
  function isLightModeEnabled() {
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches;
  }

  // Example usage
  if (isDarkModeEnabled()) {
    console.log("Dark mode is enabled.");
    document.getElementById('logo').src = 'images/Toggled-Light-Left.png'
    // Your dark mode specific code here
  } else if (isLightModeEnabled()) {
    console.log("Light mode is enabled.");
    document.getElementById('logo').src = 'images/Toggled-Left.png'
    // Your light mode specific code here
  } else {
    console.log("Color scheme preference not detected.");
    document.getElementById('logo').src = 'images/Toggled.png'
    // Handle the case when the preference is not explicitly set.
  }
} catch { }

function pin() {
  chrome.storage.sync.get(['pin'], result => {
    if (result.pin) {
      if (!window.sessionStorage.getItem('pass') && result.pin) {
        const bg = document.createElement('div')
        bg.setAttribute('style', 'display: block; background-color: white; position: fixed; left: 0; top: 0; width: 100vw; height: 100vh; z-index: 999999;')

        document.querySelector('html').append(bg)

        setTimeout(function () {
          if (window.prompt('Enter your pin!') == window.atob(result.pin)) {
            bg.remove()
            window.sessionStorage.setItem('pass', 'true')
          } else {
            pin()
          }
        }, 2)
      }
    }
  })
}

pin()

async function fetchAndParseModules() {
  chrome.storage.sync.get({ modules: [] }, async (data) => {
    const modules = data.modules;

    if (modules.length === 0) {
      console.log("No modules found.");
      return;
    }

    for (const url of modules) {
      try {
        const response = await fetch(url);
        if (!response.ok) {
          console.error(`Failed to fetch module: ${url}`);
          continue;
        }

        const scriptContent = await response.text();
        // console.log(`Module from ${url}:\n`, scriptContent);
        const content = JSON.parse(scriptContent)

        // Get details
        const details = content.details;
        const blocks = content.blocks;
    
        if (details) {
          console.log("Extracted App Details:", details);
        } else {
          console.error("Failed to extract app details.");
          return "No details"
        }

        if (blocks) {
          // console.log("Extracted Blocks:", blocks);

          blocks.forEach((block) => {
            document.getElementById("cards").innerHTML += `<article class="card ${block.styles}" id="module-${details.name}-${block.title}">
                  <div class="card-header">
                    <div>
                      <span><img src="${block.icon}" /></span>
                      <h3>${block.title}</h3>
                    </div>
                  </div>
                  
                  
                  <div class="card-body">
                    ${block.content}
                  </div>
                  <div class="card-footer">
                    ${block.actions.map(action => `<a href="${action.target}" class="${action.styles}" style="margin-left: 10px">${action.title}</a>`).join('')}
                  </div>
                </article>`
          })
        }

        if (content.popups) {
          const popups1 = content.popups;
          console.log("Extracted Popups:", popups1);
          popups1.forEach((popup) => {
            popups[popup.id] = popup;
          })
        }

        if (content.panels) {
          const panels = content.panels;
          // console.log("Extracted Panels:", panels);
          document.getElementById("homeTab").addEventListener('click', () => {
            document.getElementById("cards").style.display = '';
            document.getElementById("customPanel").style.display = 'none';
            document.querySelector("#vertical-tabs .active").classList.remove("active");
            document.getElementById("homeTab").classList.add("active");
            document.getElementById("customPanel").innerHTML = ''
          })

          panels.forEach((panel) => {
            const panelElement = document.createElement('a');
            panelElement.href = '#';
            panelElement.textContent = panel.title;
            panelElement.addEventListener('click', () => {
              document.getElementById("cards").style.display = 'none';
              document.getElementById("customPanel").style.display = '';
              document.querySelector("#vertical-tabs .active").classList.remove("active");
              panelElement.classList.add("active");

              panel.blocks.forEach((block) => {
                document.getElementById("customPanel").innerHTML += `<article class="card ${block.styles}" id="module-${details.name}-${block.title}">
                      <div class="card-header">
                        <div>
                          <span><img src="${block.icon}" /></span>
                          <h3>${block.title}</h3>
                        </div>
                      </div>
                      
                      
                      <div class="card-body">
                        ${block.content}
                      </div>
                      <div class="card-footer">
                        ${block.actions.map(action => `<a href="${action.target}" class="${action.styles}" style="margin-left: 10px">${action.title}</a>`).join('')}
                      </div>
                    </article>`
              })

            })
            document.getElementById("vertical-tabs").appendChild(panelElement);
          })
        }

      } catch (error) {
        console.warn(`Error fetching module from ${url}:`, error);
      }
    }
  });
}

// Function to convert a JavaScript object-like string to valid JSON
function normalizeJavaScriptObject(jsObjectString) {
  return JSON.parse(
    jsObjectString
      .replace(/(\w+):/g, '"$1":') // Quote unquoted keys
      .replace(/'/g, '"') // Convert single quotes to double quotes
  );
}


// Call the function to fetch and parse modules
fetchAndParseModules();

