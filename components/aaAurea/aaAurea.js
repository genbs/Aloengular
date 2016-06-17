/**
 * aloengular Font

 */
(function(){

    'use strict';

    angular
        .module('aloengular.aurea', [])
        .constant('PHI', (Math.sqrt(1.25)) + 0.5)
        .factory('$aaAurea', aaAurea)
    ;

    ////////////////////////////////////////

    function aaAurea(PHI)
    {
        var base = 100;
        var gld10 = base / PHI;
        var gld9 = base - gld10;
        var gld8 = gld9 / PHI;
        var gld7 = gld9 - gld8;
        var gld6 = gld7 / PHI;
        var gld5 = gld7 - gld6;
        var gld4 = gld5 / PHI;
        var gld3 = gld5 - gld4;
        var gld2 = gld3 / PHI;
        var gld1 = gld3 - gld2;

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
    aaAurea.$inject = ['PHI'];

})();

