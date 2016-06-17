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
            getFontSpecByFontSize: getFontSpecByFontSize,
            getFontSpecByWidth: getFontSpecByWidth
        }

        //////////////////

        /*
        */
        function getLineHeightFromFontAndWidth(fontSize, width)
        {
            return PHI - (1 / (2 * PHI)) * (1 - (width / (Math.pow(fontSize * PHI, 2))));

        }

        function getWidthFromFontAndLineHeight(fontSize, h)
        {
            return Math.pow(fontSize * PHI, 2) * (1 + 2 * PHI * ((h / fontSize) - PHI));
        }

        //////////////////////////////

        function getFontSpecByWidth(width)
        {
            var fontSize, h;

            fontSize = Math.sqrt(width) / PHI;
            //h = getLineHeightFromFontAndWidth(fontSize, width);
            h = fontSize * PHI

            return {
                fontSize: fontSize,
                lineHeight: h,
                width: width
            };
        }

        function getFontSpecByFontSize(fontSize)
        {
            var h, w;

            //w = getWidthFromFontAndLineHeight(fontSize, fontSize * PHI);
            //h = getLineHeightFromFontAndWidth(fontSize, w);
            h = fontSize * PHI
            w = Math.pow(h, 2);

            return {
                fontSize: fontSize,
                lineHeight: h,
                width: w
            };
        }
    }
    aaAurea.$inject = ['PHI'];

})();

