Cold.add('browser', function(){

	Cold.log("browser 载入完毕。"); 

	var _ua = navigator.userAgent.toLowerCase();

	var browser = {
		platform: navigator.platform,
		features: {xpath: !!(document.evaluate), air: !!(window.runtime), query: !!(document.querySelector)},
		engine : {
			presto: function(){
				return (!window.opera) ? false : ((arguments.callee.caller) ? 960 : ((document.getElementsByClassName) ? 950 : 925));
			},
			trident: function(){
				return (!window.ActiveXObject) ? false : ((window.XMLHttpRequest) ? ((document.querySelectorAll) ? 6 : 5) : 4);
			},
			webkit: function(){
				return (navigator.taintEnabled) ? false : ((browser.features.xpath) ? ((browser.features.query) ? 525 : 420) : 419);
			},
			gecko: function(){
				return (!document.getBoxObjectFor && window.mozInnerScreenX == null) ? false : ((document.getElementsByClassName) ? 19 : 18);
			}
		},
		detect : function(){
			var info = '';
			for(var eng in this.engine){
				var e = this.engine[eng]();
				if(e !== false){
					info += 'engine:'+eng + ' ' + e;
					break;
				}
			}
			for(var b in this){
				if(this[b] === true){
					info += ' browser:' + b + ' ' + this['version'];
					break;
				}
			}
			return info;
		},
		version : (_ua.match(/.+(?:rv|it|ra|ie)[\/: ]([\d.]+)/) || [0, '0'])[1],
		msie	: /msie/.test(_ua),
		firefox : /firefox/.test(_ua),
		chrome	: /chrome/.test(_ua) && /webkit/.test(_ua),
		safari	: /safari/.test(_ua) && !this.chrome,
		opera	: /opera/.test(_ua)
	};
	browser.ie = browser.msie;
	browser.ie6 = browser.msie && parseInt(browser.version) === 6;
	browser.ie7 = browser.msie && parseInt(browser.version) === 7;
	browser.ie8 = browser.msie && parseInt(browser.version) === 8;

	browser.winSize = function(doc){
		var w, h;
		doc = doc || document;
		if(window.innerHeight){
			w = window.innerWidth;
			h = window.innerHeight;
		}
		else if(doc.documentElement && doc.documentElement.clientHeight){
			w = doc.documentElement.clientWidth;
			h = doc.documentElement.clientHeight;
		}
		else{
			w = doc.body.clientWidth;
			h = doc.body.clientHeight;
		}
		return { width:w, height:h };
	};

	browser.pageSize = function(doc){
		doc = doc || document;
	};

	browser.scroll = function(doc){
		doc = doc || document;
		return {
			'left' : Math.max(doc.documentElement.scrollLeft, doc.body.scrollLeft),
			'top' : Math.max(doc.documentElement.scrollTop, doc.body.scrollTop)
		};
	};

	return browser;
});