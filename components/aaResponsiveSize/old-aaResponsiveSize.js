/**
 * Aloengular Responsive Size
 * sizes object = [
 *     { attr: string, element: object (optional), elementAttr: string (optional), size: number (optional, percentage), offset: (optiona, number), mediaQuery: string(aaMediaQuery)(optional) }
 * ]
 */
(function(){

    'use strict';

    angular
        .module('aloengular.responsiveSize', [])
        .directive('aaRSize', aaResponsiveSize)
    ;

    function aaResponsiveSize($window, $timeout, $aaMediaQuery)
    {
        return {
            restrict : 'A',
            scope : {
                sizes : '=aaRSize',
                delay : '=aaRSizeDelay'
            },
            link : aaResponsiveSizeLink
        };

        function aaResponsiveSizeLink($scope, $element, $attrs)
        {
            var s, sizes, $w = angular.element($window);

            sizes = typeof $scope.sizes === 'string'
                        ? $scope.sizes.split(',').map(function(e){
                            var e = e.trim().split(' ');
                            e[1] = e[1] ? e[1] : 100;
                            return { attr: e[0], size: e[1] };
                        })
                        : !$scope.sizes.length ? [$scope.sizes] : $scope.sizes;

            for(s in sizes){
                var t = sizes[s];
                t.element = typeof t.element === 'string' ? getObjectByName(t.element, $element[0]) : t.element ? t.element : $element[0].parentNode;
                t.elementAttr = t.elementAttr
                                ? t.elementAttr
                                : (t.attr == 'height' || t.attr == 'width' ? 'offset' + capitalizeFirstLetter(t.attr) : t.attr);

                t.offset = t.offset ? t.offset : 0;
                t._mediaQuery = t.mediaQuery;
                t.mediaQuery = t.mediaQuery ? $aaMediaQuery[t.mediaQuery] : function(){ return true };

                t.size = t.size ? t.size : 100;
                sizes[s] = t;
            }

            $scope.$watch(function(){
                var a = [];
                for(s in sizes)
                    a.push(sizes[s].element[sizes[s].elementAttr]);

                return a;
            }, setSizes, true);

            return;

            function setSizes()
            {
                for(s in sizes){
                    var t = sizes[s];
                    if(t.mediaQuery()){
                        $element[0].style[t.attr] = ((((t.element.style && t.element.style[t.elementAttr]) ? t.element.style[t.elementAttr] : t.element[t.elementAttr]) * t.size / 100) + t.offset) + 'px';
                    }
                }
            }

            function getObjectByName(objName, obj)
            {
                switch(objName)
                {
                    case 'parent':
                        return obj.parentNode;
                    case 'window':
                        return window;
                    case 'body':
                        return document.body;
                    default:
                        if(objName.indexOf('parent:') == 0){
                            var p = objName.split(':');
                            p[0] = obj;
                            do{
                                p[0] = p[0].parentNode;
                                p[1]--;
                            }while(p[1] != 0);

                            return p[0];
                        }
                        return window;
                }
            }

            function capitalizeFirstLetter(string) {
                return string.charAt(0).toUpperCase() + string.slice(1);
            }
        }
    }
    aaResponsiveSize.$inject = ['$window', '$timeout', '$aaMediaQuery'];

})();
