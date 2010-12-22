Cold.add('Cold.event', function(){

	//var _eventsList = {};

	console.info("event 载入完毕。");

	var _id = function(elem){
		return elem = Cold.isString(elem) ? document.getElementById(elem) : elem;
	};

	var _addEvent = function(elem, eventType, func){
		elem = _id(elem);
		eventType = eventType || 'click';

		if(!elem || elem.nodeType === 3 || elem.nodeType === 8 || !Cold.isFunction(func)){
			return false;
		}

		if(elem.addEventListener){
			elem.addEventListener(eventType, func, false);
		}
		else if(elem.attachEvent){
			elem.attachEvent('on' + eventType, func);
		}
		else{
			elem['on' + eventType] = func;
		}
		return true;
	};

	var _delEvent = function(elem, eventType, func){
		elem = _id(elem);
		eventType = eventType || 'click';
		if(!elem || elem.nodeType === 3 || elem.nodeType === 8 || !Cold.isFunction(func)){
			return false;
		}

		if(elem.removeEventListener){
			elem.removeEventListener(eventType, func, false);
		}
		else if(elem.detachEvent){
			elem.detachEvent('on' + eventType, func);
		}
		else{
			elem['on' + eventType] = null;
		}
		return true;
	};

	var _fireEvent = function(elem, eventType){
		elem = _id(elem);
		eventType = eventType || 'click';

		if(elem.fireEvent){
			elem.fireEvent('on' + eventType);  
		}
		else{  
			var evt = document.createEvent('HTMLEvents');
			evt.initEvent(eventType, true, true);
			elem.dispatchEvent(evt);
		}
		return true;
	};

	return {
		addEvent	: _addEvent,
		delEvent	: _delEvent,
		fireEvent	: _fireEvent
	};
});