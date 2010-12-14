//cold.js

(function(){
	var _cold = {

		VERSION: '0.01',

		BaseURL: (function(){
			var scripts = document.getElementsByTagName('script');
			var str = scripts[scripts.length - 1].getAttribute('src');
			return str.match(/http:\/\/[^\/]*\//)[0];
		})(),

		cache: {},

		scripts: {},

		extend: function(obj, exobj, overwrite){
			overwrite = overwrite || false;
			for(var p in exobj){
                if(!obj[p] && overwrite){
					obj[p] = exobj[p];
				}
				else{
					throw new Error('pros ' + p + ' is existed.');
				}
            }
		},

		add: function(namespace, func){
			var names = namespace.split('.'),
				namesLen = names.length,
				space = null;

			if(namesLen < 1) throw new Error('namespace wrong.');
			if(!(names[0] in window)){
				window[names[0]] = {};
			}
			space = window[names[0]];
			for(var i = 1; i < namesLen; i++){
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
			var s = document.createElement('script')
				head = document.getElementsByTagName('head')[0];

			s.setAttribute('type', 'text/javascript');
			s.setAttribute('src', url);
			head.appendChild(s);
			s.onerror = s.onload = s.onreadystatechange = function(){
				if(typeof onComplete === 'function'){
					onComplete.apply();
				}
				head.removeChild(s);
			};
		},

		inc: function(namespace, callback){
			var url = "";
			if(Cold.scripts["namespace"] !== "loaded")
			{
				if(!(/component|util|other/g.test(namespace))){
					url = namespace.replace('Cold','Cold.core');
				}
				url = url.replace(/\./g,'/');
				url = Cold.BaseURL + url + ".js";
				
				Cold.addScript(url, function(){
					if(typeof callback === 'function'){
						callback.apply();
					}
					Cold.scripts[namespace] = "loaded";
				});
			}
		}
	};
	window["Cold"] = _cold;
})();