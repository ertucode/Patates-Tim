import loadStorage from "../utils/load_storage.js";

const disableContainer = document.querySelector("#disabled-streamers");
const onlyWatchContainer = document.querySelector("#only-watch-streamers");

const disableButton = document.querySelector("#disable-streamer-button");
const onlyWatchButton = document.querySelector("#only-watch-streamer-button");

const disableInput = document.querySelector("#disable-streamer-name-input");
const onlyWatchInput = document.querySelector(
  "#only-watch-streamer-name-input"
);

const disableRadio = document.querySelector("#disable-radio");
const onlyWatchRadio = document.querySelector("#only-watch-radio");
const noModeRadio = document.querySelector("#no-mode-radio");

const skipIntroBox = document.querySelector("#skip-intro");
const skipOutroBox = document.querySelector("#skip-outro");

const STORAGE_PREFIX = "PATATES-STORAGE-";
const STORAGE_RADIO_KEY = STORAGE_PREFIX + "radio";
const DISABLED_STREAMERS_KEY = STORAGE_PREFIX + "disabled";
const ONLY_WATCH_STREAMERS_KEY = STORAGE_PREFIX + "only-watch";
const SKIP_INTRO_KEY = STORAGE_PREFIX + "intro";
const SKIP_OUTRO_KEY = STORAGE_PREFIX + "outro";

function renderStorageItems() {
  loadStorage().then((data) => {
    console.log(data);
  });
}

renderStorageItems();

let disabledStreamers = [];

chrome.storage.sync.get([DISABLED_STREAMERS_KEY], function (result) {
  disabledStreamers = JSON.parse(result[DISABLED_STREAMERS_KEY]) || [];
  disabledStreamers.forEach(showDisabledStreamer);
});

let onlyWatchStreamers = [];

chrome.storage.sync.get([ONLY_WATCH_STREAMERS_KEY], function (result) {
  onlyWatchStreamers = JSON.parse(result[ONLY_WATCH_STREAMERS_KEY]) || [];
  onlyWatchStreamers.forEach(showOnlyWatchStreamer);
});

let mode = null;
chrome.storage.sync.get([STORAGE_RADIO_KEY], function (result) {
  mode = result[STORAGE_RADIO_KEY];
  if (mode == null) {
    disableRadio.checked = true;
    disableRadioClicked();
  } else if (mode === "disabled") {
    disableRadio.checked = true;
  } else if (mode === "only-watch") {
    onlyWatchRadio.checked = true;
  } else if (mode === "no-mode") {
    noModeRadio.checked = true;
  }
});

chrome.storage.sync.get([SKIP_INTRO_KEY], function (result) {
  if (result[SKIP_INTRO_KEY]) {
    skipIntroBox.checked = true;
  }
});

chrome.storage.sync.get([SKIP_OUTRO_KEY], function (result) {
  if (result[SKIP_OUTRO_KEY]) {
    skipOutroBox.checked = true;
  }
});

function setItem(key, value) {
  chrome.storage.sync.set({ [key]: value }, function () {
    console.log("Key is set to " + key);
    console.log("Value is set to " + value);
  });
}

function showDisabledStreamer(name) {
  showStreamer(name, "disabled-streamer", disableContainer);
}

function showOnlyWatchStreamer(name) {
  showStreamer(name, "only-watch-streamer", onlyWatchContainer);
}

function showStreamer(name, className, container) {
  const elem = document.createElement("div");
  elem.classList.add(className, "streamer");
  elem.innerText = name;
  const removeElem = document.createElement("span");
  removeElem.classList.add("streamer-remover");
  removeElem.innerText = "X";
  elem.append(removeElem);
  container.append(elem);
}

function updateDisabledStorage() {
  setItem(DISABLED_STREAMERS_KEY, JSON.stringify(disabledStreamers));
}

function updateOnlyWatchStorage() {
  setItem(ONLY_WATCH_STREAMERS_KEY, JSON.stringify(onlyWatchStreamers));
}

function addDisabledStreamer() {
  const name = disableInput.value;

  if (name === "" || disabledStreamers.includes(name)) return;
  showDisabledStreamer(name);
  disabledStreamers.push(name);
  updateDisabledStorage();
  disableInput.value = "";
}

function addOnlyWatchStreamer() {
  const name = onlyWatchInput.value;

  if (name === "" || onlyWatchStreamers.includes(name)) return;
  showOnlyWatchStreamer(name);
  onlyWatchStreamers.push(name);
  updateOnlyWatchStorage();
  onlyWatchInput.value = "";
}

disableButton.addEventListener("click", () => {
  addDisabledStreamer();
});

onlyWatchButton.addEventListener("click", () => {
  addOnlyWatchStreamer();
});

document.addEventListener("click", (e) => {
  if (!e.target.matches(".streamer-remover")) return;

  const div = e.target.closest("div");

  const name = div.textContent.slice(0, -1);

  if (div.classList.contains("disabled-streamer")) {
    disabledStreamers = disabledStreamers.filter((streamer) => {
      return name !== streamer;
    });
    updateDisabledStorage();
  } else if (div.classList.contains("only-watch-streamer")) {
    onlyWatchStreamers = onlyWatchStreamers.filter((streamer) => {
      return name !== streamer;
    });

    updateOnlyWatchStorage();
  }

  console.log(disabledStreamers);

  div.remove();
});

document.body.addEventListener("change", (e) => {
  switch (e.target) {
    case disableRadio:
      setItem(STORAGE_RADIO_KEY, "disabled");
      break;
    case onlyWatchRadio:
      setItem(STORAGE_RADIO_KEY, "only-watch");
      break;
    case noModeRadio:
      setItem(STORAGE_RADIO_KEY, "no-mode");
      break;
  }
});

disableInput.addEventListener("keydown", (e) => {
  if (e.key !== "Enter") return;

  addDisabledStreamer();
});

onlyWatchInput.addEventListener("keydown", (e) => {
  if (e.key !== "Enter") return;

  addOnlyWatchStreamer();
});

skipIntroBox.addEventListener("change", () => {
  setItem(SKIP_INTRO_KEY, skipIntroBox.checked);
});

skipOutroBox.addEventListener("change", () => {
  setItem(SKIP_OUTRO_KEY, skipOutroBox.checked);
});
