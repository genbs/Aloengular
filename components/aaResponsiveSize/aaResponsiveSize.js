/**
 * Aloengular Responsive Size
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

    function aaResponsiveSizeFactory($aa)
    {
        var c = {}, sizes = [];

        c.add = add;

        window.addEventListener('resize', function(){
            requestAnimationFrame(update);
        });

        requestAnimationFrame(update);

        return c;

        //////////////////////////////

        function add(aaRSizeArray)
        {
            sizes = sizes.concat(aaRSizeArray);
        }

        function getValueFromObj(aaRSizeObj)
        {
            var x = aaRSizeObj.element[aaRSizeObj.elementAttr]
                                ? aaRSizeObj.element[aaRSizeObj.elementAttr]
                                : aaRSizeObj.element.style[aaRSizeObj.elementAttr];

            return (x * aaRSizeObj.size / 100) + (aaRSizeObj.offset || 0) + 'px';
        }

        //////////////////////////////

        function update()
        {
            var styles = [];

            sizes.map(function(t){
                t.target[0].style[t.attr] = getValueFromObj(t);
            });
        }

    }
    aaResponsiveSizeFactory.$inject = ['$aa'];



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
                    aaRSizeObj.target = $element;

                    aaRSizeObj.elementName = typeof aaRSizeObj.element === 'string' ? aaRSizeObj.element : '';

                    aaRSizeObj.element = typeof aaRSizeObj.element === 'string'
                                        ? $aa.getObj(aaRSizeObj.element, $element[0])
                                        : aaRSizeObj.element ? aaRSizeObj.element : $element[0].parentNode;

                    if(aaRSizeObj.elementName === '')
                    {
                        if(aaRSizeObj.element == document.body)
                            aaRSizeObj.elementName = 'body';
                        else if(aaRSizeObj.element == document.window)
                            aaRSizeObj.elementName = 'window';
                    }

                    aaRSizeObj.elementAttr = aaRSizeObj.elementAttr
                                        ? aaRSizeObj.elementAttr
                                        : (
                                            aaRSizeObj.attr == 'height' || aaRSizeObj.attr == 'width'
                                                ? 'offset' + $aa.ucfirst(aaRSizeObj.attr)
                                                : aaRSizeObj.attr
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