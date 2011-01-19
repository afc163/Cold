Cold.add('Cold.event', function(){

	//var _eventsList = {};

	//console.info("event 载入完毕。");

	var id = function(elem){
		return elem = Cold.isString(elem) ? document.getElementById(elem) : elem;
	};

	var addEvent = function(elem, eventType, func){
		elem = id(elem);
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

	var delEvent = function(elem, eventType, func){
		elem = id(elem);
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

	var fireEvent = function(elem, eventType){
		elem = id(elem);
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

	var hover = function(elem, over, out, relateElems){
		var timeout = 100;
		addEvent(elem, "mouseover", function(){
			elem.over = true;
			setTimeout(function(){
				if(elem.over === true){
					over && over();
				}
			},timeout);
		});
		addEvent(elem, "mouseout", function(){
			elem.over = false;
			setTimeout(function(){
				if(elem.over === false){
					out && out();
				}
			},timeout);
		});
	};

	var toggle = function(elem, click1, click2){
		var num = 0;
		click1 = click1 || function(){};
		click2 = click2 || function(){};
		addEvent(elem, "click", function(){
			(num++)%2 === 0 ? click1() : click2();
		});
	};

	return {
		add		: addEvent,
		remove	: delEvent,
		fire	: fireEvent,
		hover	: hover,
		toggle	: toggle
	};
});