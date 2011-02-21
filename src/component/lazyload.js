Cold.add('component.lazyLoad', ['event', 'browser', 'dom'], function(){

	var _add = Cold.event.add,
		_remove = Cold.event.remove,
		_winSize = Cold.browser.winSize,
		_getScroll = Cold.browser.scroll,
		_getXY = Cold.dom.getXY;

	var op = {
		tag : 'img',
		src : 'lazysrc',
		preHeight : 300 /* 预先载入的高度 */
	};

	return function(option){
		Cold.extend(op, option, true);
		var nodes = document.getElementsByTagName(op.tag);

		var next = function(){
			for(var i = 0, l = nodes.length; i < l; i++){
				if(nodes[i].getAttribute(op.src)) return nodes[i];
			}
			return null;
		};

		var loader = function(){
			var current = next(),
				showHeight = _getScroll()['top'] + _winSize()['height'] + op.preHeight;
			if(current){
				if (showHeight >= _getXY(current)['y']){
					current.setAttribute('src', current.getAttribute(op.src));
					current.removeAttribute(op.src);
					setTimeout(arguments.callee, 10);
                }
			}
			else{
				_remove(window, 'scroll', loader);
				_remove(window, 'resize', loader);
			}

		};

		loader();
		_add(window, 'scroll', loader);
		_add(window, 'resize', loader);
	};
});