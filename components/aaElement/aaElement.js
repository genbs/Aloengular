(function(){

	'use strict';

	angular
		.module('aloengular.element', [])
		.factory('$aa', aaElementConstructor)
	;

	////////////////////////////////////////

	function aaElementConstructor(element)
	{
		var e = element;
		if(typeof e == 'string')
			e = document.querySelector(element);

		if(!e) throw new Error('[Aloengular@$aa] elemento "' + element + '" non trovato.');

		return new aaElement(!e.length ? [e] : e);
	}

	function aaElement(elements)
	{
		var len = elements.length;
		if(len > 0)
			for(var i = 0; i < len; i++)
				this[i] = els[i];

		this.length = len;
		return this;
	}
	aaElement.prototype


})();