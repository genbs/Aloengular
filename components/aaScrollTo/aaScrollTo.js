(function(){

	'use strict';

	angular
		.module('aloengular.scrollTo', [])
		.factory('$aaScrollTo', aaScrollTo)
	;


	function aaScrollTo($window, $timeout){

		var SETTINGS = {
			duration: 1000,
			timeout: 10,
		};

		return scroll;

  		////////////////////////////////////////

  		function scroll(to, duration, timeout)
  		{
  			if(typeof to !== 'number'){
  			 	if(typeof to.offsetTop !== 'undefined')
  			 		to = to.offsetTop;
  			 	else
  			 		throw new Error('[Aloengular@aaScrollTo] parametro \'to\' error. Expected Number or HTMLElement');
  			}

  			duration = typeof duration !== 'undefined' ? duration : SETTINGS.duration;
  			timeout = typeof timeout !== 'undefined' ? timeout : SETTINGS.timeout;

  			var start = $window.scrollY || $window.pageYOffset;
			var iterations = duration / timeout;
			var increment = (to - start) / iterations;

			_scroll(start, increment, iterations, timeout);
  		}

  		function _scroll(current, increment, iterations, timeout)
  		{
			$window.scrollTo(0,  current);
			if(iterations > 0)
				$timeout(function(){
					_scroll(current + increment, increment, --iterations, timeout);
				}, timeout);
		}
  	}
  	aaScrollTo.$inject = ['$window', '$timeout'];

})();
