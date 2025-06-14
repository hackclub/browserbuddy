import "@/assets/root.css";

export default defineContentScript({
	registration:'runtime',
	matches: [],
	main() {
		console.log("Hello content.");
	},
});
