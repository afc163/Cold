//搜索建议组件
Cold.add('app.suggest', ['dom', 'event', 'ajax', 'anim'], function(){
	var dom = Cold.dom, event = Cold.event;
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
	var _suggest = {
		showLayer : function(data){
			if(!data) return;
			var layer, top, left, width, temp, str = '';
			if(!_suggest.layer){
				layer = dom.create('div');
				layer.id = 'coldAppSuggestLayer';
				var parentDiv = _findParentDiv(this.input),
					pdivPos = dom.getXY(parentDiv),
					inputPos = dom.getXY(this.input);
				left = inputPos['x'] - pdivPos['x'] + 'px';
				top = inputPos['y'] - pdivPos['y'] + dom.height(this.input) + 'px';
				width = dom.width(this.input) - 2 + 'px';
				dom.css(layer, {
					'position'	: 'absolute',
					'top'		: top,
					'left'		: left,
					'border'	: '1px solid #999',
					'border-top': 'none',
					'width'		: width,
					'background': '#fff',
					'z-index'	: '10'
				});
				dom.css(parentDiv, 'position', 'relative');
				dom.css(parentDiv, 'z-index', '9999');

				Cold.each(data, function(item, index){
					temp = dom.create('p');
					dom.css(temp, {
						'height'		: '14px',
						'font-size'		: '14px',
						'line-height'	: '14px',
						'color'			: '#555',
						'overflow'		: 'hidden',
						'display'		: 'block',
						'margin'		: '0',
						'padding'		: '6px 8px'
					});
					(function(el, i){
						event.hover(el, {
							over : function(){
								_suggest.over = true;
								_suggest.index = i;
								_suggest.selectItem();
							},
							out : function(){
								_suggest.over = false;
								_suggest.index = null;
								dom.css(el, 'background', '#fff');
							}
						});
						event.click(el, function(){
							_suggest.input.value = el.innerHTML;
							_suggest.hideLayer();
						});
					})(temp, index);
					temp.innerHTML = item;
					dom.appendEnd(layer, temp);
				});
				dom.insertAfter(this.input, layer);
				_suggest.layer = layer;
				_suggest.list = layer.getElementsByTagName('p');
			}
			else{
				dom.css(_suggest.layer, 'display', 'block');
				var index = 0;
				Cold.each(data, function(item){
					_suggest.list[index++].innerHTML = item;
				});
			}
		},
		hideLayer : function(){
			_suggest.layer && dom.css(_suggest.layer, 'display', 'none');
		},
		lastItem : function(){
			if(!Cold.isNumber(_suggest.index)){
				_suggest.index = _suggest.list.length - 1;
			}
			else{
				_suggest.index = (_suggest.index - 1 + _suggest.list.length) % _suggest.list.length;
			}
			_suggest.selectItem();
		},
		nextItem : function(){
			if(!Cold.isNumber(_suggest.index)){
				_suggest.index = 0;
			}
			else{
				_suggest.index = (_suggest.index + 1) % _suggest.list.length;
			}
			_suggest.selectItem();
		},
		selectItem : function(){
			if(Cold.isNumber(_suggest.index)){
				var el = _suggest.list[_suggest.index];
				Cold.each(_suggest.list, function(item){
					item.className = '';
					dom.css(item, 'background', '');
				});
				el.className = 'selected';
				dom.css(el, 'background', '#A2B7DB');
			}
		},
		getSuggestion : function(){
			if(_trim(this.input.value) === ''){
				_suggest.hideLayer();
				return;
			}
			Cold.ajax.get(_suggest.url + this.input.value, {
				onSuccess : function(data){
					_suggest.showLayer(data);
				}
			});
		},
		keyBind : function(){
			var INPUT_EVENT = Cold.browser.IE ? 'keyup' : 'input';
			event.add(_suggest.input, INPUT_EVENT, function(e){
				if(e.keyCode === 38){
					_suggest.lastItem();
					_suggest.input.value = _suggest.list[_suggest.index].innerHTML;
				}
				else if(e.keyCode === 40){
					_suggest.nextItem();
					_suggest.input.value = _suggest.list[_suggest.index].innerHTML;
				}
				else{
					_suggest.getSuggestion();
				}
			});
			event.add(_suggest.input, 'blur', function(){
				!_suggest.over && _suggest.hideLayer();
			});
		}
	};

	return function(input, url){
		_suggest.input = dom.id(input);
		_suggest.url = url;
		_suggest.keyBind();
		dom.val(_suggest.input, 'autocomplete', 'off');
	};
});