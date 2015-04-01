
var currentMenu = null;

var menuBtn         = document.getElementById("menu-btn");
var	closeBtns       = document.getElementsByClassName("exit-btn");
var instructionsBtn = document.getElementById("instructions-btn");
var settingsBtn     = document.getElementById("settings-btn");
var undoBtn         = document.getElementById("undo-btn");

function closeMenus() {
	var menus = document.getElementsByClassName("overlay");
	for(var i = 0; i < menus.length; ++i) {
		menus[i].classList.remove("open");
		menus[i].classList.add("close");
		menuBtn.style.visibility = "visible";
	}
}

function openMenu(id) {
	closeMenus();
	var menu = document.getElementById(id);
	menu.classList.remove("close");
	menu.classList.add("open");
	menuBtn.style.visibility = "hidden";
	currentMenu = id;

}

function prevMenu() {
	if (currentMenu === "main-overlay") {
		closeMenus();
	} else if (currentMenu === "instructions-overlay" ||
		currentMenu === "settings-overlay") {
		openMenu("main-overlay");
		currentMenu = "main-overlay";
	}
}

menuBtn.onclick         = function() { openMenu("main-overlay"); };
instructionsBtn.onclick = function() { openMenu("instructions-overlay"); };
settingsBtn.onclick     = function() { openMenu("settings-overlay"); };

for(var i = 0; i < closeBtns.length; ++i) {
	closeBtns[i].onclick = closeMenus;
}

document.getElementById("toggle-wrapper").onclick = function() {
  var off = document.getElementById("off");
  var on = document.getElementById("on");
	if (this.getAttribute("val") === "OFF") {
    off.style.left = "-100%";
    on.style.left = "0%";
    this.setAttribute("val", "ON");
    undoBtn.style.visibility = "visible";
  } else {
    off.style.left = "0%";
    on.style.left = "100%"
    this.setAttribute("val", "OFF");
    undoBtn.style.visibility= "hidden";
  }
};

function setConfig() {
	document.getElementById("grid-size-config").value = config.GRID_SIZE;
    document.getElementById("slates-config").value = config.SLATES;
    document.getElementById("crumbs-config").value = config.CRUMBS;
}
