Cold.add("Cold.dom",function(){
	console.log("cold.dom init");
	var _selector = function(){
		var elems = null;
		return elems;
	};

	var _$E = function(str){
		return typeof str === 'string' ? document.getElementById(str) : str;
	};

	var _$C = function(str){
		return typeof str === 'string' ? document.createElement(str) : str;
	};

	var _$CN = function(str){
		
	};

	var _$T = function(str){
		return typeof str === 'string' ? document.getElementsByTagName(str) : str;
	};

	return {
		selector: _selector,
		$		: _selector,
		$E		: _$E,
		$C		: _$C,
		$CN		: _$CN,
		$T		: _$T
	};
});