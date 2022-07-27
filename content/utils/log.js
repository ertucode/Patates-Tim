function inform(...toLog) {
	if (!boolInform) return;
	if (toLog.length === 1) toLog = toLog[0];
	console.log("%c ---PATATES-TIM---", "color:blue;font-weight:bold;", toLog);
}

function log(...toLog) {
	if (!boolLog) return;
	if (toLog.length === 1) toLog = toLog[0];
	console.log(
		"%c ---PATATES-TIM---",
		"color:yellow;font-weight:bold;",
		toLog
	);
}

function warn(...toLog) {
	if (!boolWarn) return;
	if (toLog.length === 1) toLog = toLog[0];
	console.log("%c ---PATATES-TIM---", "color:red;font-weight:bold;", toLog);
}
