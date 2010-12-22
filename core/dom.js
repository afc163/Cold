Cold.add('Cold.dom', function(){

	console.info("dom 载入完毕。");

	var _selector = function(){
		var elems = null;
		return elems;
	};

	var _$E = function(str){
		return Cold.isString(str) ? document.getElementById(str) : str;
	};

	var _$C = function(str){
		return Cold.isString(str) ? document.createElement(str) : str;
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

	var _css = function(elem, style, value){
		elem = _$E(elem);
		if(Cold.isString(style)){
			if(!!value) elem.style[style] = value;
			else		return elem.style[style];
		}
		else{
			style = style || {};
			for(var s in style){
				elem.style[_camelize(s)] = style[s];
			}
			return elem;
		}
	};

	var _val = function(elem, prop, value){
		elem = _$E(elem);
		if(Cold.isString(prop)){
			if(!!value) elem.setAttribute(prop, value);
			else		return elem.getAttribute(prop);
		}
		else{
			prop = prop || {};
			for(var p in prop){
				elem.setAttribute(p, prop[p]);
			}
		}
		return elem;
	};

	var _html = function(elem, value){
		elem = _$E(elem);
		if(!!value){
			elem.innerHTML = value;
		}
		else{
			return elem.innerHTML;
		}
		return elem;
	};

	return {
		selector: _selector,
		$		: _selector,
		id		: _$E,
		$E		: _$E,
		$C		: _$C,
		$CN		: _$CN,
		$T		: _$T,
		css		: _css,
		val		: _val,
		html	: _html
	};
	
});