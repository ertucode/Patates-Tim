let counter = new Date();

chrome.webNavigation.onHistoryStateUpdated.addListener(function (details) {
	if (new Date() - counter < 100) return;

	counter = new Date();

	chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
		chrome.tabs.sendMessage(tabs[0].id, { newPage: true });
		console.log("Page changed");
	});
});

chrome.storage.onChanged.addListener(() => {
	chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
		chrome.tabs.sendMessage(tabs[0].id, { storageChanged: true });
		console.log("Storage changed");
	});
});
