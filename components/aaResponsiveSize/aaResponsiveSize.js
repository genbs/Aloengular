/**
 * Aloengular Responsive Size
 * created at: 2016-01-20
 * author: Gennaro Bosone <gennaro.bs@gmail.com>
 *
 * version: 0.0.0
 * update at: 2016-06-19
 *
 * @required [aloengular.utils]
 * sizes object = [
 *     { attr: string, element: object (optional), elementAttr: string (optional), size: number (optional, percentage), offset: (optiona, number), mediaQuery: string(aaMediaQuery)(optional) }
 * ]
 */
 (function(){

    'use strict';

    angular
        .module('aloengular.responsiveSize', [])
        .factory('$aaRSize', aaResponsiveSizeFactory)
        .directive('aaRSize', aaResponsiveSize)
    ;

    //////////////////////////////

    function aaResponsiveSizeFactory($aa, $rootScope)
    {
        var c = {}, sizes = [], raf, o = null;

        c.add = add;

        raf = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;

        window.addEventListener('resize', update);
        $rootScope.$watchCollection(watchCollection, update);
        $rootScope.$on('$aaRSize:update', update);

        return c;

        //////////////////////////////

        function watchCollection()
        {
            return sizes.map(function(s){ return s.element[s.elementAttr]; });
        }

        function getValueFromObj(aaRSizeObj)
        {
            var x = aaRSizeObj.element[aaRSizeObj.elementAttr]
                    ? aaRSizeObj.element[aaRSizeObj.elementAttr]
                    : aaRSizeObj.element.style[aaRSizeObj.elementAttr];

            return ((x * aaRSizeObj.size) / 100) + (aaRSizeObj.offset || 0) + 'px';
        }

        function applyStyles()
        {
            sizes.map(function(aaRSize){
                aaRSize.attr.map(function(attr){
                    aaRSize.target.style[attr] = getValueFromObj(aaRSize);
                });
            });
        }

        function update(){ raf(applyStyles); }

        //////////////////////////////

        function add(aaRSizeArray)
        {
            sizes = sizes.concat(aaRSizeArray);
        }

    }
    aaResponsiveSizeFactory.$inject = ['$aa', '$rootScope'];



    //////////////////////////////



    function aaResponsiveSize($aaRSize, $aa)
    {
        return {
            restrict : 'A',
            scope : {
                sizes : '=aaRSize'
            },
            link : aaResponsiveSizeLink
        }

        //////////////////////////////

        function aaResponsiveSizeLink($scope, $element, $attrs, aaRSizeCtrl)
        {
            $aaRSize.add(aaRSizeSanitize($scope.sizes));

            $element[0].removeAttribute('aa-r-size');

            return;

            //////////////////////////////

            function aaRSizeSanitize(sizes)
            {
                var s, sizes;

                if(typeof sizes === 'string')
                    sizes = aaRSizeObjFromString(sizes);
                else
                    sizes = !sizes.length ? [sizes] : sizes;

                for(s in sizes)
                    sizes[s] = aaRSizeSanitizeObj(sizes[s]);

                return sizes;

                //////////////////////////////

                function aaRSizeObjFromString(string)
                {

                    //String example 's:100 e:parent a:height ea:lineHeight, e:width,'

                    var t, temp;

                    return string.split(',').map(createObj);

                    //////////////////////////////

                    function createObj(string)
                    {
                        var r = {};

                        string.trim().split(' ').map(function(e){
                            e = e.trim().split(':');
                            r[e[0]] = e[1];
                        });

                        return {
                            attr        : r.a,
                            size        : Number(r.s || 100),
                            offset      : r.o || 0,
                            element     : r.e,
                            elementAttr : r.ea
                        };
                    }
                }

                //////////////////////////////

                function aaRSizeSanitizeObj(aaRSizeObj)
                {
                    aaRSizeObj.target = $element[0];

                    aaRSizeObj.attr = typeof aaRSizeObj.attr === 'string' ? [aaRSizeObj.attr] : aaRSizeObj.attr;

                    aaRSizeObj.element = typeof aaRSizeObj.element === 'string'
                                        ? $aa.getObj(aaRSizeObj.element, $element[0])
                                        : aaRSizeObj.element ? aaRSizeObj.element : $element[0].parentNode;

                    aaRSizeObj.elementAttr = aaRSizeObj.elementAttr
                                            ? aaRSizeObj.elementAttr
                                            : (
                                                aaRSizeObj.attr[0] == 'height' || aaRSizeObj.attr[0] == 'width'
                                                ? 'offset' + $aa.ucfirst(aaRSizeObj.attr[0])
                                                : aaRSizeObj.attr[0]
                                                );
                    aaRSizeObj.offset = aaRSizeObj.offset ? aaRSizeObj.offset : 0;
                    //aaRSizeObj._mediaQuery = aaRSizeObj.mediaQuery;
                    //aaRSizeObj.mediaQuery = aaRSizeObj.mediaQuery ? $aaMediaQuery[aaRSizeObj.mediaQuery] : function(){ return true };
                    aaRSizeObj.size = aaRSizeObj.size ? aaRSizeObj.size : 100;

                    return aaRSizeObj;
                }
            }
        }
    }
    aaResponsiveSize.$inject = ['$aaRSize', '$aa'];

})();