/**
 * Aloengular Async Image
 * @return DIRECTIVE aaImg, SERVICE $aaImg
 */
 (function(){

   'use strict';

    angular
        .module('aloengular.asyncMedias')
        .directive('aaVid', aaVidDirective)
   ;

    //////////////////////////////

    function aaVidDirective($rootScope)
    {
        return {
            restrict: 'EA',
            replace: true,
            scope: {
                src : '=?aaSrc',
            },
            link : aaVidLink,
            template: '<video class="aa-vid"></video>'
        }

        //////////////////////////////

        function aaVidLink($scope, $element, $attrs)
        {
            if(!$rootScope.asyncMedias) $rootScope.asyncMedias = [];

            $scope.loaded = false;
            $scope.inProg = false;
            $scope.loadPerc = 0;

            if($scope.background) $scope.src = $scope.background;

            $rootScope.asyncMedias.push({ $scope: $scope, $element: $element, $attrs: $attrs });

            $scope.$watch('result', function(n, o){
                if(!n) return;

                if($scope.background){
                    $element[0].style.backgroundImage = 'url(\'' + $scope.result + '\')';
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
    aaVidDirective.$inject = ['$rootScope'];

})();

