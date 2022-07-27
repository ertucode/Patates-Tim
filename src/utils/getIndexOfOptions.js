export default function getIndexOfOptions(arr, options) {
	for (let i = 0; i < options.length; i++) {
		const option = options[i];
		const indexOfOption = arr.indexOf(option);

		if (indexOfOption !== -1) {
			return indexOfOption;
		}
	}
	return -1;
}
