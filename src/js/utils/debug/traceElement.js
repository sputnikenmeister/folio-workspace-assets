module.exports = function(el) {
	var traceId = "";
	if (el.cid !== void 0) {
		traceId += "@" + el.cid + " ";
	}
	if (el.hasAttribute("id")) {
		traceId += "#" + el.id + " ";
	} else {
		traceId += "." + el.classList[0] + " ";
	}
	// var cid;
	// if (el.hasAttribute("data-cid")) {
	// 	cid = el.getAttribute("data-cid");
	// 	if (el.cid === cid) {
	// 		traceId += "@" + cid + " ";
	// 	} else {
	// 		traceId += "@!" + cid + " ";
	// 	}
	// }
	if (traceId == "") {
		traceId += "(" + el.tagName + ")?";
	}
	return traceId;
};
