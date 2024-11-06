let allFilters = [
	"*://*.doubleclick.net/*",
	"*://partner.googleadservices.com/*",
	"*://*.googlesyndication.com/*",
	"*://*.google-analytics.com/*",
	"*://creative.ak.fbcdn.net/*",
	"*://*.adbrite.com/*",
	"*://*.exponential.com/*",
	"*://*.quantserve.com/*",
	"*://*.scorecardresearch.com/*",
	"*://*.zedo.com/*"
  ];
  
  const blockImagePayload = { redirectUrl: "data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEAAAAALAAAAAABAAEAAAI=" };
  const blockPagePayload = { redirectUrl: "about:blank" };
  const cancelPayload = { cancel: true };
  
  chrome.webRequest.onBeforeRequest.addListener(
	(details) => blockImagePayload,
	{ urls: allFilters, types: ["image"] },
	["blocking"]
  );
  
  chrome.webRequest.onBeforeRequest.addListener(
	(details) => blockPagePayload,
	{ urls: allFilters, types: ["sub_frame"] },
	["blocking"]
  );
  
  chrome.webRequest.onBeforeRequest.addListener(
	(details) => cancelPayload,
	{ urls: allFilters, types: ["main_frame", "object", "script", "xmlhttprequest", "stylesheet", "font", "media", "ping", "csp_report", "other"] },
	["blocking"]
  );
  
  chrome.storage.local.get("filters", (result) => {
	if (result["filters"] == undefined) {
	  chrome.storage.local.set({ "filters": allFilters });
	} else {
	  allFilters = result["filters"];
	}
  });
  
  chrome.storage.local.get("webrtc_privacy", (result) => {
	const webRTCPrivacy = result["webrtc_privacy"] ?? false;
	chrome.privacy.network.webRTCIPHandlingPolicy.set({
	  value: webRTCPrivacy ? "default_public_interface_only" : "default"
	});
  });
  
chrome.runtime.onInstalled.addListener(() => {
	console.log("Blade extension installed and service worker initialized.");
  
	chrome.storage.local.get("webrtc_privacy", (result) => {
	  const webRTCPrivacy = result["webrtc_privacy"] ?? false;
	  if (chrome.privacy && chrome.privacy.network && chrome.privacy.network.webRTCIPHandlingPolicy) {
		try {
		  chrome.privacy.network.webRTCIPHandlingPolicy.set({
			value: webRTCPrivacy ? "default_public_interface_only" : "default"
		  });
		  console.log("WebRTC privacy setting applied.");
		} catch (error) {
		  console.error("Failed to apply WebRTC privacy setting:", error);
		}
	  } else {
		console.warn("WebRTC privacy API not supported in this environment.");
	  }
	});
  });