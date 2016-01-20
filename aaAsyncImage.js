/**
 * Aloengular Async Image
 * @return DIRECTIVE aaImg, SERVICE $aaImg
 */
(function(){

	'use strict';

	angular
        .module('aloengular.asyncImage', [])
        .directive('aaImg', aaImgDirective)
        .factory('$aaImg', aaImgFactory)
    ;

	////////////////////////////////////////

    function aaImgDirective($rootScope)
    {
        return {
            restrict: 'E',
            scope: {
                src : '@'
            },
            link : aaImgLink
        }

	   ////////////////////////////////////////

        function aaImgLink($scope, $element, $attrs)
        {
            var a;

            if(!$rootScope.__aaImages) $rootScope.__aaImages = [];

            $scope.loaded = false;
            $rootScope.__aaImages.push({ $scope: $scope, $element: $element, $attrs: $attrs });

            $scope.$watch('loaded', function(n, o){
                if(n){
                    var img = new Image();
                    for(a in $attrs.$attr)
                        if(a != 'src')
                            img.setAttribute(a, $attrs[a]);

                   img.src = $scope.result;
                   $element[0].appendChild(img);
               }
            });
        }
    }

    ////////////////////////////////////////

    function aaImgFactory($rootScope, $q, $timeout)
    {
        var s = this;

        return init;

        ////////////////////////////////////////

        function init()
        {
            var d = $q.defer(), i, objs, total = 0;

            $timeout(function(){
                objs = $r.asyncImages;
                for(i in objs)
                    sendRequest(d, objs[i]);
            }, 33);

            return d.promise;

            ////////////////////////////////////////

            function sendRequest(d, obj){
                if(obj.$scope.loaded = true) return;

                var xhr = (XMLHttpRequest ? new XMLHttpRequest() : new ActiveXObject('Microsoft.XMLHTTP'));

                xhr.open('GET', obj.$scope.src, true);

                xhr.responseType = 'arraybuffer';

                xhr.onload = function(e) {
                    if(xhr.response){
                        var blob = new Blob([xhr.response]);
                        $rootScope.$apply(function(){
                            obj.$scope.loaded = true;
                            obj.$scope.result = window.URL.createObjectURL(blob);
                        });
                        addPerc(d, 100);
                    }
                }

                xhr.addEventListener('progress', function(e) {
                    if(e.total != 0)
                        addPerc(d, (e.loaded / e.total) * 100);
                });

                xhr.send();
            }

            function addPerc(d, p)
            {
                var onePercImg = 100 / objs.length;
                total += (onePercImg * p) / 100;

                d.notify(total > 100 ? 100 : total);

                if(total >= 100)
                    $timeout(d.resolve);
            }
        }
    }

    aaImgFactory.$inject = ['$rootScope', '$q', '$timeout'];


})();

