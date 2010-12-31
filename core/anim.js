//anim.js

Cold.add('Cold.anim', ['Cold.dom'], function(){
	var _id = Cold.dom.$E,
		_css = Cold.dom.css,
		$void = function(){},
		BACK_CONST = 1.70158,
		$time = Date.now || function(){
			return +new Date;
		};

	var Easing = {
		'linear' : function(t){
			return t;
		},
		'easeIn' : function(t){
			return t * t;
		},
		'easeOut' : function(t) {
			return ( 2 - t) * t;
		},
		'easeBoth' : function(t){
			return (t *= 2) < 1 ?
				.5 * t * t :
				.5 * (1 - (--t) * (t - 2));
		},
		'easeInStrong' : function(t){
			return t * t * t * t;
		},
		'easeOutStrong' : function(t){
			return 1 - (--t) * t * t * t;
		},
		'easeBothStrong' : function(t){
			return (t *= 2) < 1 ?
				.5 * t * t * t * t :
				.5 * (2 - (t -= 2) * t * t * t);
		},
		'elasticIn' : function(t){
			var p = .3, s = p / 4;
			if (t === 0 || t === 1) return t;
			return -(Math.pow(2, 10 * (t -= 1)) * Math.sin((t - s) * (2 * Math.PI) / p));
		},
		'elasticOut' : function(t){
			var p = .3, s = p / 4;
			if (t === 0 || t === 1) return t;
			return Math.pow(2, -10 * t) * Math.sin((t - s) * (2 * Math.PI) / p) + 1;
		},
		'elasticBoth' : function(t){
			var p = .45, s = p / 4;
			if (t === 0 || (t *= 2) === 2) return t;

			if (t < 1) {
				return -.5 * (Math.pow(2, 10 * (t -= 1)) *
					Math.sin((t - s) * (2 * Math.PI) / p));
			}
			return Math.pow(2, -10 * (t -= 1)) *
				Math.sin((t - s) * (2 * Math.PI) / p) * .5 + 1;
		},
		'backIn' : function(t){
			if (t === 1) t -= .001;
			return t * t * ((BACK_CONST + 1) * t - BACK_CONST);
		},
		'backOut' : function(t){
			return (t -= 1) * t * ((BACK_CONST + 1) * t + BACK_CONST) + 1;
		},
		'backBoth' : function(t){
			if ((t *= 2 ) < 1) {
				return .5 * (t * t * (((BACK_CONST *= (1.525)) + 1) * t - BACK_CONST));
			}
			return .5 * ((t -= 2) * t * (((BACK_CONST *= (1.525)) + 1) * t + BACK_CONST) + 2);
		},
		'bounceIn' : function(t){
			return 1 - Easing.bounceOut(1 - t);
		},
		'bounceOut' : function(t){
			var s = 7.5625, r;
			if (t < (1 / 2.75)) {
				r = s * t * t;
			}
			else if (t < (2 / 2.75)) {
				r = s * (t -= (1.5 / 2.75)) * t + .75;
			}
			else if (t < (2.5 / 2.75)) {
				r = s * (t -= (2.25 / 2.75)) * t + .9375;
			}
			else {
				r = s * (t -= (2.625 / 2.75)) * t + .984375;
			}
			return r;
		},
		'bounceBoth' : function(t){
			if (t < .5) {
				return Easing.bounceIn(t * 2) * .5;
			}
			return Easing.bounceOut(t * 2 - 1) * .5 + .5;
		}
	};

	var _effect = function(){
		this.init.apply(this, arguments);
	};

	_effect.DefaultOption = {
		'fps'		: 13,
		'duration'	: 2000,
		'onStart'	: $void,
		'onComplete': $void,
		/*
		'onPause'	: $void,
		'onResume'	: $void,
		*/
		'easing'	: 'linear'
	};

	_effect.prototype = (function(){
		var queue = {};
		return {
			init : function(el, props, option){
				this.el = _id(el);
				this.props = props || {};
				this.from = {}
				this.to = {};
				for(var p in this.props){
					var temp = parseFloat(this.props[p]);
					if(temp){
						this.from[p] = parseFloat(this.el[p] || _css(this.el, p));
						//console.info(p+" : "+this.from[p]);
						this.to[p] = temp;
					}
				}
				option = option || {};
				Cold.extend(_effect.DefaultOption, option, true);
				Cold.extend(this, _effect.DefaultOption, true);
				//this.current = 0;
			},
			step : function(){
				var now = $time();
				//console.info(this.begin + " " + now + " " + this.end);
				if(now < this.end){
					this.update((now - this.begin) / this.duration);
				}
				else{
					this.stop && this.stop();
					this.update(1);
					this.onComplete && this.onComplete();
				}
			},
			update : function(progress){
				for(var p in this.props){
					var pos = this.compute(this.from[p], this.to[p], progress);
					//console.info(this.from[p] + " " + pos + " " + this.to[p]);
					if(p in this.el.style){
						if(p !== 'opacity') pos = parseInt(pos, 10) + 'px';
						_css(this.el, p, pos);
					}
					else{
						this.el[p] = pos;
					}
				}
			},
			compute : function(from, to, progress){
				return from + (to - from) * Easing[this.easing || 'linear'](progress);
			},
			pause : function(){
				this.paused = true;
			},
			resume : function(){
				this.paused = false;
			},
			reset : function(){
				this.update(0);
				this.stop();
			},
			start : function(inQueue){
				inQueue = inQueue || false;
				var f = (function(that){
					return function(){
						that.begin = $time();
						that.end = that.begin + that.duration;

						var old = that.onComplete, next;
						that.onStart && that.onStart();

						that.onComplete = function(){
							old && old();
							//console.info(queue[that.el].length);
							next = queue[that.el].shift();
							next && next();
						};

						that.timer = setInterval(function(){
							!that.paused && that.step.call(that);
						}, that.fps || _effect.DefaultOption.fps);
					};
				})(this);
				if(!(this.el in queue)) queue[this.el] = [];
				inQueue ? queue[this.el].push(f) : f();
			},
			stop: function(){
				this.timer && clearInterval(this.timer);
			}
		};
	})();

	var _runBuilder = function(inQueue){
		inQueue = inQueue || false;
		return function(el, props, callback, duration, easing){
			if(Cold.isFunction(callback)){
				option = {};
				option.onComplete = callback;
				option.duration = duration;
				option.easing = easing;
			}
			else{
				option = callback;
			}
			var anim = new _effect(el, props, option);
			anim.start(inQueue);
		};
	};

	/* run 和 queue的不同之处在于，run直接执行，queue会等到它前面的run和queue执行完了才执行 */
	var run = _runBuilder();

	/* queue在第一个出现时，效果和run一样 */
	var queue = _runBuilder(true);

	var move = function(){
		
	};

	var fade = function(el, to, callback, duration, easing){
		var anim = new _effect(el, { opacity : to },{
			'duration' : duration,
			'onComplete' : callback,
			'easing' : easing
		}, option);
		anim.start();
	};

	var fadeIn = function(el, callback, duration, easing){
		var anim = new _effect(el, { opacity : 0 },{
			'duration' : duration,
			'onComplete' : function(){},
			'easing' : easing
		}, option);
		anim.start();
	};

	var fadeOut = function(el, callback, duration, easing){
		var anim = new _effect(el, { opacity : 1 },{
			'duration' : duration,
			'onComplete' : callback,
			'easing' : easing
		}, option);
		anim.start();
	};

	var slide = function(el, to, callback, duration, easing){
		var anim = new _effect(el, { height : to },{
			'duration' : duration,
			'onComplete' : function(){},
			'easing' : easing
		}, option);
		anim.start();
	};

	return {
		run			: run,
		queue		: queue,
		move		: move,
		fade		: fade,
		fadeIn		: fadeIn,
		fadeOut		: fadeOut,
		slide		: slide,
		Easing		: Easing
	};
});