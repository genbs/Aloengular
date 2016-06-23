window.onload= function() {
            var ctx = new (window.AudioContext || window.webkitAudioContext)();
            var audio = document.getElementById('myAudio');

            var audioSrc = ctx.createMediaElementSource(audio);

            //////////////////////////////

            var gainNode = ctx.createGain();
            gainNode.gain.value = 2;
            audioSrc.connect(gainNode);
            gainNode.connect(ctx.destination);

            //////////////////////////////
            var analyser = ctx.createAnalyser();

            analyser.fftSize = 2048;
            analyser.minDecibels = -90;
            analyser.maxDecibels = -10;
            analyser.smoothingTimeConstant = 0.85;

            // we have to connect the MediaElementSource with the analyser
            audioSrc.connect(analyser);
            // we could configure the analyser: e.g. analyser.fftSize (for further infos read the spec)

            // frequencyBinCount tells you how many values you'll receive from the analyser
            var frequencyData = new Uint8Array(analyser.frequencyBinCount);

            // we're ready to receive some data!
            // loop

            //////////////////////////////
            var WIDTH, HEIGHT;
            var c = document.getElementById('c');
            var canvctx = c.getContext('2d');
            c.width  = WIDTH = window.innerWidth;
            c.height = HEIGHT = window.innerHeight;
            c.style.width  = window.innerWidth + 'px';
            c.style.height = window.innerHeight + 'px';
            //////////////////////////////
            var MIN_SAMPLES = 0;
            var GOOD_ENOUGH_CORRELATION = 0.9;
            function autoCorrelate( buf, sampleRate ) {
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

            var noteStrings = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];

            function noteFromPitch( frequency ) {
                var noteNum = 12 * (Math.log( frequency / 440 )/Math.log(2) );
                return Math.round( noteNum ) + 69;
            }

            function frequencyFromNoteNumber( note ) {
                return 440 * Math.pow(2,(note-69)/12);
            }

            function centsOffFromPitch( frequency, note ) {
                return Math.floor( 1200 * Math.log( frequency / frequencyFromNoteNumber( note ))/Math.log(2) );
            }


            var buflen = analyser.frequencyBinCount;
            var buf = new Float32Array( buflen );
            function renderFrame() {
                requestAnimationFrame(renderFrame);
                // update data in frequencyData
                /*
                analyser.getFloatTimeDomainData(buf);

                var x = autoCorrelate(buf, ctx.sampleRate);
                if(x!=-1){
                    var note = noteFromPitch(x);
                    console.log(Math.round(x), note, centsOffFromPitch(x, note), noteStrings[note%12]);
                }
                //return;

                analyser.getByteTimeDomainData(frequencyData);


                canvctx.fillStyle = 'rgb(200, 200, 200)';
                canvctx.fillRect(0, 0, WIDTH, HEIGHT);
                canvctx.lineWidth = 2;
                canvctx.strokeStyle = 'rgb(0, 0, 0)';
                canvctx.beginPath();

                var bufferLength = frequencyData.length;
                var sliceWidth = WIDTH * 1.0 / bufferLength;
                var x = 0;

                for(var i = 0; i < bufferLength; i++) {

                    var v = frequencyData[i] / 128.0;
                    var y = v * HEIGHT/2;

                    if(i === 0) {
                      canvctx.moveTo(x, y);
                    } else {
                      canvctx.lineTo(x, y);
                    }

                    x += sliceWidth;
                }

                canvctx.lineTo(c.width, c.height/2);
                canvctx.stroke();

                */

                analyser.getByteFrequencyData(frequencyData);
                // render frame based on values in frequencyData

                canvctx.fillStyle = 'rgb(0, 0, 0)';
                canvctx.fillRect(0, 0, WIDTH, HEIGHT);

                var bufferLength = frequencyData.length;
                var barWidth = (WIDTH / bufferLength) * 2.5;
                var barHeight;
                var x = 0;


                for(var i = 0; i < bufferLength; i++) {
                    barHeight = frequencyData[i];
                    canvctx.fillStyle = 'rgb(' + (barHeight+100) + ',0,0)';
                    canvctx.fillRect(x,HEIGHT-barHeight/2,barWidth,barHeight/2);

                    x += barWidth + 1;
                }

            }
            audio.play();
            renderFrame();
        };