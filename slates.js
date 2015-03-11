
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
    var LINE_WIDTH = 5;
    var GRID_SIZE = 5;
    var rect_size;
    var grid = [];
    var LINE_COLOR = "rgba(230,230,230,1)"; // "rgba(48,48,48,1)";
    var BG_COLOR = "rgba(200,200,200,1)";
    var finalState = [randint(1, GRID_SIZE), randint(1, GRID_SIZE)];
    // var finalStates = [[0,0]];
    var INITIAL_STATE = [];
    var NUM_OF_SLATES = 5;
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
	    s.push(finalState);
	} return s;
    }

    function getPossibleStates(loc) {
	var x = loc[0]; var y = loc[1];
	var edge = GRID_SIZE-1;

	// clock-wise around the edges
	if      ((x == 0) && (y == 0))                           return [3];
	else if ((x != 0 && x != edge) && (y == 0))              return [0,3,4];
	else if ((x == edge) && (y == 0))                        return [4];
	else if ((x == edge) && (y != 0 && y != edge))           return [1,4,5];
	else if ((x == edge) && (y == edge))                     return [5];
	else if ((x != 0 && x != edge) && (y == edge))           return [0,2,5];
	else if ((x == 0) && (y == edge))                        return [2];
	else if ((x == 0) && (y != 0 && y != edge))              return [1,2,3];
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
    	if(slates.length <= 1) return acc.concat(slates);

    	var split = randint(1, slates.length);
    	var left = slates.slice(0, split);
    	var right = slates.slice(split, slates.length);

    	var possibleStates = getPossibleStates(slates[0]);
    	// var tries = 0;
    	// do {
	    // console.log("fssfgsdgd");
    	    var state = possibleStates[randint(0,possibleStates.length)];
    	    var leftPeek = modifyLocation(state, "LEFT")(slates[0]);
    	    var rightPeek = modifyLocation(state, "RIGHT")(slates[0]);
	    // if (tries > 6) break;
	    // } while(hasMember(finalStates,leftPeek) || hasMember(finalStates,rightPeek) || hasMember(repeats,leftPeek) || hasMember(repeats, rightPeek));
	    // } while(hasMember(finalStates,leftPeek) || hasMember(finalStates,rightPeek) || hasMember(acc,leftPeek) || hasMember(acc, rightPeek));
	// } while(hasMember(finalStates,leftPeek) || hasMember(finalStates,rightPeek));

	var newLeft = left.map(modifyLocation(state, "LEFT"));
	var newRight = right.map(modifyLocation(state, "RIGHT"));

	return backTrack(newLeft, acc).concat(backTrack(newRight, acc));
    }

    function drawRoundedRect(x,y,w,h,r) {
	ctx.lineJoin = "round";
	ctx.lineWidth = r;
	ctx.strokeRect(x+r/2, y+r/2, w-r, h-r);
    }

    function fillRoundedRect(x,y,w,h,r) {
	drawRoundedRect(x,y,w,h,r);
	ctx.fillRect(x+r/2, y+r/2, w-r, h-r)
    }

    function displayGrid() {

	ctx.fillStyle = BG_COLOR;
	ctx.fillRect(0,0,width,height);

	ctx.strokeStyle = LINE_COLOR;
	drawRoundedRect(0,0,width,height,LINE_WIDTH);

	 // ctx.shadowColor = "black";
	 //    ctx.shadowOffsetY = 0;
	 //    ctx.shadowOffsetX = 0;
	 //    ctx.shadowBlur = LINE_WIDTH*2;

	ctx.fillStyle = LINE_COLOR; 
	for(var i = 1; i < GRID_SIZE; i++) {
	    var xSpacing = (i*rect_size);//-(LINE_WIDTH/2);
	    var ySpacing = (i*rect_size);//-(LINE_WIDTH/2);
	    // console.log("rect_size = " + rect_size);
	    ctx.fillRect(xSpacing, 0, LINE_WIDTH, height);
	    ctx.fillRect(0, ySpacing, width, LINE_WIDTH);
	}

	// ctx.shadowColor = null;
	//     ctx.shadowOffsetY = null;
	//     ctx.shadowOffsetX = null;
	//     ctx.shadowBlur = null;
	//     ctx.strokeStyle = null;

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
	// var fontSize = (rect_size * .2) + "px";
	// ctx.font = fontSize + " monospace";
	for(var i = 0; i < GRID_SIZE; i++) {
	    for(var j = 0; j < GRID_SIZE; j++) {
		var s = rect_size;
		ctx.fillStyle = LINE_COLOR;
		ctx.fillRect(i*s+LINE_WIDTH-1, j*s+LINE_WIDTH-1, s-LINE_WIDTH+2, s-LINE_WIDTH+2);
		if (stacks[i][j] != 0) {
		    ctx.fillStyle = "rgba(35, 114, 170, 1)"; // dark-blue
		    ctx.strokeStyle = "rgba(35, 114, 170, 1)"; //dark-blue
		    fillRoundedRect(i*s+LINE_WIDTH, j*s+LINE_WIDTH, s-LINE_WIDTH, s-LINE_WIDTH, LINE_WIDTH);
		}
		else {
		    ctx.fillStyle = BG_COLOR;
		    ctx.strokeStyle = BG_COLOR;
		    // var grd = ctx.createRadialGradient(i*s+LINE_WIDTH*.5+(s*.5), j*s+LINE_WIDTH*.5+(s*.5), s/4, 
		    // 				       i*s+LINE_WIDTH*.5+(s*.5), j*s+LINE_WIDTH*.5+(s*.5), 100);
		    // grd.addColorStop(0, BG_COLOR);
		    // grd.addColorStop(1, LINE_COLOR);
		    // ctx.fillStyle = grd;
		    // ctx.strokeStyle = grd;
		    fillRoundedRect(i*s+LINE_WIDTH, j*s+LINE_WIDTH, s-LINE_WIDTH, s-LINE_WIDTH, LINE_WIDTH);
		    

		    // ctx.fillStyle = "red";
		    // ctx.strokeStyle = "green";

		    // ctx.shadowColor = "black";
		    // ctx.shadowOffsetY = 0;
		    // ctx.shadowOffsetX = 0;
		    // ctx.shadowBlur = LINE_WIDTH*2;
		    // var ins = 5;
		    // drawRoundedRect(i*s+LINE_WIDTH/2, j*s+LINE_WIDTH/2, s, s, LINE_WIDTH);
		    // ctx.shadowColor = null;
		    // ctx.shadowOffsetY = null;
		    // ctx.shadowOffsetX = null;
		    // ctx.shadowBlur = null;
		    // ctx.strokeStyle = null;
		}
	    }
	}
    }

    function renderNumbers() {
	// var fontSize = (rect_size * .2) + "px";
	var fontSize = (rect_size * .8) + "px";
	ctx.font = fontSize + " monospace";
	ctx.fillStyle = LINE_COLOR;
	for(var i = 0; i < GRID_SIZE; i++) {
	    for(var j = 0; j < GRID_SIZE; j++) {
		var n = stacks[i][j];
		if(n > 1) {
		    // ctx.fillText(n.toString(), i*rect_size+LINE_WIDTH*1.5, j*rect_size+rect_size-LINE_WIDTH*.75);
		    var w = ctx.measureText(n.toString()).width;
		    ctx.fillText(n.toString(), i*rect_size+rect_size/2-w/2, 
				 j*rect_size+rect_size/2+(rect_size*.8)/2);
		}
	    }
	}
    }

    function isValidMove(x, y) {
	var adj = 0;
	var edge = GRID_SIZE-1;

	if (x != 0    && stacks[x-1][y] != 0) adj++;
	if (y != 0    && stacks[x][y-1] != 0) adj++;
	if (x != edge && stacks[x+1][y] != 0) adj++;
	if (y != edge && stacks[x][y+1] != 0) adj++;

	return (adj >= 2);
    }

    function renderHover() {
	if (hover[0] == -1 && hover[1] == -1) return;
	var s = rect_size;
	// if (isValidMove(hover[0], hover[1])) ctx.fillStyle = "rgba(45, 21, 73,.6)";
	// else ctx.fillStyle = "rgba(0,0,0,.5)";

	
	if (hasMember(selection, hover)) {
	    ctx.fillStyle = "rgba(18,58,86,1)";
	    ctx.strokeStyle = "rgba(18, 58, 86,1)";
	    var t = LINE_WIDTH*2;
	    fillRoundedRect(hover[0]*s+LINE_WIDTH+t,hover[1]*s+LINE_WIDTH+t, s-LINE_WIDTH-t*2, s-LINE_WIDTH-t*2,LINE_WIDTH/2);
	} else {
	    ctx.fillStyle = "rgba(0,0,0,.5)";
	    ctx.strokeStyle = "rgba(0,0,0,.5)";
	    drawRoundedRect(hover[0]*s+LINE_WIDTH, hover[1]*s+LINE_WIDTH, s-LINE_WIDTH, s-LINE_WIDTH, LINE_WIDTH);
	    ctx.fillRect(hover[0]*s+LINE_WIDTH*2, hover[1]*s+LINE_WIDTH*2, s-LINE_WIDTH*3, s-LINE_WIDTH*3);
	}
    }

    function renderFinalState() {

	var i = finalState[0];
	var j = finalState[1];

	var s = rect_size;
	
	ctx.strokeStyle = "rgba(170, 26, 40, 1)";
	ctx.fillStyle =  "rgba(170, 26, 40, 1)";
	fillRoundedRect(i*s+LINE_WIDTH/2, j*s+LINE_WIDTH/2, s, s, LINE_WIDTH);
	// fillRoundedRect(i*s, j*s, s+LINE_WIDTH, s+LINE_WIDTH, LINE_WIDTH);

	var h = stacks[i][j];
	if (h > 0) {
	    ctx.fillStyle = "rgba(35, 114, 170, 1)";
	    ctx.strokeStyle = "rgba(35, 114, 170, 1)";
	} else {
	    ctx.fillStyle = BG_COLOR;
	    ctx.strokeStyle = BG_COLOR;
	}
	fillRoundedRect(i*s+LINE_WIDTH, j*s+LINE_WIDTH, s-LINE_WIDTH, s-LINE_WIDTH, LINE_WIDTH);
    }

    function mouseMotionListener(e) {
	var br = canvas.getBoundingClientRect();
	// if ((br.left <= e.clientX && e.clientX <= br.left+width) && (br.top <= e.clientY && e.clientY <= br.top+height)) {
	var x = e.clientX - br.left;
	var y = e.clientY - br.top;
	var xLoc = Math.floor(x / rect_size);
	var yLoc = Math.floor(y / rect_size);
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
	return (d == Math.sqrt(2) || d == 2) ? true : false;
    }

    function renderSelection() {
	var x = rect_size;
	var y = rect_size;
	var rs = rect_size;
	for(var i = 0; i < selection.length; i++) {
	    var s = selection[i];
	    // ctx.fillStyle = "rgba(255, 255, 255, .5)"; // "rgba(228, 186, 22, .75)";
	    // ctx.fillRect(s[0]*x,s[1]*y, x, y);
	    // ctx.fillStyle = "rgba(0,0,0,.5)";
	    // ctx.fillRect(s[0]*x,s[1]*y, x, y);
	    
	    if (stacks[s[0]][s[1]] > 1) {
		ctx.fillStyle = "rgba(35, 114, 170, 1)";
		ctx.strokeStyle = "rgba(35, 114, 170, 1)";
	    } else {
		ctx.fillStyle = BG_COLOR;
		ctx.strokeStyle = BG_COLOR;
	    }

	    fillRoundedRect(s[0]*rs+LINE_WIDTH, s[1]*rs+LINE_WIDTH, rs-LINE_WIDTH, rs-LINE_WIDTH, LINE_WIDTH);

	    ctx.shadowColor = "black";
	    ctx.shadowOffsetY = 0;
	    ctx.shadowOffsetX = 0;
	    ctx.shadowBlur = LINE_WIDTH*2;
	    // ctx.fillStyle = "rgba(0,0,0,.5)";
	    // ctx.fillRect(s[0]*x,s[1]*y, x, y);

	    ctx.fillStyle = "rgba(35, 114, 170, 1)";
	    ctx.strokeStyle = "rgba(35, 114, 170, 1)";

	    // ctx.strokeStyle = "black"


	    var t = LINE_WIDTH*2;

	    fillRoundedRect(s[0]*x+LINE_WIDTH+t,s[1]*y+LINE_WIDTH+t, x-LINE_WIDTH-t*2, y-LINE_WIDTH-t*2,LINE_WIDTH/2);
	    ctx.shadowBlur = LINE_WIDTH*4;
	    fillRoundedRect(s[0]*x+LINE_WIDTH+t,s[1]*y+LINE_WIDTH+t, x-LINE_WIDTH-t*2, y-LINE_WIDTH-t*2,LINE_WIDTH/2);
	    // ctx.shadowBlur = LINE_WIDTH*8;
	    // fillRoundedRect(s[0]*x+LINE_WIDTH+t,s[1]*y+LINE_WIDTH+t, x-LINE_WIDTH-t*2, y-LINE_WIDTH-t*2,LINE_WIDTH/2);


	    // ctx.strokeRect(s[0]*x+t,s[1]*y+t, x-t*2, y-t*2);
	    // ctx.fillRect(s[0]*x,s[1]*y, x, y);
	    ctx.shadowColor = null;
	    ctx.shadowOffsetY = null;
	    ctx.shadowOffsetX = null;
	    ctx.shadowBlur = null;
	    ctx.strokeStyle = null;
	    fillRoundedRect(s[0]*x+LINE_WIDTH+t,s[1]*y+LINE_WIDTH+t, x-LINE_WIDTH-t*2, y-LINE_WIDTH-t*2,LINE_WIDTH/2);
	    // ctx.fillStyle = "rgba(35, 114, 170, .8)";
	    // var t = 2;
	    // ctx.fillRect(s[0]*x+t,s[1]*y+t, x-t*2, y-t*2);
	    // ctx.fillStyle = "rgba(255, 255, 255, .25)";
	    // ctx.strokeStyle = "rgba(255,255,255,.25)";
	    // fillRoundedRect(s[0]*x+LINE_WIDTH+t,s[1]*y+LINE_WIDTH+t, x-LINE_WIDTH-t*2, y-LINE_WIDTH-t*2,LINE_WIDTH/2);
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

    function animateSlate(a,b) {

	// var stepx = 0;
	// var stepy = 0;
	var r = 1;
	var threshold = 5;
	var rs = rect_size;
	var t = LINE_WIDTH/2

	var tmp = 0;
	
	a = [a[0]*rs+LINE_WIDTH+t,a[1]*rs+LINE_WIDTH+t];
	b = [b[0]*rs+LINE_WIDTH+t,b[1]*rs+LINE_WIDTH+t];

	function animate() {

	    // console.log(a);
	    
	   var rid = requestAnimationFrame(function(){animate(a,b);});

	    var d = distance(a,b);
	    
	    if (d <= threshold) {
		console.log("canceling");
		cancelAnimationFrame(rid)
		return 1;
	    }
	    
	    
	    // console.log(d);
	    

	    ctx.fillStyle = "rgba(35, 114, 170, 1)";
	    ctx.strokeStyle = "rgba(35, 114, 170, 1)";

	    
	    // fillRoundedRect(a[0]*rs+LINE_WIDTH+t+stepx,a[1]*rs+LINE_WIDTH+t+stepy, rs-LINE_WIDTH-t*2, 
	    // 		    rs-LINE_WIDTH-t*2,LINE_WIDTH/2);
	    // ctx.shadowBlur = LINE_WIDTH*4;
	    // fillRoundedRect(a[0]*rs+LINE_WIDTH+t+stepx,a[1]*rs+LINE_WIDTH+t+stepy, rs-LINE_WIDTH-t*2, 
	    // 		    rs-LINE_WIDTH-t*2,LINE_WIDTH/2);
	    // ctx.shadowBlur = LINE_WIDTH*8;
	    // fillRoundedRect(a[0]*rs+LINE_WIDTH+t+stepx,a[1]*rs+LINE_WIDTH+t+stepy, rs-LINE_WIDTH-t*2, 
	    // 		    rs-LINE_WIDTH-t*2,LINE_WIDTH/2);
	    // this.fillRoundedRect(a[0], a[1], rs-LINE_WIDTH-t*2, rs-LINE_WIDTH-t*2);
	    // ctx.shadowColor = "black";
	    // ctx.shadowOffsetY = 0;
	    // ctx.shadowOffsetX = 0;
	    // ctx.shadowBlur = LINE_WIDTH*2;

	    ctx.lineJoin = "round";
	    ctx.lineWidth = LINE_WIDTH/2;
	    // s[0]*x+LINE_WIDTH+t,s[1]*y+LINE_WIDTH+t, x-LINE_WIDTH-t*2, y-LINE_WIDTH-t*2,LINE_WIDTH/2
	    ctx.strokeRect(a[0], a[1], rs-LINE_WIDTH-t*2, rs-LINE_WIDTH-t*2);
	    ctx.fillRect(a[0], a[1], rs-LINE_WIDTH-t*2, rs-LINE_WIDTH-t*2);

	    // ctx.shadowBlur = LINE_WIDTH*4;
	    // ctx.strokeRect(a[0], a[1], rs-LINE_WIDTH-t*2, rs-LINE_WIDTH-t*2);
	    // ctx.fillRect(a[0], a[1], rs-LINE_WIDTH-t*2, rs-LINE_WIDTH-t*2);

	    // ctx.shadowBlur = LINE_WIDTH*8;
	    // ctx.strokeRect(a[0], a[1], rs-LINE_WIDTH-t*2, rs-LINE_WIDTH-t*2);
	    // ctx.fillRect(a[0], a[1], rs-LINE_WIDTH-t*2, rs-LINE_WIDTH-t*2);

	    // ctx.shadowColor = null;
	    // ctx.shadowOffsetY = null;
	    // ctx.shadowOffsetX = null;
	    // ctx.shadowBlur = null;
	    // ctx.strokeStyle = null;
	    
	    if      (a[0] < b[0]) a[0] += r;
	    else if (a[0] > b[0]) a[0] -= r;
	    
	    if      (a[1] < b[1]) a[1] += r;
	    else if (a[1] > b[1]) a[1] -= r;

	    tmp++;

	    requestAnimationFrame(function(){animate(a,b);});
	}

	return animate();
	 // ctx.shadowColor = null;
	 //    ctx.shadowOffsetY = null;
	 //    ctx.shadowOffsetX = null;
	 //    ctx.shadowBlur = null;
	 //    ctx.strokeStyle = null;

    }

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
		var f1 = animateSlate(one,[x,y]);
		stacks[two[0]][two[1]]--;
		var f2 = animateSlate(two,[x,y]);
		// console.log(f1+f2);
		if ((f1+f2) == 2) stacks[x][y]++;
		// stacks[x][y]++;
		selection = [];
	    }
	    else wobble();
	}
	else console.log("something went wrong in click handler");
    }


    Slates.prototype.init = function() {
	canvas = document.getElementById("canvas");
	// canvas.style.borderWidth  = LINE_WIDTH+"px";
	// canvas.style.borderColor  = LINE_COLOR;
	// canvas.style.borderRadius = LINE_WIDTH*2+"px";
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
	rect_size = Math.round((width - LINE_WIDTH)/GRID_SIZE);
    };

    function update() {

    };

    function render() {
	ctx.clearRect(0, 0, width, height);
	ctx.fillStyle = "rgba(255,255,255,.8)";
	ctx.fillRect(0, 0, width, height);
	displayGrid();
	renderSlates();
	renderNumbers();     
	renderFinalState();
	renderSelection()
	renderHover();
	window.requestAnimationFrame(render);
    };	

    Slates.prototype.main = function() {
	update();
	render();
	// window.requestAnimationFrame(main);
    }
}



var slates = new Slates();

window.onload = function() {
    slates.init();
    window.onresize = slates.resize.bind(slates);
    // slates.main();
    window.requestAnimationFrame(slates.main.bind(slates));
   //  window.setInterval(slates.main.bind(slates), 1);
};
