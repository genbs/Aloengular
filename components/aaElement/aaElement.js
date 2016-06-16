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
	aaElement.prototype = {
		map: function(callable){
			var e, results = [];
			for(e in this){
				var result = callable.call(this[e]);
				if(typeof result !== 'undefined')
					results.push(result);
			}
			return results.length ? (results.length == 1 ? results[0] : results) : this;
		},
		offset: function(){
			return this.map(function(e){
				var el = e, offset = { top: 0, left: 0 };
				do{
					if(!isNaN(el.offsetTop)){
						offset.top += el.offsetTop;
						offset.left += el.offsetLeft;
					}
				}while(el = el.offsetParent);

				return offset;
			});

		},
		offset: function(element){
			var el = element.length ? element[0] : element;

			var offset = { top: 0, left: 0 };
			do{
				if(!isNaN(el.offsetTop)){
					offset.top += el.offsetTop;
					offset.left += el.offsetLeft;
				}
			}while(el = el.offsetParent);

			return offset;
		}
	}


})();