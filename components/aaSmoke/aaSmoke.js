(function(){

    'use strict';

    angular
        .module('aloengular.smoke', [])
        .provider('aaSmoke', SmokeProvider)
    ;

    //

    function SmokeProvider()
    {
        var bounce = false;
        var images = [];

        var SETTINGS = {
            x: null,
            y: null,
            minSize: 180,
            maxSize: 200,
            image: null,
            angle: null,
            angleIncrement: null,
            velocity: null,
            xVelocity: null,
            yVelocity: null,
            lifeTime: null
        };

        return {
            $get: aaSmoke,
            setImage: setImage,
            setMinSize: setMinSize,
            setMaxSize: setMaxSize,
            setLifeTime: setLifeTime,
            setVelocity: setVelocity,
            setXVelocity: setXVelocity,
            setYVelocity: setYVelocity,
            setAngleIncrement: setAngleIncrement,
            setBounce: setBounce,
        };

        function aaSmoke(){
            var c = this;

            c.rand = rand;
            c.create = create;

            return c;

            //

            function create(canvas, options)
            {
                var o = angular.extend({}, SETTINGS, options);

                this.lifeTime = o.lifeTime;
                this.angleIncrement = o.angleIncrement;
                this.xVelocity = o.xVelocity;
                this.yVelocity = o.yVelocity;

                this.image = getImage(o.image);

                this.x = o.x !== null ? o.x : rand(0, canvas.width);
                this.y = o.y !== null ? o.y : rand(0, canvas.width);

                this.died = false;

                this.startSize = o.minSize ? o.minSize : rand(o.minSize, o.maxSize);
                this.endSize = o.maxSize;

                if(this.angleIncrement !== null)
                    this.angle = o.angle ? o.angle : rand(0, Math.random() * 359);

                this.startLife = new Date().getTime();
                this.currLifeTime = 0;

                if(this.xVelocity !== null)
                    this.xVelocity = (o.xVelocity ? o.xVelocity : rand(-o.xVelocity, o.xVelocity));
                if(this.yVelocity !== null)
                    this.yVelocity = (o.yVelocity ? o.yVelocity : rand(-o.yVelocity, o.yVelocity));

                this.context = canvas.getContext('2d');

                this.draw = function() {
                    this.context.save();

                    var offsetX = -this.size / 2,
                        offsetY = -this.size / 2;

                    this.context.translate(this.x - offsetX, this.y - offsetY);

                    if(this.angleIncrement !== null)
                        this.context.rotate(this.angle / 180 * Math.PI);

                    this.context.globalAlpha = this.alpha;

                    this.context.drawImage(this.image, offsetX, offsetY, this.size, this.size);

                    this.context.restore();
                };

                // Update the smoke.
                this.update = function() {
                    this.currLifeTime = new Date().getTime() - this.startLife;
                    var lifePerc = ((this.currLifeTime / this.lifeTime) * 100);

                    if(this.lifeTime !== null){

                        if(this.endSize < this.startSize)
                            this.size = this.startSize - ((this.startSize - this.endSize) * lifePerc / 100);
                        else
                            this.size = this.startSize + ((this.endSize - this.startSize) * lifePerc / 100);


                        if(lifePerc > 100)
                            this.died = true;

                    } else {
                        this.size = this.endSize;
                    }

                    if(lifePerc > 10){
                        this.alpha = 1 - (lifePerc / 100);
                        this.alpha = Math.max(this.alpha, 0);
                    } else {
                        this.alpha = lifePerc / 10;
                    }

                    if(this.angleIncrement !== null)
                        this.angle += this.angleIncrement;

                    if(o.xVelocity !== null)
                        this.x += this.xVelocity;
                    if(o.yVelocity !== null)
                        this.y += this.yVelocity;

                    if(bounce){
                        if (this.x >= canvas.width) {
                            this.xVelocity = -this.xVelocity;
                            this.x = canvas.width;
                        } else if (this.x <= 0) {
                            this.xVelocity = -this.xVelocity;
                            this.x = 0;
                        }

                        if (this.y >= canvas.height) {
                            this.yVelocity = -this.yVelocity;
                            this.y = canvas.height;
                        } else if (this.y <= 0) {
                            this.yVelocity = -this.yVelocity;
                            this.y = 0;
                        }
                    }
                }
            }
        }

        function getImage(image)
        {
            if(image === null)
                return images[0];

            var i, s;
            for(i in images){

                s = images[i].src.split('/');
                s = s[s.length - 1];
                if(s === image)
                    return images[i];
            }
        }

        function setImage(imgs)
        {
            if(typeof imgs === 'string')
                imgs = [imgs];

            var i;

            for(i in imgs){
                var img = new Image();
                img.src = imgs[i];

                images.push(img);
            }
        }

        function setMinSize(size){ SETTINGS.minSize = size; }
        function setMaxSize(size){ SETTINGS.maxSize = size; }
        function setLifeTime(duration){ SETTINGS.lifeTime = duration; }
        function setVelocity(velocity){ SETTINGS.xVelocity = velocity; SETTINGS.yVelocity = velocity; }
        function setXVelocity(velocity){ SETTINGS.xVelocity = velocity; }
        function setYVelocity(velocity){ SETTINGS.yVelocity = velocity; }
        function setAngleIncrement(increment){ SETTINGS.angleIncrement = increment; }
        function setBounce(bounce){ bounce = bounce; }
        function rand(min, max)
        {
            if(typeof min === 'object'){
                var a = min;
                min = 0;
                max = a.length - 1;
                return a[Math.round(Math.random() * (max - min) + min)];
            }
            return Math.random() * (max - min) + min;
        }
    }
    SmokeProvider.$inject = [];
})();