Cold.add('app.DatePicker', ['dom','event'], function(){
	var dom = Cold.dom,
		event = Cold.event,
		inputs = dom.$CN('date'),
		DatePicker;
	
	Cold.each(inputs, function(item){
		dom.val(item, 'readonly', 'true');
		var pickFlag = dom.create('span');
		pickFlag.innerHTML = '日期';
		//这里的位置是权益的，更通用的方法是根据input控件的xy位置和高宽来确定位置
		dom.css(pickFlag, {
			'float'		: 'left',
			'font-size'	: '12px',
			'color'		: '#999',
			'position'	: 'absolute',
			'left'		: '234px',
			'top'		: '6px'
		});
		item.parentNode.style.position = 'relative';
		dom.appendEnd(item.parentNode, pickFlag);
		
		var func = function(e){
			e.stopPropagation();

			if(!DatePicker){
				DatePickerInit();
			}
			DatePicker.show(item);
			document.onclick = function(){
				DatePicker.hide();
				document.onclick = null;
			};
			DatePicker.DIV.onclick = function(e){
				e = event.fix(e);
				e.stopPropagation();
			};
		}
		event.click(item, func);
		event.click(pickFlag, func);
	});

	function DatePickerInit(){
		DatePicker = {
			pickYear : function(){
			},
			pickMonth : function(){
			},
			pickDay : function(){
			},
			setDate : function(value){
			},
			createDiv : function(input){
				var pos = dom.getXY(input),
					w = dom.width(input),
					h = dom.height(input);

				var picker = dom.create('div');
				picker.id = 'datepicker';
				dom.css(picker, {
					'width'			: '180px',
					'height'		: '130px',
					'font-size'		: '12px',
					'color'			: '#555',
					'background'	: '#fff',
					'border'		: '1px solid #999',
					'position'		: 'absolute',
					'left'			: pos.x + 'px',
					'top'			: pos.y + h - 1 + 'px'
				});
				dom.appendBody(picker);
				DatePicker.DIV = picker;
			},
			show : function(input){
				if(!dom.id('datepicker')){
					DatePicker.createDiv(input);
				}
				else{
					dom.css(DatePicker.DIV, 'display', 'block');
				}
				DatePicker.setDate(input.value);
			},
			hide : function(){
				DatePicker.DIV && dom.css(DatePicker.DIV, 'display', 'none');
			}
		};
	}
});