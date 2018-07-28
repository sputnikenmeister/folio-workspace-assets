module.exports = function(el) {
	if (!(el instanceof HTMLElement)) {
		return "" + el;
	}
	var retval = [el.tagName];
	if (el.hasAttribute("id")) {
		retval.push("#" + el.id);
	}
	if (el.classList[0]) {
		retval.push("." + el.classList[0]);
	}
	if (el.cid !== void 0) {
		retval.push(" @" + el.cid);
	} else if (el.hasAttribute("data-cid")) {
		retval.push(" @" + el.getAttribute("data-cid"));
	}
	return retval.join("");
};