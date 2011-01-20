Cold.add('Cold.event', function(){

	//var _eventsList = {};

	//console.info("event 载入完毕。");

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

	var hover = function(el, over, out, showElems){
		var timeout = 100,
			timer = null,
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
		showElems = showElems || [];

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