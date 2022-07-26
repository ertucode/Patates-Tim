import formatTime from "./utils/formatTime.js";
import getElement from "./utils/getElement.js";
import getIndexOfOptions from "./utils/getIndexOfOptions.js";
import STORAGE_KEY from "./utils/keys.js";
import loadStorage, { loadLog } from "./utils/loadStorage.js";
import { log, warn, inform, loadLogPreference } from "./utils/log.js";
import setItem from "./utils/setItem.js";
import sleep from "./utils/sleep.js";

const TRY_COUNT = 100;

inform("INSERTED");

const REGEX_FOR_TIME = /\d\d:\d\d/;

let vid;
let pageChanged = true;
const storageChanged = [];

async function Main() {
	await main();
	inform("Out of first main");

	while (true) {
		await sleep(200);

		if (pageChanged === true) {
			log("Starting main again");
			await main();
			log("Out of other main");
		}
	}
}

function putButton() {
	const button = document.createElement("button");
	button.classList.add("patates-btn");
	button.addEventListener("click", () => {
		pageChanged = true;
		firstTime = true;
	});

	button.innerHTML =
		'<svg xmlns="http://www.w3.org/2000/svg" fill="currentColor"><path d="M24 40q-6.65 0-11.325-4.675Q8 30.65 8 24q0-6.65 4.675-11.325Q17.35 8 24 8q4.25 0 7.45 1.725T37 14.45V8h3v12.7H27.3v-3h8.4q-1.9-3-4.85-4.85Q27.9 11 24 11q-5.45 0-9.225 3.775Q11 18.55 11 24q0 5.45 3.775 9.225Q18.55 37 24 37q4.15 0 7.6-2.375 3.45-2.375 4.8-6.275h3.1q-1.45 5.25-5.75 8.45Q29.45 40 24 40Z"/></svg>';

	button.ariaLabel = "Refresh patates";
	button.title = "Refresh patates";

	const container = document.querySelector("#container #end");

	container.prepend(button);

	// document.body.prepend(button);
}

putButton();

async function main() {
	inform("IN MAIN");
	pageChanged = false;

	await waitForPageLoad(4000);
	const returnValue = await checkCurrentPage();

	log("Currently on Patates Tim:", returnValue);
	if (!returnValue) return;

	await expandDescription();

	vid = document.querySelector(".video-stream.html5-main-video");

	await checkChapters();
}

let disabledStreamers, onlyWatchStreamers, skipIntro, skipOutro, mode;

async function checkCurrentPage() {
	({ disabledStreamers, onlyWatchStreamers, skipIntro, skipOutro, mode } =
		await loadStorage());

	if (mode == null || mode === "no-mode") return;

	inform("Checking if a video is opened");

	if (!window.location.pathname.startsWith("/watch")) return;

	const subElement = await getElement(
		() => document.querySelector("#owner-sub-count"),
		TRY_COUNT,
		250
	);

	if (subElement == null) return;

	await sleep(2000);

	const channelName = subElement.previousSibling.querySelector("a").innerText;

	inform("Checking channel name");
	if (channelName !== "Patates Tim") return;

	inform("--- Patates tim --- ");
	return true;
}

let firstTime = true;

async function waitForPageLoad(time) {
	inform("Waiting for the page to load");
	if (firstTime) {
		firstTime = false;
	} else {
		await sleep(time);
	}
}

async function expandDescription() {
	let elementToExpand = null;
	for (let i = 0; i < 1000; i++) {
		elementToExpand = document.querySelector(
			"#description-inline-expander"
		);
		if (elementToExpand != null) break;

		await sleep(100);
	}

	if (elementToExpand == null) {
		inform("Couldn't find the description expander");
		return;
	}

	inform("Expanding...");
	elementToExpand.setAttribute("is-expanded", "");
	log("Expand result", elementToExpand.getAttribute("is-expanded"));
	await sleep(500);
}

async function loadChapters() {
	const descriptionField = document.querySelector(
		"yt-formatted-string.style-scope.ytd-text-inline-expander"
	);

	inform("Getting time elements");
	let timeElements = [
		...descriptionField.querySelectorAll(
			".yt-simple-endpoint.style-scope.yt-formatted-string"
		),
	];
	log("Time elements", timeElements);

	timeElements.filter((elem) => {
		return elem.textContent.match(REGEX_FOR_TIME);
	});

	const indexOfZero = getIndexOfOptions(
		timeElements.map((elem) => {
			return elem.textContent;
		}),
		["00:00", "0:00"]
	);

	timeElements = timeElements.slice(indexOfZero);

	const times = timeElements.map((elem) => {
		return elem.textContent;
	});

	return { timeElements, times };
}

async function checkChapters() {
	inform("STARTING THE LOOP");
	let { timeElements, times } = await loadChapters();

	let chapterName = "";
	let chapterElem = null;

	while (true) {
		if (!vid.paused) {
			chapterElem = document.querySelector(".ytp-chapter-title-content");
			chapterName = chapterElem.textContent;

			if (checkOutroIntro(timeElements, times, chapterName)) return;

			if (
				(mode === "only-watch" &&
					!onlyWatchStreamers.includes(chapterName)) ||
				(mode === "disabled" && disabledStreamers.includes(chapterName))
			) {
				if (playNextChapter(timeElements, times)) return;
			}
		}

		if (pageChanged) {
			log("Page changed - Not checking chapters");
			break;
		}

		if (storageChanged.length > 0) {
			({
				disabledStreamers,
				onlyWatchStreamers,
				skipIntro,
				skipOutro,
				mode,
			} = await loadStorage());
			({ timeElements, times } = await loadChapters());
			storageChanged.splice(0, 1);
		}

		await sleep(200);
	}
}

function checkOutroIntro(timeElements, times, chapterName) {
	if (skipIntro && chapterName == "Giriş") {
		inform(timeElements, chapterName);
		inform("Skipping intro");
		playNextChapter(timeElements, times);
	}

	if (
		skipOutro &&
		(chapterName === "Kapanış ve Günün Yorumları" ||
			chapterName === "Günün Sözü")
	) {
		inform("Pausing the video");
		vid.pause();
	}
}

function playNextChapter(timeElements, times) {
	//Get current time

	const currentTime = vid.currentTime;

	//Find next time

	const formattedTimes = times.map(formatTime);

	const biggerTimeIndex = formattedTimes.findIndex((time) => {
		return time > currentTime;
	});

	if (biggerTimeIndex === -1) {
		return true;
	} else {
		timeElements[biggerTimeIndex].click();
	}
}

function checkPage(request) {
	if (request.newPage === true) {
		log("CHANGING PAGE");
		pageChanged = true;
	}

	if (request.storageChanged === true) {
		storageChanged.push(1);
		loadLogPreference();
	}
}

chrome.runtime.onMessage.addListener(checkPage);

Main();

document.addEventListener("keydown", (e) => {
	if (e.key === '"' && e.ctrlKey) {
		pageChanged = true;
		firstTime = true;
	}

	if (e.key === "<" && e.ctrlKey) {
		const chapterElem = document.querySelector(
			".ytp-chapter-title-content"
		);
		const chapterName = chapterElem?.textContent;

		if (chapterName == null) {
			return;
		}
		setItem(
			STORAGE_KEY.DISABLED_STREAMERS,
			JSON.stringify([...disabledStreamers, chapterName])
		);
	}
});

/**
 * YOUTUBE_API
 * https://developers.google.com/youtube/iframe_api_reference?csw=1
 * playVideo()
 * pauseVideo()
 * stopVideo()
 * seekTo(seconds)
 *
 * getCurrentTime()
 * getDuration()
 *
 *
 * PLAYLIST FUNCTIONS:
 * nextVideo()
 * previousVideo()
 * playVideoAt()
 *
 * mute()
 * unMute()
 * isMuted()
 * setVolume()
 * getVolume()
 *
 */
