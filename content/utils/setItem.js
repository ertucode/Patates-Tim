function setItem(key, value) {
	chrome.storage.sync.set({ [key]: value }, function () {
		inform("Key is set to " + key);
		inform("Value is set to " + value);
	});
}
