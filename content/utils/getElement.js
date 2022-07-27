async function getElement(callback, count, waitTime) {
	let variable;
	for (let i = 0; i < count; i++) {
		variable = callback();
		if (variable != null) return variable;

		await sleep(waitTime);
	}
	return variable;
}
