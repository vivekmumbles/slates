(function() {
	var triggerBttn = document.getElementById('menu-btn');
	var	overlay = document.querySelector( 'div.overlay' );
	var	closeBttn = document.getElementById('overlay-close');
	var	transEndEventNames = {
			'WebkitTransition': 'webkitTransitionEnd',
			'MozTransition': 'transitionend',
			'OTransition': 'oTransitionEnd',
			'msTransition': 'MSTransitionEnd',
			'transition': 'transitionend'
		};
	var	transEndEventName = transEndEventNames[ Modernizr.prefixed( 'transition' ) ];
	var	support = { transitions : Modernizr.csstransitions };

	function toggleOverlay() {
		if( classie.has( overlay, 'open' ) ) {
			classie.remove( overlay, 'open' );
			classie.add( overlay, 'close' );
			var onEndTransitionFn = function( ev ) {
				if( support.transitions ) {
					if( ev.propertyName !== 'visibility' ) return;
					this.removeEventListener( transEndEventName, onEndTransitionFn );
				}
				classie.remove( overlay, 'close' );
			};
			if( support.transitions ) {
				overlay.addEventListener( transEndEventName, onEndTransitionFn );
			}
			else {
				onEndTransitionFn();
			}

			triggerBttn.style.visibility = 'visible';
		}
		else if( !classie.has( overlay, 'close' ) ) {
			classie.add( overlay, 'open' );

			triggerBttn.style.visibility = 'hidden';
		}
	}

	// triggerBttn.addEventListener( 'click', toggleOverlay );
	triggerBttn.onclick = toggleOverlay;
	closeBttn.addEventListener( 'click', toggleOverlay );
})();
