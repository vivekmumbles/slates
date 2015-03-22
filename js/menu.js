
var currentMenu = null;

var menuBtn         = document.getElementById("menu-btn");
var	closeBtns       = document.getElementsByClassName("overlay-close");
var instructionsBtn = document.getElementById("instructions-btn");
var settingsBtn     = document.getElementById("settings-btn");

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

