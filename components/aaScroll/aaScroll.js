/**
 * Aloengular Scroll
 * @return DIRECTIVE(class) aaScroll
 */
(function(){

	'use strict';

	angular
		.module('aloengular.scroll', [
			'aloengular.element'
		])
		.directive('aaScroll', aaScrollDirective)
	;

	////////////////////////////////////////

	function aaScrollDirective($window, $timeout, $aa)
	{
		return {
			restrict : 'C',
			scope : {
				onScroll : '&aaOnScroll'
			},
			link : ScrollDirectiveLink
		};


		function aaScrollDirectiveLink($scope, $element, $attrs){

			var scrolled = false, e = $element[0], $w = angular.element($window);

			$w
				.bind('scroll', checkScrolled)
				.bind('load', checkScrolled)
			;

			return;


			function checkScrolled(){
				if(scrolled && !$scope.onScroll) return;

				var d = document,
					off = 0,
					elem = e,
					scroll = (d.documentElement && d.documentElement.scrollTop || d.body.scrollTop);

				scroll += d.documentElement.clientHeight / 1.5;

				do{
					if(!isNaN(elem.offsetTop))
						off += elem.offsetTop;
				}while(elem = elem.offsetParent);


				if(off < scroll){
					$element.addClass('scrolled');
					scrolled = true;
					$scope.onScroll();
				}
			}
		}


	}

	aaScrollDirective.$inject = ['$window', '$timeout'. '$aa'];


})();