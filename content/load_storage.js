let storageCache = {};

const initStorageCache = getAllStorageSyncData().then((items) => {
	Object.assign(storageCache, items);
});

let disabledStreamers;
let onlyWatchStreamers;
let skipIntro;
let skipOutro;
let mode;

let boolLog;
let boolWarn;
let boolInform;

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

async function loadStorage() {
	await initStorageCache;

	disabledStreamers =
		JSON.parse(storageCache[STORAGE_KEY.DISABLED_STREAMERS]) || [];
	onlyWatchStreamers =
		JSON.parse(storageCache[STORAGE_KEY.ONLY_WATCH_STREAMERS]) || [];

	skipIntro = storageCache[STORAGE_KEY.SKIP_INTRO];
	skipOutro = storageCache[STORAGE_KEY.SKIP_OUTRO];
	mode = storageCache[STORAGE_KEY.MODE];

	boolLog = storageCache[LOG_KEY.LOG];
	boolWarn = storageCache[LOG_KEY.WARN];
	boolInform = storageCache[LOG_KEY.INFORM];
}
