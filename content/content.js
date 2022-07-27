const TRY_COUNT = 100;

inform("INSERTED");

const REGEX_FOR_TIME = /\d\d:\d\d/;

let vid;
let pageChanged = true;

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

async function main() {
	inform("IN MAIN");
	pageChanged = false;

	const returnValue = await checkCurrentPage();

	log("Currently on Patates Tim:", returnValue);
	if (!returnValue) return;

	await waitFirstLoad();

	await expandDescription();

	vid = document.querySelector(".video-stream.html5-main-video");

	await checkChapters();
}

async function checkCurrentPage() {
	await loadStorage();

	if (mode == null || mode === "no-mode") return;

	const channelContainer = await getElement(
		() => document.querySelector("ytd-channel-name"),
		TRY_COUNT,
		250
	);

	if (channelContainer == null) return;

	inform("Checking if a video is opened");
	await sleep(500);
	if (document.querySelector("#owner-sub-count") == null) return;

	log(channelContainer);

	channelName = channelContainer.querySelector("a").innerText;

	inform("Checking channel name");
	if (channelName !== "Patates Tim") return;

	inform("--- Patates tim --- ");
	return true;
}

let firstTime = true;

async function waitFirstLoad(time) {
	inform("waiting for the script to load");
	if (firstTime) {
		firstTime = false;
	} else {
		await sleep(time);
	}
}

async function expandDescription() {
	let elementToExpand = null;
	for (let i = 0; i < 1000; i++) {
		elementToExpand = elem = document.querySelector(
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
	const { timeElements, times } = await loadChapters();

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

		if (pageChanged) break;

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
		return true;
	}
}

function playNextChapter(timeElements, times) {
	//Get current time

	const currentTime = vid.currentTime;

	/** 
    fireKey()

    const currentTime = formatTime(document.querySelector(".ytp-time-current").textContent)
    */

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
}

chrome.runtime.onMessage.addListener(checkPage);

Main();

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
