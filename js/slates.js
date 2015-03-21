
/*================================================================================================*\
                       ______  __      ______  ______  ______  ______    
                      /\  ___\/\ \    /\  __ \/\__  _\/\  ___\/\  ___\   
                      \ \___  \ \ \___\ \  __ \/_/\ \/\ \  __\\ \___  \  
                       \/\_____\ \_____\ \_\ \_\ \ \_\ \ \_____\/\_____\ 
                        \/_____/\/_____/\/_/\/_/  \/_/  \/_____/\/_____/ 
                                                                         
                        \*================================================================================================*/

                        "use strict";

//== utility functions ===========================================================================\\

// [min,max)
function randint(min, max) {
	return Math.floor(Math.random() * (max - min)) + min;
}

function distance(a, b) {
	return Math.sqrt(Math.pow(b[0]-a[0],2)+Math.pow(b[1]-a[1],2));
}

// order matters
Object.prototype.equals = function(x) {
	return (JSON.stringify(this) === JSON.stringify(x));
}

Array.prototype.equals = function(array) {

	if (!array) return false;

	if (this.length != array.length) return false;

	for (var i = 0; i < this.length; i++) {
		if (this[i] instanceof Array && array[i] instanceof Array) {
			if (!this[i].equals(array[i])) return false;
		} else if (this[i] != array[i]) return false;
	} return true;
}

Array.prototype.hasMember = function(x) {
	if (this.length === 0) return false;
	for(var i = 0; i < this.length; i++) {
		if ((this[i] instanceof Array && x instanceof Array) ||
			(this[i] instanceof Object && x instanceof Object)) {
			if (this[i].equals(x)) return true;
	} else if (this[i] === x) return true;
} return false;
}

// TODO: menu, undo, swipe for touch, add option for hearistic, allow for list of animations

function Slates() {

	var canvas;
	var ctx;

	var width;
	var height;

    // config params

    // good config : 4, 8, 3

    var GRID_SIZE     = 4;
    var NUM_OF_SLATES = 8;
    var NUM_OF_CRUMBS = (function(x) { return Math.max(Math.min(x,NUM_OF_SLATES-1),1); })(3);

    // aesthetics

    // colors
    var BG_COLOR          = "rgba(252, 252, 252, 1)"; //"rgba(230, 230, 230, 1)"; // light gray
    var SQR_COLOR         = "rgba(200, 200, 200, 1)"; // dark gray
    var SLATE_COLOR       = "rgba(35,  114, 170, 1)"; // blue
    var CRUMB_COLOR       = "rgba(178,  34,  34, 1)"; // firebrick
    var VISITED_COLOR     = "rgba(0,   153,  51, 1)"; // green
    var HOVER_COLOR       = "rgba(0,     0,   0,.5)"; // transparent black
    var FONT_COLOR        = BG_COLOR;                 // light gray

    // scaling
    var LINE_WIDTH_FACTOR = 8;  // larger => smaller
    var BR_FACTOR         = 10; // larger => smaller
    var CRUMB_SIZE_FACTOR = 2.25;
    var FONT_SIZE_FACTOR  = 1.5;
    var SEL_HEIGHT_FACTOR = 10;
    var SHADOW_FACTOR     = 3;

    // derived properties
    var PAD;
    var DIV_SIZE;
    var LINE_WIDTH;
    var SQR_SIZE;
    var BORDER_RADIUS;
    var CRUMB_SIZE;
    var FONT_SIZE;
    var FONT_OFFSET;
    var SHADOW_BLUR;
    var SEL_OFS; 
    var SEL_SIZE;
    var LP;	 
    var CTR_OFS; 
    var BR_OFS;
    var SEL_BR;
    var LP_OFS;

    // global vars

    var finalState = [randint(1, GRID_SIZE-1), randint(1, GRID_SIZE-1)];    
    var crumbs     = [{loc: finalState, visited: false}];
    var grid       = initGrid();
    var slates     = initSlates();
    var hover      = [-1,-1];
    var selection  = [];

    // animation global vars
    var aPos = null;
    var bPos = null;

    var animate    = false;
    var target     = null;
    var rot        = 0;
    var TARGET_ROT = 2*Math.PI; // radians

    //== init code ===============================================================================\\

    function setStyle() {
    	ctx.textAlign     = 'center';
    	ctx.textBaseline  = 'middle';
    	ctx.shadowColor   = "black";
    	ctx.shadowOffsetY = 0;
    	ctx.shadowOffsetX = 0;

    	canvas.style.marginTop  = -LINE_WIDTH + "px";
    	canvas.style.marginLeft = -LINE_WIDTH + "px";

    	var content = document.getElementById("content");
    	content.style.width = canvas.width-LINE_WIDTH + "px";
    }

    // last function call in resize
    function setDerivedProperties() {
    	var br = .9;

    	PAD           = (width-width*br)/2;
    	DIV_SIZE      = Math.round((width*br)/GRID_SIZE);
    	LINE_WIDTH    = DIV_SIZE/LINE_WIDTH_FACTOR;
    	SQR_SIZE      = DIV_SIZE-LINE_WIDTH;
    	BORDER_RADIUS = SQR_SIZE/BR_FACTOR;
    	CRUMB_SIZE    = SQR_SIZE/CRUMB_SIZE_FACTOR;
    	FONT_SIZE     = CRUMB_SIZE*FONT_SIZE_FACTOR;
    	FONT_OFFSET   = DIV_SIZE/2+LINE_WIDTH/2+PAD;
    	SHADOW_BLUR   = DIV_SIZE/SHADOW_FACTOR;
    	SEL_OFS       = SQR_SIZE/SEL_HEIGHT_FACTOR;
    	SEL_SIZE      = SQR_SIZE-(SEL_OFS*2);
    	LP            = LINE_WIDTH+PAD;
    	CTR_OFS       = DIV_SIZE/2+LINE_WIDTH/2+PAD;
    	BR_OFS        = BORDER_RADIUS-(BORDER_RADIUS/Math.sqrt(2));
    	SEL_BR        = BORDER_RADIUS-BR_OFS;
    	LP_OFS        = LP+SEL_OFS;

    	setStyle();
    }

    function initGrid() {
    	var g = []
    	for(var i = 0; i < GRID_SIZE; ++i) {
    		g.push([]);
    		for(var j = 0; j < GRID_SIZE; ++j) {
    			g[i].push(0);
    		}
    	} return g;
    }

    function initSlates() {
    	var s = [];
    	for(var i = 0; i < NUM_OF_SLATES; ++i) {
    		s.push(finalState);
    	} return s;
    }

    function updateGrid(slates) {
    	for(var i = 0; i < slates.length; i++) {
    		var x = slates[i][0];
    		var y = slates[i][1];
    		grid[x][y]++;
    	}
    }

    //== proc gen ================================================================================\\

    function getPossibleStates(loc) {
    	var x = loc[0]; var y = loc[1];
	var e = GRID_SIZE-1; // edge

	if      (x == 0 &&           y == e)           return [2];
	else if (x == 0 &&           y == 0)           return [3];
	else if (x == e &&           y == 0)           return [4];
	else if (x == e &&           y == e)           return [5];
	else if (x != 0 && x != e && y == 0)           return [0,3,4];
	else if (x != 0 && x != e && y == e)           return [0,2,5];
	else if (x == e &&           y != 0 && y != e) return [1,4,5];
	else if (x == 0 &&           y != 0 && y != e) return [1,2,3];
	else if (x != 0 && x != e && y != 0 && y != e) return [0,1,2,3,4,5];
	else {
		console.error("error determining possible states");
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
			console.error("error in modying location.");
		}
		return [x,y];
	}
	return helper;
}

    // dispersion heuristic
    function dispersion(loc, states) {

    	var x = loc[0]; var y = loc[1];

	// return move based on state
	function move(x,y,state) {
		switch (state) {
			case 0: return [[x-1,y],[x+1,y]];
			case 1: return [[x,y-1],[x,y+1]];
			case 2: return [[x,y-1],[x+1,y]];
			case 3: return [[x+1,y],[x,y+1]];
			case 4: return [[x-1,y],[x,y+1]];
			case 5: return [[x-1,y],[x,y-1]];
			default:
			console.error("No such possible state");
			return new Error("No possible state!");
		}
	}
	
	// return states with min slates
	function minStates(states) {
		var minStates = [[-1,Number.MAX_VALUE]];
		for(var i = 0; i < states.length; ++i) {
			var m   = move(x,y,states[i]);
			var num = grid[m[0][0]][m[0][1]]+grid[m[1][0]][m[1][0]];
			if      (num == minStates[0][1]) minStates.push([states[i],num]);
			else if (num <  minStates[0][1]) minStates = [[states[i],num]];
		} return minStates.map(function(x){ return x[0];});
	}

	// return states with max dst from final state
	function maxDstStates(states) {
		var maxDstStates = [[-1,Number.MIN_VALUE]];
		for(var i = 0; i < states.length; ++i) {
			var m   = move(x,y,states[i]);
			var dst = (distance(m[0],finalState)+distance(m[1],finalState));
			if      (dst == maxDstStates[0][1]) maxDstStates.push([states[i],dst]);
			else if (dst >  maxDstStates[0][1]) maxDstStates = [[states[i],dst]];
		} return maxDstStates.map(function(x){ return x[0];});
	}

	return states[randint(0,states.length)];
	
	// var r = Math.random();

	// var ms = minStates(states);
	// var md = maxDstStates(states);
	
	// // if (r < 1/3) return states[randint(0,states.length)];
	// if (r < 1/2) return ms[randint(0,ms.length)];
	// else         return md[randint(0,md.length)];

}

function backTrack(slates) {
	updateGrid(slates);
	if(slates.length <= 1) return slates;

	var split = randint(1, slates.length);
	var left = slates.slice(0, split);
	var right = slates.slice(split, slates.length);

	var possibleStates = getPossibleStates(slates[0]);
	var state = dispersion(slates[0],possibleStates);

	// crumbs
	var r = Math.random();
	if (r < (NUM_OF_CRUMBS/(NUM_OF_SLATES-1)) && crumbs.length < NUM_OF_CRUMBS && 
		slates.length < NUM_OF_SLATES && crumbs.hasMember({loc: slates[0], visited: false}) == false) {
		crumbs.push({loc: slates[0], visited: false});
}

var newLeft = left.map(modifyLocation(state, "LEFT"));
var newRight = right.map(modifyLocation(state, "RIGHT"));

return backTrack(newLeft).concat(backTrack(newRight));
}

    //== slates util =============================================================================\\

    
    function iterGrid(lambda) {
    	for(var i = 0; i < GRID_SIZE; i++) {
    		for(var j = 0; j < GRID_SIZE; j++) {
    			lambda(i,j);
    		}
    	}
    }
    
    function isValidMove(x, y) {
    	var adj = 0;
    	var edge = GRID_SIZE-1;

    	if (x != 0    && grid[x-1][y] != 0) adj++;
    	if (y != 0    && grid[x][y-1] != 0) adj++;
    	if (x != edge && grid[x+1][y] != 0) adj++;
    	if (y != edge && grid[x][y+1] != 0) adj++;

    	return (adj >= 2);
    }

    function validSelection(a, b) {
    	var d = distance(a, b);
    	return (d == Math.sqrt(2) || d == 2) ? true : false;
    }

    function fillRoundedRect(x, y, w, h, r) {
    	ctx.beginPath();
    	ctx.moveTo(x+r, y);
    	ctx.lineTo(x+w-r, y);
    	ctx.arcTo(x+w, y, x+w, y+r, r);
    	ctx.lineTo(x+w, y+h-r);
    	ctx.arcTo(x+w, y+h, x+w-r, y+h, r);
    	ctx.lineTo(x+r, y+h);
    	ctx.arcTo(x, y+h, x, y+h-r, r);
    	ctx.lineTo(x, y+r);
    	ctx.arcTo(x, y, x+r, y, r);
    	ctx.fill();
    	ctx.closePath();
    }

    function toggleShadow(bool) {
    	if (bool) ctx.shadowBlur = SHADOW_BLUR;
    	else      ctx.shadowBlur = null;
    }

    function checkWinner() {

    	var c = 0; var v = 1;
    	for(var i = 0; i < crumbs.length; ++i) {
    		var cl = crumbs[i].loc;
    		c += grid[cl[0]][cl[1]];
    		v &= crumbs[i].visited;
    		if (c > 1 || v == 0) return false;
    	}

    	var num = 0;
    	for(var i = 0; i < GRID_SIZE; i++) {
    		for(var j = 0; j < GRID_SIZE; j++) {
    			num += grid[i][j];
    			if (num > 1) return false;
    		}
    	}

    	return true;
    }

    function checkLoser() {
    	var moves = 0;
    	iterGrid(function(i,j) {
    		if (isValidMove(i,j)) moves++; 
    	});

    	return (moves == 0);
    }

    //== draw graphics ===========================================================================\\

    function renderSlates() {
    	iterGrid(function(i,j) {
    		var x = (i*DIV_SIZE)+LP;
    		var y = (j*DIV_SIZE)+LP;
    		if (grid[i][j] != 0) ctx.fillStyle = SLATE_COLOR;
    		else                 ctx.fillStyle = SQR_COLOR;
    		fillRoundedRect(x, y, SQR_SIZE, SQR_SIZE, BORDER_RADIUS);
    	});
    }

    function renderNumbers() {
    	ctx.fillStyle = FONT_COLOR;
    	var digits = 1;
    	iterGrid(function(i,j) {
    		var n = grid[i][j];
    		var d = Math.ceil(Math.log10(n));
    		if (d > digits) digits = d;
    	});
    	iterGrid(function(i,j) {
    		var n = grid[i][j];
    		if(n > 1) {
    			ctx.font = (FONT_SIZE/digits) + "px monospace";
    			var x = (i*DIV_SIZE)+FONT_OFFSET;
    			var y = (j*DIV_SIZE)+FONT_OFFSET;
    			ctx.fillText(n.toString(), x, y);
    		}
    	});
    }

    function renderHover() {
    	if (hover[0] == -1 && hover[1] == -1) return;

    	var ofs = 0;
    	var br  = BORDER_RADIUS;

    	ctx.fillStyle = HOVER_COLOR;

    	if (selection.hasMember(hover)) {
    		ofs = SEL_OFS;
    		br  = SEL_BR;
    	}
    	var buf = 1;
    	var x = (hover[0]*DIV_SIZE)+LP+ofs-buf;
    	var y = (hover[1]*DIV_SIZE)+LP+ofs-buf;
    	var s = SQR_SIZE-(ofs*2)+(buf*2);;

    	fillRoundedRect(x, y, s, s, br);
    }

    // includes final state
    function renderCrumbs() {

    	for(var i = 0; i < crumbs.length; ++i) {

    		var u = crumbs[i].loc[0];
    		var v = crumbs[i].loc[1];

    		var x = (u*DIV_SIZE)+LP;
    		var y = (v*DIV_SIZE)+LP;

    		var h = grid[u][v];
    		ctx.fillStyle = (h > 0) ? SLATE_COLOR : SQR_COLOR;
    		fillRoundedRect(x, y, SQR_SIZE, SQR_SIZE, BORDER_RADIUS);

    		ctx.beginPath();
    		ctx.arc((u*DIV_SIZE)+CTR_OFS, (v*DIV_SIZE)+CTR_OFS, CRUMB_SIZE, 0, 2*Math.PI, false);
    		ctx.fillStyle = (crumbs[i].visited) ? VISITED_COLOR : CRUMB_COLOR;
    		ctx.fill();
    		ctx.closePath();
    	}
    }

    function renderSelection() {

    	for(var i = 0; i < selection.length; i++) {
    		var sel = selection[i];

    		ctx.fillStyle = (grid[sel[0]][sel[1]] > 1) ? SLATE_COLOR : SQR_COLOR;

    		var buf = 1;
    		var x = (sel[0]*DIV_SIZE)+LP;
    		var y = (sel[1]*DIV_SIZE)+LP;

    		fillRoundedRect(x-buf, y-buf, SQR_SIZE+buf*2, SQR_SIZE+buf*2, BORDER_RADIUS);

    		toggleShadow(true);

    		x = x + SEL_OFS;
    		y = y + SEL_OFS;

    		ctx.fillStyle = SLATE_COLOR;
    		fillRoundedRect(x, y, SEL_SIZE, SEL_SIZE, SEL_BR);
    		fillRoundedRect(x, y, SEL_SIZE, SEL_SIZE, SEL_BR);

    		toggleShadow(false);

    		fillRoundedRect(x, y, SEL_SIZE, SEL_SIZE, SEL_BR);
    	}
    }

    //== animation ===============================================================================\\

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

    	var a = aPos;
    	var b = bPos;

    	var mTol = .5;
    	var rTol = .01;

    	var deltaAX = target.x-a.x;
    	var deltaAY = target.y-a.y;

    	var deltaBX = target.x-b.x;
    	var deltaBY = target.y-b.y;

    	toggleShadow(true);

    	ctx.fillStyle = "rgba(35, 114, 170, 1)";

    	if ((Math.abs(deltaAX) > mTol || Math.abs(deltaAY) > mTol) &&
    		(Math.abs(deltaBX) > mTol || Math.abs(deltaBY) > mTol)) {

    		fillRoundedRect(a.x, a.y, SEL_SIZE, SEL_SIZE, SEL_BR);
    	fillRoundedRect(a.x, a.y, SEL_SIZE, SEL_SIZE, SEL_BR);

    	fillRoundedRect(b.x, b.y, SEL_SIZE, SEL_SIZE, SEL_BR);
    	fillRoundedRect(b.x, b.y, SEL_SIZE, SEL_SIZE, SEL_BR);

    	a.x = easeOutExpo(.1, a.x, deltaAX, 2);
    	a.y = easeOutExpo(.1, a.y, deltaAY, 2);

    	b.x = easeOutExpo(.1, b.x, deltaBX, 2);
    	b.y = easeOutExpo(.1, b.y, deltaBY, 2);

    	rot = 0;
    }
    else {
    	var deltaRot = TARGET_ROT-rot;
    	if (Math.abs(deltaRot) > rTol) {
    		rot = easeOutCubic(1, rot, deltaRot, 20);

    		ctx.save();
    		var ox = target.x + SEL_SIZE/2;
    		var oy = target.y + SEL_SIZE/2;

    		ctx.translate(ox,oy);
    		ctx.rotate(rot);
    		ctx.translate(-ox,-oy);

    		fillRoundedRect(target.x, target.y, SEL_SIZE, SEL_SIZE, SEL_BR);
    		fillRoundedRect(target.x, target.y, SEL_SIZE, SEL_SIZE, SEL_BR);

    		ctx.restore();
    	}
    	else {

    		grid[target.loc[0]][target.loc[1]]++;

    		crumbs.forEach(function(el) {
    			if (el.loc.equals(target.loc)) {
    				el.visited = true;
    			}
    		});

    		target = null;
    		animate = false;

    		if      (checkWinner()) alert("You Won!");
    		else if (checkLoser()) alert("You Lost!");
    	}
    }

    toggleShadow(false);

    aPos = a;
    bPos = b;

}

    //== mouse controls ==========================================================================\\

    function mouseMotionListener(e) {
    	var br = canvas.getBoundingClientRect();
    	var x = e.clientX - br.left - PAD;
    	var y = e.clientY - br.top  - PAD;
    	var xLoc = Math.floor(x / DIV_SIZE);
    	var yLoc = Math.floor(y / DIV_SIZE);

    	if (xLoc < 0 || yLoc < 0 || xLoc >= GRID_SIZE || yLoc >= GRID_SIZE) { 
    		hover = [-1,-1];
    		return;
    	}

    	var u = e.clientX - br.left;
    	var v = e.clientY - br.top;

    	if ((xLoc*DIV_SIZE)+LP+BR_OFS <= u && u <= (xLoc*DIV_SIZE)+DIV_SIZE+PAD-BR_OFS &&
    		(yLoc*DIV_SIZE)+LP+BR_OFS <= v && v <= (yLoc*DIV_SIZE)+DIV_SIZE+PAD-BR_OFS) {
    		hover = [xLoc, yLoc];
    } else { 
    	hover = [-1,-1]; 
    }
}

function mouseExitListener(e) {
	hover = [-1,-1];
}

function mouseClickListener(e) {
	if (hover[0] == -1 && hover[1] == -1) return;
	
	var x = hover[0]; var y = hover[1];
	
	if (selection.length == 0) {
		if (grid[x][y] != 0) selection.push(hover);
		else wobble();
	}
	else if (selection.length == 1) {
		if      (selection[0].equals(hover)          && grid[x][y] != 0) selection.splice(0,1);
		else if (validSelection(selection[0], hover) && grid[x][y] != 0) selection.push(hover);
		else wobble();
	}
	else if (selection.length == 2) {
		if      (selection[0].equals(hover)) selection.splice(0,1);
		else if (selection[1].equals(hover)) selection.splice(1,1);
		else if (distance(selection[0], hover) == 1 && distance(selection[1], hover) == 1) {

			var one = selection[0]; var two = selection[1];
			grid[one[0]][one[1]]--;
			grid[two[0]][two[1]]--;

			var tmpx = (one[0]*DIV_SIZE)+LP_OFS;
			var tmpy = (one[1]*DIV_SIZE)+LP_OFS;
			aPos = {x:tmpx, y:tmpy};

			tmpx = (two[0]*DIV_SIZE)+LP_OFS;
			tmpy = (two[1]*DIV_SIZE)+LP_OFS;
			bPos = {x:tmpx, y:tmpy};

			tmpx = (x*DIV_SIZE)+LP_OFS;
			tmpy = (y*DIV_SIZE)+LP_OFS;
			target = {x:tmpx, y:tmpy, loc: [x,y]};

			animate = true;
			selection = [];
		}
		else wobble();
	}
	else console.log("something went wrong in click handler");
}

    //== render loop =============================================================================\\

    function render() {
    	ctx.fillStyle = BG_COLOR;
    	ctx.fillRect(0, 0, width, height);

    	renderSlates();   
    	renderCrumbs();
    	renderNumbers();
    	renderSelection();
    	animateSlates();
    	// renderHover();

    	window.requestAnimationFrame(render);
    };

    //== publicly visible ========================================================================\\

    Slates.prototype.resize = function() {
    	
    	var ww = window.innerWidth;
    	var wh = window.innerHeight;

    	var content = document.getElementById("content");
    	var menu    = document.getElementById("menu-wrapper");
    	var title   = document.getElementById("title");
    	var overlay = document.getElementById("overlay");

    	var size = (wh < ww) ? Math.round(wh*.8) : ww;

        width = size;
        height = size;
        canvas.width  = size;
        canvas.height = size;

        content.style.width  = size + "px";
        content.style.height = wh   + "px";

        canvas.parentElement.style.height = size + "px";
        canvas.parentElement.style.width  = size + "px";

        var menuHeight = Math.round(wh-size);

        if (menuHeight/window.innerHeight > .4) menuHeight -= 20;

        menu.style.height = menuHeight + "px";

        title.style.fontSize = width/7 + "px";

        overlay.style.width = size + "px";
        overlay.style.marginLeft = (ww-size)/2 + "px";

        // finally query the various pixel ratios
		var devicePixelRatio  = window.devicePixelRatio || 1;
		var backingStoreRatio = ctx.webkitBackingStorePixelRatio ||
								ctx.mozBackingStorePixelRatio ||
								ctx.msBackingStorePixelRatio ||
								ctx.oBackingStorePixelRatio ||
								ctx.backingStorePixelRatio || 1;

		var ratio = devicePixelRatio / backingStoreRatio;

    	// upscale the canvas if the two ratios don't match
    	if (devicePixelRatio !== backingStoreRatio) {

    		var oldWidth = canvas.width;
    		var oldHeight = canvas.height;

    		canvas.width = oldWidth * ratio;
    		canvas.height = oldHeight * ratio;

    		canvas.style.width = oldWidth + 'px';
    		canvas.style.height = oldHeight + 'px';

        	// now scale the ctx to counter
        	// the fact that we've manually scaled
        	// our canvas element
        	ctx.scale(ratio, ratio);
        }

        setDerivedProperties();

        alert(content.style.width);
    };

    Slates.prototype.init = function() {
    	canvas = document.getElementById("canvas");
    	ctx = canvas.getContext("2d");


    	this.resize();

    	slates = backTrack(slates);
    	grid = initGrid();
    	updateGrid(slates);

    	canvas.onmousemove  = mouseMotionListener;
    	canvas.onmouseleave = mouseExitListener;
    	canvas.onclick      = mouseClickListener;
    };	

    Slates.prototype.main = function() {
    	render();
    }
}

//== onload ======================================================================================\\

window.onload = function() {
	var slates = new Slates();
	slates.init();
	window.onresize = slates.resize.bind(slates);
	window.requestAnimationFrame(slates.main.bind(slates));
};
