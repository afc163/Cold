//base.js 包括ajax、browser、event、dom

Cold.add('base', function(){
	Cold.add('browser', function(){
		Cold.log("browser 载入完毕。"); 
		var _ua = navigator.userAgent.toLowerCase();
		var browser = {
			platform: navigator.platform,
			features: {xpath: !!(document.evaluate), air: !!(window.runtime), query: !!(document.querySelector)},
			engine : {
				presto: function(){
					return (!window.opera) ? false : ((arguments.callee.caller) ? 960 : ((document.getElementsByClassName) ? 950 : 925));
				},
				trident: function(){
					return (!window.ActiveXObject) ? false : ((window.XMLHttpRequest) ? ((document.querySelectorAll) ? 6 : 5) : 4);
				},
				webkit: function(){
					return (navigator.taintEnabled) ? false : ((browser.features.xpath) ? ((browser.features.query) ? 525 : 420) : 419);
				},
				gecko: function(){
					return (!document.getBoxObjectFor && window.mozInnerScreenX == null) ? false : ((document.getElementsByClassName) ? 19 : 18);
				}
			},
			detect : function(){
				var info = '';
				for(var eng in this.engine){
					var e = this.engine[eng]();
					if(e !== false){
						info += 'engine:'+eng + ' ' + e;
						break;
					}
				}
				for(var b in this){
					if(this[b] === true){
						info += ' browser:' + b + ' ' + this['version'];
						break;
					}
				}
				return info;
			},
			version : (_ua.match(/.+(?:rv|it|ra|ie)[\/: ]([\d.]+)/) || [0, '0'])[1],
			msie	: /msie/.test(_ua),
			firefox : /firefox/.test(_ua),
			chrome	: /chrome/.test(_ua) && /webkit/.test(_ua),
			safari	: /safari/.test(_ua) && !this.chrome,
			opera	: /opera/.test(_ua)
		};
		browser.ie = browser.msie;
		browser.ie6 = browser.msie && parseInt(browser.version) === 6;
		browser.ie7 = browser.msie && parseInt(browser.version) === 7;
		browser.ie8 = browser.msie && parseInt(browser.version) === 8;

		browser.winSize = function(doc){
			var w, h;
			doc = doc || document;
			if(window.innerHeight){
				w = window.innerWidth;
				h = window.innerHeight;
			}
			else if(doc.documentElement && doc.documentElement.clientHeight){
				w = doc.documentElement.clientWidth;
				h = doc.documentElement.clientHeight;
			}
			else{
				w = doc.body.clientWidth;
				h = doc.body.clientHeight;
			}
			return { width:w, height:h };
		};

		browser.pageSize = function(doc){
			doc = doc || document;
		};

		browser.scroll = function(doc){
			doc = doc || document;
			return {
				'left' : Math.max(doc.documentElement.scrollLeft, doc.body.scrollLeft),
				'top' : Math.max(doc.documentElement.scrollTop, doc.body.scrollTop)
			};
		};
		return browser;
	});

	Cold.add('dom', function(){
		Cold.log("dom 载入完毕。");
		var _domCache = Cold['cache']['elems'] = {};

		var id = function(str){
			if(_domCache[str]){
				return _domCache[str];
			}
			if(Cold.isString(str)){
				return ( _domCache[str] = document.getElementById(str) );
			}
			return str;
		};

		var create = function(str, property){
			var re_html = /^[\s]*<([a-zA-Z]*)[\s]*([^>]*)>(.*)<\/\1>[\s]*/i,
				temp, elem;
			if(str.match(re_html)){
				temp = document.createElement('div');
				temp.innerHTML = str;
				elem = temp.firstChild;
				if (temp.childNodes.length === 1) {
					return elem;
				} else {
					var frag = document.createDocumentFragment();
					while (elem = temp.firstChild) frag.appendChild(elem);
					return frag;
				}
			}
			else{
				el = document.createElement(str);
				if (property) {
					for (var i in property) el[i] = property[i];
				}
				return el;
			}
		};

		var $CN = function(str, node, tag){
			if(document.getElementsByClassName){
				return document.getElementsByClassName(str);
			}
			else{   
				node = node || document;
				tag = tag || '*';
				var returnElements = [];
				var els = (tag === '*' && node.all)? node.all : node.getElementsByTagName(tag);
				var i = els.length;
				str = str.replace(/\-/g, '\\-');
				var pattern = new RegExp('(^|\\s)' + str + '(\\s|$)');
				while(--i >= 0){
					if(pattern.test(els[i].className)){
						returnElements.push(els[i]);
					}
				}
				return returnElements;
			}
		};

		var $T = function(str){
			return typeof Cold.isString(str) ? document.getElementsByTagName(str) : str;
		};

		var _camelize = function(str){
			return String(str).replace(/\-(\w)/g, function(a, b){ return b.toUpperCase(); });
		};

		var _uncamelize = function(str){
			return String(str).replace(/[A-Z]/g, '-$&').toLowerCase();
		};

		var _hasClass = function(el, className){
			var cn = el.className,
				cns = cn.split(' ');
			for(var i=0, l=cns.length; i<l; i++){
				if(cns[i] === className){
					return true;
				}
			}
			return false;
		};

		var addClass = function(el, className){
			if(!_hasClass(el, className)){
				el.className = ( el.className == null )
								? className 
								: el.className + ' ' + className;
			}
		};

		var removeClass = function(el, className){
			var cn = el.className,
				cns = cn.split(' ');
			for(var i=0, l=cns.length; i<l; i++){
				if(cns[i] === className){
					cns[i] = '';
				}
			}
			el.className = cns.join(' ');
		};

		var opacity = function(el, opacity){
			var ret;
			el = id(el);
			if(opacity != null){
				if(css(el, 'display') === 'none'){
					css(el, 'display', 'block');
				}
				if(css(el, 'visibility') === 'hidden'){
					css(el, 'visibility', 'visible');
				}
				el.style.opacity = opacity;
				el.style.filter = 'alpha(opacity=' + opacity*100 + ')';
				if(el.filters){
					el.style.zoom = 1;
					if(opacity == 1){
						el.style.zoom = '';
					}
				}
			}
			else{
				if(el.style.filter){
					ret = /alpha\(opacity=(.*)\)/.match(el.style.filter);
					ret = (!!ret) ? parseInt(ret[1], 10)/100 : 1.0;
					return ret;
				}
				return el.style.opacity || 1.0;
			}
		};

		var _getCurrentStyle = function(el, style){
			el = id(el);
			var ret = '',
				d = el.ownerDocument.defaultView;
			if(d && d.getComputedStyle){
				ret = d.getComputedStyle(el, null)[_camelize(style)];
			}else if(el.currentStyle){
				ret = el.currentStyle[_camelize(style)];
			}else{
				ret = el.style[style];
			}
			if(style === 'opacity'){
				if (ret) return parseFloat(ret, 10);
				else		return opacity(el);
			}
			return (!ret || ret === 'auto') ? 0 : ret;
		};

		var isStyle = function(el, p){
			return _camelize(p) in el.style || p in el.style || p === 'opacity';
		};

		var css = function(el, style, value){
			el = id(el);
			if(Cold.isString(style)){
				if(value != null){
					style.toLowerCase() === 'opacity'
						? opacity(el, value)
						: ( el.style[_camelize(style)] = value );
				}
				else{
					return _getCurrentStyle(el, style);
				};
				return el;
			}
			else{
				style = style || {};
				var styleText = '';
				for(var s in style){
					s.toLowerCase() === 'opacity'
						? opacity(el, style[s])
						: ( styleText += _uncamelize(s) + ':' + style[s] + ';');
				}
				el.style.cssText += (el.style.cssText === '' ? '' : ';') + styleText;
				return el;
			}
		};

		var val = function(el, prop, value){
			el = id(el);
			if(Cold.isString(prop)){
				if(value != null) el.setAttribute(prop, value);
				else		return el.getAttribute(prop);
			}
			else{
				prop = prop || {};
				for(var p in prop){
					el.setAttribute(p, prop[p]);
				}
			}
			return el;
		};

		var html = function(el, value){
			el = id(el);
			if(!!value){
				el.innerHTML = value;
			}
			else{
				return el.innerHTML;
			}
			return el;
		};

		var _insertHTML = function(el, html, where){
			el = id(el);
			where = where? where.toLowerCase(): "beforeend";
			if(el.insertAdjacentHTML) {
				switch(where){
					case 'beforebegin':
						el.insertAdjacentHTML('BeforeBegin', html);
						return el.previousSibling;
					case 'beforeend':
						el.insertAdjacentHTML('BeforeEnd', html);
						return el.lastChild;
					case 'afterbegin':
						el.insertAdjacentHTML('AfterBegin', html);
						return el.firstChild;
					case 'afterend':
						el.insertAdjacentHTML('AfterEnd', html);
						return el.nextSibling;
				};
				throw 'Illegal insertion position : "' + where + '"';
			}
			else{
				var range = el.ownerDocument.createRange(), frag;
				switch (where) {
					case "beforebegin":
						range.setStartBefore(el);
						frag = range.createContextualFragment(html);
						el.parentNode.insertBefore(frag, el);
						return el.previousSibling;
					case "afterbegin":
						if (el.firstChild) {
							range.setStartBefore(el.firstChild);
							frag = range.createContextualFragment(html);
							el.insertBefore(frag, el.firstChild);
							return el.firstChild;
						}
						else {
							el.innerHTML = html;
							return el.firstChild;
						}
						break;
					case "beforeend":
						if (el.lastChild) {
							range.setStartAfter(el.lastChild);
							frag = range.createContextualFragment(html);
							el.appendChild(frag);
							return el.lastChild;
						}
						else {
							el.innerHTML = html;
							return el.lastChild;
						}
						break;
					case "afterend":
						range.setStartAfter(el);
						frag = range.createContextualFragment(html);
						el.parentNode.insertBefore(frag, el.nextSibling);
						return el.nextSibling;
				}
				throw 'Illegal insertion position : "' + where + '"';
			}
		};

		var insert = function(el, target, where){
			el = id(el);
			where = where? where.toLowerCase(): "beforeend";
			if(Cold.isString(target)){
				_insertHTML(el, target, where);
			}
			else{
				switch(where){
					case 'beforebegin':
						el.parentNode.insertBefore(target, el);
						break;
					case 'afterbegin':
						el.insertBefore(target, el.firstChild);
						break;
					case 'beforeend':
						el.appendChild(target);
						break;
					case 'afterend':
						el.parentNode.insertBefore(target, el.nextSibling || null);
						break;
					default:
						throw 'Illegal insertion position : "' + where + '"';
				};
				return target;
			}
		};

		var insertBefore = function(el, html){
			return insert(el, html, 'beforebegin');
		};

		var appendFront = function(el, html){
			return insert(el, html, 'afterbegin');
		};

		var appendEnd = function(el, html){
			return insert(el, html, 'beforeend');
		};

		var insertAfter = function(el, html){
			return insert(el, html, 'afterend');
		};

		var remove = function(el){
			if(el){
				return el.parentNode.removeChild(el);
			}
		};

		var	_hidden = Cold.IE && css(el, 'display') === 'none', w, h;
		var width = function(el){
			el = id(el);
			w = Math.max(el.offsetWidth, _hidden ? 0 : el.clientWidth) || 0;
			return w < 0 ? 0 : w;
		};
		var height = function(el){
			el = id(el);
			h = Math.max(el.offsetHeight, _hidden ? 0 : el.clientHeight) || 0;
			return h < 0 ? 0 : h;
		};

		var getScroll = Cold.browser.scroll;

		var getXY = function(el){
			var x = 0, y = 0, doc = el.ownerDocument, docElem = doc.documentElement,
				scrolls = getScroll(doc),
				clientTop = docElem.clientTop || doc.body.clientTop || 0,
				clientLeft = docElem.clientLeft || doc.body.clientLeft || 0;
			if(el.getBoundingClientRect){
				x = el.getBoundingClientRect().left + scrolls['left'] - clientLeft;
				y = el.getBoundingClientRect().top + scrolls['top'] - clientTop;
			}
			else{
				do{
					x += el.offsetLeft;
					x += el.offsetTop;
				}while(el = el.offsetParent);
			}
			return { 'x' : x, 'y' : y };
		};

		return {
			id			: id,
			$E			: id,
			$C			: create,
			create		: create,
			$CN			: $CN,
			$T			: $T,
			isStyle		: isStyle,
			addClass	: addClass,
			removeClass	: removeClass,
			css			: css,
			val			: val,
			html		: html,
			insert		: insert,
			insertBefore: insertBefore,
			insertAfter	: insertAfter,
			appendFront	: appendFront,
			appendEnd	: appendEnd,
			remove		: remove,
			width		: width,
			height		: height,
			getXY		: getXY
		};
	});
	Cold.add("ajax", function(){
		var _jsonToQuery = function(data){
			if(Cold.isString(data)){
				return data;
			}
			var q = '';
			for(var p in data){
				q += (p + '=' + data[p] + '&');
			}
			if(q !== ''){
				q = q.slice(0, -1);
			}
			return q.toLowerCase();
		};

		var _addQuery = function(url, data){
			return url + '?' + _jsonToQuery(data);
		};

		var getRequest = function(){
			try{
				return new XMLHttpRequest();
			}
			catch(e){
				try{
					return new ActiveXObject('MSXML2.XMLHTTP');
				}
				catch(e){
					return new ActiveXObject('Microsoft.XMLHTTP');
				}
			}
		};

		var _defaultOption = {
			method		: 'get',
			data		: {},
			async		: true,
			contentType : 'application/x-www-form-urlencoded',
			charset		: 'utf-8',
			timeout		: 30 * 1000,
			returnType	: 'json',	// json | xml | html | text | jsonp & script is undefined
			onSuccess	: function(){},
			onError		: function(){}
		};

		var ajax = function(url, option){
			if (url == '' || url == null) {
				throw new Error('ajax need parameter url.');
			}
			var XHR = getRequest(),
				op = _defaultOption,
				method;
			Cold.extend(op, option, true);
			method = op.method.toLowerCase();

			XHR.onreadystatechange = function(){
				var data = '';
				if(XHR.readyState === 4){
					if(XHR.status === 200 || XHR.status === 0){
						switch(op.returnType){
							case 'text':
							case 'html':
								data = XHR.responseText;
								break;
							case 'xml':
								data = XHR.responseXML;
								break;
							case 'script':
								break;
							case 'jsonp':
								break;
							case 'json':
								data = eval('('+ XHR.responseText +')');
								break;
						}
						op.onSuccess && op.onSuccess(data);
					}
					else{
						op.onError && op.onError();
					}
				}
			};
			if(op.data && method === 'get'){
				op.data['rd'] = new Date().valueOf();
				url = _addQuery(url, op.data);
			}
			XHR.open(method, url, op.async);
			XHR.setRequestHeader('Content-Type', op.contentType + ';charset=' + op.charset.toLowerCase());
			XHR.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
			XHR.send( (method === 'post') ? _jsonToQuery(data) : null);
			return XHR;
		};

		var get = function(url, option){
			option = option || {};
			option['method'] = 'get';
			return ajax(url, option);
		};

		var post = function(url, option){
			option = option || {};
			option['method'] = 'post';
			return ajax(url, option);
		};

		var getJson = function(url, option){
			option = option || {};
			option['method'] = 'get';
			option['returnType'] = 'json';
			return ajax(url, option);
		};

		var getXml = function(url, option){
			option = option || {};
			option['method'] = 'get';
			option['returnType'] = 'xml';
			return ajax(url, option);
		};

		var getText = function(url, option){
			option = option || {};
			option['method'] = 'get';
			option['returnType'] = 'text';
			return ajax(url, option);
		};
		
		return {
			getXHR		: getRequest,
			ajax		: ajax,
			get			: get,
			post		: post,
			getJson		: getJson,
			getXml		: getXml,
			getText		: getText
		};
	});

	Cold.add('event', function(){
		//var _eventsList = {};
		Cold.log("event 载入完毕。");
		var id = function(el){
			return el = Cold.isString(el) ? document.getElementById(el) : el;
		};

		var addEvent = function(el, eventType, func){
			el = id(el);
			eventType = eventType || 'click';

			if(!el || el.nodeType === 3 || el.nodeType === 8 || !Cold.isFunction(func)){
				return false;
			}

			if(el.addEventListener){
				el.addEventListener(eventType, func, false);
			}
			else if(el.attachEvent){
				el.attachEvent('on' + eventType, func);
			}
			else{
				el['on' + eventType] = func;
			}
			return true;
		};

		var delEvent = function(el, eventType, func){
			el = id(el);
			eventType = eventType || 'click';
			if(!el || el.nodeType === 3 || el.nodeType === 8 || !Cold.isFunction(func)){
				return false;
			}

			if(el.removeEventListener){
				el.removeEventListener(eventType, func, false);
			}
			else if(el.detachEvent){
				el.detachEvent('on' + eventType, func);
			}
			else{
				el['on' + eventType] = null;
			}
			return true;
		};

		var fireEvent = function(el, eventType){
			el = id(el);
			eventType = eventType || 'click';

			if(el.fireEvent){
				el.fireEvent('on' + eventType);  
			}
			else{  
				var evt = document.createEvent('HTMLEvents');
				evt.initEvent(eventType, true, true);
				el.dispatchEvent(evt);
			}
			return true;
		};

		var click = function(el, func){
			return addEvent(el, 'click', func);
		};

		var hover = function(el, option){
			var timeout = 100,
				timer = null,
				over = option.over || function(){},
				out = option.out || function(){},
				showElems = option.elems || [],
				overFn = function(){
					timer && clearTimeout(timer);
					timer = setTimeout(function(){
						if(el.over === true){
							over && over();
						}
					},timeout);
				},
				outFn = function(){
					timer && clearTimeout(timer);
					timer = setTimeout(function(){
						if(el.over === false){
							out && out();
						}
					},timeout);
				};

			addEvent(el, 'mouseover', function(){
				el.over = true;
				overFn();
			});
			addEvent(el, 'mouseout', function(){
				el.over = false;
				outFn();
			});

			for(var i=0, se, l=showElems.length; se = showElems[i]; i++){
				addEvent(se, 'mouseover', function(){
					el.over = true;
					overFn();
				});
				addEvent(se, 'mouseout', function(){
					el.over = false;
					outFn();
				});
			}
		};

		var toggle = function(el, click1, click2){
			var num = 0;
			click1 = click1 || function(){};
			click2 = click2 || function(){};
			click(el, function(){
				(num++)%2 === 0 ? click1() : click2();
			});
		};

		return {
			add		: addEvent,
			remove	: delEvent,
			fire	: fireEvent,
			click	: click,
			hover	: hover,
			toggle	: toggle
		};
	});
});