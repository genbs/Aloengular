/**
 * aaRoundProgress [require: aloengular.easing]
 * @return DIRECTIVE aaRoundProgress
 *
 * @param Int maxValue
 * @param Int value
 * @param Int strokeWidth
 * @param String easing
 * @param String backColor
 * @param String backColor
 * @param Int duration (millisecond)
 * @param Int delay (millisecond)
 *
 */
(function(){

	'use strict';

	angular
		.module('aloangular.roundProgress', [
			'aloangular.easing'
		])
	 	.directive('aaRoundProgress', aaRoundProgressDirective)
 	;


 	function aaRoundProgressDirective($timeout, $aaEasing) {

 		var DEFAULT_SETTINGS = {
			stroke    : 10,
			duration  : 300,
			timeout   : 10,
			color     : '#000',
			backColor : 'transparent',
			easing	  : 'linear',
			delay     : 0,
			startAngle: 1.5 * Math.PI,
			endAngle  : 3.5 * Math.PI
 		};

 		return {
			compile     : aaRoundProgressCompile,
			replace     : true,
			transclude  : true,
			scope: {
				'maxValue' : '=aaRoundProgressMaxValue',
				'value'    : '=aaRoundProgressValue',
				'stroke'   : '=aaRoundProgressStrokeWidth',
				'color'    : '@aaRoundProgressColor',
				'easing'   : '@aaRoundProgressEasing',
				'backColor': '@aaRoundProgressBackColor',
				'duration' : '=aaRoundProgressDuration',
				'delay'    : '=aaRoundProgressDelay'
			},
			template: '<div class="aa-round-progress"><div class="aa-round-circle-container"><div ng-transclude></div></div></div>'
		};

		////////////////////////////////////////

		function aaRoundProgressCompile(element, attrs){
			var canvas, SETTINGS;
			SETTINGS = angular.copy(DEFAULT_SETTINGS);

			SETTINGS.stroke    = attrs.aaRoundProgressStrokeWidth || SETTINGS.stroke;
			SETTINGS.color     = attrs.aaRoundProgressColor || SETTINGS.color;
			SETTINGS.backColor = attrs.aaRoundProgressBackColor || SETTINGS.backColor;
			SETTINGS.duration  = attrs.aaRoundProgressDuration || SETTINGS.duration;
			SETTINGS.delay     = attrs.aaRoundProgressDelay || SETTINGS.delay;
			SETTINGS.easing    = $aaEasing[attrs.aaRoundProgressEasing || SETTINGS.easing];

			if(!attrs.aaRoundProgressValue)
				throw new Error('[aaRoundProgress:directive]: aaRoundProgressValue non può essere nullo');

			if(attrs.aaRoundProgressMaxValue && (Number(attrs.aaRoundProgressMaxValue) < Number(attrs.aaRoundProgressValue)))
				throw new Error('[aaRoundProgress:directive]: aaRoundProgressMaxValue non può essere minore di attrs.aaRoundProgressValue');

			SETTINGS.value = attrs.aaRoundProgressValue;
			SETTINGS.maxValue = attrs.aaRoundProgressMaxValue || SETTINGS.value;

			//SETTINGS.valuePerc = SETTINGS.value * 100 / SETTINGS.maxValue;
			//SETTINGS.valueAngle = (SETTINGS.endAngle - SETTINGS.startAngle) * SETTINGS.valuePerc / 100;
			SETTINGS.valueAngle = (SETTINGS.endAngle - SETTINGS.startAngle) * (SETTINGS.value / SETTINGS.maxValue);

			return {
				pre: aaRoundProgressPreLink,
				post: aaRoundProgressPostLink
			}

			////////////////////////////////////////

	 		function aaRoundProgressPreLink($scope, $element, $attrs)
	 		{
	 			SETTINGS.width = $element[0].offsetWidth;
	 			SETTINGS.height = $element[0].offsetHeight;
	 			SETTINGS.width2 = SETTINGS.width / 2;
	 			SETTINGS.height2 = SETTINGS.height / 2;

	 			////////////////////////////////////////

	 			var c = document.createElement('canvas');
	 			c.width = SETTINGS.width;
	 			c.height = SETTINGS.height;

				canvas = c.getContext('2d');
	 			canvas.lineWidth = SETTINGS.stroke;

	 			$element.append(c);
	 		}


			////////////////////////////////////////

	 		function aaRoundProgressPostLink($scope, $element, $attrs) {
	 			SETTINGS.currentAngle = SETTINGS.startAngle;
				$scope.currentValue = 0;
	 			SETTINGS.currentTime = 0;

	 			canvas.beginPath();
				canvas.strokeStyle = SETTINGS.backColor;
				canvas.arc(SETTINGS.width2, SETTINGS.height2, SETTINGS.width2 - SETTINGS.stroke, SETTINGS.startAngle, SETTINGS.endAngle, false);
				canvas.stroke();

	 			$timeout(function(){
	 				SETTINGS.startTime = Date.now();
	 				draw();
	 			}, SETTINGS.delay);

	 			////////////////////////////////////////

	 			function draw()
				{
	 				SETTINGS.currentTime = Date.now() - SETTINGS.startTime;

					SETTINGS.currentAngle = SETTINGS.easing(SETTINGS.currentTime, SETTINGS.startAngle, SETTINGS.valueAngle, SETTINGS.duration);
					$scope.currentValue = Math.round(SETTINGS.easing(SETTINGS.currentTime, 0, SETTINGS.value, SETTINGS.duration));

					canvas.clearRect(0, 0, SETTINGS.width, SETTINGS.width);

					canvas.beginPath();
					canvas.strokeStyle = SETTINGS.backColor;
					canvas.arc(SETTINGS.width2, SETTINGS.height2, SETTINGS.width2 - SETTINGS.stroke, SETTINGS.startAngle, SETTINGS.endAngle, false);
					canvas.stroke();

					canvas.beginPath();
					canvas.strokeStyle = SETTINGS.color;
					canvas.arc(SETTINGS.width2, SETTINGS.height2, SETTINGS.width2 - SETTINGS.stroke, SETTINGS.startAngle, SETTINGS.currentAngle, false);
					canvas.stroke();

					if(SETTINGS.currentTime < SETTINGS.duration)
						$timeout(draw, SETTINGS.timeout);
					else
						console.log(Date.now() - SETTINGS.startTime);
				}
	 		}

	 	}

		function easeInOutExpo(t, b, c, d) {
			t /= d/2;
			if (t < 1) return c/2*t*t*t*t*t + b;
			t -= 2;
			return c/2*(t*t*t*t*t + 2) + b;
		};

	}
	aaRoundProgressDirective.$inject = ['$timeout', '$aaEasing'];

})();
