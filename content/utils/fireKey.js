async function fireKey() {
	//Set key to corresponding code. This one is set to the right arrow key.
	// left 37
	var key = 39;
	if (document.createEventObject) {
		var eventObj = document.createEventObject();
		eventObj.keyCode = key;
		body.fireEvent("onkeydown", eventObj);
	} else if (document.createEvent) {
		var eventObj = document.createEvent("Events");
		eventObj.initEvent("keydown", true, true);
		eventObj.which = key;
		body.dispatchEvent(eventObj);
	}

	await sleep(400);
}
