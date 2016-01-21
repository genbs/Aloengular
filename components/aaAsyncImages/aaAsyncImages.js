/**
 * Aloengular Async Image
 * @return DIRECTIVE aaImg, SERVICE $aaImg
 */
 (function(){

   'use strict';

   angular
   .module('aloengular.asyncImages', [])
       .directive('aaImg', aaImgDirective)
       .factory('$aaImg', aaImgFactory)
   ;

	////////////////////////////////////////

    function aaImgDirective($rootScope)
    {
        return {
            restrict: 'EA',
            transclude: true,
            scope: {
                src : '=',
                background: '='
            },
            link : aaImgLink,
            template: function(element, attrs){
                if(typeof attrs.background === 'undefined')
                    return '<div ng-transclude></div>';
                return null;
            }
        }

       ////////////////////////////////////////

        function aaImgLink($scope, $element, $attrs)
        {
            if(!$rootScope.asyncImages) $rootScope.asyncImages = [];

            $scope.loaded = false;
            $scope.inProg = false;
            $scope.loadPerc = 0;

            if($scope.background) $scope.src = $scope.background;

            $rootScope.asyncImages.push({ $scope: $scope, $element: $element, $attrs: $attrs });

            $scope.$watch('result', function(n, o){
                if(!n) return;

                if($scope.background){
                    $element[0].style.backgroundImage = 'url(\'' + $scope.result + '\')';
                } else {
                    var attr, img = $element[0].getElementsByTagName('img'), a = !!img;

                    img = img.length ? img[0] : new Image();

                    for(attr in $attrs.$attr)
                        if(attr != 'src' && attr != 'background')
                            img.setAttribute(attr, $attrs[attr]);

                    img.src = $scope.result;

                    if(a) $element[0].appendChild(img);

                    $scope.loaded = true;
                    $scope.inProg = false;
                }
            });
        }
    }

    ////////////////////////////////////////

    function aaImgFactory($rootScope, $q, $timeout)
    {
        var _init = false;

        $rootScope.$watch(function(){ return $rootScope.asyncImages.length; }, function(n){
            if(n && _init)
                init();
        });

        return init;

        ////////////////////////////////////////

        function init()
        {
            var d = $q.defer(), i, objs, objsLen;

            _init = true;

            $timeout(function(){
                objs = $rootScope.asyncImages;
                objsLen = objs.length;

                for(i in objs)
                    sendRequest(objs[i]);
            });

            return d.promise;

            ////////////////////////////////////////

            function sendRequest(obj){
                if(obj.$scope.loaded == true || obj.$scope.inProg == true) return;
                obj.$scope.inProg = true;

                var xhr = (XMLHttpRequest ? new XMLHttpRequest() : new ActiveXObject('Microsoft.XMLHTTP'));

                xhr.open('GET', obj.$scope.src, true);
                xhr.responseType = 'arraybuffer';

                xhr.onload = function(e) {
                    if(xhr.response){
                        var blob = new Blob([xhr.response]);
                        $rootScope.$apply(function(){
                            obj.$scope.result = window.URL.createObjectURL(blob);
                        });
                        addPerc(obj, 100);
                    }
                }

                xhr.addEventListener('progress', function(e) {
                    if(e.total != 0)
                        addPerc(obj, (e.loaded / e.total) * 100);
                });

                xhr.send();

                return;
            }

            ////////////////////////////////////////

            function addPerc(obj, p)
            {
                $rootScope.$apply(function(){
                    obj.$scope.loadPerc = Math.ceil(p);
                });

                var total = 0, onePercImg = 100 / objsLen;

                for(i in objs)
                    total += Math.ceil((onePercImg * objs[i].$scope.loadPerc) / 100);

                if(total >= 100){
                    d.notify(100);
                    d.resolve();
                } else
                    d.notify(total);
            }

        }
    }

    aaImgFactory.$inject = ['$rootScope', '$q', '$timeout'];


})();

