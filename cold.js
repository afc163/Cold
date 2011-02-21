//Cold.js

(function(){

	//伪onload，只有在add函数里会被执行
	var _scriptOnload = function(node, callback){
		var old = node.callback;
		node.callback = function(){
			node.callback = null;
			old && old();
			callback && callback();
		};
	};

	var _checkNs = function(ns){
		if(!/^\s*Cold/.test(ns)) return 'Cold.' + ns;
		return ns;
	};

	var _getUrl = function(ns){
		var url = ns, debug = Cold.DEBUG ? '/src' : '/bulid';
		if(!(/component|util|task|other/g.test(ns))){
			url = ns.replace(/cold/i,'cold.core');
		}
		url = url.replace(/\./g,'/');
		return Cold.BaseURL + url.replace(/cold/i, 'cold' + debug) + '.js';
	};

	window['Cold'] = {

		VERSION: '0.0.1',

		DEBUG: true,

		BaseURL: (function(){
			var scripts = document.getElementsByTagName('script'),
				str = scripts[scripts.length - 1].getAttribute('src'),
				re_http = /http:\/\/[^\/]*\//;
			return (str.match(re_http) || window.location.href.match(re_http))[0];
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

		add: function(namespace, req, doFunc){
			var ns = _checkNs(namespace),
				names = ns.split('.'),
				namesLen = names.length,
				space = window,
				node = Cold.scripts.nodes[_getUrl(ns)];
			var func = (function(f){
				return function(){
					var obj = typeof f === 'function' && f();
					if(obj != null) {	//当add里的函数无返回值时，不在namespace上附加属性
						if(!(names[0] in window)){
							window[names[0]] = {};
						}
						for(var i = 0, n; i < namesLen; i++){
							n = names[i];
							if(i === namesLen - 1){
								if(space[n])	Cold.extend(space[n], obj);
								else			space[n] = obj;
								break;
							}
							(!space[n]) && ( space[n] = {} );
							space = space[n];
						}
					}
					node && node.callback && node.callback();
				};
			})(typeof req === 'function' ? req : doFunc);

			//check req
			if(typeof req !== 'function' && req.length > 0){
				var reqNum = req.length;
				return Cold.load(req, function(){
					--reqNum === 0 && func();
				});
			}
			else{
				func();
			}
			return Cold;
		},

		addScript: function(url, onComplete){
			var s = document.createElement('script'),
				head = document.getElementsByTagName('head')[0],
				cs = Cold.scripts;
			s.setAttribute('type', 'text/javascript');
			s.setAttribute('src', url);
			//for firefox 3.6
			s.setAttribute('async', true);
			head.appendChild(s);
			_scriptOnload(s, function(){
				onComplete && onComplete.call();
				head.removeChild(s);
			});
			cs.nodes[url] = s;
			return Cold;
		},

		loadSingle: function(namespace, callback){
			var ns = _checkNs(namespace),
				cs = Cold.scripts,
				URL = _getUrl(ns),
				node = cs.nodes[URL];
			
			if(cs[ns] === 'loaded'){
				typeof callback === 'function' && callback.call();
			}
			//通过缓存所有script节点，给正在载入的script添加onload事件
			//从而避免了重复请求的问题，感谢kissy loader的方法
			else if(cs[ns] === 'loading'){
				node && _scriptOnload(node, function(){
					callback && callback.call();
				});
			}
			else{
				cs[ns] = 'loading';
				cs['loadingNum'] 
					? (cs['loadingNum'] += 1) 
					: (cs['loadingNum'] = 1);
				Cold.addScript(URL, function(){
					typeof callback === 'function' && callback();
					cs[ns] = 'loaded';
					cs['loadingNum'] -= 1;
				});
			}
			return Cold;
		},

		load: function(namespace, callback){
			namespace = namespace || [];
			if(typeof namespace === 'string'){
				return Cold.loadSingle(namespace, callback);
			}
			else{
				for(var i=0, len = namespace.length; i<len; i++){
					Cold.loadSingle(namespace[i], function(){
						typeof callback === 'function' && callback.call();
					});
				}
			}
			return Cold;
		}
	};

	try{
		document.domain = window.location.href.match(/http:\/\/(www\.)?([^\/]*)\//)[2];
		document.execCommand("BackgroundImageCache", false, true);
	}catch(e){}

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
			funcList[i](Cold);
		}
		funcList = [];
	};

	var _ColdReady = function(){
		if(executed === true){
			return;
		}
		if(_isComplete() === false){
			timer = setTimeout(arguments.callee, 5);
			return;
		}
		timer && clearTimeout(timer);
		_execReady.call();
		Cold.scripts.nodes = {};
	};

	var readyBounded = (function(){
		if(readyBounded){
			return;
		}
		var dscroll = document.documentElement.doScroll;
		//w3c mode
		if(document.addEventListener){
			document.addEventListener('DOMContentLoaded', _ColdReady, false);
			window.addEventListener('load', _ColdReady, false);
		}
		//ie mode
		else{
			document.attachEvent('onreadystatechange', _ColdReady);
			window.attachEvent('onload', _ColdReady);
			if(dscroll && window == window.top){
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
		
	var ready = function(func){
		if(typeof func !== 'function'){
			return;
		}
		if(executed === true || (/loaded|complete/).test(document.readyState.toLowerCase())){
			func(Cold);
		}
		else{
			funcList.push(func);
		}
	};

	var type = {};
	(function(){
		var _toString = Object.prototype.toString;
		var objTypes = ['Array', 'Function', 'String', 'Number'];
		for(var i=0, l=objTypes.length; i<l; i++){
			(function(i){
				type["is" + objTypes[i]] = function(obj){
					return _toString.call(obj) === '[object ' + objTypes[i] + ']';
				};
			})(i);
		}
	})();


	return {
		type		: type,
		isArray		: type.isArray,
		isFunction	: type.isFunction,
		isString	: type.isString,
		isNumber	: type.isNumber,
		ready		: ready
	};

});