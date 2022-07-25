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

  return {
    disabledStreamers: storageCache[STORAGE_KEY.DISABLED_STREAMERS],
    onlyWatchStreamers: storageCache[STORAGE_KEY.ONLY_WATCH_STREAMERS],
    skipIntro: storageCache[STORAGE_KEY.SKIP_INTRO],
    skipOutro: storageCache[STORAGE_KEY.SKIP_OUTRO],
    radio: storageCache[STORAGE_KEY.RADIO],
  };
}
