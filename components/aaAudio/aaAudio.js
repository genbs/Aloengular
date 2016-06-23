/**
 * Aloengular audio
 */
(function(){

    'use strict';

    angular
        .module('aloengular.audio', [])
        .factory('$aaAudioService', aaAudioService)
        .directive('aaAudio', aaAudioDirective)
    ;

    //////////////////////////////

    function aaAudioService($q)
    {
        var c = this;

        c.load = load;
        c.init = init;

        c.gain = gain;
        c.analyser = analyser;

        c.autoCorrelate = autoCorrelate;

        return c;

        //////////////////////////////

        function load(url, callback, progress)
        {
            var audioCtx = new (window.AudioContext || window.webkitAudioContext)();

            loadAsync(url).then(function(arrayBuffer){
                audioCtx.decodeAudioData(arrayBuffer, function(decoded){
                    var source = audioCtx.createBufferSource();
                    source.buffer = decoded;
                    source.connect(audioCtx.destination);

                    callback(audioCtx, source);
                });
            }, null, progress);
        }

        function init(element, callback) {
            var audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            var audioElement = document.getElementById(element);
            var source = audioCtx.createMediaElementSource(audioElement);

            callback(audioCtx, source, audioElement);
        }

        function loadAsync(url)
        {
            var d = $q.defer();
            var request = new XMLHttpRequest();

            request.open('GET', url, true);
            request.responseType = 'arraybuffer';

            request.addEventListener('load', function(){ d.resolve(request.response); });
            request.addEventListener('progress', function(e){ d.notify(e.loaded * 100 / e.total); });

            request.send();
            return d.promise;
        }

        //////////////////////////////

        function gain(audioContext, bufferSource)
        {
            var gain = audioContext.createGain();

            gain.connect(audioContext.destination);
            bufferSource.connect(gain);

            return gain;
        }

        function analyser(audioContext, bufferSource, fftSize, minDecibels, maxDecibels, smoothingTimeConstant)
        {
            var analyser = audioContext.createAnalyser();

            if(fftSize) analyser.fftSize = fftSize;
            if(minDecibels) analyser.minDecibels = minDecibels;
            if(maxDecibels) analyser.maxDecibels = maxDecibels;
            if(smoothingTimeConstant) analyser.smoothingTimeConstant = smoothingTimeConstant;

            bufferSource.connect(analyser);

            return analyser;
        }

        //////////////////////////////

        var MIN_SAMPLES = 0;
        var GOOD_ENOUGH_CORRELATION = 0.9;

        function autoCorrelate(buf, sampleRate) {
                var SIZE = buf.length;
                var MAX_SAMPLES = Math.floor(SIZE/2);
                var best_offset = -1;
                var best_correlation = 0;
                var rms = 0;
                var foundGoodCorrelation = false;
                var correlations = new Array(MAX_SAMPLES);

                for (var i=0;i<SIZE;i++) {
                    var val = buf[i];
                    rms += val*val;
                }
                rms = Math.sqrt(rms/SIZE);
                if (rms<0.01) // not enough signal
                    return -1;

                var lastCorrelation=1;
                for (var offset = MIN_SAMPLES; offset < MAX_SAMPLES; offset++) {
                    var correlation = 0;

                    for (var i=0; i<MAX_SAMPLES; i++) {
                        correlation += Math.abs((buf[i])-(buf[i+offset]));
                    }
                    correlation = 1 - (correlation/MAX_SAMPLES);
                    correlations[offset] = correlation; // store it, for the tweaking we need to do below.
                    if ((correlation>GOOD_ENOUGH_CORRELATION) && (correlation > lastCorrelation)) {
                        foundGoodCorrelation = true;
                        if (correlation > best_correlation) {
                            best_correlation = correlation;
                            best_offset = offset;
                        }
                    } else if (foundGoodCorrelation) {
                        // short-circuit - we found a good correlation, then a bad one, so we'd just be seeing copies from here.
                        // Now we need to tweak the offset - by interpolating between the values to the left and right of the
                        // best offset, and shifting it a bit.  This is complex, and HACKY in this code (happy to take PRs!) -
                        // we need to do a curve fit on correlations[] around best_offset in order to better determine precise
                        // (anti-aliased) offset.

                        // we know best_offset >=1,
                        // since foundGoodCorrelation cannot go to true until the second pass (offset=1), and
                        // we can't drop into this clause until the following pass (else if).
                        var shift = (correlations[best_offset+1] - correlations[best_offset-1])/correlations[best_offset];
                        return sampleRate/(best_offset+(8*shift));
                    }
                    lastCorrelation = correlation;
                }
                if (best_correlation > 0.01) {
                    // console.log("f = " + sampleRate/best_offset + "Hz (rms: " + rms + " confidence: " + best_correlation + ")")
                    return sampleRate/best_offset;
                }
                return -1;
            //  var best_frequency = sampleRate/best_offset;
            }

    }
    aaAudioService.$inject = ['$q'];

    //////////////////////////////

    function aaAudioDirective($aaAudioService, $timeout)
    {
        return {
            restrict: 'E',
            scope: {
                source: '=',
                minDecibels: '=',
                maxDecibels: '=',
                smoothing: '=',
                fftSize: '=',
                state: '=',
                onprogress: '&?',
                volume: '=',
                playbackRate: '=',

                audio: '=',
            },
            link: aaAudioDirectiveLink
        };

        //////////////////////////////

        function aaAudioDirectiveLink($scope, $element, $attrs)
        {
            var context = {}, source,
                analyser,
                gain, volume,
                playbackRate,
                audioElement,
                time;

            //////////////////////////////

            $scope.audio = {};

            $scope.$watch('audio.context.state', function(n, o){
                if(n) $scope.state = n;
            }, true);

            //////////////////////////////

            $scope.$watch('source', init),
            $scope.$watch('state', changeState);
            $scope.$watch('volume', setVolume);
            $scope.$watch('playbackRate', setPlaybackRate);

            //////////////////////////////

            $scope.onprogress = $scope.onprogress ? $scope.onprogress() : null;

            //////////////////////////////

            init($scope.source);

            return;

            //////////////////////////////

            function init(source)
            {
                if($scope.state != 'init' && source){
                    $scope.state = 'init';

                    context.close && context.close();

                    if(document.getElementById(source) != null)
                        $aaAudioService.init(source, start);
                    else
                        $aaAudioService.load(source, start, function(p){
                            $scope.onprogress && $scope.onprogress(p);
                        });
                }
            }

            function start(audioContext, bufferSource, audioElement)
            {
                context = audioContext;
                source = bufferSource;

                gain = $aaAudioService.gain(audioContext, source);

                $scope.analyser = analyser = $aaAudioService.analyser(audioContext, source, $scope.fftSize, $scope.minDecibels, $scope.maxDecibels, $scope.smoothing);

                setPlaybackRate(playbackRate);
                setVolume();


                if($scope.state != 'suspend')
                {
                    if(audioElement) audioElement.play();
                    else {
                        source.start();
                        time = Date.now();
                    }
                }

                $scope.$apply(function(){
                    $scope.audio = {
                        context: context,
                        bufferSource: source,
                        analyser: analyser,
                        gain:  gain,
                        time: time
                    };
                });
            }

            //////////////////////////////

            function changeState(newState)
            {
                if(newState == context.state) return;

                if(context.state == 'running')
                    context.suspend();
                else if(context.state == 'suspended')
                    context.resume();
            }

            //////////////////////////////

            function setVolume(n){
                if(typeof n !== 'undefined')
                    volume = (parseInt(n) / 100) - 1;
                if(gain) gain.gain.value = volume;
            }

            function setPlaybackRate(n)
            {
                if(typeof n !== 'undefinded')
                    playbackRate = n;
                if(source) source.playbackRate.value = n;
            }

        }
    }

    aaAudioDirective.$inject = ['$aaAudioService'];

})();