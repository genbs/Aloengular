/**
 * Aloengular media query test
 * @return FACTORY $aaMediaQuery
 */
(function(){

  'use strict';

    angular
        .module('aloengular.mediaQuery', [])
        .factory('$aaMediaQuery', aaMediaQuery);

    ////////////////////////////


    function aaMediaQuery($window)
    {

        var mqf = {};

        mqf.isPhone           = isPhone;
        mqf.isTablet          = isTablet;
        mqf.isTabletPortrait  = isTabletPortrait;
        mqf.isTabletLandscape = isTabletLandscape;
        mqf.isPortrait        = isPortrait;
        mqf.isLandscape       = function(){ return !isPortrait(); };
        mqf.isMobile          = function(){ return (isPhone() || isTablet()); };
        mqf.isDesktop         = isDesktop;

        return mqf;

        ////////////////////////////

        function isPhone(){ return $window.matchMedia('only screen and (max-width:480px)').matches; }
        function isTablet(){ return $window.matchMedia('only screen and (min-width:481px) and (max-width:992px)').matches; }
        function isTabletPortrait(){ return $window.matchMedia('only screen and (min-width:481px) and (max-width:992px) and (orientation: portrait)').matches; }
        function isTabletLandscape(){ return $window.matchMedia('only screen and (min-width:481px) and (max-width:992px) and (orientation: landscape)').matches; }
        function isPortrait(){ return $window.matchMedia('(orientation: portrait)').matches; }
        function isDesktop(){ return $window.matchMedia('only screen and (min-width:993px)').matches; }

    }
    aaMediaQuery.$inject = ['$window'];


})();
