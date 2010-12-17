//cold.js

(function(){
	var _cold = {

		VERSION: '0.0.1',

		BaseURL: (function(){
			var scripts = document.getElementsByTagName('script');
			var str = scripts[scripts.length - 1].getAttribute('src');
			return str.match(/http:\/\/[^\/]*\//)[0];
		})(),

		cache: {},

		scripts: {'loadingNum' : 0},

		extend: function(obj, exobj, overwrite){
			obj = obj || {};
			exobj = exobj || {};
			overwrite = overwrite || false;

			for(var p in exobj){
				if(overwrite){
					obj[p] = exobj[p];
				}
				else{
					if(!obj[p]){
						obj[p] = exobj[p];
					}
					else{
						//throw new Error("property " + p + " can't be overwrited!");
					}
				}
            }
		},

		add: function(namespace, func){
			var names = namespace.split('.'),
				namesLen = names.length,
				space = window;

			if(namesLen < 1) throw new Error('namespace wrong.');
			if(!(names[0] in window)){
				window[names[0]] = {};
			}

			for(var i = 0; i < namesLen; i++){
				if(i === namesLen-1 && typeof func === 'function'){
					if(space[names[i]]){
						Cold.extend(space[names[i]], func());
					}
					else{
						space[names[i]] = func();
					}
					return true;
				}
				if(!space[names[i]]){
					space[names[i]] = {};
				}
				space = space[names[i]];
			}
			return false;
		},

		addScript: function(url, onComplete){
			var s = document.createElement('script'),
				head = document.getElementsByTagName('head')[0],
				loaded = false;
			s.setAttribute('type', 'text/javascript');
			s.setAttribute('src', url);
			//for firefox 3.6
			s.setAttribute('async', true);
			head.appendChild(s);
			s.onerror = s.onload = s.onreadystatechange = function(){
				if(!loaded && (!this.readyState || (/loaded|complete/).test(this.readyState))){
					loaded = true;
					s.onerror = s.onload = s.onreadystatechange = null;
					if(typeof onComplete === 'function'){
						onComplete.apply();
					}
					head.removeChild(s);
				}
			};
		},

		load: function(namespace, callback){
			var url = '';
			if(Cold.scripts[namespace] !== 'loaded')
			{
				Cold.scripts['loadingNum'] 
					? (Cold.scripts['loadingNum'] += 1) 
					: (Cold.scripts['loadingNum'] = 1);

				if(!(/component|util|task|other/g.test(namespace))){
					url = namespace.replace('Cold','Cold.core');
				}
				url = url.replace(/\./g,'/');
				url = Cold.BaseURL + url + ".js";
				
				Cold.addScript(url, function(){
					if(typeof callback === 'function'){
						callback.apply();
					}
					Cold.scripts[namespace] = 'loaded';
					Cold.scripts['loadingNum'] -= 1;
				});
			}
		}
	};
	window["Cold"] = _cold;
})();

Cold.add("Cold", function(){

	var funcList = [],
		timer = null,
		executed = false;

	var _isComplete = function(){
		return (Cold.scripts['loadingNum'] === 0);
	};

	var _execReady = function(){
		if(executed === true){
			return;
		}
		executed = true;
		for(var i=0, l=funcList.length; i < l; i++){
			funcList[i].call();
		}
		funcList = [];
	};

	var _coldReady = function(){
		if(executed === true){
			return;
		}
		if(_isComplete() === false){
			timer = setTimeout(arguments.callee, 25);
			return;
		}
		timer && clearTimeout(timer);
		_execReady.call();
	};

	var readyBounded = (function(){
		if(readyBounded){
			return;
		}
		var doc = document,
			win = window,
			dscroll = doc.documentElement.doScroll;

		//w3c mode
		if(doc.addEventListener){
			doc.addEventListener("DOMContentLoaded", _coldReady, false);
			win.addEventListener("load", _coldReady, false);
		}
		//ie mode
		else{
			doc.attachEvent("onreadystatechange", _coldReady);
			win.attachEvent("onload", _coldReady);
			if(dscroll && win == win.top){
				(function(){				
					try{
						dscroll("left");
					}
					catch(ex){
						setTimeout(arguments.callee, 0);
					}
				})();
			}
		}
		return true;
	})();
		
	var _ready = function(func){
		if(typeof func !== 'function'){
			return;
		}
		if(executed === true || (/loaded|complete/).test(document.readyState.toLowerCase())){
			func.call();
		}
		else{
			funcList.push(func);
		}
	};

	return {
		ready	: _ready
	};
});