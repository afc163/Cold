//搜索建议组件
Cold.add('app.suggest', ['dom', 'event', 'ajax', 'anim'], function(){
	var dom = Cold.dom,
		event = Cold.event;

	var _suggest = {
		showLayer : function(data){
			if(!data) return;
			var layer, top, width, temp, str = '';
			if(!_suggest.layer){
				layer = dom.create('div');
				layer.id = 'coldAppSuggestLayer';
				top = dom.getXY(this.input.parentNode)['y'] - dom.getXY(this.input)['y'];
				width = dom.width(this.input) - 2 + 'px';
				dom.css(layer, {
					'position'	: 'absolute',
					'top'		: top,
					'border'	: '1px solid #999',
					'border-top': 'none',
					'width'		: width,
					'background': '#fff',
					'z-index'	: '10'
				});
				dom.css(this.input.parentNode, 'position', 'relative');

				Cold.each(data, function(item){
					temp = dom.create('p');
					dom.css(temp, {
						'height'		: '20px',
						'font-size'		: '14px',
						'line-height'	: '20px',
						'color'			: '#555',
						'margin'		: '0',
						'padding'		: '0'
					});
					(function(el){
						event.hover(el, {
							over : function(){
								dom.css(el, 'background', '#F0F7F9');
							},
							out : function(){
								dom.css(el, 'background', '#fff');
							}
						});
						event.click(el, function(){
							setTimeout(function(){
								_suggest.input.value = el.innerHTML;
							}, 0);
						});
					})(temp);
					temp.innerHTML = item;
					dom.appendEnd(layer, temp);
				});
				dom.insertAfter(this.input, layer);
				_suggest.layer = layer;
			}
			else{
				dom.css(_suggest.layer, 'display', 'block');
				var index = 0, list = _suggest.layer.getElementsByTagName('p');
				Cold.each(data, function(item){
					list[index++].innerHTML = item;
				});
			}
		},
		hideLayer : function(){
			dom.css(_suggest.layer || dom.id('coldAppSuggestLayer'), 'display', 'none');
		},
		getSuggestion : function(){
			Cold.ajax.get(_suggest.url + this.input.value, {
				onSuccess : function(data){
					_suggest.showLayer(data);
				}
			});
		},
		keyBind : function(){
			event.add(_suggest.input, 'keyup', function(){
				_suggest.getSuggestion();
			});
			event.add(_suggest.input, 'blur', function(){
				setTimeout(function(){
					_suggest.hideLayer();
				}, 100);
			});
		}
	};

	return function(input, url){
		_suggest.input = dom.id(input);
		_suggest.url = url;
		_suggest.keyBind();
	};
});