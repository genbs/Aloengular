/**
 * aaRoundProgress [require: aloengular.easing]
 * @return DIRECTIVE aaRoundProgress
 *
 * @param Int maxValue
 * @param Int/Model value
 * @param Int strokeWidth
 * @param String easing
 * @param String Color
 * @param String backColor
 * @param Int duration (millisecond)
 * @param Int delay (millisecond)
 * @param Int size
 * @param boolean manual // watch 'value' without call timeout draw
 *
 */
(function(){

	'use strict';

	angular
		.module('aloangular.roundProgress', [
			'aloengular.easing'
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
				'delay'    : '=aaRoundProgressDelay',
				'manual'   : '=aaRoundProgressManual',
				'size'    : '=aaRoundProgressSize',
			},
			compile     : aaRoundProgressCompile,
			template: '<div class="aa-round-progress"><div class="aa-round-circle-container"><div ng-transclude></div></div></div>'
		};

		////////////////////////////////////////

		function aaRoundProgressCompile(element, attrs){
			var canvas, SETTINGS;
			SETTINGS = angular.copy(DEFAULT_SETTINGS);

			SETTINGS.maxValue     = attrs.aaRoundProgressMaxValue;
			SETTINGS.stroke       = attrs.aaRoundProgressStrokeWidth || SETTINGS.stroke;
			SETTINGS.color        = attrs.aaRoundProgressColor || SETTINGS.color;
			SETTINGS.backColor    = attrs.aaRoundProgressBackColor || SETTINGS.backColor;
			SETTINGS.duration     = attrs.aaRoundProgressDuration || SETTINGS.duration;
			SETTINGS.delay        = attrs.aaRoundProgressDelay || SETTINGS.delay;
			SETTINGS.easing       = $aaEasing[attrs.aaRoundProgressEasing || SETTINGS.easing];
			SETTINGS.currentAngle = SETTINGS.startAngle;

			if(!attrs.aaRoundProgressValue)
				throw new Error('[aaRoundProgress:directive]: aaRoundProgressValue non può essere nullo');

			if(attrs.aaRoundProgressMaxValue && (Number(attrs.aaRoundProgressMaxValue) < Number(attrs.aaRoundProgressValue)))
				throw new Error('[aaRoundProgress:directive]: aaRoundProgressMaxValue non può essere minore di attrs.aaRoundProgressValue');

			return {
				pre: aaRoundProgressPreLink,
				post: aaRoundProgressPostLink
			}

			////////////////////////////////////////

	 		function aaRoundProgressPreLink($scope, $element, $attrs)
	 		{
				SETTINGS.width = parseInt(attrs.aaRoundProgressSize) || $element[0].parentNode.offsetWidth;
	 			SETTINGS.height = parseInt(attrs.aaRoundProgressSize) || $element[0].parentNode.offsetHeight;
	 			SETTINGS.width2 = SETTINGS.width / 2;
	 			SETTINGS.height2 = SETTINGS.height / 2;

	 			$element[0].style.lineHeight = SETTINGS.height + 'px';
	 			$element[0].style.height = SETTINGS.height + 'px';

	 			var c = document.createElement('canvas');
	 			c.width = SETTINGS.width;
	 			c.height = SETTINGS.height;
				canvas = c.getContext('2d');
	 			canvas.lineWidth = SETTINGS.stroke;

	 			$element.append(c);
	 		}


			////////////////////////////////////////

	 		function aaRoundProgressPostLink($scope, $element, $attrs) {

				draw();

				if($scope.manual === true)
				{

					$scope.$watch('value', function(n,o){
						if(n){
							SETTINGS.value = n;
							SETTINGS.valueAngle = (SETTINGS.endAngle - SETTINGS.startAngle) *
												  (SETTINGS.value / SETTINGS.maxValue);
							manualDraw();
						}
					});

				} else {

					SETTINGS.value = $scope.value;
					SETTINGS.valueAngle = (SETTINGS.endAngle - SETTINGS.startAngle) *
										  (SETTINGS.value / SETTINGS.maxValue);

		 			$timeout(function(){
		 				SETTINGS.startTime = Date.now();
		 				autoDraw();
		 			}, SETTINGS.delay);

				}

	 			////////////////////////////////////////

	 			function autoDraw()
				{
	 				SETTINGS.currentTime = Date.now() - SETTINGS.startTime;
					SETTINGS.currentAngle = SETTINGS.easing(SETTINGS.currentTime,
															SETTINGS.startAngle,
															SETTINGS.valueAngle,
															SETTINGS.duration);

					$scope.currentValue = Math.ceil(SETTINGS.easing(SETTINGS.currentTime,
																	 0,
																	 SETTINGS.value,
																	 SETTINGS.duration));
					draw();

					if(SETTINGS.currentTime < SETTINGS.duration)
						$timeout(draw, SETTINGS.timeout);
					//console.log(Date.now() - SETTINGS.startTime); //Duration time
				}

				function manualDraw()
				{
 					$scope.currentValue = SETTINGS.value;
 					SETTINGS.currentAngle = SETTINGS.valueAngle + SETTINGS.startAngle;
					draw();
				}

				function draw()
				{
					canvas.clearRect(0, 0, SETTINGS.width, SETTINGS.width);

					canvas.beginPath();
					canvas.strokeStyle = SETTINGS.backColor;
					canvas.arc(SETTINGS.width2, SETTINGS.height2, SETTINGS.width2 - SETTINGS.stroke, SETTINGS.startAngle, SETTINGS.endAngle, false);
					canvas.stroke();

					canvas.beginPath();
					canvas.strokeStyle = SETTINGS.color;
					canvas.arc(SETTINGS.width2, SETTINGS.height2, SETTINGS.width2 - SETTINGS.stroke, SETTINGS.startAngle, SETTINGS.currentAngle, false);
					canvas.stroke();
				}
	 		}

	 	}
	}
	aaRoundProgressDirective.$inject = ['$timeout', '$aaEasing'];

})();
