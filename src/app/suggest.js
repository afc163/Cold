//搜索建议组件
Cold.add('app.suggest', ['dom', 'event', 'ajax', 'anim', 'browser'], function(){
	var dom = Cold.dom, event = Cold.event;

	var _default_option = {
		sendData : {},
		queryName : 'q',
		callbackKey : 'callback',
		callbackName : 'cold.suggest',
		isOverlay : false,
		maxLength : 10,
	
		width : null,
		layerClass : 'suggest-layer',
		showStyle : 'none',
		itemClass : 'suggest-item',
		selectedClass : 'suggest-selected-item',

		/* 用户自组装数据源，返回一个数组 */	
		customData : function(data) {
			return data;
		},
		/* 用户自定义layer的dom结构，返回html */		
		customLayerHtml : function(data) {
			return '';
		},
		/* 用户根据得到的data自定义每项item的dom结构，返回dom结点 */
		customItem : function(item) {
			return { html : '<p>' + item + '</p>', content: item };
		},
		/* 绑定选中提示项后的动作，比如表单提交 */
		enterFn : function() {
			
		}
	};

	Cold.cache.suggest = {};

	var _findParentDiv = function(el){
		var temp = el;
		while(!/div|body/i.test(temp.parentNode.tagName)){
			temp = temp.parentNode;
		}
		return temp.parentNode;
	};

	var _trim = function(str){
		return str.replace(/^\s+|\s+$/g, '');
	};

	var newSuggest = function() {
		return {
			showLayer : function(data){
				var that = this;
				if(!data) return;
				data = this.option.customData(data);

				var layer, top, left, width, temp, str = '';
				if(!this.layer) {
					layer = dom.create('div');
					layer.className = 'coldAppSuggestLayer';
					var parentDiv = _findParentDiv(this.input),
					pdivPos = dom.getXY(parentDiv),
					inputPos = dom.getXY(this.input);
					left = inputPos['x'] - pdivPos['x'] + 'px';
					top = inputPos['y'] - pdivPos['y'] + dom.height(this.input) + 'px';
					width = (this.option.width || (dom.width(this.input) - 2)) + 'px';
					dom.addClass(layer, this.option.layerClass);
					dom.css(layer, {
						'position' : 'absolute',
						'top' : top,
						'left' : left,
						'width' : width,
						'z-index' : '10',
						'overflow' : 'hidden'
					});
					if(dom.css(parentDiv, 'position') != 'absolute') {
						dom.css(parentDiv, 'position', 'relative');
					}
					dom.css(parentDiv, 'z-index', '9999');
					layer.innerHTML = this.option.customLayerHtml(data);

					for(var i=0; i<this.option.maxLength; i++) {
						if(data[i]) { 
							temp = dom.create(this.option.customItem(data[i]).html);
						};
						dom.css(temp, 'display', data[i] ? 'block' : 'none');
						dom.addClass(temp, this.option.itemClass);
						(function(el, i) {
							event.hover(el, {
								over : function(){
									that.over = true;
									that.index = i;
									that.selectItem();
								},
								out : function(){
									that.over = false;
									that.index = null;
								}
							});
							event.click(el, function(){
								that.input.value = el.innerHTML;
								that.hideLayer();
								that.option.enterFn();
							});
						})(temp, i);
						dom.appendEnd(layer, temp);
					}
					dom.insertAfter(this.input, layer);
					this.layer = layer;
					this.list = dom.$CN(this.option.itemClass, layer);

					//动画效果
					if(this.option.showStyle == 'slideDown') {
						var oldHeight = dom.height(this.layer);
						dom.css(this.layer, 'height', '0px');
						Cold.anim.slide(this.layer, oldHeight, function(){
							dom.css(that.layer, 'height', '');
						}, 200);
					}
					else if(this.option.showStyle == 'fadeIn') {
						dom.css(this.layer, 'opacity', '0');	
						Cold.anim.fadeIn(this.layer, function(){
						}, 300);
					}
				}
				else{
					dom.css(this.layer, 'display', 'block');
					for(var i=0; i<this.option.maxLength; i++) {
						dom.removeClass(this.list[i], this.option.selectedClass);
						this.list[i].innerHTML = data[i] ? this.option.customItem(data[i]).content : '';
						dom.css(this.list[i], 'display', data[i] ? 'block' : 'none');
					}
				}
			},

			hideLayer : function() {
				this.layer && dom.css(this.layer, 'display', 'none');
				this.index = null;
			},

			lastItem : function(){
				if(!Cold.isNumber(this.index)){
					this.index = this.list.length - 1;
				}
				else{
					this.index = (this.index - 1 + this.list.length) % this.list.length;
				}
				this.selectItem();
			},

			nextItem : function(){
				if(!Cold.isNumber(this.index)){
					this.index = 0;
				}
				else{
					this.index = (this.index + 1) % this.list.length;
				}
				this.selectItem();
			},

			selectItem : function()	{
				var that = this;
				if(Cold.isNumber(this.index)){
					var el = this.list[this.index];
					Cold.each(this.list, function(item) {
						dom.removeClass(item, that.option.selectedClass);
					});
					dom.addClass(el, this.option.selectedClass);
				}
				this.input.value = this.lastInputValue =  this.list[this.index].innerHTML;			
			},

			getSuggestion : function() {
				var that = this;				
				if(_trim(this.input.value) === ''){
					this.hideLayer();
					Cold.namespace(this.option.callbackName, function(){});
					return;
				}
				var cacheData = Cold.cache.suggest[this.option.inputId][this.input.value];
				if(cacheData) {
					this.showLayer(cacheData);
					return;
				}
				this.option.sendData[this.option.queryName] = this.input.value;
				Cold.ajax.jsonp(this.url, {
					data : this.option.sendData,
					callbackKey : this.option.callbackKey,
					callbackName : this.option.callbackName,
					onSuccess : function(data) {
						//保存cache
						Cold.cache.suggest[that.option.inputId][that.input.value] = data;
						that.showLayer(data);
					}
				});
			},

			lastInputValue : '',

			typeInter : null,

			keyBind : function(){
				var that = this;
				event.add(this.input, 'focus', function(e) {
					that.typeInter = setInterval(function() {
						if(that.lastInputValue != _trim(that.input.value)) {
							that.getSuggestion();
							that.lastInputValue = _trim(that.input.value);
						}
					}, 75);
				});
				event.add(this.input, 'keyup', function(e) {
					e = event.fix(e);
					if(e.keyCode === 38) {
						that.lastItem();
					}
					else if(e.keyCode === 40) {
						that.nextItem();
					}
					else if(e.keyCode === 13) {
						that.hideLayer();
						that.option.enterFn();
					}
				});
				event.add(this.input, 'blur', function() {
					!that.over && that.hideLayer();
					that.typeInter && clearInterval(that.typeInter);
				});
			}
		};
	};

	return function(option) {
		option = option || {};
		Cold.extend(option, _default_option);
		var suggest = newSuggest();
		suggest.option = option;
		suggest.input = dom.id(option.inputId);
		suggest.url = option.url;
		suggest.keyBind();
		Cold.cache.suggest[option.inputId] = {};
		dom.val(suggest.input, 'autocomplete', 'off');
	};
});
