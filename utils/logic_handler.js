import loadStorage from "./load_storage.js";
import setItem from "./set_storage.js";
import STORAGE_KEY from "./keys.js";

const disableContainer = document.querySelector("#disabled-streamers");
const onlyWatchContainer = document.querySelector("#only-watch-streamers");

const disableBoxContainer = document.querySelector("#disable-streamers");
const onlyWatchBoxContainer = document.querySelector("#enable-streamers");

const disableButton = document.querySelector("#disable-streamer-button");
const onlyWatchButton = document.querySelector("#only-watch-streamer-button");

const disableInput = document.querySelector("#disable-streamer-name-input");
const onlyWatchInput = document.querySelector(
	"#only-watch-streamer-name-input"
);

const disableRadio = document.querySelector("#disable-radio");
const onlyWatchRadio = document.querySelector("#only-watch-radio");
const noModeRadio = document.querySelector("#no-mode-radio");

const BUTTON_TO_MODE_MAP = {
	disableRadio: "disabled",
	onlyWatchRadio: "only-watch",
	noModeRadio: "no-mode",
};

const MODE_TO_BUTTON_MAP = {
	disabled: disableRadio,
	"only-watch": onlyWatchRadio,
	"no-mode": noModeRadio,
};

const skipIntroBox = document.querySelector("#skip-intro");
const skipOutroBox = document.querySelector("#skip-outro");

let disabledStreamers = [];
let onlyWatchStreamers = [];
let mode = null;
let skipIntro;
let skipOutro;

loadStorage().then(updateItemsAccordingToStorageData);

function updateItemsAccordingToStorageData(data) {
	disabledStreamers = data.disabledStreamers;
	onlyWatchStreamers = data.onlyWatchStreamers;
	mode = data.mode;
	skipIntro = data.skipIntro;
	skipOutro = data.skipOutro;

	renderItems();
}

function handleMode(mode) {
	if (mode == null) {
		disableRadio.checked = true;
		disableRadioClicked();
		onlyWatchBoxContainer.classList.add("blur");
	} else if (mode === "disabled") {
		onlyWatchBoxContainer.classList.add("blur");
		disableRadio.checked = true;
	} else if (mode === "only-watch") {
		disableBoxContainer.classList.add("blur");
		onlyWatchRadio.checked = true;
	} else if (mode === "no-mode") {
		noModeRadio.checked = true;
	}
}

function renderItems() {
	onlyWatchStreamers.forEach(renderOnlyWatchStreamer);
	disabledStreamers.forEach(renderDisabledStreamer);

	handleMode(mode);

	if (skipIntro) skipIntroBox.checked = true;
	if (skipOutro) skipOutroBox.checked = true;
}

function renderDisabledStreamer(name) {
	showStreamer(name, "disabled-streamer", disableContainer);
}

function renderOnlyWatchStreamer(name) {
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
	setItem(STORAGE_KEY.DISABLED_STREAMERS, JSON.stringify(disabledStreamers));
}

function updateOnlyWatchStorage() {
	setItem(
		STORAGE_KEY.ONLY_WATCH_STREAMERS,
		JSON.stringify(onlyWatchStreamers)
	);
}

function addDisabledStreamer() {
	const name = disableInput.value;

	if (name === "" || disabledStreamers.includes(name)) return;
	renderDisabledStreamer(name);
	disabledStreamers.push(name);
	updateDisabledStorage();
	disableInput.value = "";
}

function addOnlyWatchStreamer() {
	const name = onlyWatchInput.value;

	if (name === "" || onlyWatchStreamers.includes(name)) return;
	renderOnlyWatchStreamer(name);
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

function removeStreamer(target) {
	const div = target.closest("div");

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

	div.remove();
}

document.addEventListener("click", (e) => {
	if (!e.target.matches(".streamer-remover")) return;

	removeStreamer(e.target);
});

document.body.addEventListener("change", (e) => {
	setItem(STORAGE_KEY.MODE, BUTTON_TO_MODE_MAP[e.target]);
});

document.body.addEventListener("change", (e) => {
	switch (e.target) {
		case disableRadio:
			setItem(STORAGE_KEY.MODE, "disabled");
			onlyWatchBoxContainer.classList.add("blur");
			disableBoxContainer.classList.remove("blur");
			break;
		case onlyWatchRadio:
			setItem(STORAGE_KEY.MODE, "only-watch");
			disableBoxContainer.classList.add("blur");
			onlyWatchBoxContainer.classList.remove("blur");
			break;
		case noModeRadio:
			setItem(STORAGE_KEY.MODE, "no-mode");
			onlyWatchBoxContainer.classList.remove("blur");
			disableBoxContainer.classList.remove("blur");
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
	setItem(STORAGE_KEY.SKIP_INTRO, skipIntroBox.checked);
});

skipOutroBox.addEventListener("change", () => {
	setItem(STORAGE_KEY.SKIP_OUTRO, skipOutroBox.checked);
});
