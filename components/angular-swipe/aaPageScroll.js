/**
 * Aloengular
 */
(function(){

  'use strict';

    angular
        .module('aloengular.pageScroll', [])
        .directive('aaPageScroll', PageScrollDirective)
        .directive('aaPage', PageDirective)
    ;

    ////////////////////////////

    function PageScrollDirective($aaMediaQuery, $timeout)
    {
        return {
            restrict: 'E',
            replace: true,
            transclude: true,
            scope: {
                id: '@',
                animation_duration: '=animation_duration',
                onChangePageStart: '&',
                onChangePageEnd: '&'
            },
            template: '<div ng-swipe-top="next(event)" ng-swipe-bottom="prev(event)" class="aa-page-scroll" ng-transclude></div>',
            controller: ['$scope', '$element', '$attrs', PageScrollController]
        }

        /////////////////////////

        function PageScrollController($scope, $element, $attrs)
        {
            var c = this,
                allpages = [],
                pages = [],
                currentPage = 0,
                inAnim = false,
                ANIMATION_DURATION = 1200,
                transformReg = /\.*translateY\((.*)px\)/i,
                e = $element[0],
                lastScroll = 0
            ;

            $scope.id = $scope.id ? $scope.id : 'page-scroll_' + Math.random().toString(36).substring(18);
            $scope.next = next;
            $scope.prev = prev;

            ANIMATION_DURATION = $scope.animation_duration ? $scope.animation_duration : ANIMATION_DURATION;

            c.addPage = addPage;

            $element.bind('DOMMouseScroll wheel mousewheel', scroll);

            angular
                .element(window)
                    .bind('resize', function(){
                        $timeout(function(){
                            checkMediaQuery();
                            $timeout(function(){ go(currentPage < pages.length ? currentPage : pages.length - 1); });
                        }, 250);
                    })
                    .bind('keydown', function(e){
                        switch(e.keyCode){
                            case 40: //giu
                                next();
                                break;
                            case 38: //su
                                prev();
                                break;
                        }
                    });
            ;

            return c;

            /////////////////////////////////////

            function addPage(scope, element)
            {
                element[0].id = scope.id ? scope.id : $scope.id + '_page_' + (allpages.length + 1);
                allpages.push({ scope: scope, element: element });

                checkMediaQuery();
                /*if(pages.length == 1){
                    element.addClass('current-page-index');
                }*/
            }

            function checkMediaQuery()
            {
                var p, a = [];

                for(p in allpages)
                    if(!allpages[p].scope.mediaQuery || (allpages[p].scope.mediaQuery && $aaMediaQuery[allpages[p].scope.mediaQuery]())){
                        allpages[p].scope.visible = true;
                        a.push(allpages[p]);
                    } else {
                        allpages[p].scope.visible = false;
                    }

                pages = a;
            }

            function next(event){
                np(event, 1);
            }
            function prev(event){
                np(event, -1);
            }

            function np(event, t){
                if(e.style.transform == '')
                    currentPage = 0;

                go(currentPage + t);
            }

            function go(pageIndex)
            {
                if(pageIndex >= 0 && pageIndex < pages.length)
                {
                    $scope.$evalAsync(function(){
                        $scope.onChangePageStart() && $scope.onChangePageStart()({ index: pageIndex, id: pages[pageIndex].scope.id });
                    });

                    if(currentPage < pages.length)
                        pages[currentPage].element.removeClass('current-page-index');

                    if(pageIndex > 0)
                        pages[pageIndex - 1].element.removeClass('current-page-index');

                    pages[pageIndex].element.addClass('current-page-index');

                    inAnim = true;

                    var yTrans = transformReg.exec(e.style.transform);
                    yTrans = yTrans ? Math.abs(Number(yTrans[1])) : 0;

                    e.style.webkitTransform = 'translateY(-' + getPageTranslatePosition(pageIndex) + 'px)';
                    e.style.mozTransform = 'translateY(-' + getPageTranslatePosition(pageIndex) + 'px)';
                    e.style.msTransform = 'translateY(-' + getPageTranslatePosition(pageIndex) + 'px)';
                    e.style.transform = 'translateY(-' + getPageTranslatePosition(pageIndex) + 'px)';

                    $timeout(function(){
                        currentPage = pageIndex;
                        inAnim = false;
                        $timeout(function(){ lastScroll = 0; }, 600);
                        $scope.onChangePageEnd() && $scope.onChangePageEnd()(currentPage);
                    }, ANIMATION_DURATION);
                }
            }

            function getPageTranslatePosition(pageIndex)
            {
                var p = pageIndex * document.body.offsetHeight;

                if(p + document.body.offsetHeight > e.offsetHeight)
                    return p - pages[pageIndex].element[0].offsetHeight;

                return p;
            }

            function scroll(evt)
            {
                var now = Date.now();


                if(!inAnim && (now - lastScroll) > 100)
                {
                    var e0 = evt.originalEvent,
                        delta = evt.wheelDelta || -evt.detail || (e0 ? e0.wheelDelta || -e0.detail : 0);

                    if(delta == 0)
                        return;

                    evt.preventDefault();
                    evt.stopPropagation();

                    if(e.style.transform == '')
                        currentPage = 0;

                    go(currentPage + (delta > 0 ? -1 : 1));
                }
                lastScroll = now;
            }
        }
    }
    PageScrollDirective.$inject = ['$aaMediaQuery', '$timeout'];

    /////////////////////////

    function PageDirective()
    {
        return {
            require: '^^aaPageScroll',
            replace: true,
            transclude: true,
            scope: {
                id: '@?pageId',
                height: '=?',
                mediaQuery: '@?'
            },
            link: function(scope, element, attrs, pageCtrl) {
                pageCtrl.addPage(scope, element);
            },
            template: '<div class="aa-page-scroll-page"><div ng-show="visible" class="aa-page" aa-r-size="[{ attr: \'height\', element: \'body\', elementAttr: \'offsetHeight\', size: height }, { attr: \'lineHeight\', element: \'body\', elementAttr: \'offsetHeight\', size: height }]" ng-transclude></div></div>'
        }
    }
    PageDirective.$inject = [];


})();
