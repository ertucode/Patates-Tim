export default function setItem(key, value) {
	chrome.storage.sync.set({ [key]: value }, function () {});
}
