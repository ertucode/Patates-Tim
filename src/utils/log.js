import { loadLog } from "./loadStorage";

let boolInform, boolLog, boolWarn;

export async function loadLogPreference() {
	({ boolInform, boolLog, boolWarn } = await loadLog());
}

loadLogPreference();

export function inform(...toLog) {
	if (!boolInform) return;
	if (toLog.length === 1) toLog = toLog[0];
	console.log("%c ---PATATES-TIM---", "color:blue;font-weight:bold;", toLog);
}

export function log(...toLog) {
	if (!boolLog) return;
	if (toLog.length === 1) toLog = toLog[0];
	console.log(
		"%c ---PATATES-TIM---",
		"color:yellow;font-weight:bold;",
		toLog
	);
}

export function warn(...toLog) {
	if (!boolWarn) return;
	if (toLog.length === 1) toLog = toLog[0];
	console.log("%c ---PATATES-TIM---", "color:red;font-weight:bold;", toLog);
}
