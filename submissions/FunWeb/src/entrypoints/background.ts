export default defineBackground(() => {
	console.log("Hello background!", { id: browser.runtime.id });

	// Map of functions for "fun" scripts
	const funScripts = {
		upsideDownWeb: () => {
			document.body.style.transform = "rotate(180deg)";
		},
		noVisualStuff: () => {
			Array.from(document.body.getElementsByTagName("*")).forEach((el) => {
				el.style.visibility = "hidden";
			});
		},
		shakeOnType: () => {
			const onKeyPress = () => {
				document.body.style.transform = `translate(${
					Math.random() * 10 - 5
				}px, ${Math.random() * 10 - 5}px)`;
			};
			document.addEventListener("keypress", onKeyPress);
		},
		blockyWeb: () => {
			const style = document.createElement("style");
			style.innerHTML = `
				*, *::before, *::after {
					border-radius: 0px !important;
          letter-spacing: 3px;
          font-family: 'Courier New', monospace;
				}
			`;
			document.head.appendChild(style);
		},
		terminalWeb: () => {
			document.body.style.backgroundColor = "black";
			document.body.style.color = "green";
			document.body.style.fontFamily = "'Courier New', monospace";

			const style = document.createElement("style");
			style.innerHTML = `
				*, *::before, *::after {
					background-color: black !important;
					color: green !important;
				}
			`;
			document.head.appendChild(style);
		},
	};

	browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
		if (message.action === "executeFunScript" && message.scriptName) {
			const scriptToExecute = funScripts[message.scriptName];
			if (!scriptToExecute) return;

			browser.tabs.query({ active: true, currentWindow: true }).then((tabs) => {
				if (tabs[0] && tabs[0].id !== undefined) {
					browser.scripting.executeScript({
						target: { tabId: tabs[0].id },
						func: scriptToExecute,
					});
				}
			});
		} else if (message.action == "reloadTab") {
			browser.tabs.query({ active: true, currentWindow: true }).then((tabs) => {
				if (tabs[0] && tabs[0].id !== undefined) {
					browser.tabs.reload(tabs[0].id);
				}
			});
		}
	});
});
