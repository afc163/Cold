//cold.js

(function(){
	var scriptOnload = document.createElement('script').readyState ?
	function(node, callback) {
		var oldCallback = node.onreadystatechange;
		node.onreadystatechange = function(){
			if ((/loaded|complete/).test(node.readyState)){
				node.onreadystatechange = null;
				oldCallback && oldCallback();
				callback.call(this);
			}
		};
	} :
	function(node, callback) {
		node.addEventListener('load', callback, false);
	};

	var _cold = {

		VERSION: '0.0.1',

		BaseURL: (function(){
			var scripts = document.getElementsByTagName('script'),
				str = scripts[scripts.length - 1].getAttribute('src'),
				httpMatcher = /http:\/\/[^\/]*\//;
			return (str.match(httpMatcher) || window.location.href.match(httpMatcher))[0];
		})(),

		cache: {},

		scripts: {
			'loadingNum': 0,
			'nodes'		: {}
		},

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
						throw 'namespace wrong.';
					}
					if(!(names[0] in window)){
						window[names[0]] = {};
					}
					for(var i = 0, n; i < namesLen; i++){
						n = names[i];
						if(i === namesLen - 1 && typeof f === 'function'){
							if(space[n])	_cold.extend(space[n], f());
							else				space[n] = f();
							break;
						}
						(!space[n]) && ( space[n] = {} );
						space = space[n];
					}
				};
			})(typeof req === 'function' ? req : callback);

			//check req
			if(typeof req !== 'function'){
				var reqNum = req.length;
				return _cold.load(req, function(){
					if(--reqNum === 0){
						func();
					}
				});
			}
			else{
				func();
			}
			return _cold;
		},

		addScript: function(url, onComplete){
			var s = document.createElement('script'),
				head = document.getElementsByTagName('head')[0],
				cs = _cold.scripts;

			s.setAttribute('type', 'text/javascript');
			s.setAttribute('src', url);
			//for firefox 3.6
			s.setAttribute('async', true);
			head.appendChild(s);
			scriptOnload(s, function(){
				onComplete && onComplete.call();
				head.removeChild(s);
			});
			cs.nodes[url] = s;
			return _cold;
		},

		loadSingle: function(namespace, callback){
			var cs = _cold.scripts,
				node = null,
				getUrl = function(){
					var url = namespace;
					if(!(/component|util|task|other/g.test(namespace))){
						url = namespace.replace(/Cold/i,'Cold.core');
					}
					url = _cold.BaseURL + url.replace(/\./g,'/') + '.js';
					return url;
				};
			
			if(cs[namespace] === 'loaded'){
				typeof callback === 'function' && callback.call();
			}
			//通过缓存所有script节点，给正在载入的script添加onload事件
			//从而避免了重复请求的问题，感谢kissy loader的方法
			else if(cs[namespace] === 'loading'){
				if(node = cs.nodes[getUrl()]){
					scriptOnload(node, function(){
						callback && callback.call();
					});
				}
			}
			else{
				cs[namespace] = 'loading';
				cs['loadingNum'] 
					? (cs['loadingNum'] += 1) 
					: (cs['loadingNum'] = 1);
				_cold.addScript(getUrl(), function(){
					typeof callback === 'function' && callback.call();
					cs[namespace] = 'loaded';
					cs['loadingNum'] -= 1;
				});
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

	try{
		document.domain = window.location.href.match(/http:\/\/(www\.)?([^\/]*)\//)[2];
		document.execCommand("BackgroundImageCache",false,true);
	}catch(ex){}

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
			timer = setTimeout(arguments.callee, 15);
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

});