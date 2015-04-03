
var currentMenu = null;

var menuBtn         = document.getElementById("menu-img");
var	closeBtns       = document.getElementsByClassName("exit-btn");
var instructionsBtn = document.getElementById("instructions-btn");
var settingsBtn     = document.getElementById("settings-btn");
var undoBtn         = document.getElementById("undo-btn");
var toggle          = document.getElementById("toggle");


function closeMenus() {
	var menus = document.getElementsByClassName("overlay");
	for(var i = 0; i < menus.length; ++i) {
		menus[i].classList.remove("open");
		menus[i].classList.add("close");
		menuBtn.style.visibility = "visible";
	}
	currentMenu = null;
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
 	if (toggle.checked) undoBtn.style.visibility = "visible";
 	else undoBtn.style.visibility = "hidden";
};

function setConfig() {
	document.getElementById("grid-size-config").value = config.GRID_SIZE;
    document.getElementById("slates-config").value    = config.SLATES;
    document.getElementById("crumbs-config").value    = config.CRUMBS;
}
