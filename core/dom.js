Cold.add('Cold.dom', function(){

	//console.info("dom 载入完毕。");

	var domCache = Cold['cache']['elems'] = {};

	var _selector = function(){
	};

	var _id = function(str){
		if(domCache[str]){
			return domCache[str];
		}
		if(Cold.isString(str)){
			return ( domCache[str] = document.getElementById(str) );
		}
		return str;
	};

	var _create = function(str, property){
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

	var _$CN = function(str, node, tag){
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

	var _$T = function(str){
		return typeof Cold.isString(str) ? document.getElementsByTagName(str) : str;
	};

	var _camelize = function(str){
		return String(str).replace(/\-(\w)/g, function(a, b){ return b.toUpperCase(); });
	};

	var _opacity = function(el, opacity){
		var ret;
		el = _id(el);
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
		el = _id(el);
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
			else		return _opacity(el);
		}
		return (!ret || ret === 'auto') ? 0 : ret;
	};

	var _css = function(el, style, value){
		el = _id(el);
		if(Cold.isString(style)){
			if(!!value){
				style.toLowerCase() === 'opacity'
					? _opacity(el, value)
					: ( el.style[style] = value );
			}
			else{
				return _getCurrentStyle(el, style);
			};
		}
		else{
			style = style || {};
			for(var s in style){
				s.toLowerCase() === 'opacity'
					? _opacity(el, style[s])
					: ( el.style[_camelize(s)] = style[s] );
			}
			return el;
		}
	};

	var _val = function(el, prop, value){
		el = _id(el);
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

	var _html = function(el, value){
		el = _id(el);
		if(!!value){
			el.innerHTML = value;
		}
		else{
			return el.innerHTML;
		}
		return el;
	};

	var _insertHTML = function(el, html, where){
		el = _id(el);
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

	var _insert = function(el, target, where){
		el = _id(el);
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

	var _insertBefore = function(el, html){
		return _insert(el, html, 'beforebegin');
	};

	var _appendFront = function(el, html){
		return _insert(el, html, 'afterbegin');
	};

	var _appendEnd = function(el, html){
		return _insert(el, html, 'beforeend');
	};

	var _insertAfter = function(el, html){
		return _insert(el, html, 'afterend');
	};

	var _width = function(){};
	var _height = function(){};

	return {
		selector	: _selector,
		$			: _selector,
		id			: _id,
		$E			: _id,
		$C			: _create,
		create		: _create,
		$CN			: _$CN,
		$T			: _$T,
		css			: _css,
		val			: _val,
		html		: _html,
		insert		: _insert,
		insertBefore: _insertBefore,
		insertAfter	: _insertAfter,
		appendFront	: _appendFront,
		appendEnd	: _appendEnd,
		width		: _width,
		height		: _height
	};
	
});