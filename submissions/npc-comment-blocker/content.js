const keywords = [
	"Best",
	"100% music, 0% nudity",
	"Who's here in ",
	"Who's listening to this in ",
	"Like if you're watching this in ",
	"Who's here after watching ",
	"This song never gets old",
	"This brings back memories",
	"This song hits different at 3 am",
	"This is real music, not like today’s trash.",
	"Anyone else getting nostalgic vibes?",
	"This deserves more views/likes!",
	"How many people are still listening to this in [year]?",
	"I’m in [current year], but this song is timeless.",
	"If you're reading this, I hope you have a great day!",
	"Who’s still watching in [year]?",
	"Here before this blows up!",
	"RIP to those who haven’t found this gem yet.",
	"This comment section is a vibe.",
	"This song is a masterpiece, change my mind.",
	"If you're reading this, you're a legend.",
	"Anyone in",
	"R.I.P Legend",
	"You’re a legend if you’re watching this in",
	"Who's listening in",
	"Who's watching in",
	"Who's here in",
	"Who's still listening in",
	"You are allowed to like",
	"Edit: Thanks for the likes!",
	"Edit: I can't believe this blew up!",
	"I see you scrolling through the comments",
	"You are allowed to like",
	"I am not asking for likes",
	"If you like this comment",
	"If you are reading this",
	"If you don't like this comment",
	"Wow this blew",
	"WHO's Still here",
	"2019 anyone?",
	"  Who else is just randomly listening to some old songs",
	"I'm not asking for likes",
	"0% Porn",
	"100% Music",
	"See you in 2030",
	"The older i get",
	"The worst thing about this song is that it ends",
	"This song is my childhood",
	"This song is my life",
	"This song is my love",
	"This song is my soul",
	"This song is my heart",
	"The worst thing about this",
	"Lets get this to",
	"[year] anyone?",
	"[year] [month]",
	"el comentario con más likes es gay",
	"el comentario con más likes es puto",
	"Subscribe to my channel",
	"use me as a mark",
	"느낌 좋은 여자들",
	"이부분때문에",
	"lets pray for those",
	"button",
	"el que lea esto",
	"el comentario con",
	"first",
	"second",
	"third",
	"im here early",
	"amen jesus",
	"only love",
	"free fire",
	"laek share",
	"only legends",
	"first comment",
	"those who ",
	"english or spanish",
	"can i get a",
	"why so many dislikes",
	"why so serious",
	"infinite aura",
	"hawk tuah",
];

/**
 * Replaces placeholders in a keyword with regex patterns.
 * @param {string} keyword - The keyword containing placeholders.
 * @returns {string} - The keyword with placeholders replaced by regex patterns.
 */
function replacePlaceholders(keyword) {
	return keyword
		.replace(/\[year\]/g, "(20\\d{2})")
		.replace(/\[month\]/g, "(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)");
}

/**
 * Creates a regex pattern from a keyword.
 * @param {string} keyword - The keyword to create a regex pattern from.
 * @returns {RegExp} - The regex pattern.
 */
function createPattern(keyword) {
	const patternWithPlaceholders = replacePlaceholders(keyword);
	const escapedPattern = patternWithPlaceholders.replace(
		/[.*+?^${}()|[\]\\]/g,
		"\\$&",
	);
	return new RegExp(`\\b${escapedPattern.replace(/\s+/g, "\\s*")}\\b`, "i");
}

/**
 * Checks if a text contains any of the keywords.
 * @param {string} text - The text to check.
 * @returns {boolean} - True if the text contains any of the keywords, false otherwise.
 */
function containsKeyword(text) {
	return keywords.some((keyword) => createPattern(keyword).test(text));
}

/**
 * Checks and hides or replaces comments that contain any of the keywords.
 * @param {Array<string>} keywords - The list of keywords to check against.
 * @param {boolean} replaceComments - Whether to replace comments with "[Blocked Comment]" or hide them.
 * @param {string} customReplaceWord - The custom word to replace comments with.
 */
function blockComments(keywords, replaceComments, customReplaceWord) {
	const comments = document.querySelectorAll("#content-text");
	// biome-ignore lint/complexity/noForEach: <explanation>
	comments.forEach((comment) => {
		if (containsKeyword(comment.innerText.toLowerCase(), keywords)) {
			if (replaceComments) {
				comment.innerText = customReplaceWord || "[Blocked Comment]";
			} else {
				comment.closest("ytd-comment-thread-renderer").style.display = "none";
			}
		}
	});
}

/**
 * Initializes the observer to monitor and block comments.
 * @param {Array<string>} keywords - The list of keywords to check against.
 * @param {boolean} replaceComments - Whether to replace comments with "[Blocked Comment]" or hide them.
 * @param {string} replaceWord - The custom word to replace comments with.
 */
function initObserver(keywords, replaceComments, replaceWord) {
	const commentsSection = document.querySelector("#comments");
	if (commentsSection) {
		blockComments(keywords, replaceComments, replaceWord);
		const observer = new MutationObserver(() =>
			blockComments(keywords, replaceComments, replaceWord),
		);
		observer.observe(commentsSection, {
			childList: true,
			subtree: true,
		});
	} else {
		console.error("Comments section not found.");
	}
}

/**
 * Loads keywords and toggle states from storage and initializes the observer when the page loads.
 */
window.addEventListener("load", () => {
	browser.storage.sync.get(
		["keywords", "isEnabled", "replaceComments", "replaceWord"],
		(data) => {
			const keywords = data.keywords || [];
			const replaceWord = data.replaceWord || "[Blocked Comment]";
			const isEnabled = data.isEnabled !== false; // Default to enabled if not set
			const replaceComments = data.replaceComments === true; // Default to remove if not set
			if (isEnabled) {
				setTimeout(() => {
					initObserver(keywords, replaceComments, replaceWord);
				}, 3000);
			} else {
				console.log("NPC Comment Blocker is disabled");
			}
		},
	);
});

// Listen for changes in storage and reapply the comment blocking logic
browser.storage.onChanged.addListener((changes, area) => {
	if (area === "sync") {
		browser.storage.sync.get(
			["keywords", "isEnabled", "replaceComments", "replaceWord"],
			(data) => {
				const keywords = data.keywords || [];
				const replaceWord = data.replaceWord || "[Blocked Comment]";
				const isEnabled = data.isEnabled !== false; // Default to enabled if not set
				const replaceComments = data.replaceComments === true; // Default to remove if not set
				if (isEnabled) {
					blockComments(keywords, replaceComments, replaceWord);
				} else {
					console.log("NPC Comment Blocker is disabled");
				}
			},
		);
	}
});
