import STORAGE_KEY from "./keys.js";

let storageCache = {};

const initStorageCache = getAllStorageSyncData().then((items) => {
	Object.assign(storageCache, items);
});

function getAllStorageSyncData() {
	return new Promise((resolve, reject) => {
		chrome.storage.sync.get(null, (items) => {
			if (chrome.runtime.lastError) {
				return reject(chrome.runtime.lastError);
			}
			resolve(items);
		});
	});
}

export default async function loadStorage() {
	await initStorageCache;

	const disabledStreamers =
		JSON.parse(storageCache[STORAGE_KEY.DISABLED_STREAMERS]) || [];
	const onlyWatchStreamers =
		JSON.parse(storageCache[STORAGE_KEY.ONLY_WATCH_STREAMERS]) || [];

	const skipIntro = storageCache[STORAGE_KEY.SKIP_INTRO];
	const skipOutro = storageCache[STORAGE_KEY.SKIP_OUTRO];
	const mode = storageCache[STORAGE_KEY.MODE];

	return {
		disabledStreamers,
		onlyWatchStreamers,
		skipIntro,
		skipOutro,
		mode,
	};
}
