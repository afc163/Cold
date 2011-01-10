//cold.js

(function(){

	//伪onload，只有在add函数里会被执行
	var _onAdd = function(node, onAdd){
		var old = node.callback;
		node.callback = function(){
			node.callback = null;
			old && old();
			onAdd && onAdd();
		};
	};

	var _scriptOnload = document.createElement('script').readyState ?
	function(node, callback, onAdd) {
		var old = node.onreadystatechange;
		node.onreadystatechange = function(){
			if ((/loaded|complete/).test(node.readyState)){
				node.onreadystatechange = null;
				old && old();
				callback.call(this);
			}
		};
		onAdd && _onAdd(node, onAdd);
	} :
	function(node, callback, onAdd) {
		node.addEventListener('load', callback, false);
		onAdd && _onAdd(node, onAdd);
	};

	var _checkNs = function(ns){
		if(!/^\s*Cold/.test(ns)) return 'Cold.' + ns;
		return ns;
	};

	var _getUrl = function(ns){
		var url = ns;
		if(!(/component|util|task|other/g.test(ns))){
			url = ns.replace(/Cold/i,'Cold.core');
		}
		return cold.BaseURL + url.replace(/\./g,'/') + '.js';
	};

	var cold = {

		VERSION: '0.0.1',

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

		//namespace必须与文件路径相对应,namspace是获得当前文件路径的唯一标识
		add: function(namespace, req, doFunc){
			_checkNs(namespace);
			var names = namespace.split('.'),
				namesLen = names.length,
				space = window,
				node = cold.scripts.nodes[_getUrl(namespace)];
			var func = (function(f){
				return function(){
					if(!(names[0] in window)){
						window[names[0]] = {};
					}
					for(var i = 0, n; i < namesLen; i++){
						n = names[i];
						if(i === namesLen - 1 && typeof f === 'function'){
							if(space[n])	cold.extend(space[n], f());
							else			space[n] = f();
							break;
						}
						(!space[n]) && ( space[n] = {} );
						space = space[n];
					}
					node && node.callback && node.callback();
				};
			})(typeof req === 'function' ? req : doFunc);

			//check req
			if(typeof req !== 'function' && req.length > 0){
				var reqNum = req.length;
				return cold.load(req, function(){
					--reqNum === 0 && func();
				});
			}
			else{
				func();
			}
			return cold;
		},

		addScript: function(url, onComplete, onAdd){
			var s = document.createElement('script'),
				head = document.getElementsByTagName('head')[0],
				cs = cold.scripts;
			s.setAttribute('type', 'text/javascript');
			s.setAttribute('src', url);
			//for firefox 3.6
			s.setAttribute('async', true);
			head.appendChild(s);
			_scriptOnload(s, function(){
				onComplete && onComplete.call();
				head.removeChild(s);
			}, function(){
				onAdd && onAdd();
			});
			cs.nodes[url] = s;
			return cold;
		},

		loadSingle: function(namespace, callback){
			namespace = _checkNs(namespace);
			var cs = cold.scripts,
				URL = _getUrl(namespace),
				node = cs.nodes[URL];
			
			if(cs[namespace] === 'loaded'){
				typeof callback === 'function' && callback.call();
			}
			//通过缓存所有script节点，给正在载入的script添加onload事件
			//从而避免了重复请求的问题，感谢kissy loader的方法
			else if(cs[namespace] === 'loading'){
				node && _scriptOnload(node, function(){
					callback && callback.call();
				});
			}
			else{
				cs[namespace] = 'loading';
				cs['loadingNum'] 
					? (cs['loadingNum'] += 1) 
					: (cs['loadingNum'] = 1);
				cold.addScript(URL, function(){
					cs[namespace] = 'loaded';
					cs['loadingNum'] -= 1;
				},function(){
					typeof callback === 'function' && callback.call();
				});
			}
			return cold;
		},

		load: function(namespace, callback){
			namespace = namespace || [];
			if(typeof namespace === 'string'){
				return cold.loadSingle(namespace, callback);
			}
			else{
				for(var i=0, len = namespace.length; i<len; i++){
					cold.loadSingle(namespace[i], function(){
						typeof callback === 'function' && callback.call();
					});
				}
			}
			return cold;
		}
	};

	window['Cold'] = cold;

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
			funcList[i].call();
		}
		funcList = [];
	};

	var _coldReady = function(){
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
		
	var ready = function(func){
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