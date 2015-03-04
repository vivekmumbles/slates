
"use strict";

function randint(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
}

function equal(xs, ys) {
    if (xs.length != ys.length) return false;
    for(var i = 0; i < xs.length; i++) {
	if (xs[i] != ys[i]) return false;
    } return true;
}

function hasMember(xs, x) {
    if (xs.length == 0) return false;
    for(var i = 0; i < xs.length; i++) {
	if (equal(xs[i],x)) return true;
    } return false;
}

function Slates() {
    var canvas;
    var ctx;
    var width;
    var height;
    var GRID_SIZE = 10;
    var grid = [];
    var LINE_WIDTH = 1;
    var LINE_COLOR = "rgba(25,25,25,1)";
    var finalStates = [[randint(1, GRID_SIZE-1), randint(1, GRID_SIZE-1)]];
    var INITIAL_STATE = [];
    var NUM_OF_SLATES = 100;
    var slates = initSlates();
    var stacks = [];
    var hover = [-1,-1];

    function initGrid() {
	for(var i = 0; i < GRID_SIZE; i++) {
	    grid.push([]);
	    stacks.push([]);
	    for(var j = 0; j < GRID_SIZE; j++) {
		grid[i].push(false);
		stacks[i].push(0);
	    }
	}
    }

    function initSlates() {
	var s = [];
	for(var i = 0; i < NUM_OF_SLATES; i++) {
	    s.push(finalStates[0]);
	} return s;
    }

    function getPossibleStates(loc) {
	var x = loc[0]; var y = loc[1];
	var edge = GRID_SIZE-1;

	// clock-wise around the edges
	if (x == 0 && y == 0) return [3];
	else if ((x != 0 && x != edge) && (y == 0)) return [0,3,4];
	else if (x == edge && y == 0) return [4];
	else if ((x == edge) && (y != 0 && y != edge)) return [1,4,5];
	else if (x == edge && y == edge) return [5];
	else if ((x != 0 && x != edge) && (y == edge)) return [0,2,5];
	else if (x == 0 && y == edge) return [2];
	else if ((x == 0) && (y != 0 && y != edge)) return [1,2,3];
	else if ((x != 0 && x != edge) && (y != 0 && y != edge)) return [0,1,2,3,4,5];
	else {
	    console.log("error determining possible states");
	    return new Error("No possible states!");
	}
    }

    function modifyLocation(state, side) {
	function check(a, b) {
	    return (state == a) && (side == b);
	}
	var L = "LEFT"; var R = "RIGHT";
	function helper(loc) {
	    var x = loc[0]; var y = loc[1];
	    if      (check(0,L) || check(4,R) || check(5,L)) x--;
	    else if (check(0,R) || check(2,R) || check(3,L)) x++;
	    else if (check(1,L) || check(2,L) || check(5,R)) y--;
	    else if (check(1,R) || check(3,R) || check(4,L)) y++;
	    else {
		console.log("error in modying location.");
	    }

	    return [x,y];
	}
	return helper;
    }

    // var repeats = [];
    
    function backTrack(slates, acc) {
	if(slates.length <= 1) {
	    // console.log("leaf = " + slates);
	    // repeats.concat(slates);
	    return acc.concat(slates);
	}

	var split = randint(1, slates.length);
	var left = slates.slice(0, split);
	var right = slates.slice(split, slates.length);

	var possibleStates = getPossibleStates(slates[0]);
	var tries = 0;
	do {
	    var state = possibleStates[randint(0,possibleStates.length)];
	    var leftPeek = modifyLocation(state, "LEFT")(slates[0]);
	    var rightPeek = modifyLocation(state, "RIGHT")(slates[0]);
	    // if (tries > 6) break;
	    // } while(hasMember(finalStates,leftPeek) || hasMember(finalStates,rightPeek) || hasMember(repeats,leftPeek) || hasMember(repeats, rightPeek));
	    // } while(hasMember(finalStates,leftPeek) || hasMember(finalStates,rightPeek) || hasMember(acc,leftPeek) || hasMember(acc, rightPeek));
	} while(hasMember(finalStates,leftPeek) || hasMember(finalStates,rightPeek));

	var newLeft = left.map(modifyLocation(state, "LEFT"));
	var newRight = right.map(modifyLocation(state, "RIGHT"));

	return backTrack(newLeft, acc).concat(backTrack(newRight, acc));
    }

    function displayGrid() {
	ctx.fillStyle = LINE_COLOR;
	for(var i = 1; i < GRID_SIZE; i++) {
	    var xSpacing = (i*(width/GRID_SIZE))-(LINE_WIDTH/2);
	    var ySpacing = (i*(height/GRID_SIZE))-(LINE_WIDTH/2);
	    ctx.fillRect(xSpacing, 0, LINE_WIDTH, height);
	    ctx.fillRect(0, ySpacing, width, LINE_WIDTH);
	}
    }

    function updateGrid(slates) {
	for(var i = 0; i < slates.length; i++) {
	    var x = slates[i][0];
	    var y = slates[i][1];
	    grid[x][y] = true;
	    stacks[x][y]++;
	}
    }

    function renderSlates() {
	// ctx.fillStyle = "rgba(0,119,204,.8)"; // blue
	// ctx.fillStyle = "rgba(108,153,187,1)"; // blue
	// 2372aa
	var fontSize = (width/GRID_SIZE * .2) + "px";
	ctx.font = fontSize + " monospace";
	for(var i = 0; i < GRID_SIZE; i++) {
	    for(var j = 0; j < GRID_SIZE; j++) {
		// if (grid[i][j] == true) {
		if (selection[0] != undefined && equal([i,j],selection[0])) continue;
		if (selection[1] != undefined && equal([i,j],selection[1])) continue;
		if (stacks[i][j] != 0) {
		    var x = (width/GRID_SIZE);
		    var y = (height/GRID_SIZE);
		    ctx.fillStyle = "rgba(35, 114, 170, .8)"; // dark-blue
		    ctx.fillRect(i*x, j*y, x, y);
		    var h = stacks[i][j];
		    if (h > 1) {
			ctx.fillStyle = "rgba(0,0,0,.8)";
			ctx.fillText(h.toString(), i*x+2, (j*y)+y-4);
			// (i*x)+x-1, (i*y)+y-fontSize-1);
		    }
		}
		// if(i == hover[0] && j == hover[1]) {
		// 	// console.log("hovering");
		// 	console.log(hover[0]+", "+hover[1]);
		// 	console.log(i+","+j);
		// 	ctx.fillStyle = "rgba(0,0,0,.5)";
		// 	// ctx.fillRect(0, 0, x, y);
		// 	ctx.fillRect(i*x, j*y, x, y);
		// }
	    }
	}
    }

    function isValidMove(x, y) {
	var adj = 0;
	var edge = GRID_SIZE-1;
	if (x != 0 && stacks[x-1][y] != 0) adj++;
	if (y != 0 && stacks[x][y-1] != 0) adj++;
	if (x != edge && stacks[x+1][y] != 0) adj++;
	if (y != edge && stacks[x][y+1] != 0) adj++;

	return (adj >= 2);
    }

    function renderHover() {
	if (hover[0] == -1 && hover[1] == -1) return;
	var x = (width/GRID_SIZE);
	var y = (height/GRID_SIZE);
	if (isValidMove(hover[0], hover[1])) ctx.fillStyle = "rgba(45, 21, 73,.6)";
	else ctx.fillStyle = "rgba(0,0,0,.5)";
	ctx.fillRect(hover[0]*x, hover[1]*y, x, y);
    }

    function renderFinalStates() {
	// ctx.fillStyle = "rgba(204,0,0,.8)"; // red
	// #AA1A28
	for(var i = 0; i < finalStates.length; i++) {
	    ctx.fillStyle = "rgba(170, 26, 40, .8)"; // dark red
	    var x = (width/GRID_SIZE);
	    var y = (height/GRID_SIZE);
	    var loc = finalStates[i];
	    ctx.fillRect(loc[0]*x, loc[1]*y, x, y);
	    var h = stacks[loc[0]][loc[1]];
	    if (h > 0) {
		ctx.fillStyle = "rgba(0,0,0,.8)";
		ctx.fillText(h.toString(), loc[0]*x+2, (loc[1]*y)+y-4);
		// (i*x)+x-1, (i*y)+y-fontSize-1);
	    }
	}
    }

    function mouseMotionListener(e) {
	var br = canvas.getBoundingClientRect();
	// if ((br.left <= e.clientX && e.clientX <= br.left+width) && (br.top <= e.clientY && e.clientY <= br.top+height)) {
	var x = e.clientX - br.left;
	var y = e.clientY - br.top;
	var xLoc = Math.floor(x / (width/GRID_SIZE));
	var yLoc = Math.floor(y / (height/GRID_SIZE));
	// console.log(xLoc+", "+yLoc);
	hover = [xLoc, yLoc];
	// ctx.fillStyle = "rgba(0,0,0,.8)";
	// ctx.fillRect(xLoc*(width/GRID_SIZE), yLoc*(height/GRID_SIZE), (width/GRID_SIZE), (height/GRID_SIZE));
	// }
    }

    function mouseExitListener(e) {
	hover = [-1,-1];
    }

    var selection = [];

    function distance(a, b) {
	return Math.sqrt(Math.pow(b[0]-a[0],2)+Math.pow(b[1]-a[1],2))
    }

    function validSelection(a, b) {
	var d = distance(a, b);
	// console.log("a = " + a);
	// console.log("b = " + b);
	// console.log(d);
	if (d == Math.sqrt(2) || d == 2) return true;
	else return false;
    }

    function renderSelection() {
	var x = (width/GRID_SIZE);
	var y = (height/GRID_SIZE);
	for(var i = 0; i < selection.length; i++) {
	    var s = selection[i];
	    // ctx.fillStyle = "rgba(255, 255, 255, .5)"; // "rgba(228, 186, 22, .75)";
	    // ctx.fillRect(s[0]*x,s[1]*y, x, y);
	    ctx.fillStyle = "rgba(0,0,0,.5)";
	    ctx.fillRect(s[0]*x,s[1]*y, x, y);

	    ctx.shadowColor = "black";
	    ctx.shadowOffsetY = 0;
	    ctx.shadowOffsetX = 0;
	    ctx.shadowBlur = 50;
	    // ctx.fillStyle = "rgba(0,0,0,.5)";
	    // ctx.fillRect(s[0]*x,s[1]*y, x, y);
	    ctx.fillStyle = "rgba(35, 114, 170, 1)";
	    ctx.strokeStyle = "black"
	    var t = 5;
	    ctx.fillRect(s[0]*x+t,s[1]*y+t, x-t*2, y-t*2);
	    ctx.strokeRect(s[0]*x+t,s[1]*y+t, x-t*2, y-t*2);
	    // ctx.fillRect(s[0]*x,s[1]*y, x, y);
	    ctx.shadowColor = null;
	    ctx.shadowOffsetY = null;
	    ctx.shadowOffsetX = null;
	    ctx.shadowBlur = null;
	    ctx.strokeStyle = null;
	    // ctx.fillStyle = "rgba(35, 114, 170, .8)";
	    // var t = 2;
	    // ctx.fillRect(s[0]*x+t,s[1]*y+t, x-t*2, y-t*2);
	    ctx.fillStyle = "rgba(255, 255, 255, .25)"
	    ctx.fillRect(s[0]*x+t,s[1]*y+t, x-t*2, y-t*2);
	}
    }

    function wobble() {
	var start = new Date().getTime();
	var el = document.getElementById("canvas-wrapper");
	el.classList.add("wobble");
	setTimeout(function(el) { 
	    document.getElementById("canvas-wrapper").classList.remove("wobble"); 
	}, 200);
    };

    function mouseClickListener(e) {
	var x = hover[0]; var y = hover[1];
	// console.log("hover = " + hover);
	// console.log("selection = " + selection);
	if (selection.length == 0) {
	    if (stacks[x][y] != 0) selection.push(hover);
	    else wobble();
	}
	else if (selection.length == 1) {
	    if (equal(selection[0], hover) && stacks[x][y] != 0) selection.splice(0,1);
	    else if (validSelection(selection[0], hover) && stacks[x][y] != 0) selection.push(hover);
	    else wobble();
	}
	else if (selection.length == 2) {
	    if (equal(selection[0], hover)) selection.splice(0,1);
	    else if (equal(selection[1], hover)) selection.splice(1,1);
	    else if(distance(selection[0], hover) == 1 && distance(selection[1], hover) == 1) {
		// good
		var one = selection[0]; var two = selection[1];
		stacks[one[0]][one[1]]--;
		stacks[two[0]][two[1]]--;
		stacks[x][y]++;
		selection = [];
	    }
	    else wobble();
	}
	else console.log("something went wrong in click handler");
    }


    Slates.prototype.init = function() {
	canvas = document.getElementById("canvas");
	canvas.style.borderWidth = LINE_WIDTH+"px";
	canvas.style.borderColor = LINE_COLOR;
	canvas.style.borderRadius = LINE_WIDTH+"px";
	ctx = canvas.getContext("2d");
	this.resize();
	initGrid();
	slates = backTrack(slates, []);
	// repeats = [];
	updateGrid(slates);
	canvas.onmousemove = mouseMotionListener;
	canvas.onmouseleave = mouseExitListener;
	canvas.onclick = mouseClickListener;
    };

    Slates.prototype.resize = function() {
	var scale = .8;
	var size = Math.min(window.innerWidth*scale, window.innerHeight*scale);
	width = Math.round(size);
	height = Math.round(size);
	canvas.width = width;
	canvas.height = height;
	var margin = Math.round((window.innerHeight-height)/2);
	canvas.style.marginTop = margin+"px";
	canvas.style.marginBottom = margin+"px";
    };

    function update() {

    };

    function render() {
	ctx.clearRect(0, 0, width, height);
	ctx.fillStyle = "rgba(255,255,255,.8)";
	ctx.fillRect(0, 0, width, height);
	renderSlates();
	renderFinalStates();
	renderHover();
	renderSelection();
	displayGrid();
    };

    Slates.prototype.main = function() {
	update();
	render();
    }
}



var slates = new Slates();

window.onload = function() {
    slates.init();
    window.onresize = slates.resize.bind(slates);
    // slates.main();
    // window.requestAnimationFrame(slates.render.bind(slates));
    window.setInterval(slates.main.bind(slates), 1);
};
