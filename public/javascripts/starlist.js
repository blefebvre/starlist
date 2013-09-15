var Starlist = function() {};

Starlist.prototype.initNav = function(menuElementId, navElementId, backButtonId) {
	if (menuElementId && navElementId) {
		var menuElement = document.getElementById(menuElementId);
		var navElement = document.getElementById(navElementId);
		menuElement.onclick = function() {
			Util.toggleClass(navElement, "active");
		};
	}
};

Starlist.prototype.initDeleteList = function() {
	// Add swipe to show delete button for each list
	var listItems = document.querySelectorAll(".list");
	for (var i = 0; i < listItems.length; i++) {
		var item = listItems[i];

		Hammer(item).on("dragright", function(ev) {
			// Stops page from scrolling while dragging right
			ev.gesture.preventDefault();
			// Only fire once
			ev.gesture.stopDetect();
			console.log('showing delete button!');
		}).on("dragleft", function(ev) {
			ev.gesture.preventDefault();
			ev.gesture.stopDetect();
			// TODO: hide delete button
		});
	}
};

/* Util methods from http://net.tutsplus.com/tutorials/javascript-ajax/from-jquery-to-javascript-a-reference/ */
var Util = {
	hasClass: function (el, cl) {
		var regex = new RegExp('(?:\\s|^)' + cl + '(?:\\s|$)');
		return !!el.className.match(regex);
	},
 
	addClass: function (el, cl) {
		el.className += ' ' + cl;
	},
 
	removeClass: function (el, cl) {
		var regex = new RegExp('(?:\\s|^)' + cl + '(?:\\s|$)');
		el.className = el.className.replace(regex, ' ');
	},
 
	toggleClass: function (el, cl) {
		this.hasClass(el, cl) ? this.removeClass(el, cl) : this.addClass(el, cl);
	}
}