Cold.add("Cold.event",function(){
	//var _eventsList = {};
	var _addEvent = function(elem, eventType, func){
		elem = (typeof elem === 'string') ? document.getElementById(elem) : elem;
		eventType = eventType || 'click';
		if(!elem || elem.nodeType === 3 || elem.nodeType === 8 || typeof func !== 'function'){
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
		elem = (typeof elem === 'string') ? document.getElementById(elem) : elem;
		eventType = eventType || 'click';
		if(!elem || elem.nodeType === 3 || elem.nodeType === 8 || typeof func !== 'function'){
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
		elem = (typeof elem === 'string') ? document.getElementById(elem) : elem;
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