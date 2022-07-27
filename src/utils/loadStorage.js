import STORAGE_KEY, { LOG_KEY } from "./keys.js";
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

function parseJSON(item) {
	if (item == null) return [];

	return JSON.parse(item);
}

export default async function loadStorage() {
	await initStorageCache;

	const disabledStreamers = parseJSON(
		storageCache[STORAGE_KEY.DISABLED_STREAMERS]
	);
	const onlyWatchStreamers = parseJSON(
		storageCache[STORAGE_KEY.ONLY_WATCH_STREAMERS]
	);

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

export async function loadLog() {
	await initStorageCache;

	const boolLog = storageCache[LOG_KEY.LOG];
	const boolWarn = storageCache[LOG_KEY.WARN];
	const boolInform = storageCache[LOG_KEY.INFORM];

	return {
		boolLog,
		boolWarn,
		boolInform,
	};
}
