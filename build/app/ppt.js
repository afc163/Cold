Cold.add('app.ppt', ['dom','anim','event'], function(){
	var dom = Cold.dom,
		anim = Cold.anim,
		event = Cold.event;
	
	var ppt = {
		goTo : function(num){
			ppt.curr = num;
			window.location.hash="#slide-"+num;
			anim.run(ppt.slides, {
				'margin-top' : -(num-1)*ppt.height + 'px'
			}, function(){}, 600, 'easeOutStrong');
			ppt.showInfo();
		},
		prev : function(){
			(ppt.curr > 1)
				? ppt.goTo(--ppt.curr)
				: ppt.goTo(1);
		},
		next : function(){
			(ppt.curr < ppt.length)
				? ppt.goTo(++ppt.curr)
				: ppt.goTo(ppt.length);
		},
		domBind : function(){
			event.click(dom.id('prev'), function(){
				ppt.prev();
			});
			event.click(dom.id('next'), function(){
				ppt.next();
			});
		},
		resize : function(){
			dom.css(document.body, {
				'width' : screen.width + 'px',
				'height' : screen.height + 'px'
			});
			dom.css(ppt.win, {
				'height' : screen.height + 'px'
			});
			dom.css(ppt.pages, {
				'height' : screen.height - 120 + 'px'
			});
		},
		keyBind : function(){
			event.add(document, 'keyup', function(e){
				e = event.fix(e);
				switch(e.keyCode){
					case 33:
					case 37:
					case 38:
						ppt.prev();
						break;
					case 32:
					case 34:
					case 39:
					case 40:
						ppt.next();
						break;
					case 36:
						ppt.goTo(1);
						break;
					case 35:
						ppt.goTo(ppt.length);
						break;
				}
				return false;
			});
		},
		showInfo : function(){
			if(!dom.id('pptPageInfo')){
				var time = dom.create('div');
				time.id = 'pptTime';
				time.innerHTML =  '- 00:00 -';
				time.className = 'info';
				dom.css(time, {
					'right'		: '55px',
					'text-align': 'right'
				});
				var pageInfo = dom.create('div');
				pageInfo.id = 'pptPageInfo';
				pageInfo.innerHTML = ppt.curr + '/' + ppt.length;
				pageInfo.className = 'info';
				dom.css(pageInfo, {
					'left' : '55px'
				});
				dom.css(ppt.win, 'position', 'relative');
				dom.appendEnd(ppt.win, time);
				dom.appendEnd(ppt.win, pageInfo);

				var tick = 0;
				setInterval(function(){
					tick++;
					var min = parseInt(tick/60);
					var sec = tick%60;
					min = min>=10 ? min : '0'+min;
					sec = sec>=10 ? sec : '0'+sec;
					time.innerHTML = '- ' + min + ':' + sec + ' -';
				}, 1000);
			}
			else{
				dom.id('pptPageInfo').innerHTML = ppt.curr + '/' + ppt.length;
			}
		},
		init : function(){
			ppt.pages = dom.$CN('slide');
			ppt.win = dom.id('presentation');
			ppt.slides = ppt.pages[0].parentNode;
			ppt.length = ppt.pages.length;
			ppt.height = window.screen.height;
			
			ppt.curr = window.location.hash.replace("#slide-","") || 1;
			ppt.goTo(ppt.curr);

			ppt.domBind();
			ppt.keyBind();
			ppt.showInfo();
			ppt.resize();
		}
	};
	ppt.init();
});