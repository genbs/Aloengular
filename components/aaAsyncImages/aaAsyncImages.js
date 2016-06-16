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
            replace: true,
            scope: {
                src : '=?aaSrc',
                background: '=?aaBackground'
            },
            link : aaImgLink,
            template: function(element, attrs){
                if(typeof attrs.aaBackground !== 'undefined')
                    return '<div class="aa-img-background" ng-transclude></div>';
                return '<img class="aa-img"></img>';
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

            $scope.$watch('result', watchResult);

            return;

            //////////////////////

            function watchResult(n)
            {
                if(!n) return;

                if($scope.background)
                    $element[0].style.backgroundImage = 'url(\'' + $scope.result + '\')';
                else
                    $element[0].setAttribute('src', $scope.result);

                $scope.loaded = true;
                $scope.inProg = false;
            }

        }
    }
    aaImgDirective.$inject = ['$rootScope'];

    ////////////////////////////////////////

    function aaImgFactory($rootScope, $q, $timeout)
    {
        var _init = false;

        $rootScope.$watch('asyncImages.length', function(n){
            if(n && _init) init();
        }, true);

        return init;

        ////////////////////////////////////////

        function init()
        {
            var d = $q.defer(), i, objs, objsLen;

            _init = true;

            $timeout(function(){
                objs = $rootScope.asyncImages;
                objsLen = objs.length;

                for(i in objs) sendRequest(objs[i]);
            }, 33);


            return d.promise;

            ////////////////////////////////////////

            function sendRequest(obj)
            {
                if(obj.$scope.loaded == true || obj.$scope.inProg == true) return;

                obj.$scope.inProg = true;

                var xhr = (XMLHttpRequest ? new XMLHttpRequest() : new ActiveXObject('Microsoft.XMLHTTP'));

                xhr.open('GET', obj.$scope.src, true);
                xhr.responseType = 'arraybuffer';

                xhr.addEventListener('load', function(e){
                    if(xhr.response){
                        var blob = new Blob([xhr.response]);
                        obj.$scope.result = window.URL.createObjectURL(blob);
                        addPerc(obj, 100);
                    }
                });

                xhr.addEventListener('progress', function(e) {
                    addPerc(obj, (e.loaded / (e.total || 0)) * 100);
                });

                xhr.send();

                return;
            }

            ////////////////////////////////////////

            function addPerc(obj, p)
            {
                $rootScope.$apply(function(){
                    obj.$scope.loadPerc = round(p, 2);
                });

                var total = 0, loaded = [], onePercImg = 100 / objsLen;

                for(i in objs){
                    total += round((onePercImg * objs[i].$scope.loadPerc) / 100, 2);
                    if(objs[i].$scope.loaded) loaded.push(objs[i]);
                }

                d.notify({ percentage : Math.round(total), loaded: loaded });

                if(total >= 100 || loaded.length >= objsLen)
                    d.resolve();
            }

            function round(value, decimals) {
                return Number(Math.round(value+'e'+decimals)+'e-'+decimals);
            }
        }
    }
    aaImgFactory.$inject = ['$rootScope', '$q', '$timeout'];


})();

