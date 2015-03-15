
"use strict";

// attach the .equals method to Array's prototype to call it on any array
Array.prototype.equals = function (array) {
    // if the other array is a falsy value, return
    if (!array)
        return false;

    // compare lengths - can save a lot of time 
    if (this.length != array.length)
        return false;

    for (var i = 0, l=this.length; i < l; i++) {
        // Check if we have nested arrays
        if (this[i] instanceof Array && array[i] instanceof Array) {
            // recurse into the nested arrays
            if (!this[i].equals(array[i]))
                return false;       
        }           
        else if (this[i] != array[i]) { 
            // Warning - two different object instances will never be equal: {x:20} != {x:20}
            return false;   
        }           
    }       
    return true;
}


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

function distance(a, b) {
	return Math.sqrt(Math.pow(b[0]-a[0],2)+Math.pow(b[1]-a[1],2))
}

// TODO: add breadcrumb final states, menu, swipe for touch

function Slates() {
    var canvas;
    var ctx;
    var width;
    var height;
    var LINE_WIDTH = 5;
    var BORDER_RADIUS = 5; // TODO: make a function of width
    var GRID_SIZE = 5;
    var rect_size;
    var grid = [];
    var LINE_COLOR = "rgba(230,230,230,1)"; // "rgba(48,48,48,1)";
    var BG_COLOR = "rgba(200,200,200,1)";

    var NUM_OF_SLATES = 5;
    // var finalState = [randint(1, GRID_SIZE-1), randint(1, GRID_SIZE-1)];
    var NUM_OF_CRUMBS = Math.max(Math.min(3,NUM_OF_SLATES-1),1); // including final state, min = 1, max = NUM_OF_SLATES - 1 
    var finalState = [2,2];
    var crumbs = [{loc: finalState, visited: false}];
    // var INITIAL_STATE = [];
   
    var slates = initSlates();
    var stacks = [];
    var hover = [-1,-1];

    var aPos = null;
    var bPos = null;

    var animate = false;
    var target = null;
    var rot = 0;
    var targetRot = 2*Math.PI; // radians

    var PAD;

    // var NUM_OF_CRUMBS = 1; // max numofslates - 2 (moves - finalstate)
    // var crumbs = [];


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

    // greedy algorithm to minimize overlap
    function dispersion(loc, states) {
	// console.log("states: ", states);
	function move(x,y,state) {
	    // console.log("states: ", state);
	    switch (state) {
	    case 0: return [[x-1,y],[x+1,y]];
	    case 1: return [[x,y-1],[x,y+1]];
	    case 2: return [[x,y-1],[x+1,y]];
	    case 3: return [[x+1,y],[x,y+1]];
	    case 4: return [[x-1,y],[x,y+1]];
	    case 5: return [[x-1,y],[x,y-1]];
	    default:
		console.log("error state: ", state);
		console.error("No such possible state");
		return new Error("No possible state!");
	    }
	}

	var x = loc[0]; var y = loc[1];

	function minStates(states) {
	    var minStates = [[-1,Number.MAX_VALUE]];
	    for(var i = 0; i < states.length; ++i) {
		var m = move(x,y,states[i]);
		var num = stacks[m[0][0]][m[0][1]]+stacks[m[1][0]][m[1][0]];
		// console.log("m: ", m[0], ", ", m[1]);
		// console.log("stacks: ", stacks);
		// console.log("num: ", num);
		if      (num == minStates[0][1]) minStates.push([states[i],num]);
		else if (num < minStates[0][1]) minStates = [[states[i],num]];
	    }
	    return minStates;
	}

	function maxDstStates(states) {
	    var maxDstStates = [[-1,Number.MIN_VALUE]];
	    for(var i = 0; i < states.length; ++i) {
		var m = move(x,y,states[i]);
		var dst = (distance(m[0],finalState)+distance(m[1],finalState));
		// var dst = (distance(m[0],finalState)+distance(m[1],finalState))/2;
		// var dst = Math.min(distance(m[0],finalState), distance(m[1],finalState));
		// var dst = Math.max(distance(m[0],finalState), distance(m[1],finalState));
		//	    console.log("DST: ", dst)
		if (dst == maxDstStates[0][1]) maxDstStates.push([states[i],dst]);
		else if (dst > maxDstStates[0][1]) maxDstStates = [[states[i],dst]];
	    }
	    return maxDstStates;
	}

	
	var r = Math.random();
	
	// if (r < 1/5) return states[randint(0,states.length)];
	if (r < 1/2) {
	    var ms = minStates(states);
	    return ms[randint(0,ms.length)][0];	
	}
	if (r < 1) {
	    var md = maxDstStates(states);
	    return md[randint(0,md.length)][0];
	}
	



	// var r = Math.random();
	// // var r = 1;
	
	// if (r < 1/5) return states[randint(0,states.length)];
	// if (r < 2/5) {
	//     var ms = minStates(states);
	//     return ms[randint(0,ms.length)][0];	
	// }
	// if (r < 3/5) {
	//     var md = maxDstStates(states);
	//     return md[randint(0,md.length)][0];
	// }
	// if (r < 4/5) {
	//     var md = maxDstStates(states).map(function(x){ return x[0];});
	//     var ms = minStates(md);
	//     return ms[randint(0,ms.length)][0];	
	// }
	// var ms = minStates(states).map(function(x){ return x[0];});
	// // console.log(ms);
	// var md = maxDstStates(ms);
	// return md[randint(0,md.length)][0];




	// var md = maxDstStates(states);
	// return md[randint(0,md.length)][0];

	// console.log("minStates: ", minStates);
	// return minStates[randint(0,minStates.length)][0];

	// console.log("maxDstStates: ", maxDstStates.toString());
	// return maxDstStates[randint(0,maxDstStates.length)][0];
	
	// // corners
	// if (x == 0 && y == 0) return [3];
	// if ((x == edge) && (y == 0)) return [4];
	// if ((x == edge) && (y == edge))  return [5];
	// if ((x == 0) && (y == edge)) return [2];

	
	
    }

    function updateGrid(slates) {
	for(var i = 0; i < slates.length; i++) {
	    var x = slates[i][0];
	    var y = slates[i][1];
	    grid[x][y] = true;
	    stacks[x][y]++;
	}
    }

    Slates.prototype.printvar = function() {
	console.log(crumbs);
    }

    // var repeats = [];
    
    function backTrack(slates) {
	// console.log(slates.length);
	// console.log("slates: ", slates.toString());
	updateGrid(slates);
    	if(slates.length <= 1) return slates; // return acc.concat(slates);

    	var split = randint(1, slates.length);
    	var left = slates.slice(0, split);
    	var right = slates.slice(split, slates.length);

    	var possibleStates = getPossibleStates(slates[0]);
    	// var tries = 0;
    	// do {
	    // console.log("fssfgsdgd");

    	// var state = possibleStates[randint(0,possibleStates.length)];
    	    
	var state = dispersion(slates[0],possibleStates);
	// console.log("returned state: ", state);
	
	// console.count("here");
	var r = Math.random();
	if (r < (NUM_OF_CRUMBS/(NUM_OF_SLATES-1)) && crumbs.length < NUM_OF_CRUMBS && 
	    slates.length < NUM_OF_SLATES && hasMember(crumbs,slates[0]) == false) {
	    crumbs.push({loc: slates[0], visited: false});
	    // console.log("here");
	}

	


	// var leftPeek = modifyLocation(state, "LEFT")(slates[0]);
    	// var rightPeek = modifyLocation(state, "RIGHT")(slates[0]);

	    // if (tries > 6) break;
	    // } while(hasMember(finalStates,leftPeek) || hasMember(finalStates,rightPeek) || hasMember(repeats,leftPeek) || hasMember(repeats, rightPeek));
	    // } while(hasMember(finalStates,leftPeek) || hasMember(finalStates,rightPeek) || hasMember(acc,leftPeek) || hasMember(acc, rightPeek));
	// } while(hasMember(finalStates,leftPeek) || hasMember(finalStates,rightPeek));

	var newLeft = left.map(modifyLocation(state, "LEFT"));
	var newRight = right.map(modifyLocation(state, "RIGHT"));

	
	// console.log("acc: ", acc.toString());

	return backTrack(newLeft).concat(backTrack(newRight));
    }

    // function drawRoundedRect(x,y,w,h,r) {
    // 	ctx.lineJoin = "round";
    // 	ctx.lineWidth = r;
    // 	ctx.strokeRect(x+r/2, y+r/2, w-r, h-r);
    // }

    // function fillRoundedRect(x,y,w,h,r) {
    // 	drawRoundedRect(x,y,w,h,r);
    // 	ctx.fillRect(x+r/2, y+r/2, w-r, h-r)
    // }

    // function drawRoundedRect(x,y,w,h,r) {
    // 	ctx.beginPath();
    // 	ctx.moveTo(x+r, y);
    // 	ctx.lineTo(x+w-r, y);
    // 	ctx.quadraticCurveTo(x+w, y, x+w, y+r);
    // 	ctx.lineTo(x+w, y+h-r);
    // 	ctx.quadraticCurveTo(x+w, y+h, x+w-r, y+h);
    // 	ctx.lineTo(x+r, y+h);
    // 	ctx.quadraticCurveTo(x, y+h, x, y+h-r);
    // 	ctx.lineTo(x, y+r);
    // 	ctx.quadraticCurveTo(x, y, x+r, y);
    // 	ctx.stroke();
    // 	ctx.closePath();
    // }

    function fillRoundedRect(x, y, w, h, r) {
	ctx.beginPath();
	ctx.moveTo(x+r, y);
	ctx.lineTo(x+w-r, y);
	ctx.quadraticCurveTo(x+w, y, x+w, y+r);
	ctx.lineTo(x+w, y+h-r);
	ctx.quadraticCurveTo(x+w, y+h, x+w-r, y+h);
	ctx.lineTo(x+r, y+h);
	ctx.quadraticCurveTo(x, y+h, x, y+h-r);
	ctx.lineTo(x, y+r);
	ctx.quadraticCurveTo(x, y, x+r, y);
	ctx.fill();
	ctx.closePath();
    }

    function displayGrid() {

	ctx.fillStyle = LINE_COLOR;
	ctx.fillRect(0,0,width,height)
	// fillRoundedRect(0,0,width,height,BORDER_RADIUS);

	// ctx.strokeStyle = 'red';
	// ctx.fillStyle = 'green';
	// ctx.lineWidth = 100;
	ctx.fillStyle = LINE_COLOR;
	fillRoundedRect(0,0,width,height,BORDER_RADIUS);

	 // ctx.shadowColor = "black";
	 //    ctx.shadowOffsetY = 0;
	 //    ctx.shadowOffsetX = 0;
	 //    ctx.shadowBlur = LINE_WIDTH*2;

	// ctx.fillStyle = LINE_COLOR; 
	// for(var i = 1; i < GRID_SIZE; i++) {
	//     var xSpacing = (i*rect_size);//-(LINE_WIDTH/2);
	//     var ySpacing = (i*rect_size);//-(LINE_WIDTH/2);
	//     // console.log("rect_size = " + rect_size);
	//     ctx.fillRect(xSpacing, 0, LINE_WIDTH, height);
	//     ctx.fillRect(0, ySpacing, width, LINE_WIDTH);
	// }

	// ctx.shadowColor = null;
	//     ctx.shadowOffsetY = null;
	//     ctx.shadowOffsetX = null;
	//     ctx.shadowBlur = null;
	//     ctx.strokeStyle = null;

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
		// ctx.fillStyle = LINE_COLOR;
		// ctx.fillRect(i*s+LINE_WIDTH-1, j*s+LINE_WIDTH-1, s-LINE_WIDTH+2, s-LINE_WIDTH+2);
		if (stacks[i][j] != 0) {
		    ctx.fillStyle = "rgba(35, 114, 170, 1)"; // dark-blue
		    ctx.strokeStyle = "rgba(35, 114, 170, 1)"; //dark-blue
		    fillRoundedRect(i*s+LINE_WIDTH+PAD, j*s+LINE_WIDTH+PAD, s-LINE_WIDTH, s-LINE_WIDTH, BORDER_RADIUS);
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
		    fillRoundedRect(i*s+LINE_WIDTH+PAD, j*s+LINE_WIDTH+PAD, s-LINE_WIDTH, s-LINE_WIDTH, BORDER_RADIUS);
		    

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
	var fontSize = (rect_size/2-LINE_WIDTH*1.5)*1.5 + "px"; // TODO: Maybe find max 'n' and set font-size accordingly
	ctx.font = fontSize + " monospace";
	ctx.fillStyle = LINE_COLOR;
	ctx.textAlign = 'center';
	ctx.textBaseline = 'middle';
	for(var i = 0; i < GRID_SIZE; i++) {
	    for(var j = 0; j < GRID_SIZE; j++) {
		var n = stacks[i][j];
		if(n > 1) {
		    if (Math.floor(Math.log10(n)) == 0) ctx.font = (rect_size/2.5)*1.5 + "px monospace";
		    else ctx.font = ((rect_size/2.5)*1.5)/Math.floor(Math.log10(n)) + "px monospace";
		    // ctx.font = ((rect_size/2-LINE_WIDTH*1.5)*1.5)/Math.floor(Math.log10(n)) + "px monospace";
		    // ctx.font = "px monospace";
		    // if (Math.floor(Math.log10(n)) == 0);
		    // ctx.fillText(n.toString(), i*rect_size+LINE_WIDTH*1.5, j*rect_size+rect_size-LINE_WIDTH*.75);
		    var w = ctx.measureText(n.toString()).width;
		    ctx.fillText(n.toString(), i*rect_size+rect_size/2+LINE_WIDTH/2+PAD, 
				 j*rect_size+rect_size/2+LINE_WIDTH/2+PAD);
		    // ctx.fillStyle = 'green';
		    // ctx.fillRect(i*rect_size+rect_size/2+LINE_WIDTH/2, 
		    // 		 j*rect_size+rect_size/2+LINE_WIDTH/2, 10, 10);
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
	if (hover[0] < 0 || hover[1] < 0 || hover[0] >= GRID_SIZE || hover[1] >= GRID_SIZE) return;
	var s = rect_size;
	// if (isValidMove(hover[0], hover[1])) ctx.fillStyle = "rgba(45, 21, 73,.6)";
	// else ctx.fillStyle = "rgba(0,0,0,.5)";

	ctx.fillStyle = "rgba(0,0,0,.5)";

	
	if (hasMember(selection, hover)) {
	    // ctx.fillStyle = "rgba(0,0,0,.5)";
	    // ctx.fillStyle = "rgba(18,58,86,1)";
	    var t = rect_size/30;
	    fillRoundedRect(hover[0]*s+LINE_WIDTH+t+PAD,hover[1]*s+LINE_WIDTH+t+PAD, s-LINE_WIDTH-t*2, s-LINE_WIDTH-t*2,BORDER_RADIUS);
	} else {
	    // ctx.fillStyle = "rgba(0,0,0,.5)";
	    fillRoundedRect(hover[0]*s+LINE_WIDTH+PAD, hover[1]*s+LINE_WIDTH+PAD, s-LINE_WIDTH, s-LINE_WIDTH, BORDER_RADIUS);
	    // ctx.fillRect(hover[0]*s+LINE_WIDTH*2, hover[1]*s+LINE_WIDTH*2, s-LINE_WIDTH*3, s-LINE_WIDTH*3);
	}
    }

    function renderFinalState() {

	// var i = finalState[0];
	// var j = finalState[1];

	// var s = rect_size;
	
	// // ctx.strokeStyle = "rgba(170, 26, 40, 1)";
	// // ctx.fillStyle =  "rgba(170, 26, 40, 1)";
	// // fillRoundedRect(i*s+LINE_WIDTH/2, j*s+LINE_WIDTH/2, s, s, LINE_WIDTH);
	// // fillRoundedRect(i*s, j*s, s+LINE_WIDTH, s+LINE_WIDTH, LINE_WIDTH);

	// var h = stacks[i][j];
	// if (h > 0) {
	//     ctx.fillStyle = "rgba(35, 114, 170, 1)";
	//     ctx.strokeStyle = "rgba(35, 114, 170, 1)";
	// } else {
	//     ctx.fillStyle = BG_COLOR;
	//     ctx.strokeStyle = BG_COLOR;
	// }
	// fillRoundedRect(i*s+LINE_WIDTH+PAD, j*s+LINE_WIDTH+PAD, s-LINE_WIDTH, s-LINE_WIDTH, BORDER_RADIUS);

	// ctx.beginPath();
	// ctx.arc(i*s+s/2+LINE_WIDTH/2+PAD, j*s+s/2+LINE_WIDTH/2+PAD, s/2.5, 0, 2 * Math.PI, false);
	// ctx.fillStyle = 'firebrick';
	// ctx.fill();
	// ctx.closePath();

	// console.log(crumbs);

	for(var k = 0; k < crumbs.length; ++k) {
	    var i = crumbs[k].loc[0];
	    // console.log("i = ", i);
	    var j = crumbs[k].loc[1];
	    // console.log("j = ", j);

	    var s = rect_size;

	    var h = stacks[i][j];
	    if (h > 0) {
		ctx.fillStyle = "rgba(35, 114, 170, 1)";
		ctx.strokeStyle = "rgba(35, 114, 170, 1)";
	    } else {
		ctx.fillStyle = BG_COLOR;
		ctx.strokeStyle = BG_COLOR;
	    }
	    fillRoundedRect(i*s+LINE_WIDTH+PAD, j*s+LINE_WIDTH+PAD, s-LINE_WIDTH, s-LINE_WIDTH, BORDER_RADIUS);

	    ctx.beginPath();
	    ctx.arc(i*s+s/2+LINE_WIDTH/2+PAD, j*s+s/2+LINE_WIDTH/2+PAD, s/2.5, 0, 2 * Math.PI, false);
	    // if (k == 0) ctx.fillStyle = "yellow";
	    if (crumbs[k].visited == false) {
		ctx.fillStyle = 'firebrick';
	    } else {
		// ctx.fillStyle = 'rebeccapurple';
		ctx.fillStyle = "rgba(0, 153, 51, 1)";
		// ctx.fillStyle = "rgba(209, 62, 25, 1)";
	    }
	    
	    ctx.fill();
	    ctx.closePath();
	}
    }

    function mouseMotionListener(e) {
	var br = canvas.getBoundingClientRect();
	// if ((br.left <= e.clientX && e.clientX <= br.left+width) && (br.top <= e.clientY && e.clientY <= br.top+height)) {
	var x = e.clientX - br.left - PAD;
	var y = e.clientY - br.top - PAD;
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
	    
	    var buf = 1;
	    fillRoundedRect(s[0]*rs+LINE_WIDTH-buf+PAD, s[1]*rs+LINE_WIDTH-buf+PAD, rs-LINE_WIDTH+buf*2, rs-LINE_WIDTH+buf*2, BORDER_RADIUS);

	    // ctx.shadowColor = "black";
	    // ctx.shadowOffsetY = 0;
	    // ctx.shadowOffsetX = 0;
	    // ctx.shadowBlur = LINE_WIDTH*2;
	    // // ctx.fillStyle = "rgba(0,0,0,.5)";
	    // // ctx.fillRect(s[0]*x,s[1]*y, x, y);

	    // ctx.fillStyle = "rgba(35, 114, 170, 1)";
	    // ctx.strokeStyle = "rgba(35, 114, 170, 1)";

	    // // ctx.strokeStyle = "black"


	    var t = rect_size/30; // LINE_WIDTH*2;

	    // fillRoundedRect(s[0]*x+LINE_WIDTH+t,s[1]*y+LINE_WIDTH+t, x-LINE_WIDTH-t*2, y-LINE_WIDTH-t*2,BORDER_RADIUS);
	    // ctx.shadowBlur = LINE_WIDTH*4;
	    // fillRoundedRect(s[0]*x+LINE_WIDTH+t,s[1]*y+LINE_WIDTH+t, x-LINE_WIDTH-t*2, y-LINE_WIDTH-t*2,BORDER_RADIUS);
	    // // ctx.shadowBlur = LINE_WIDTH*8;
	    // // fillRoundedRect(s[0]*x+LINE_WIDTH+t,s[1]*y+LINE_WIDTH+t, x-LINE_WIDTH-t*2, y-LINE_WIDTH-t*2,LINE_WIDTH/2);


	    // // ctx.strokeRect(s[0]*x+t,s[1]*y+t, x-t*2, y-t*2);
	    // // ctx.fillRect(s[0]*x,s[1]*y, x, y);
	    // ctx.shadowColor = null;
	    // ctx.shadowOffsetY = null;
	    // ctx.shadowOffsetX = null;
	    // ctx.shadowBlur = null;
	    // ctx.strokeStyle = null;

	    ctx.shadowColor = "black";
	    ctx.shadowOffsetY = 0;
	    ctx.shadowOffsetX = 0;
	    ctx.shadowBlur = rs/3;

	    ctx.fillStyle = "rgba(35, 114, 170, 1)";
	    fillRoundedRect(s[0]*x+LINE_WIDTH+t+PAD,s[1]*y+LINE_WIDTH+t+PAD, x-LINE_WIDTH-t*2, y-LINE_WIDTH-t*2,BORDER_RADIUS);
	    // ctx.shadowBlur = 25;
	    fillRoundedRect(s[0]*x+LINE_WIDTH+t+PAD,s[1]*y+LINE_WIDTH+t+PAD, x-LINE_WIDTH-t*2, y-LINE_WIDTH-t*2,BORDER_RADIUS);


	    ctx.shadowColor = null;
	    ctx.shadowOffsetY = null;
	    ctx.shadowOffsetX = null;
	    ctx.shadowBlur = null;

	    // ctx.fillStyle = "rgba(0, 255, 0, .5)"
	    fillRoundedRect(s[0]*x+LINE_WIDTH+t+PAD,s[1]*y+LINE_WIDTH+t+PAD, x-LINE_WIDTH-t*2, y-LINE_WIDTH-t*2,BORDER_RADIUS);

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

    function easeOutExpo(t, b, c, d) {
	return c * ( -Math.pow( 2, -10 * t/d ) + 1 ) + b;
    }

    function easeOutCubic(t, b, c, d) {
	t /= d;
	t--;
	return c*(t*t*t + 1) + b;
    }

    
    function animateSlates() {
	if (animate == false) return;
	
	var a = aPos; // {x:selection[0][0], y:selection[0][1]};
	var b = bPos; // {x:selection[1][0], y:selection[1][1]};

	var mTol = .5;
	var rTol = .01;

	var rs = rect_size;

	var t = rs/30;

	var deltaAX = target.x-a.x;
	var deltaAY = target.y-a.y;

	var deltaBX = target.x-b.x;
	var deltaBY = target.y-b.y;

	ctx.shadowColor = "black";
	ctx.shadowOffsetY = 0;
	ctx.shadowOffsetX = 0;
	ctx.shadowBlur = rs/3;

	ctx.fillStyle = "rgba(35, 114, 170, 1)";

	if ((Math.abs(deltaAX) > mTol || Math.abs(deltaAY) > mTol) &&
	    (Math.abs(deltaBX) > mTol || Math.abs(deltaBY) > mTol)) {
	    // console.log("jdfksfjkl");
	    // console.log(a.x);
	    // fillRoundedRect(a.x*rs+LINE_WIDTH+t,a.y*rs+LINE_WIDTH+t, rs-LINE_WIDTH-t*2, rs-LINE_WIDTH-t*2,LINE_WIDTH-t);
	    // fillRoundedRect(b.x*rs+LINE_WIDTH+t,b.y*rs+LINE_WIDTH+t, rs-LINE_WIDTH-t*2, rs-LINE_WIDTH-t*2,LINE_WIDTH-t);
	    fillRoundedRect(a.x,a.y, rs-LINE_WIDTH-t*2, rs-LINE_WIDTH-t*2,BORDER_RADIUS-t);
	    fillRoundedRect(a.x,a.y, rs-LINE_WIDTH-t*2, rs-LINE_WIDTH-t*2,BORDER_RADIUS-t);

	    fillRoundedRect(b.x,b.y, rs-LINE_WIDTH-t*2, rs-LINE_WIDTH-t*2,BORDER_RADIUS-t);
	    fillRoundedRect(b.x,b.y, rs-LINE_WIDTH-t*2, rs-LINE_WIDTH-t*2,BORDER_RADIUS-t);
	    a.x = easeOutExpo(.1, a.x, deltaAX, 2);
	    a.y = easeOutExpo(.1, a.y, deltaAY, 2);
	    b.x = easeOutExpo(.1, b.x, deltaBX, 2);
	    b.y = easeOutExpo(.1, b.y, deltaBY, 2);
	    rot = 0;
	}
	else {
	    var deltaRot = targetRot-rot;
	    if (Math.abs(deltaRot) > rTol) {
		rot = easeOutCubic(1, rot, deltaRot, 20);
		ctx.save();
		var ox = target.x + (rs-LINE_WIDTH-t*2)/2; // target.x+(rs-(rs*.1))/2-LINE_WIDTH/2;
		var oy = target.y + (rs-LINE_WIDTH-t*2)/2;// target.y+(rs-(rs*.1))/2-LINE_WIDTH/2;
	
		ctx.translate(ox,oy);
		ctx.rotate(rot);
		ctx.translate(-ox,-oy);
		// ctx.fillStyle = "green";
		// fillRoundedRect(target.x*rs+LINE_WIDTH+t, target.y*rs+LINE_WIDTH+t, rs-LINE_WIDTH-t*2, rs-LINE_WIDTH-t*2,LINE_WIDTH-t);
		fillRoundedRect(target.x, target.y, rs-LINE_WIDTH-t*2, rs-LINE_WIDTH-t*2,BORDER_RADIUS-t);
		fillRoundedRect(target.x, target.y, rs-LINE_WIDTH-t*2, rs-LINE_WIDTH-t*2,BORDER_RADIUS-t);
		// ctx.fillStyle= "yellow";
		// ctx.fillRect(ox-5,oy-5,10,10);
		ctx.restore();
	    }
	    else {
		// console.log(target);
		// console.log(rs);

		// console.log("target: ", target);
		// console.log("rs: ", rs);

		// ctx.fillStyle = "yellow";
		// ctx.fillRect(target.x, target.y, 10, 10);
		
		stacks[target.loc[0]][target.loc[1]]++;
		// selection = [];
		

		crumbs.forEach(function(el) {
		    if (el.loc.equals(target.loc)) {
			el.visited = true;
		    }
		});

		target = null;
		animate = false;
		
		if (checkWinner()) alert("You Won!");
		else if (checkLoser()) alert("You Lost!");
		
		// console.log(slates);
	    }
	}
	
		ctx.shadowColor = null;
		ctx.shadowOffsetY = null;
		ctx.shadowOffsetX = null;
		ctx.shadowBlur = null;

	aPos = a;
	bPos = b;
	
    }
    

    function mouseClickListener(e) {
	// if (animate == true) return;
	if (hover[0] < 0 || hover[1] < 0 || hover[0] >= GRID_SIZE || hover[1] >= GRID_SIZE) return;
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
		// var f1 = animateSlate(one,[x,y]);
		stacks[two[0]][two[1]]--;
		// var f2 = animateSlate(two,[x,y]);
		// console.log(f1+f2);
		// if ((f1+f2) == 2) stacks[x][y]++;
		// var br = canvas.getBoundingClientRect();
		// // if ((br.left <= e.clientX && e.clientX <= br.left+width) && (br.top <= e.clientY && e.clientY <= br.top+height)) {
		// var x = e.clientX - br.left;
		// var y = e.clientY - br.top;
		var t = rect_size/30;
		var rs = rect_size;
		aPos = {x:one[0]*rs+LINE_WIDTH+t+PAD,y:one[1]*rs+LINE_WIDTH+t+PAD};
		bPos = {x:two[0]*rs+LINE_WIDTH+t+PAD,y:two[1]*rs+LINE_WIDTH+t+PAD};
		target = {x:x*rs+LINE_WIDTH+t+PAD, y:y*rs+LINE_WIDTH+t+PAD, loc: [x,y]};
		animate = true;
		// stacks[x][y]++;
		selection = [];
	    }
	    else wobble();
	}
	else console.log("something went wrong in click handler");
    }

    function checkWinner() {
	var num = 0;
	for(var i = 0; i < GRID_SIZE; ++i) {
	    for(var j = 0; j < GRID_SIZE; ++j) {
		num += stacks[i][j];
	    }
	}
	
	// console.log(crumbs);
	
	// var v = crumbs.reduce(function(x,y){ 
	//     console.log("x: ", x);
	//     console.log("y: ", y);
	//     return (x.visited && y.visited); });

	var v = true;

	var c = 0;
	for(var i = 0; i < crumbs.length; ++i) {
	    // if (v == 0) return false;
	    var cl = crumbs[i].loc;
	    c += stacks[cl[0]][cl[1]];
	    // console.log(crumbs[i]);
	    // console.log(v);
	    v = (v && crumbs[i].visited);
	}

	// console.log(crumbs);

	// console.log("num = "+num+", v = "+v+", c = "+c);
	
	return (num == 1 && v == true && c == 1);
	
	// return (stacks[finalState[0]][finalState[1]] == 1 && num == 1); 
    }

    function checkLoser() {
	var moves = 0;
	for(var i = 0; i < GRID_SIZE; ++i) {
	    for(var j = 0; j < GRID_SIZE; ++j) {
		if (isValidMove(i,j)) moves++;
	    }
	}
	return (moves == 0);
    }


    Slates.prototype.init = function() {
	canvas = document.getElementById("canvas");
	// canvas.style.borderWidth  = LINE_WIDTH+"px";
	// canvas.style.borderColor  = LINE_COLOR;
	// canvas.style.borderRadius = LINE_WIDTH*2+"px";
	ctx = canvas.getContext("2d");
	this.resize();
	initGrid();
	slates = backTrack(slates);
	grid = []; stacks = [];
	initGrid();
	// repeats = [];
	updateGrid(slates);
	canvas.onmousemove = mouseMotionListener;
	canvas.onmouseleave = mouseExitListener;
	canvas.onclick = mouseClickListener;
    };

    Slates.prototype.resize = function() {
	var scale = 1;
	var br = .8
	var size = Math.min(window.innerWidth*scale, window.innerHeight*scale)-20;
	width = Math.round(size);
	height = Math.round(size);
	canvas.width = width;
	canvas.height = height;
	// var margin = Math.round((window.innerHeight-height)/2);
	// canvas.style.marginTop = margin+"px";
	// canvas.style.marginBottom = margin+"px";
	canvas.parentElement.style.height = size+"px";
	canvas.parentElement.style.width = size+"px";
	rect_size = Math.round((width*br - LINE_WIDTH)/GRID_SIZE);
	PAD = (width-width*br)/2
    };

    function update() {
	
    };

    function render() {
	ctx.clearRect(0, 0, width, height);
	ctx.fillStyle = "rgba(255,255,255,.8)";
	ctx.fillRect(0, 0, width, height);
	displayGrid();
	renderSlates();   
	renderFinalState();
	renderNumbers();
	renderSelection();
	animateSlates();
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
