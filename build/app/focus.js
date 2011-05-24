Cold.add('app.focus', ['dom', 'anim', 'event'], function(){

	var dom = Cold.dom;
	var  _defaultConfig = {
		style		: "fade",		//图片切换效果，可选[none|fade|roll]
		duration	: 300,			//图片切换速度（毫秒）
		easing		: 'easeOut',	//切换easing
		direction	: "updown",		//图片切换方向，切换效果为roll时有效，可选[updown|leftright]
		hasDesc		: true,			//是否显示图片描述
		hasIndex	: true,			//是否显示图片切换按钮
		action		: 'hover',		//切换图片的动作，可选[hover|click]
		auto		: true,			//是否自动切换
		time		: 5000,			//定时切换图片的间隔，小于100毫秒则不自动切换
		outsideCss	: false			//是否使用外部css进行渲染
	};

	var _focus = {
		//图片切换
		change : function(){
			this.curr %= this.length;
			//描述切换
			if(this.desc){
				var currPic = this.imgList[this.curr];
				this.desc.innerHTML = currPic.getAttribute("title") ||currPic.getAttribute("alt");
			}
			//索引切换
			if(this.indexList){
				this.indexList[this.curr].className = 'selected';
				this.indexList[this.last].className = '';
			}
			//图片切换
			this[this.config.style]();
		},
		none : function(){
			this.picList[this.last].style.display = 'none';
			this.picList[this.curr].style.display = '';
		},
		//渐隐方式
		fade : function(){
			var lastPic = this.picList[this.last],
				currPic = this.picList[this.curr];
			lastPic.style.zIndex = 10;	//保持旧图在新图的上方
			currPic.style.zIndex = 1;
			currPic.style.display = '';
			Cold.anim.fadeOut(lastPic, function(){
				lastPic.style.display = 'none';
				dom.opacity(lastPic, '');
			}, this.config.duration, this.config.easing);
		},
		//滚动方式
		roll : function(){
			dom.css(this.picList, 'display', '');
			var lenPerPic;
			if(this.config.direction === 'leftright'){
				lenPerPic = parseInt(dom.css(this.win, 'width'));
				Cold.anim.run(this.el, {
					'left' : -this.curr*lenPerPic
				}, null, this.config.duration, this.config.easing);
			}else{
				lenPerPic = parseInt(dom.css(this.win, 'height'));
				Cold.anim.run(this.el, {
					'top' : -this.curr*lenPerPic
				}, null, this.config.duration, this.config.easing);
			}
		},
		//使用js修饰样式
		decorate : function(){
			if(!this.config.outsideCss){
				dom.css(this.win, {
					'position'	: 'relative',
					'overflow'	: 'hidden',
					'font-size' : '0'
				});
				this.desc && dom.css(this.desc, {
					'position'		: 'absolute',
					'bottom'		: '0',
					'line-height'	: '30px',
					'font-size'		: '14px',
					'z-index'		: '100',
					'padding-left'	: '10px'
				});
				this.descBg && dom.css(this.descBg, {
					'background': '#000',
					'position'	: 'absolute',
					'bottom'	: '0',
					'height'	: '30px',
					'z-index'	: '100',
					'width'		: '100%'
				});
				this.picIndex && dom.css(this.picIndex, {
					'position'		: 'absolute',
					'z-index'		: '101',
					'right'			: '1em',
					'bottom'		: '6px',
					'font'			: '14px/16px Helvetica,arial,sans-serif',
					'color'			: '#666',
					'text-align'	: 'center'
				});
				this.indexList && dom.css(this.indexList, {
					'width'			: '16px',
					'height'		: '16px',
					'line-height'	: '16px',
					'float'			: 'left',
					'display'		: 'inline',
					'margin-left'	: '8px',
					'border'		: '1px solid #f90',
					'cursor'		: 'pointer',
					'background'	: '#FFF5E1'
				});
				//roll下的特殊样式
				if(this.config.style === 'roll'){
					dom.css(this.el, 'position', 'absolute');
					dom.css(this.picList, 'position', '');
					if(this.config.direction === 'leftright'){
						dom.css(this.picList, {
							'float'			: 'left',
							'margin-left'	: '0'
						});
						dom.css(this.el, 'width', '32768px');
					}
				}
				else{
					dom.css(this.picList, {
						'position'	: 'absolute',
						'margin-top': '0',
						'left'		: '0',
						'top'		: '0'
					});
				}
			}
		},
		//显示图片描述
		showDesc : function(){
			if(this.config.hasDesc){
				if(!this.desc){
					this.desc = dom.$C('div');
					this.desc.className = 'focus_desc';
					dom.css(this.desc, {});
					//从当前图片的title属性或alt属性中读取描述
					var curr = this.imgList[this.curr];
					this.desc.innerHTML = curr.getAttribute("title") ||curr.getAttribute("alt");
					dom.appendEnd(this.win, this.desc);
				}
				if(!this.descBg){
					this.descBg = dom.$C('div');
					this.descBg.className = 'focus_descBg';
					dom.opacity(this.descBg, 0.1);
					dom.appendEnd(this.win, this.descBg);
				}
			}
		},
		//显示图片切换索引
		showIndex : function(){
			if(!this.config.hasIndex) return;
			this.picIndex = dom.$C('ul');
			this.picIndex.className = 'focus_picIndex';
			for(var i=0; i<this.length; i++){
				var tempIndex = dom.$C('li');
				if(i === 0){
					tempIndex.className = 'selected';
				}
				tempIndex.innerHTML = i+1;
				//为切换按钮注册切换事件
				(function(i ,that){
					var f = function(){
						that.last = that.curr;
						that.curr = i;
						that.change.call(that);
					}, tempInter;
					if(this.action === 'click'){
						Cold.event.click(tempIndex, f);
					}else{
						Cold.event.add(tempIndex, 'mouseover', function(){
							tempInter = setTimeout(f, 200);
						});
						Cold.event.add(tempIndex, 'mouseout', function(){
							clearTimeout(tempInter);
						});
					}
				})(i, this);
				dom.appendEnd(this.picIndex, tempIndex);
			}
			dom.appendEnd(this.win, this.picIndex);
			this.indexList = this.picIndex.getElementsByTagName('li');
		},
		//开始自动切换
		autoChange : function(){
			this.stopAutoChange();
			if(this.config.auto && this.config.time >= 100){
				this.changeInter = setInterval((function(that){
					return function(){
						that.last = that.curr++;
						that.change();
					};
				})(this), this.config.time);
			}
		},
		//停止自动切换
		stopAutoChange : function(){
			this.changeInter && clearInterval(this.changeInter);
		},
		//初始化
		init : function(el, config){
			this.stopAutoChange();
			this.el = dom.$E(el);
			this.win = this.el.parentNode;
			this.picList = this.el.getElementsByTagName('li');
			this.length = this.picList && this.picList.length || 0;
			this.imgList = this.el.getElementsByTagName('IMG');
			this.config = Cold.extend(config, _defaultConfig);
			this.curr = 0; //初始图片号

			this.showIndex();	//显示图片索引
			this.showDesc();	//显示图片描述
			this.decorate();	//进行样式渲染
			this.autoChange();	//开始自动切换
			//当鼠标在窗口中时，停止自动切换
			(function(that){
				Cold.event.add(that.win, 'mouseover', function(){
					that.stopAutoChange.call(that);
				});
				Cold.event.add(that.win, 'mouseout', function(){
					that.autoChange.call(that);
				});
			})(this);
		}	
	};

	return function(el, config){
		_focus.init(el, config);
	};
});