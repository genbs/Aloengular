(function(){

    'use strict';

    angular
        .module('app', [
            'aloengular.smoke'
        ])
        .config(AppConfig)
        .controller('MainController', MainController);
    ;

    var smokesImgs = ['Smoke10.png', 'Smoke2.png', 'Smoke3.png', 'Smoke4.png'];

    function AppConfig(aaSmokeProvider)
    {
        aaSmokeProvider.setImage(smokesImgs);
        aaSmokeProvider.setBounce(false);
        aaSmokeProvider.setMinSize(180);
        aaSmokeProvider.setMaxSize(300);
    }
    AppConfig.$inject = ['aaSmokeProvider'];


    function MainController(aaSmoke, $interval, $timeout)
    {
        var c = this;
        var smokes = [];
        var smokeCount = 1000;
        var canvas, context;
        var fps = 100;

        window.addEventListener('load', init);

        return c;

        function init() {
            canvas = document.getElementById('myCanvas');

            if (canvas.getContext)
            {
                canvas.width = window.innerWidth;
                canvas.height = window.innerHeight;

                context = canvas.getContext('2d');
                for(var i=0; i < smokeCount; ++i){
                    smokes.push(new aaSmoke.create(canvas, {
                        image: aaSmoke.rand(smokesImgs),
                        xVelocity: aaSmoke.rand(-0.5, 0.5),
                        yVelocity: aaSmoke.rand(-0.5, 0.5),
                        lifeTime: aaSmoke.rand(10000, 100000),
                        angleIncrement: aaSmoke.rand(-0.5, 0.5)
                    }));
                }

                animate();

            }

            return context;
        }

        function animate()
        {
            var i = $interval(function() {
                context.clearRect(0, 0, window.innerWidth, window.innerHeight);

                var t = [];
                smokes.forEach(function(smoke) {
                    smoke.update();

                    if(smoke.died)
                        smoke = null;
                    else{
                        smoke.draw();
                        t.push(smoke);
                    }
                });

                smokes = t;

                if(!smokes.length)
                    $interval.cancel(i);

            }, 1000 / fps);
        }
    }
    MainController.$inject = ['aaSmoke', '$interval', '$timeout']
})();