//Cold.js

(function(){
	//伪onload，在add函数中执行
	var _onAdd = function(node, callback){
		var old = node.callback;
		node.callback = node.onerror = function(){
			node.callback = node.onerror = null;
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
		if(!(/app|component|util|task|other/g.test(ns))){
			url = ns.replace(/cold/i,'cold.core');
		}
		url = url.replace(/\./g,'/');
		return Cold.BaseURL + url.replace(/cold/i, 'cold' + debug) + '.js';
	};

	var _checkReq = function(ns, req){
		var i, l, cr = Cold.reqList;
		ns = _checkNs(ns);
		cr[ns] = cr[ns] || [];
		//1.检查ns对应的reqList中是否同req重复
		for(i=0, l=req.length; i<l; i++){
			req[i] = _checkNs(req[i]);
			_exist(cr[ns], req[i]) && req.splice(i, 1); //如果有，删掉对应的req
		}
		//2.检查req中是否同ns重复，如果有，删掉对应的req
		var num = _exist(req, ns);
		num && req.splice(num-1, 1);	//如果有，删掉对应的req
		//3.把ns及其reqList一起加到每个req对应的reqList中
		for(i=0,l=req.length; i<l; i++){
			cr[req[i]] = cr[req[i]] || [];
			cr[req[i]].push(ns);
			cr[req[i]] = cr[req[i]].concat(cr[ns]);
		}
	};

	var _exist = function(list, item){
		if(list){
			for(var i=0,l=list.length; i<l; i++){
				if(list[i] === item)
					return i+1;
			}
		}
		return false;
	};

	window['Cold'] = {
		/** 
		* 当前版本
		* @type String
		*/
		VERSION: '0.0.1',
		/** 
		* 调试模式（true调用未压缩版本并输出调试信息）
		* @type Boolean
		*/
		DEBUG: true,
		/** 
		* cold.js文件所在的路径
		* @type String
		*/
		BaseURL: (function(){
			var scripts = document.getElementsByTagName('script'),
				str = scripts[scripts.length - 1].getAttribute('src'),
				re_http = /http:\/\/[^\/]*\//;
			return (str.match(re_http) || window.location.href.match(re_http))[0];
		})(),
		/** 
		* 各种对象的缓存区，尚未好好利用
		* @type Object
		*/
		cache: {},
		/** 
		* 存储模块状态
		* loadingN : 表示当前正在载入的模块数
		* nodes : 存储模块所对应的script节点
		* @type Object
		*/
		scripts: {
			'loadingN': 0,
			'nodes'		: {}
		},
		/** 
		* 存储依赖关系
		* @type Object
		*/
		reqList: {},
		/** 
		* 扩展对象
		* @type method
		* @param {Object} obj 表示被扩展的对象
		* @param {Object} exobj 扩展对象
		* @param {Boolean} overwrite 是否复写同名属性
		* @return {void} 
		*/
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
			return obj;
		},
		/** 
		* 模块定义
		* @type method
		* @param {String} namespace 模块名，模块命名空间
		* @param {Array|Function} req 依赖模块表，或doFunc
		* @param {Function} doFunc 模块执行函数，返回值用于扩展namespace对应的对象
		× @example
		* Cold.add('Cold.dom', ['Cold.browser'], function(){
		*     //...
		* });
		* @return Cold
		*/
		add: function(namespace, req, doFunc){
			var ns = _checkNs(namespace),
				names = ns.split('.'),
				namesLen = names.length,
				space = window,
				cs = Cold.scripts,
				node = cs.nodes[_getUrl(ns)];
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
					cs[ns] = 'attached';
				};
			})(typeof req === 'function' ? req : doFunc);

			//js file loaded
			if(cs[ns]) cs[ns] = 'loaded';

			if(typeof req !== 'function' && req.length > 0){
				_checkReq(ns, req);
			}
			if(typeof req !== 'function' && req.length > 0){
				var reqNum = req.length;
				return Cold.load(req, function(){
					--reqNum === 0 && func();
				});
			}
			func();
			return Cold;
		},
		/** 
		* 依赖于某些模块的执行代码，不需要等到domReady就可以执行
		* @type method
		* @param {Array|Function} req 依赖模块表，或doFunc
		* @param {Function} doFunc 具体执行代码，不需要有返回值
		× @example
		* Cold.task(['dom', 'ajax'], function(){
		*     //...
		* });
		* @return Cold
		*/
		task: function(req, doFunc){
			if(typeof req === 'function'){
				req();
			}
			else if(req.length > 0){
				var reqNum = req.length;
				return Cold.load(req, function(){
					--reqNum === 0 && doFunc && doFunc();
				});
			}
			else{
				doFunc && doFunc();
			}
			return Cold;
		},
		/** 
		* 动态载入js文件
		* @type method
		* @param {String} url js文件url
		* @param {Function} onComplete 回调函数，伪回调，只有当js文件中有Cold.add函数时才会处理回调。因此不建议外部使用这个函数载入js文件
		× @example
		* Cold.addScript('http://someurl.com/cold/core/dom.js', function(){
		*     //...
		* });
		* @return Cold
		*/
		addScript: function(url, onComplete){
			var s = document.createElement('script'),
				head = document.getElementsByTagName('head')[0],
				cs = Cold.scripts;
			s.setAttribute('type', 'text/javascript');
			s.setAttribute('src', url);
			//for firefox 3.6
			s.setAttribute('async', true);
			head.appendChild(s);
			_onAdd(s, function(){
				onComplete && onComplete.call();
				head.removeChild(s);
			});
			cs.nodes[url] = s;
			return Cold;
		},
		/** 
		* 载入单个模块
		* @type method
		* @param {String} namespace 模块名
		* @param {Function} callback 回调函数（放在对应script节点的callback属性中，由add函数进行调用）
		* @return Cold
		*/
		loadSingle: function(namespace, callback){
			var ns = _checkNs(namespace),
				cs = Cold.scripts,
				URL = _getUrl(ns),
				node = cs.nodes[URL];
			//当状态为attached时，依赖项已经存在，直接执行便可
			if(cs[ns] === 'attached'){
				typeof callback === 'function' && callback.call();
			}
			//通过缓存所有script节点，给正在载入的script添加onload事件
			//从而避免了重复请求的问题，感谢kissy loader的方法
			else if(cs[ns] === 'loading' || cs[ns] === 'loaded'){
				node && _onAdd(node, function(){
					callback && callback.call();
				});
			}
			else{
				cs[ns] = 'loading';
				cs['loadingN'] 
					? (cs['loadingN'] += 1) 
					: (cs['loadingN'] = 1);
				Cold.addScript(URL, function(){
					typeof callback === 'function' && callback();
					cs[ns] = 'attached';
					cs['loadingN'] -= 1;
				}, true);
			}
			return Cold;
		},
		/** 
		* 载入模块，可能是多个
		* @type method
		* @param {String|Array} ns 模块名
		* @param {Function} callback 回调函数
		* @return Cold
		*/
		load: function(ns, callback){
			ns = ns || [];
			if(typeof ns === 'string'){
				return Cold.loadSingle(ns, callback);
			}
			else{
				for(var i=0, len = ns.length; i<len; i++){
					ns[i] && Cold.loadSingle(ns[i], function(){
						typeof callback === 'function' && callback.call();
					});
				}
			}
			return Cold;
		}
	};
	/** 
	* 输出调试信息，调用console.log；没有console对象时为空函数
	* @type method
	*/
	Cold.log = ( Cold.DEBUG && window.console ) ? function(msg){ console.log(msg); } : function(){};

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
		return (Cold.scripts['loadingN'] === 0);
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
		Cold.reqList = {};
	};

	var _readyBounded = (function(){
		if(_readyBounded){
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
		
	/** 
	* 定义dom ready且Cold对象Ready时执行的代码
	* @type method
	* @param {Function} func 执行函数
	* @example
	* Cold.ready(function(){ ... });
	*/
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

	/** 
	* 对象包括四个函数isArray、isFunction、isString、isNumber，意义明确
	* @type Object
	*/
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
		isArray		: type.isArray,
		isFunction	: type.isFunction,
		isString	: type.isString,
		isNumber	: type.isNumber,
		ready		: ready
	};

});