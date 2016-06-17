/**
 * aloengular Font

 */
(function(){

    'use strict';

    angular
        .module('aloengular.aurea', [])
        .constant('PHI', 1.618033988749895) // 05 + Math.sqrt(1.25)
        .factory('$aaAurea', aaAurea)
    ;

    ////////////////////////////////////////

    function aaAurea(PHI, $window)
    {

        return  {
            getFont: getFont
        }

        //////////////////

        function getLineHeightFromFontAndWidth(fontSize, width)
        {
            return PHI - (1 / (2 * PHI)) * (1 - (width / (Math.pow(fontSize * PHI, 2))));

        }

        function getWidthFromFontAndLineHeight(fontSize, h)
        {
            return Math.pow(fontSize * PHI, 2) * (1 + 2 * PHI * ((h / fontSize) - PHI));
        }

        function getFont(fontSize, width, lineHeight)
        {
            var h = fontSize * PHI, w = Math.pow(h, 2);

            if(typeof width !== 'undefined'){
                w = width;
                fontSize = Math.sqrt(width) / PHI;
                h = getLineHeightFromFontAndWidth(fontSize, width);
                h *= fontSize;
            } else {
                if(typeof lineHeight !== 'undefined')
                    h = lineHeight;

                w = getWidthFromFontAndLineHeight(fontSize, h);
            }

            return {
                fontSize: fontSize,
                lineHeight: h,
                width: w
            };
        }
    }
    aaAurea.$inject = ['PHI', '$window'];

})();

