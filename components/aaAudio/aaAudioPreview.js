/**
 * Aloengular audio
 */
(function(){

    'use strict';

    angular
        .module('aloengular.audio')
        .factory('$aaAudioPreviewService', aaAudioPreviewService)
        .directive('aaAudioPreview', aaAudioPreviewDirective)
    ;


    //////////////////////////////

    function aaAudioPreviewService()
    {
        var c = this;

        c.drawPreview = drawPreview;
        c.getPreviewData = getPreviewData;

        return c;

        //////////////////////////////

        function getPreviewData(audioBuffer, width)
        {
            var array = [];
            var step = Math.ceil(audioBuffer.length / width);
            var i, j, min, max, data;

            for(i = 0; i < width; i++)
            {
                min = 1.0; max = -1.0;
                for (j = 0; j < step; j++) {
                    data = audioBuffer[(i * step) + j];
                    if(data){
                        min = Math.min(data, min);
                        max = Math.max(data, max);
                    }
                }
                array.push(max - min);
            };
            return array;
        }

        function drawPreview(canvasObj, heights, t)
        {
            var width = canvasObj.element.width,
                height = canvasObj.element.height;

            var amp = height / 2;
            var i, h;

            canvasObj.context.fillStyle = canvasObj.fill;
            canvasObj.context.fillRect(0, 0, width, height);


            for(i = 0; i < width; i++){
                h = Math.max(1, heights[i] * amp);
                if(i < t)
                    canvasObj.context.fillStyle = canvasObj.playedColor;
                else
                    canvasObj.context.fillStyle = canvasObj.color;
                canvasObj.context.fillRect(i, (height / 2) - (h / 2), 1, h);
            }
        }
    }
    aaAudioPreviewService.$inject = [];

    //////////////////////////////

    function aaAudioPreviewDirective($aaAudioDrawService, $aaAudioPreviewService, $aa, $timeout)
    {
        return {
            restrict: 'E',
            scope: {
                audio: '=',
                drawFill: '=?',
                drawColor: '=?',
                drawPlayedColor: '=?'
            },
            link: aaAudioPreviewDirectiveLink
        };

        function aaAudioPreviewDirectiveLink($scope, $element, $attrs)
        {
            var context = {}, bufferSource,
                analyser, gain,
                canvas, size,
                startTime = 0, currentTime, suspendedTime, st,
                previewData = [];

            canvas = $aaAudioDrawService.createCanvas($element[0]);

            //////////////////////////////

            window.addEventListener('resize', function(){ $scope.$apply(); });
            $scope.$watch(getSize, setSize, true);

            //////////////////////////////

            $scope.$watch('audio', function(n){
                if($scope.audio && $scope.audio.bufferSource)
                    init();
            });

            $scope.$watch('audio.context.state', function(n, o){
                if(n){
                    if(n == 'suspended'){
                        st = Date.now();
                    } if(o == 'suspended' && n == 'running'){
                        suspendedTime += Date.now() - st;
                        renderFrame();
                    }
                }
            }, true);


            $element.on('click', function(e){
                var x = e.clientX;

                var buffer = bufferSource.buffer;
                var playbackRate = $scope.audio.bufferSource.playbackRate.value;

                bufferSource.stop(0);
                bufferSource = context.createBufferSource();
                bufferSource.buffer = buffer;
                bufferSource.connect(context.destination);

                bufferSource.connect(gain);
                bufferSource.connect(analyser);

                startTime = $aa.proportion(0, bufferSource.buffer.duration, x, 0, canvas.element.width);
                bufferSource.start(0, startTime);
                $scope.audio.time = Date.now() - (startTime * 1000);
                suspendedTime = 0;


                $scope.audio.bufferSource = bufferSource;
                $scope.audio.bufferSource.playbackRate.value = playbackRate;

                if(context.state == 'suspended'){
                    var v = gain.gain.value;

                    gain.gain.value = -1;

                    $timeout(function(){
                        context.resume();

                        $timeout(function(){
                            context.suspend();
                            gain.gain.value = v;
                        }, 33);
                    }, 33);


                }
            });

            //////////////////////////////

            return;

            //////////////////////////////

            function init()
            {
                context = $scope.audio.context;
                bufferSource = $scope.audio.bufferSource;
                analyser = $scope.audio.analyser;
                gain = $scope.audio.gain;

                currentTime = 0;
                suspendedTime = 0;

                setSize(getSize());
            }

            function renderFrame(force)
            {
                if(($scope.audio && $scope.audio.context && $scope.audio.context.state == 'running') || force)
                {
                    requestAnimationFrame(renderFrame);

                    canvas.fill = $scope.drawFill || '#000';
                    canvas.color = $scope.drawColor || '#fff';
                    canvas.playedColor = $scope.drawPlayedColor || '#c66';

                    $aaAudioPreviewService.drawPreview(
                        canvas,
                        previewData,
                        $aa.proportion(0, size.width, getCurrentTime(), 0, bufferSource.buffer.duration)
                    );
                }
            }

            //////////////////////////////

            function getCurrentTime()
            {
                if(context.state == 'running')
                    currentTime = (Date.now() - $scope.audio.time);
                return  (currentTime - suspendedTime) / 1000;
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

                if(bufferSource)
                {
                    $aaAudioDrawService.setCanvasSize(canvas.element, size);
                    previewData = $aaAudioPreviewService.getPreviewData(bufferSource.buffer.getChannelData(0), size.width);
                    requestAnimationFrame(function(){ renderFrame(true); });
                }
            }

            //////////////////////////////
        }
    }
    aaAudioPreviewDirective.$inject = ['$aaAudioDrawService', '$aaAudioPreviewService', '$aa', '$timeout'];


})();