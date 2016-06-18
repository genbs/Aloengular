(function(){

	'use strict';

	angular
		.module('aloengular.utils', [])
		.factory('$aa', aaUtils)
	;

	///////////////////////////

	function aaUtils()
	{
		var aa = {};

		aa.toElement = toElement;

		aa.map = map;
		aa.offset = offset;
		aa.getObj = getObjectByName;

		aa.proportion = proportion;

		aa.random = random;
		aa.ucfirst = ucfirst;
		aa.str_random = str_random;

		return aa;
	}

	///////////////////////////

	function toElement(element, toArray)
	{
		var e = element;

		if(typeof element === 'string')
			e = Array.prototype.slice.call(document.querySelectorAll(element));

		if(toArray === true)
			return isArray(e) ? e : [e];

		return isArray(e) ? (e.length == 1 ? e[0] : e) : e;
	}

	function isArray(e)
	{
		if(!Array.isArray)
			return Object.prototype.toString.call(e) === '[object Array]';

		return Array.isArray(e);
	}

	///////////////////////////

	function map(element, callable)
	{
		var results = [], k;

		element = this.toElement(element, true);

		for(k in element)
			results.push(callable.call(null, element[k], k));

		return results.length ? (results.length == 1 ? results[0] : results) : null;

		/*
		element = this.toElement(element, true);

		var e, results = [];
		for(e in element){
			var result = callable.call(null, element[e], e);
			if(typeof result !== 'undefined')
				results.push(result);
		}
		return results.length ? (results.length == 1 ? results[0] : results) : null;
		*/
	}

	///////////////////////////

	function offset(element)
	{
		return this.map(element, function(e){
			var el = e, offset = { top: 0, left: 0 };
			do{
				if(!isNaN(el.offsetTop)){
					offset.top += el.offsetTop;
					offset.left += el.offsetLeft;
				}
			}while(el = el.offsetParent);

			return offset;
		});
	}

	///////////////////////////

	function getObjectByName(name, element)
	{
		if(typeof element !== 'undefined')
			element = this.toElement(element);

		if(name === 'parent' && element)
			return element.parentNode;
		if(name === 'body')
			return document.body;

		if(name.indexOf('parent:') === 0 && element)
		{
			var p = name.split(':');

			p[0] = element; p[1] = Number(p[1]);

			do{
				p[0] = p[0].parentNode;
				p[1]--;
			} while(p[1] != 0);

			return p[0];
		}

		return window;
	}

	///////////////////////////

	function proportion(min, max, refCurrent, refMin, refMax)
	{
		var perc, x;

		if(typeof refMin === 'undefined' && typeof refMax === 'undefined')
			perc = refCurrent;
		else
			perc = (refCurrent - refMin) / (refMax - refMin) * 100;

		x = (perc * (max - min) / 100) + min;

		return x < min ? min : (x > max ? max : x);
	}

	//////////////////////////////

	function random(min, max)
	{
		return Math.random() * (max - min) + min;
	}

	function ucfirst(string)
	{
		return string.charAt(0).toUpperCase() + string.slice(1);
	}

	function str_random(length)
	{
		return Math.random().toString(36).substr(2, (length || 5) + 2);
	}

    //////////////////////////////

})();