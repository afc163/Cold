//anim.js

Cold.add('Cold.anim', ['Cold.dom'], function(){
	var _id = Cold.dom.$E,
		_css = Cold.dom.css,
		_val = Cold.dom.val,
		$void = function(){};

	var _effect = function(){
		this.init.apply(this, arguments);
	};

	_effect.DefaultOption = {
		'fps'		: 40,
		'duration'	: 2000,
		'onStart'	: $void,
		'onPlay'	: $void,
		'onComplete': $void,
		'easing'	: function(){
		}
	};

	_effect.prototype = (function(){
		var queue = [];
		return {
			init : function(el, props, option){
				var op = this.DefaultOption;
				el = _id(el);
				props = props || {};
				Cold.extend(op, option, true);
			},
			start: function(){
				return 'start';
			},
			stop: function(){}
		};
	})();

	var _run = function(el, props, option){
		var anim = new _effect(el, props, option);
		return anim.start();
	};

	var _move = function(){
		
	};

	var _slide = function(){
	
	};

	var _fade = function(){
		
	};

	var _show = function(){
	
	};

	var _hide = function(){
	
	};

	return {
		run		: _run,
		move	: _move,
		fade	: _fade,
		slide	: _slide,
		show	: _show,
		hide	: _hide,
		effect	: _effect
	};
});