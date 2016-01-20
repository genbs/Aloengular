/**
 * aloengular EE
 * @return SERVICE $aaEe
 *
 * Usage
 * inject $aaEe Factory
 *
 * $aaEe(function(){})
 * $aaEe(function(){}, )
 * $aaEe(function(){}, 'aloengular', true)
 *
 * @param Function callable
 * @param String/Ascii Code String(int) code | default aloengular.ee.KONAMI_CODE
 * @param Boolen convert | default false (true if code is string)
 *
 */
(function(){

	'use strict';

	angular
		.module('aloengular.ee', [])
		.constant('aloengular.ee.KONAMI_CODE', '38384040373937396665')
		.factory('$aaEe', aaEe)
	;

	////////////////////////////////////////

	function aaEe($window, KONAMI_CODE)
	{
		var stack = [];

		angular
			.element($window)
			.on('keydown', onKeyDown);

		return bind;

		////////////////////////////////////////

		function bind(callable, code, convert)
		{
			var i, ncode;

			ncode = code = typeof code === 'undefined' ? KONAMI_CODE : code;
			convert = typeof convert === 'undefined' ? (typeof code === 'string' ? true : false) : false;

			if(convert == true)
				for(i in code)
					ncode += (code.charCodeAt(i) - 32);

			stack.push({ code : ncode, callback : callable, keys : '' });
		}

		function onKeyDown(e)
		{
			var s;

			for(s in stack){
				s = stack[s];
				s.keys += e.keyCode;

				if(s.keys.length > s.code.length)
					s.keys = s.keys.substr((s.keys.length - s.code.length));

				if(s.keys == s.code){
					s.callback(e);
					s.keys = '';
				}
			}

			return;
		}
	}
	aaEe.$inject = ['$window', 'aloengular.ee.KONAMI_CODE'];

})();
