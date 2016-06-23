/**
 * Aloengular audio
 */
(function(){

    'use strict';

    angular
        .module('aloengular.audio')
        .factory('$aaAudioDrawService', aaAudioDrawService)
        .directive('aaAudioDraw', aaAudioDrawDirective)
    ;


    //////////////////////////////

    function aaAudioDrawService()
    {
        var c = this;

        c.createCanvas = createCanvas;
        c.setCanvasSize = setCanvasSize;

        c.drawRect = drawRect;
        c.drawLine = drawLine;
        c.drawWave = drawWave;

        return c;

        //////////////////////////////

        function createCanvas(element, fill, color)
        {
            var canvas = document.createElement('canvas');
            var canvasContext = canvas.getContext('2d');
            var width = element.offsetWidth;
            var height = element.offsetHeight;

            setCanvasSize(canvas, { width: element.offsetWidth, height: element.offsetHeight });
            element.appendChild(canvas);

            return {
                element: canvas,
                context: canvasContext
            }
        }

        function setCanvasSize(canvas, size)
        {
            canvas.width = size.width;
            canvas.height = size.height;
            canvas.style.width  = size.width + 'px';
            canvas.style.height = size.height + 'px';
        }

        function _drawRect(canvasObj, analyser, frequencyData, type)
        {
            analyser.getByteFrequencyData(frequencyData);

            var bufferLength = frequencyData.length,
                width = canvasObj.element.width,
                height = canvasObj.element.height,
                barWidth = (width / bufferLength),
                barHeight,
                x = 0;

            canvasObj.context.fillStyle = canvasObj.fill;
            canvasObj.context.fillRect(0, 0, width, height);
            canvasObj.context.fillStyle = canvasObj.color;

            for(var i = 0; i < bufferLength; i++)
            {
                barHeight = height * frequencyData[i] / 255;

                if(type == 1)
                    canvasObj.context.fillRect(x, (height / 2) - (barHeight / 2), barWidth, barHeight);
                else
                    canvasObj.context.fillRect(x, height - barHeight, barWidth, barHeight);

                x += barWidth;
            }
        }

        function drawRect(canvasObj, analyser, frequencyData){ _drawRect(canvasObj, analyser, frequencyData); }
        function drawWave(canvasObj, analyser, frequencyData){ _drawRect(canvasObj, analyser, frequencyData, 1); }

        function drawLine(canvasObj, analyser, frequencyData){
            analyser.getByteTimeDomainData(frequencyData);

            var bufferLength = frequencyData.length,
                width = canvasObj.element.width,
                height = canvasObj.element.height,
                sliceWidth = width * 1.0 / bufferLength,
                x = 0;


            canvasObj.context.fillStyle = canvasObj.fill;
            canvasObj.context.fillRect(0, 0, width, height);
            canvasObj.context.lineWidth = 1;
            canvasObj.context.strokeStyle = canvasObj.color;
            canvasObj.context.beginPath();

            for(var i = 0; i < bufferLength; i++)
            {
                var v = frequencyData[i] / 128.0;
                var y = v * height / 2;

                canvasObj.context[i === 0 ? 'moveTo' : 'lineTo'](x, y);

                x += sliceWidth;
            }

            canvasObj.context.lineTo(canvasObj.element.width, canvasObj.element.height / 2);
            canvasObj.context.stroke();
        }

    }
    aaAudioDrawService.$inject = [];

    //////////////////////////////

    function aaAudioDrawDirective($aaAudioDrawService, $aa, $timeout)
    {
        return {
            restrict: 'E',
            scope: {
                audio: '=',
                draw: '&?',
                drawType: '=?',
                drawFill: '=?',
                drawColor: '=?'
            },
            link: aaAudioDrawDirectiveLink
        };

        function aaAudioDrawDirectiveLink($scope, $element, $attrs)
        {
            var analyser, frequencyData, frequencyFloatData,
                canvas, size;

            canvas = $aaAudioDrawService.createCanvas($element[0]);

            //////////////////////////////

            window.addEventListener('resize', function(){ $scope.$apply(); });

            $scope.$watch(getSize, setSize, true);

            $scope.$watch('drawType', function(n){
                if(n && frequencyData) $aaAudioDrawService['draw' + $aa.ucfirst($scope.drawType)](canvas, analyser, frequencyData);
            });

            $scope.$watch('audio.context.state', function(n){
                if(n == 'running') requestAnimationFrame(renderFrame);
            }, true);

            //////////////////////////////

            $scope.$watch('audio', function(n){
                if($scope.audio && $scope.audio.analyser) init();
            });
            $scope.draw = $scope.draw ? $scope.draw() : null;

            //////////////////////////////

            return;

            //////////////////////////////

            function init()
            {
                analyser = $scope.audio.analyser;
                frequencyData = new Uint8Array(analyser.frequencyBinCount);

                canvas.fill = $scope.drawFill || '#000';
                canvas.color = $scope.drawColor || '#fff';

                //frequencyFloatData = new Float32Array(analyser.frequencyBinCount);

                setSize(getSize());
            }

            //////////////////////////////

            function renderFrame(force)
            {
                if(($scope.audio && $scope.audio.context && $scope.audio.context.state == 'running') || force)
                {
                    requestAnimationFrame(renderFrame);
                    canvas.fill = $scope.drawFill || '#000';
                    canvas.color = $scope.drawColor || '#fff';

                    if($scope.drawType)
                        $aaAudioDrawService['draw' + $aa.ucfirst($scope.drawType)](canvas, analyser, frequencyData);
                    else if($scope.draw)
                        $scope.draw(canvas, analyser, frequencyData);
                    else
                        $aaAudioDrawService.drawRect(canvas, analyser, frequencyData);


                    /*
                    analyser.getFloatTimeDomainData(frequencyFloatData);
                    var x = $aaAudioService.autoCorrelate(frequencyFloatData, context.sampleRate);

                    if(x!=-1){
                        console.log(Math.round(x));
                    }
                    */
                }

            }

            //////////////////////////////

            function getSize()
            {
                return {
                    width: $element[0].offsetWidth,
                    height: $element[0].offsetHeight
                }
            }

            function setSize(n){
                size = n;
                $aaAudioDrawService.setCanvasSize(canvas.element, size);
                if(analyser)
                    requestAnimationFrame(function(){ renderFrame(true); });
            }
        }
    }
    aaAudioDrawDirective.$inject = ['$aaAudioDrawService', '$aa', '$timeout'];


})();