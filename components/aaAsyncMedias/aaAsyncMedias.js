/**
 * Aloengular Async Image
 * @return DIRECTIVE aaImg, SERVICE $aaImg
 */
 (function(){

   'use strict';

    angular
        .module('aloengular.asyncMedias', [])
        .factory('$aaMedias', aaMediasFactory)
   ;

    ////////////////////////////////////////

    function aaMediasFactory($rootScope, $q, $timeout)
    {
        var _init = false;

        $rootScope.$watch(function(){ return $rootScope.asyncMedias ? $rootScope.asyncMedias.length : null; }, function(n){
            if(n && _init) init();
        });

        return init;

        ////////////////////////////////////////

        function init()
        {
            var d = $q.defer(), i, objs, objsLen;

            _init = true;


            $timeout(function(){
                objs = $rootScope.asyncMedias || [];
                objsLen = objs.length;

                for(i in objs) sendRequest(objs[i]);
            }, 33);

            return d.promise;

            ////////////////////////////////////////

            function sendRequest(obj){
                if(obj.$scope.loaded == true || obj.$scope.inProg == true) return;
                obj.$scope.inProg = true;

                var xhr = (XMLHttpRequest ? new XMLHttpRequest() : new ActiveXObject('Microsoft.XMLHTTP'));

                xhr.open('GET', obj.$scope.src, true);
                if(!obj.$scope.svg) xhr.responseType = 'arraybuffer';

                xhr.onload = function(e) {
                    if(xhr.response){
                        if(obj.$scope.svg){
                            obj.$scope.result = xhr.response;
                        } else {
                            var blob = new Blob([xhr.response]);
                            obj.$scope.result = window.URL.createObjectURL(blob);
                        }
                        addPerc(obj, 100);
                    }
                }

                xhr.addEventListener('progress', function(e) {
                    addPerc(obj, (e.loaded / (e.total || 0)) * 100);
                });
                obj.$element[0].addEventListener('error', function(err){
                    // Nothing to see here...
                    console.log('err', err);
                    // Will throw a MediaError code 4
                    console.log('obj err', obj.$element[0].error);
                });


                xhr.send();

                return;
            }

            ////////////////////////////////////////

            function addPerc(obj, p)
            {
                $rootScope.$apply(function(){
                    obj.$scope.loadPerc = round(p, 2);
                });

                var total = 0, loaded = [], onePercImg = 100 / objsLen;

                for(i in objs){
                    total += round((onePercImg * objs[i].$scope.loadPerc) / 100, 2);
                    if(objs[i].$scope.loaded) loaded.push(objs[i]);
                }

                d.notify({ percentage : Math.round(total), loaded: loaded });

                if(total >= 100 || loaded.length >= objsLen)
                    d.resolve();


            }

            function round(value, decimals) {
                return Number(Math.round(value+'e'+decimals)+'e-'+decimals);
            }
        }
    }
    aaMediasFactory.$inject = ['$rootScope', '$q', '$timeout'];

})();

