Cold.add('app.DatePicker', ['dom','event'], function(){

	/* app.DatePicker css
	.dpr_box select{margin:6px 0;}
	.dpr_box li{font-size:12px;text-align: center;width: 14.2857%;float:left;display:inline;margin:0;padding:1px 0;list-style:none;_zoom:1;}
	.dpr_select, #dpr_weeks{background:#DAF2E6;text-align:center;overflow:hidden;_zoom:1;font-weight:bold;}
	.dpr_box li.dpr_daySelect{cursor:pointer;}
	.dpr_box li.dpr_today{background:#FFF4AC;}
	.dpr_box li.dpr_selected{background:#328DCF;color:#fff;font-weight:bold;}
	.dpr_box li.over{background:#C5E9E2;}
	*/

	var dom = Cold.dom,
		event = Cold.event,
		inputs = dom.$CN('date'),
		NOW = new Date(),
		DatePicker;
	
	Cold.each(inputs, function(item){
		dom.val(item, 'readonly', 'true');
		var pickFlag = dom.create('span');
		pickFlag.innerHTML = '日期';
		//这里的位置是权宜的，更通用的方法是根据input控件的xy位置和高宽来确定位置
		dom.css(pickFlag, {
			'float'		: 'left',
			'font-size'	: '12px',
			'color'		: '#999',
			'position'	: 'absolute',
			'left'		: '238px',
			'top'		: '9px'
		});
		item.parentNode.style.position = 'relative';
		dom.appendEnd(item.parentNode, pickFlag);
		
		var func = function(e){
			e.stopPropagation();

			if(!DatePicker){
				DatePickerInit(item);
			}
			DatePicker.show();
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

	function DatePickerInit(input){
		DatePicker = {
			input : input,
			setDateTo : function(){
				DatePicker.input.value = DatePicker.year + '-' +  (DatePicker.month+1) + '-' +  DatePicker.day;
			},
			setDateFrom : function(value){
				if(value){
					var d = value.match(/(\d{4})-(\d{1,2})-(\d{1,2})/);
					DatePicker.year = DatePicker.currentYear = parseInt(d[1], 10);
					DatePicker.month = DatePicker.currentMonth = parseInt(d[2], 10)-1;
					DatePicker.day  = DatePicker.currentDay = parseInt(d[3], 10);
				}
				else{
					DatePicker.year = DatePicker.currentYear = NOW.getFullYear();
					DatePicker.month = DatePicker.currentMonth = NOW.getMonth();
					DatePicker.day = DatePicker.currentDay = NOW.getDate();
				}
			},
			createDiv : function(input){
				var pos = dom.getXY(input),
					w = dom.width(input),
					h = dom.height(input);
				var picker = dom.create('div');
				picker.id = 'datepicker';
				dom.css(picker, {
					'width'			: '168px',
					'overflow'		: 'hidden',
					'font-size'		: '12px',
					'color'			: '#555',
					'background'	: '#fff',
					'z-index'		: 500,
					'border'		: '1px solid #999',
					'position'		: 'absolute',
					'left'			: pos.x + 'px',
					'top'			: pos.y + h - 1 + 'px'
				});
				picker.innerHTML = '<div class="dpr_box">\
						<div class="dpr_select">\
							<select id="dpr_monthSelect"></select>\
							<select id="dpr_yearSelect"></select>\
						</div>\
						<div id="dpr_weeks"></div>\
						<ul id="dpr_days"></ul>\
					</div>';
				dom.appendBody(picker);
				DatePicker.DIV = picker;
				//加入月份选项
				Cold.each(DatePicker.months, function(item, index){
					//tempHtml += '<option value="'+index+'">'+item+'</option>';
					dom.id('dpr_monthSelect').options[dom.id('dpr_monthSelect').options.length] = new Option(item, index);
				});
				event.add(dom.id('dpr_monthSelect'), 'change', function(){
					DatePicker.month = dom.id('dpr_monthSelect').value;
					DatePicker.update();
				});
				//加入年份选项
				for(var i = DatePicker.yearStart; i>DatePicker.yearStart-DatePicker.yearRange-1; i--){
					dom.id('dpr_yearSelect').options[dom.id('dpr_yearSelect').options.length] = new Option(i,i);
				}
				event.add(dom.id('dpr_yearSelect'), 'change', function(){
					DatePicker.year = dom.id('dpr_yearSelect').value;
					DatePicker.update();
				});
				//加入星期头
				var tempHtml = '';
				Cold.each(DatePicker.weeks, function(item){
					tempHtml += '<li>'+item+'</li>';
				});
				dom.id('dpr_weeks').innerHTML = tempHtml;
				//更新日期信息
				DatePicker.update();
			},
			update : function(){
				var date = new Date();
				if (DatePicker.month && DatePicker.year) {
					date.setFullYear(DatePicker.year, DatePicker.month, 1);
				} else {
					DatePicker.month = date.getMonth();
					DatePicker.year = date.getFullYear();
					date.setDate(1);
				}
				//闰年判断
				if((DatePicker.year%4 == 0 && DatePicker.year%100 != 0) || DatePicker.year%400 == 0){
					DatePicker.daysInMonth[1] = 29;
				}
				else{
					DatePicker.daysInMonth[1] = 28;
				}
				/* set the day to first of the month */
				var firstDay = (1-(7+date.getDay()-DatePicker.startDay)%7);

				//加入天信息
				var tempHtml = '';
				while(firstDay <= DatePicker.daysInMonth[DatePicker.month]){
					for (i = 0; i < 7; i++){
						var tempInfo = '';
						// Show the current day
						if ( (firstDay == DatePicker.currentDay) && (DatePicker.month == DatePicker.currentMonth) && (DatePicker.year == DatePicker.currentYear) ) {
							tempInfo += ' dpr_selected';
						}
						// Show today
						if ( (firstDay == NOW.getDate()) && (DatePicker.month == NOW.getMonth()) && (DatePicker.year == NOW.getFullYear()) ) {
							tempInfo += ' dpr_today';
						}
						//set the days
						if ((firstDay <= DatePicker.daysInMonth[DatePicker.month]) && (firstDay > 0)){
							tempHtml += '<li class="dpr_daySelect'+tempInfo+'" dateValue="'+DatePicker.year+'-'+(parseInt(DatePicker.month,10)+1)+'-'+firstDay+'">'+firstDay+'</li>';
						} else {
							tempHtml += '<li class="dpr_empty"> </li>';
						}
						firstDay++;
					}
				}
				dom.id('dpr_days').innerHTML = tempHtml;
				dom.id('dpr_monthSelect').value = DatePicker.month;
				dom.id('dpr_yearSelect').value = DatePicker.year;

				//绑定over和click事件
				Cold.each(dom.$CN('dpr_daySelect'), function(item){
					event.click(item, function(){
						DatePicker.setDateFrom(item.getAttribute('dateValue'));
						DatePicker.setDateTo(input);
						DatePicker.hide();
					});
					event.hover(item, {
						over : function(){
							dom.addClass(item, 'over');
						},
						out : function(){
							dom.removeClass(item, 'over');
						}
					});
				});
			},
			show : function(input){
				DatePicker.setDateFrom(DatePicker.input.value);
				if(!dom.id('datepicker')){
					DatePicker.createDiv(DatePicker.input);
				}
				else{
					dom.css(DatePicker.DIV, 'display', 'block');
					DatePicker.update();
				}
			},
			hide : function(){
				DatePicker.DIV && dom.css(DatePicker.DIV, 'display', 'none');
			}
		};
		DatePicker.weeks = "日一二三四五六".split('');
		DatePicker.months = "一月 二月 三月 四月 五月 六月 七月 八月 九月 十月 十一月 十二月".split(' ');
		DatePicker.daysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
		DatePicker.startDay = 7; // 1 = week starts on Monday, 7 = week starts on Sunday
		DatePicker.yearRange = 80;
		DatePicker.yearStart = (new Date().getFullYear());
	}
});