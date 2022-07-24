

const TRY_COUNT = 100

const boolInform = false
const boolLog = false
const boolWarn = false


function inform(...toLog) {
    if (!boolInform) return
    if (toLog.length === 1) toLog = toLog[0]
    console.log("%c ---PATATES-TIM---", "color:blue;font-weight:bold;",toLog)
}

function log(...toLog) {
    if (!boolLog) return
    if (toLog.length === 1) toLog = toLog[0]
    console.log("%c ---PATATES-TIM---", "color:yellow;font-weight:bold;",toLog)
}

function warn(...toLog) {
    if (!boolWarn) return
    if (toLog.length === 1) toLog = toLog[0]
    console.log("%c ---PATATES-TIM---", "color:red;font-weight:bold;",toLog)
}


inform("INSERTED")

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}



let channelContainer = null
let channelItem = null
let channelName = null

const REGEX_FOR_TIME = /\d\d:\d\d/


const STORAGE_PREFIX = "PATATES-STORAGE-"
const STORAGE_RADIO_KEY = STORAGE_PREFIX + "radio"
const SKIP_INTRO_KEY = STORAGE_PREFIX + "intro"
const SKIP_OUTRO_KEY = STORAGE_PREFIX + "outro"

const storageCache = {};

const initStorageCache = getAllStorageSyncData().then(items => {
  Object.assign(storageCache, items);
});



function *zip (...iterables){
    let iterators = iterables.map(i => i[Symbol.iterator]() )
    while (true) {
        let results = iterators.map(iter => iter.next() )
        if (results.some(res => res.done) ) return
        else yield results.map(res => res.value )
    }
}

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


function setItem(key, value) {
    chrome.storage.sync.set({[key]: value}, function() {
        inform('Key is set to ' + key);
        inform('Value is set to ' + value);
      });
}

function getIndexOfOptions(arr, options) {
    for (let i=0; i<options.length; i++) {
        const option = options[i]
        const indexOfOption = arr.indexOf(option)

        if (indexOfOption !== -1) {
            return indexOfOption
        } 
    }
    return -1
}

let vid
let skipIntro
let skipOutro
let mode
let pageChanged = true

async function checkCurrentPage() {
    await initStorageCache

    mode = storageCache[STORAGE_RADIO_KEY]

    skipIntro = storageCache[SKIP_INTRO_KEY]
    skipOutro = storageCache[SKIP_OUTRO_KEY]

    if (mode == null || mode === "no-mode") return

    for (let i=0; i<TRY_COUNT; i++) {
        channelContainer = document.querySelector("ytd-channel-name")
        if (channelContainer != null) break
    
        await sleep(250);
    }

    if (channelContainer == null ) return

    inform("Checking sub count")
    if (document.querySelector("#owner-sub-count") == null) return
    
    channelItem = channelContainer.querySelector("a")
    channelName = channelItem.innerText

    inform("Checking channel name")
    if (channelName !== "Patates Tim") return

    inform("--- Patates tim --- ")

    return true
}

let firstTime = true

async function main(){

    inform("IN MAIN")
    pageChanged = false
    
    const returnValue = await checkCurrentPage()

    log("RETURNED", returnValue)

    if (firstTime) {
        firstTime = false
    } else {
        await sleep(1000)
    }

    if (!returnValue) return

    // Expand 
    /*
    const expandButton = document.querySelector("tp-yt-paper-button#expand")
    expandButton.click()
    */

    let elementToExpand = null
    for (let i=0; i<1000; i++) {
        elementToExpand = elem = document.querySelector("#description-inline-expander")
        if (elementToExpand != null) break
    
        await sleep(100);
    }

    if (elementToExpand == null) {
        inform("Couldn't find element to expand")
        return
    }

    inform("Expanding...")
    elementToExpand.setAttribute("is-expanded", "")
    log("Expand result", elementToExpand.getAttribute("is-expanded"))
    await sleep(500);

    const descriptionField = document.querySelector("yt-formatted-string.style-scope.ytd-text-inline-expander")

    inform("Getting time elements")
    let timeElements = [...descriptionField.querySelectorAll(".yt-simple-endpoint.style-scope.yt-formatted-string")]
    log("Time elements", timeElements)

    timeElements.filter(  elem => {
        return elem.textContent.match(REGEX_FOR_TIME)
    })


    
    const indexOfZero = getIndexOfOptions(timeElements.map(elem => {return elem.textContent}), ["00:00", "0:00"])
    
    
    timeElements = timeElements.slice(indexOfZero)
    let names = timeElements.map(elem => elem.nextElementSibling)

    let chapterName = ""
    let chapterElem = null

    const times = timeElements.map(elem => {return elem.textContent})
 
    vid = document.querySelector(".video-stream.html5-main-video")

    inform("STARTING THE LOOP")

    if (mode === "only-watch") {
        const ONLY_WATCH_STREAMERS_KEY = STORAGE_PREFIX + "only-watch"
        const onlyWatchStreamers = JSON.parse(storageCache[ONLY_WATCH_STREAMERS_KEY]) || []

        while(true) {
            if (!vid.paused) {
                chapterElem = document.querySelector(".ytp-chapter-title-content")
                chapterName = chapterElem.textContent
    
                if (checkOutroIntro(timeElements, times, chapterName)) return 
    
                if (!onlyWatchStreamers.includes(chapterName)) {
                    if (playNextChapter(timeElements, times)) return
                }
            }

            if (pageChanged) break

            await sleep(200)
        }


    } else if (mode === "disabled") {
        const DISABLED_STREAMERS_KEY = STORAGE_PREFIX + "disabled"
        const disabledStreamers = JSON.parse(storageCache[DISABLED_STREAMERS_KEY]) || []

        while(true) {
            if (!vid.paused) {
                chapterElem = document.querySelector(".ytp-chapter-title-content")
                chapterName = chapterElem.textContent
    
                if (checkOutroIntro(timeElements, times, chapterName)) return 
    
                if (disabledStreamers.includes(chapterName)) {
                    if (playNextChapter(timeElements, times)) return
                }
            }

            if (pageChanged) break

            await sleep(200)
        }
    }
    
}

function checkOutroIntro(timeElements, times, chapterName) {
    if (skipIntro && chapterName == "Giriş") {
        inform(timeElements, chapterName)
        inform("Skipping intro")
        playNextChapter(timeElements, times)
    } 

    if (skipOutro && (chapterName === "Kapanış ve Günün Yorumları" || chapterName === "Günün Sözü")) {
        inform("Pausing the video")
        vid.pause()
        return true
    }
}

async function fireKey()
{
    //Set key to corresponding code. This one is set to the right arrow key.
    // left 37
    var key = 39;
    if(document.createEventObject)
    {
        var eventObj = document.createEventObject();
        eventObj.keyCode = key;
        body.fireEvent("onkeydown", eventObj);   
    }else if(document.createEvent)
    {
        var eventObj = document.createEvent("Events");
        eventObj.initEvent("keydown", true, true);
        eventObj.which = key;
        body.dispatchEvent(eventObj);
    }

    await sleep(400)
} 

function formatTime(time) {
    const splits = time.split(":")
    return parseInt(splits[0]) * 60 + parseInt(splits[1])
}



function playNextChapter(timeElements, times) {
    //Get current time

    const currentTime = vid.currentTime
  
    /** 
    fireKey()

    const currentTime = formatTime(document.querySelector(".ytp-time-current").textContent)
    */

    //Find next time

    const formattedTimes = times.map(formatTime)


    const biggerTimeIndex = formattedTimes.findIndex(time => {
        return time > currentTime
    })

    if (biggerTimeIndex === -1 ) {
        return true
    } else {
        timeElements[biggerTimeIndex].click()
    }
}

function checkPage(request) {
    if (request.newPage === true) {
        log("CHANGING PAGE")
        pageChanged = true
    }
}


chrome.runtime.onMessage.addListener(checkPage);

async function Main() {
    await main()
    inform("Out of first main")

    while (true) {
        await sleep(200)

        if (pageChanged === true) {
            log("Starting main again")
            await main()
            log("Out of other main")
        }
    }
}


Main()

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







