"use strict";

var parseMs = require("parse-ms");

var pluralize = function pluralize(word, count) {
	return count === 1 ? word : word + "s";
};

module.exports = function(ms) {
	var options =
		arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

	if (!Number.isFinite(ms)) {
		throw new TypeError("Expected a finite number");
	}

	if (ms < 1000) {
		var msDecimalDigits =
			typeof options.msDecimalDigits === "number" ? options.msDecimalDigits : 0;
		return (
			(msDecimalDigits ? ms.toFixed(msDecimalDigits) : Math.ceil(ms)) +
			(options.verbose ? " " + pluralize("millisecond", Math.ceil(ms)) : "ms")
		);
	}

	var ret = [];

	var add = function add(value, long, short, valueString) {
		if (value === 0) {
			return;
		}

		var postfix = options.verbose ? " " + pluralize(long, value) : short;

		ret.push((valueString || value) + postfix);
	};

	var secDecimalDigits =
		typeof options.secDecimalDigits === "number" ? options.secDecimalDigits : 1;

	if (secDecimalDigits < 1) {
		var diff = 1000 - (ms % 1000);
		if (diff < 500) {
			ms += diff;
		}
	}

	var parsed = parseMs(ms);

	add(Math.trunc(parsed.days / 365), "year", "y");
	add(parsed.days % 365, "day", "d");
	add(parsed.hours, "hour", "h");
	add(parsed.minutes, "minute", "m");

	if (options.compact) {
		add(parsed.seconds, "second", "s");
		return "~" + ret[0];
	}

	var sec = (ms / 1000) % 60;
	var secFixed = sec.toFixed(secDecimalDigits);
	var secStr = options.keepDecimalsOnWholeSeconds
		? secFixed
		: secFixed.replace(/\.0+$/, "");
	add(sec, "second", "s", secStr);

	return ret.join(" ");
};
