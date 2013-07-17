var Starlist = function() {};

Starlist.prototype.initNav = function(menuElementId, navElementId) {
	var menuElement = document.getElementById(menuElementId);
	var navElement = document.getElementById(navElementId);
	menuElement.onclick = function() {
		Util.toggleClass(navElement, "active");
	};
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