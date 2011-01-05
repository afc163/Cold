Cold.add('Cold.dom', ['Cold.browser'], function(){

	//console.info("dom 载入完毕。");

	var domCache = Cold['cache']['elems'] = {};

	var selector = function(){
	};

	var id = function(str){
		if(domCache[str]){
			return domCache[str];
		}
		if(Cold.isString(str)){
			return ( domCache[str] = document.getElementById(str) );
		}
		return str;
	};

	var create = function(str, property){
		var htmlMatcher = /^[\s]*<([a-zA-Z]*)[\s]*([^>]*)>(.*)<\/\1>[\s]*/i,
			temp, elem;
		if(str.match(htmlMatcher)){
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

	var opacity = function(el, opacity){
		var ret;
		el = id(el);
		if(opacity){
			el.style.opacity = opacity;
			el.style.filter = 'alpha(opacity=' + opacity*100 + ')';
			if(el.filters){
				el.style.zoom = 1;
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
			if(!!value){
				style.toLowerCase() === 'opacity'
					? opacity(el, value)
					: ( el.style[_camelize(style)] = value );
			}
			else{
				return _getCurrentStyle(el, style);
			};
		}
		else{
			style = style || {};
			for(var s in style){
				s.toLowerCase() === 'opacity'
					? opacity(el, style[s])
					: ( el.style[_camelize(s)] = style[s] );
			}
			return el;
		}
	};

	var val = function(el, prop, value){
		el = id(el);
		if(Cold.isString(prop)){
			if(!!value) el.setAttribute(prop, value);
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

	return {
		selector	: selector,
		$			: selector,
		id			: id,
		$E			: id,
		$C			: create,
		create		: create,
		$CN			: $CN,
		$T			: $T,
		isStyle		: isStyle,
		css			: css,
		val			: val,
		html		: html,
		insert		: insert,
		insertBefore: insertBefore,
		insertAfter	: insertAfter,
		appendFront	: appendFront,
		appendEnd	: appendEnd,
		width		: width,
		height		: height
	};
	
});