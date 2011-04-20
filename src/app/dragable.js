//app.dragable组件
Cold.add('app.dragable', ['dom', 'event'], function(){
	var event = Cold.event,
		dom = Cold.dom;
	var x, y, w, h, dashedBox = dom.create('div'), DRAG_CN = 'module';
	dashedBox.id = 'dashedBox';
	dashedBox.className = DRAG_CN;
	dom.css(dashedBox, 'border', '2px dashed #C5E9E2');

	//模块引用
	var list = dom.$CN(DRAG_CN), modArea = list[0].parentNode.parentNode;

	//定义列对象
	var column = function(columnNode, className){
		this.name = className;
		this.node = columnNode;
		this.x = dom.getXY(this.node)['x'];
		this.init();
	};
	column.prototype = {
		//构造函数
		init : function(){
			this.items = dom.$CN(this.name, this.node);
			this.lines = [];
			this.calLines();
		},
		//计算当前列的区域线，区域线在模块的3/5位置处，将此列划分为n(模块数)+1个区域
		calLines : function(){
			var that = this;
			Cold.each(this.items, function(item){
				var y = dom.getXY(item)['y'];
				var height = dom.height(item);
				that.lines.push(y + height*0.6);
			});
		},
		//判断当前位置在哪个区域内
		whichArea : function(pos){
			var y = pos['y'], i = 0;
			Cold.each(this.lines, function(line){
				if(y < line) return false;
				i++;
			});
			return i;
		}
	};

	//共有两列
	var column1 = new column(dom.$CN('area_1')[0], DRAG_CN);
	var column2 = new column(dom.$CN('area_2')[0], DRAG_CN);

	Cold.each(list, function(item){
		var controler = item.getElementsByTagName('div')[0];
		dom.css(controler, 'cursor', 'move');

		var moveFn = function(e){
			e = event.fix(e);
			//位置移动
			item.style.left = e.clientX - x + 'px';
			item.style.top = e.clientY - y + 'px';
			//当前信息保存
			var curr = {
				min : Number.MAX_VALUE,	//当前拖动模块距离各模块的最小距离
				target : dashedBox,		//当前拖动模块距离最近的模块
				index : -1,
				dashedMoved : false,
				pos : {					//当前拖动模块的位置
					'x' : e.clientX - x,
					'y' : e.clientY - y
				}
			};
			//判断靠近哪一列，得到当前列
			var cdis1 = Math.abs(curr.pos['x'] - column1.x);
				cdis2 = Math.abs(curr.pos['x'] - column2.x);
				currColumn = (cdis2 > cdis1) ? column1 : column2;
			//判断移动模块在列的哪一个区域
			var i = currColumn.whichArea(curr.pos);
			//如果在第一个区域，或是最后一个区域，直接将虚线框加到列节点的前部
			if(i === currColumn.items.length){
				dom.appendEnd(currColumn.node, dashedBox);
				curr.dashedMoved = true;
			}
			//其他情况则加到列的第i个模块的前面
			else{
				if(i-1 >= 0 && currColumn.items[i-1] === dashedBox){
					dom.insertAfter(currColumn.items[i], dashedBox);
					curr.dashedMoved = true;
				}
				else if(currColumn.items[i] !== dashedBox){
					dom.insertBefore(currColumn.items[i], dashedBox);
					curr.dashedMoved = true;
				}
			}
			//重新绑定两列并计算模块位置
			if(curr.dashedMoved){
				column1.init();
				column2.init();
			}
		};

		//注册鼠标点击事件
		event.add(controler, 'mousedown', function(e){
			e = event.fix(e);
			if(e.target !== controler) return;

			//创建全屏占位div
			createMaskDiv();

			selectionEnable(item, false);
			var pos = dom.getXY(item);
			x = e.clientX - pos['x'];
			y = e.clientY - pos['y'];
			w = dom.width(item);
			h = dom.height(item);
			dom.css(item, {
				'position'	: 'absolute',
				'width'		: w - 2 + 'px',
				'height'	: h - 2 + 'px',
				'opacity'	: 0.7
			});
			item.className = 'moveable';
			dom.css(dashedBox, {
				'width'		: w - 4 + 'px',
				'height'	: h - 4 + 'px',
				'margin-bottom'	: '20px',
				'display'	: 'block'
			});
			dom.insertAfter(item, dashedBox);
			dashedBox.className = DRAG_CN;

			document.onmousemove = moveFn;
			document.onmouseup = function(){
				document.onmousemove = null;
				dom.insertAfter(dashedBox, item);
				dom.css(item, {
					'position'	: 'static',
					'left'		: '',
					'top'		: '',
					'opacity'	: ''
				});
				item.className = DRAG_CN;
				dom.css(dashedBox, 'display', 'none');
				dashedBox.className = '';
				selectionEnable(item, true);
				//删除全屏占位div
				removeMaskDiv();
			};
		});
	});

	//拖拽时避免文字被选中以及恢复文字选择效果
	function selectionEnable(target, enable){
		var fn =  function(){ return false };
		if(typeof target.onselectstart != 'undefined'){ //IE route
			target.onselectstart = ( enable ? null : fn );
		}else if(typeof target.style.MozUserSelect != 'undefined'){ //Firefox route
			target.style.MozUserSelect = ( enable ? null : 'none' );
		}else{ //All other route (ie: Opera)
			target.onmousedown = ( enable ? null : fn );
		}
	};
	//用于占位，防止页面高度变化导致的鼠标错位
	function createMaskDiv(){
		var maskdiv = dom.id('maskdiv');
		if(!maskdiv){
			maskdiv = dom.create('div', {
				'id'		: 'maskdiv'
			});
			dom.css(maskdiv, {
				'width'		: '100%',
				'position'	: 'absolute',
				'top'		: '0',
				'left'		: '0'
			});
		}
		dom.css(maskdiv, {
			'height': Cold.browser.pageSize()['height'] + 'px'
		});
		dom.appendEnd(document.body, maskdiv);
	}

	function removeMaskDiv(){
		dom.remove(dom.id('maskdiv'));
	}
});