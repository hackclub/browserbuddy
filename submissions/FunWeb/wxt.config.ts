import { defineConfig } from 'wxt';

// See https://wxt.dev/api/config.html
export default defineConfig({
	extensionApi: "chrome",
	modules: ["@wxt-dev/module-vue", "@wxt-dev/auto-icons"],

	manifest: {
		name: "FunWeb",
		description: "Have Fun on the Web",
		permissions: ["storage", "scripting"],
		host_permissions:["https://*/*"]
	},

	srcDir: "src",
});
