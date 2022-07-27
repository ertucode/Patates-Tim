function formatTime(time) {
	const splits = time.split(":");
	return parseInt(splits[0]) * 60 + parseInt(splits[1]);
}
