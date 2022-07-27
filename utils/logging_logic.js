import setItem from "./set_storage.js";
import { LOG_KEY } from "./keys.js";
import { loadLog } from "./load_storage.js";

const logInput = document.querySelector("#log");
const warnInput = document.querySelector("#warn");
const informInput = document.querySelector("#inform");

const INPUT_TO_KEY_MAP = new Map([
	[logInput, LOG_KEY.LOG],
	[warnInput, LOG_KEY.WARN],
	[informInput, LOG_KEY.INFORM],
]);

console.log(INPUT_TO_KEY_MAP);

export default async function loadLogCheckboxes() {
	const { boolLog, boolWarn, boolInform } = await loadLog();

	logInput.checked = boolLog;
	warnInput.checked = boolWarn;
	informInput.checked = boolInform;

	[...INPUT_TO_KEY_MAP.keys()].forEach((checkbox) => {
		checkbox.addEventListener("change", () => {
			setItem(INPUT_TO_KEY_MAP.get(checkbox), checkbox.checked);
		});
	});
}
