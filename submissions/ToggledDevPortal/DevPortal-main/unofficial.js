async function fetchAndParseModules() {
    chrome.storage.sync.get({ modules: [] }, async (data) => {
      const modules = data.modules;
  
      if (modules.length === 0) {
        console.log("No modules found.");
        return;
      }
  
      for (const url of modules) {
        console.log(url)
        try {
          const response = await fetch(url);
          if (!response.ok) {
            console.error(`Failed to fetch module: ${url}`);
            document.getElementById("card-grid").innerHTML += `<article class="card">
							<div class="card-header">
								<div>
									<h3>Unkown Module</h3>
								</div>
								<label class="toggle">
									<input type="checkbox" checked disabled>
									<span></span>
								</label>
							</div>
							<div class="card-body">
								<p>${url}</p>
							</div>
							<div class="card-footer">
								<a href="#" id="remove-${window.btoa(url)}">Remove Module</a>
							</div>
						</article>`

                        setTimeout(() => {
                            document.getElementById(`remove-${window.btoa(url)}`).addEventListener('click', () => {
                                chrome.storage.sync.get({ modules: [] }, (data) => {
                                    let modules = data.modules;
                                    modules = modules.filter(module => module !== url)
                                    chrome.storage.sync.set({ modules }, () => {
                                        alert("Module removed successfully.");
                                        window.location.reload();
                                    });
                                });
                            })
                        }, 200)
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

            document.getElementById("card-grid").innerHTML += `<article class="card">
							<div class="card-header">
								<div>
									<span><img src="${details.icon}" /></span>
									<h3>${details.name}</h3>
								</div>
								<label class="toggle">
									<input type="checkbox" checked disabled>
									<span></span>
								</label>
							</div>
							<div class="card-body">
								<p>${details.description}</p>
							</div>
							<div class="card-footer">
								<a href="#" id="remove-${window.btoa(url)}">Remove Module</a>
							</div>
						</article>`

                        setTimeout(() => {
                            document.getElementById(`remove-${window.btoa(url)}`).addEventListener('click', () => {
                                chrome.storage.sync.get({ modules: [] }, (data) => {
                                    let modules = data.modules;
                                    modules = modules.filter(module => module !== url)
                                    chrome.storage.sync.set({ modules }, () => {
                                        alert("Module removed successfully.");
                                        window.location.reload();
                                    });
                                });
                            })
                        }, 200)
          } else {
            console.log("No details found for module from", url);
            document.getElementById("card-grid").innerHTML += `<article class="card">
							<div class="card-header">
								<div>
									<h3>Unkown Module</h3>
								</div>
								<label class="toggle">
									<input type="checkbox" checked disabled>
									<span></span>
								</label>
							</div>
							<div class="card-body">
								<p>${url}</p>
							</div>
							<div class="card-footer">
								<a href="#" id="remove-${window.btoa(url)}">Remove Module</a>
							</div>
						</article>`

                        setTimeout(() => {
                            document.getElementById(`remove-${window.btoa(url)}`).addEventListener('click', () => {
                                chrome.storage.sync.get({ modules: [] }, (data) => {
                                    let modules = data.modules;
                                    modules = modules.filter(module => module !== url)
                                    chrome.storage.sync.set({ modules }, () => {
                                        alert("Module removed successfully.");
                                        window.location.reload();
                                    });
                                });
                            })
                        }, 200)
            // return "No details"
          }
  
        } catch (error) {
          console.warn(`Error fetching module from ${url}:`, error);
          document.getElementById("card-grid").innerHTML += `<article class="card">
							<div class="card-header">
								<div>
									<h3>Unkown Module</h3>
								</div>
								<label class="toggle">
									<input type="checkbox" checked disabled>
									<span></span>
								</label>
							</div>
							<div class="card-body">
								<p>${url}</p>
							</div>
							<div class="card-footer">
								<a href="#" id="remove-${window.btoa(url)}">Remove Module</a>
							</div>
						</article>`

                        setTimeout(() => {
                            document.getElementById(`remove-${window.btoa(url)}`).addEventListener('click', () => {
                                chrome.storage.sync.get({ modules: [] }, (data) => {
                                    let modules = data.modules;
                                    modules = modules.filter(module => module !== url)
                                    chrome.storage.sync.set({ modules }, () => {
                                        alert("Module removed successfully.");
                                        window.location.reload();
                                    });
                                });
                            })
                        }, 200)
        }
      }
    });
  }
  
  
  // Call the function to fetch and parse modules
  fetchAndParseModules();
  
  