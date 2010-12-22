//cold.js

(function(){

	var _cold = {

		VERSION: '0.0.1',

		BaseURL: (function(){
			var scripts = document.getElementsByTagName('script'),
				str = scripts[scripts.length - 1].getAttribute('src'),
				matchStr = /http:\/\/[^\/]*\//;
			return (str.match(matchStr) || window.location.href.match(matchStr))[0];
		})(),

		cache: {},

		scripts: {'loadingNum' : 0},

		addingList: [],

		extend: function(obj, exobj, overwrite){
			obj = obj || {};
			exobj = exobj || {};
			overwrite = overwrite || false;

			for(var p in exobj){
				if(overwrite){
					obj[p] = exobj[p];
				}
				else{
					if(!obj[p])	obj[p] = exobj[p];
					else		return false;
				}
            }
		},

		add: function(namespace, req, callback){
			var names = namespace.split('.'),
				namesLen = names.length,
				space = window;

			var func = (function(f){
				return function(){
					if(namesLen < 1){
						throw new Error('namespace wrong.');
					}
					if(!(names[0] in window)){
						window[names[0]] = {};
					}
					for(var i = 0; i < namesLen; i++){
						if(i === namesLen - 1 && typeof f === 'function'){
							if(space[names[i]])	_cold.extend(space[names[i]], f());
							else				space[names[i]] = f();
							break;
						}
						if(!space[names[i]]){
							space[names[i]] = {};
						}
						space = space[names[i]];
					}
				};
			})(typeof req === 'function' ? req : callback);

			var addingToList = function(){
				for(var i=0, l=_cold['addingList']; i<l; i++){
					if(_cold['addingList'][i] == func){
						return;
					}
				}
				_cold['addingList'].push(func);
			};
			//check req
			if(typeof req !== 'function'){
				var reqNum = req.length;
				return _cold.load(req, function(){
					if(--reqNum === 0){
						addingToList();
					}
				});
			}
			else{
				addingToList();
			}
			return _cold;
		},

		exec: function(){
			var adding = _cold['addingList'].shift();
			typeof adding === 'function' && adding.call();
			return _cold;
		},

		attach: function(){
			var list = _cold['addingList'], adding;
			while(adding = list.shift()){
				typeof adding === 'function' && adding.call();
			}
			return _cold;
		},

		addScript: function(url, onComplete){
			var s = document.createElement('script'),
				head = document.getElementsByTagName('head')[0],
				loaded = false;
			s.setAttribute('type', 'text/javascript');
			s.setAttribute('src', url);
			//for firefox 3.6
			s.setAttribute('async', true);
			head.appendChild(s);
			s.onerror = s.onload = s.onreadystatechange = function(){
				if(!loaded && (!this.readyState || (/loaded|complete/).test(this.readyState))){
					loaded = true;
					s.onerror = s.onload = s.onreadystatechange = null;
					if(typeof onComplete === 'function'){
						onComplete.call();
					}
					head.removeChild(s);
				}
			};
			return _cold;
		},

		loadSingle: function(namespace, callback){
			var url = namespace,
				cs = _cold.scripts;
			
			//为了维护依赖的载入顺序，不对正在载入的进行检查，但是这样会造成重复请求，真是头疼
			if(cs[namespace] !== 'loaded'){
				cs['loadingNum'] 
					? (cs['loadingNum'] += 1) 
					: (cs['loadingNum'] = 1);

				if(!(/component|util|task|other/g.test(namespace))){
					url = namespace.replace(/Cold/i,'Cold.core');
				}
				url = _cold.BaseURL + url.replace(/\./g,'/') + '.js';
				
				_cold.addScript(url, function(){
					typeof callback === 'function' && callback.call();
					cs[namespace] = 'loaded';
					if(--cs['loadingNum'] === 0){
						_cold.attach();
					}
				});
			}
			else{
				typeof callback === 'function' && callback.call();
			}
			return _cold;
		},

		load: function(namespace, callback){
			namespace = namespace || [];
			if(typeof namespace === 'string'){
				return _cold.loadSingle(namespace, callback);
			}
			else{
				for(var i=0, len = namespace.length; i<len; i++){
					_cold.loadSingle(namespace[i], function(){
						typeof callback === 'function' && callback.call();
					});
				}
			}
			return _cold;
		}
	};

	window['Cold'] = _cold;

})();

Cold.add('Cold', function(){

	var funcList = [],
		timer = null,
		executed = false;

	var _isComplete = function(){
		return (Cold.scripts['loadingNum'] === 0);
	};

	var _execReady = function(){
		if(executed === true){
			return;
		}
		executed = true;
		for(var i=0, l=funcList.length; i < l; i++){
			funcList[i].call();
		}
		funcList = [];
	};

	var _coldReady = function(){
		if(executed === true){
			return;
		}
		if(_isComplete() === false){
			timer = setTimeout(arguments.callee, 25);
			return;
		}
		timer && clearTimeout(timer);
		_execReady.call();
	};

	var readyBounded = (function(){
		if(readyBounded){
			return;
		}
		var doc = document,
			win = window,
			dscroll = doc.documentElement.doScroll;

		//w3c mode
		if(doc.addEventListener){
			doc.addEventListener('DOMContentLoaded', _coldReady, false);
			win.addEventListener('load', _coldReady, false);
		}
		//ie mode
		else{
			doc.attachEvent('onreadystatechange', _coldReady);
			win.attachEvent('onload', _coldReady);
			if(dscroll && win == win.top){
				(function(){				
					try{
						dscroll('left');
					}
					catch(ex){
						setTimeout(arguments.callee, 0);
					}
				})();
			}
		}
		return true;
	})();
		
	var _ready = function(func){
		if(typeof func !== 'function'){
			return;
		}
		if(executed === true || (/loaded|complete/).test(document.readyState.toLowerCase())){
			func.call();
		}
		else{
			funcList.push(func);
		}
	};

	var _type = {};
	(function(){
		var _toString = Object.prototype.toString;
		var objTypes = ['Array', 'Function', 'String', 'Number'];
		for(var i=0, l=objTypes.length; i<l; i++){
			(function(i){
				_type["is" + objTypes[i]] = function(obj){
					return _toString.call(obj) === '[object ' + objTypes[i] + ']';
				};
			})(i);
		}
	})();

	return {
		type		: _type,
		isArray		: _type.isArray,
		isFunction	: _type.isFunction,
		isString	: _type.isString,
		isNumber	: _type.isNumber,
		ready		: _ready
	};

}).exec();