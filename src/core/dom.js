Cold.add('dom', ['browser'], function(){

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