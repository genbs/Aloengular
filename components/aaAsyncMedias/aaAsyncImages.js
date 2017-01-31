/**
 * Aloengular Async Image
 * @return DIRECTIVE aaImg, SERVICE $aaImg
 */
 (function(){

   'use strict';

    angular
        .module('aloengular.asyncMedias')
        .directive('aaImg', aaImgDirective)
   ;

    //////////////////////////////

    function aaImgDirective($rootScope)
    {
        return {
            restrict: 'EA',
            transclude: true,
            replace: true,
            scope: {
                svg : '=?aaSvg',
                src : '=?aaSrc',
                background: '=?aaBackground'
            },
            link : aaImgLink,
            template: function(element, attrs){
                if(typeof attrs.aaBackground !== 'undefined'){
                    var t = element[0].tagName.toLowerCase();
                    return '<' + t + ' class="aa-img-background" ng-transclude></' + t + '>';
                }
                if(typeof attrs.aaSvg !== 'undefined'){
                    return '<span class="aa-img-svg"></span>';
                }
                return '<img class="aa-img"></img>';
            }
        }

        function aaImgLink($scope, $element, $attrs)
        {
            if(!$rootScope.asyncMedias) $rootScope.asyncMedias = [];

            $scope.loaded = false;
            $scope.inProg = false;
            $scope.loadPerc = 0;

            if(!$scope.src) $scope.src = $scope.background || $scope.svg;

            $rootScope.asyncMedias.push({ $scope: $scope, $element: $element, $attrs: $attrs });

            $scope.$watch('result', function(n, o){
                if(!n) return;

                if($scope.background){
                    $element[0].style.backgroundImage = 'url(\'' + $scope.result + '\')';
                } else if($scope.svg){
                    $element[0].innerHTML = $scope.result;
                } else {
                    var attr, e;

                    e = $element[0];
                    e.setAttribute('src', $scope.result);
                }

                $scope.loaded = true;
                $scope.inProg = false;
            });
        }
    }
    aaImgDirective.$inject = ['$rootScope'];

})();

