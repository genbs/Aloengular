/**
 * Aloengular ScrollTo
 * [Require Aloengular Easing]
 */
(function(){

	'use strict';

	angular
		.module('aloengular.scrollTo')
		.factory('$aaScrollTo', aaScrollTo)
	;


	function aaScrollTo($window, $timeout, $aaEasing){

		var SETTINGS = {
			duration: 1000,
			fps: null,
		};

		return scroll;

  		////////////////////////////////////////

  		function scroll(to, duration, easing, fps)
  		{
  			if(typeof to !== 'number'){
  			 	if(typeof to.offsetTop !== 'undefined')
  			 		to = to.offsetTop;
  			 	else
  			 		throw new Error('[Aloengular@aaScrollTo] parametro \'to\' error. Expected Number or HTMLElement');
  			}

            if(typeof easing === 'string')
                easing = $aaEasing[easing];

  			duration = typeof duration !== 'undefined' ? duration : SETTINGS.duration;
  			fps = typeof timeout !== 'undefined' ? timeout : SETTINGS.timeout;

            var timestamp = Date.now();
  			var start = $window.scrollY || $window.pageYOffset;

            _scroll();

            return;

            function _scroll()
      		{
    			$window.scrollTo(0,  easing(timestamp, start, to, duration));
    			if(Date.now() < timestamp + duration){
                    if(fps !== null)
                        $timeout(_scroll, 1000 / fps);
                    else
                        _scroll();
                }
            }
        }

  	}
  	aaScrollTo.$inject = ['$window', '$timeout', '$aaEasing'];

})();
