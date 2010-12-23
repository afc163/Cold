Cold.add('Cold.dom', function(){

	//console.info("dom 载入完毕。");

	var _selector = function(){
		var elems = null;
		return elems;
	};

	var _id = function(str){
		return Cold.isString(str) ? document.getElementById(str) : str;
	};

	var _create = function(str, property){
		var htmlMatcher = /^[\s]*<([a-zA-Z]*)[\s]*([^>]*)>(.*)<\/\1>[\s]*$/i,
			namevalueMatcher = /\s*([a-zA-Z]*)=([\'\"]?)([^=\2]*)\2\s*/g,
			html, el, namevalue;
		if(html = str.match(htmlMatcher)){
			el = document.createElement(html[1]);
			while(namevalue = namevalueMatcher.exec(html[2])){
				if(namevalue[1].toLowerCase() === 'style'){
					el.style.cssText = namevalue[3];
				}
				else{
					el.setAttribute(namevalue[1], namevalue[3]);
				}
			};
			el.innerHTML = html[3];
			return el;
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
		var parts = str.split('-'), len = parts.length;
		if (len == 1) return parts[0];
		var camelized = (str.charAt(0) === '-')
			? parts[0].charAt(0).toUpperCase() + parts[0].slice(1)
			: parts[0];
		for (var i = 1; i < len; i++){
			camelized += parts[i].charAt(0).toUpperCase() + parts[i].slice(1);
		}
		return camelized;
	};

	var _css = function(el, style, value){
		el = _id(el);
		if(Cold.isString(style)){
			if(!!value) el.style[style] = value;
			else		return el.style[style];
		}
		else{
			style = style || {};
			for(var s in style){
				el.style[_camelize(s)] = style[s];
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
		appendEnd	: _appendEnd
	};
	
});