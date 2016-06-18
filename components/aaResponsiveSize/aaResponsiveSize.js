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

    function aaResponsiveSizeFactory($rootScope, $aa)
    {
        var c = {},
            o,
            sizes = [],
            DEBOUNCE = 50,
            currentStyle,
            $scope = $rootScope.$new();


        c.add = add;
        c.bindableClass = ['window', 'body'];
        c.isBindable = isBindable;
        c.getClassFromObj = getClassFromObj;

        //////////////////////////////

        window.addEventListener('resize', function(){ $scope.$digest(); });

        $scope.$watchCollection(function(){
            return $aa.map(sizes, function(s){ return s.element[s.elementAttr]; });
        }, update, true);

        //watch();

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

        function getClassFromObj(aaRSizeObj)
        {
            return aaRSizeObj.attr + '-' + aaRSizeObj.elementName + '-' + aaRSizeObj.elementAttr + '-' + aaRSizeObj.size;
        }

        function isBindable(aaRSizeObj)
        {
            return c.bindableClass.indexOf(aaRSizeObj.elementName) >= 0;
        }

        function getAttrForCss(jsAttr)
        {
            switch(jsAttr){
                case 'lineHeight':
                    return 'line-height';
            }

            return jsAttr;
        }

        //////////////////////////////

        /*
        function watch()
        {
            var s = $aa.map(sizes, function(s){ return s.element[s.elementAttr]; });

            if(sizes.length && !angular.equals(s,o))
            {
                update();
                o = s;
            }

            $timeout(watch, DEBOUNCE);
        }
        */

        function update()
        {
            var styles = [];

            $aa.map(sizes, function(t){
                if(!isBindable(t))
                    t.target[0].style[t.attr] = getValueFromObj(t);
                else {
                    var x = '.' + getClassFromObj(t);
                    if(styles.indexOf(x) == -1) styles[x] = getAttrForCss(t.attr) + ':' + getValueFromObj(t) + ';';
                }
            });

            styles = $aa.map(styles,function(v,k){ return k+'{' + v + '}'; });
            updateStyle(typeof styles === 'string' ? styles : styles.join(''));
        }

        //////////////////////////////

        function appendStyle(fn)
        {
            var head = document.head || document.getElementsByTagName('head')[0];
            var style = document.createElement('style');

            style.type = 'text/css';
            style.title = 'aa-r-size';

            fn && fn.call(style);

            head.appendChild(style);

            return style;
        }

        function updateStyle(css)
        {
            if(currentStyle) currentStyle.remove();

            currentStyle = appendStyle(function(){
                if(this.styleSheet)
                    this.styleSheet.cssText = css;
                else
                    this.appendChild(document.createTextNode(css));
            });
        }
    }
    aaResponsiveSizeFactory.$inject = ['$rootScope', '$aa'];

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
            var aaRSizeObj = aaRSizeSanitize($scope.sizes);

            $aaRSize.add(aaRSizeObj);

            $aa.map(aaRSizeObj, function(obj){
                if($aaRSize.isBindable(obj))
                    $element.addClass($aaRSize.getClassFromObj(obj));
            })

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

                        $aa.map(string.trim().split(' '), function(e){
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