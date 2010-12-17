Cold.add("Cold.ajax",function(){
	var _jsonToQuery = function(data){
		if(typeof data === 'string'){
			return data;
		}
		var q = '';
		for(var p in data){
			q += (p + '=' + data[p] + '&');
		}
		if(q !== ''){
			q = q.slice(0, -1);
		}
		return q;
	};

	var _getRequest = function(){
		try{
			return new XMLHttpRequest();
		}
		catch(e){
			try{
				return new ActiveXObject('MSXML2.XMLHTTP');
			}
			catch(e){
				return new ActiveXObject('Microsoft.XMLHTTP');
			}
		}
	};

	var _defaultOption = {
		method		: 'get',
		data		: {},
		async		: true,
		contentType : 'application/x-www-form-urlencoded',
        charset		: 'utf-8',
		timeout		: null,
		returnType	: 'json',	// json | jsonp | script | xml | html | text
		onSuccess	: function(){},
		onError		: function(){}
	};

	var _ajax = function(url, option){
		if (url == '' || url == null) {
			throw new Error('ajax need parameter url.');
		}
		var XHR = _getRequest();
		Cold.extend(option, _defaultOption);

		XHR.onreadystatechange = function(){
			var data = '';
			if(XHR.readyState === 4){
				if(XHR.status === 200 || XHR.status === 0){
					data = XHR.responseText;
					option.onSuccess && option.onSuccess(data);
				}
				else{
					option.onError && option.onError();
				}
			}
		};
		XHR.open(option.method, url, option.async);
		XHR.setRequestHeader('Content-Type', option.contentType + ';charset=' + option.charset.toLowerCase());
		XHR.send(_jsonToQuery(option.data));
	};

	var _get = function(url, option){
		option = option || {};
		option['method'] = 'get';
		_ajax(url, option);
	};

	var _post = function(url, data, callback, returnType){
		option = option || {};
		option['method'] = 'post';
		_ajax(url, option);
	};
	
	return {
		getXHR		: _getRequest,
		ajax		: _ajax,
		get			: _get,
		post		: _post,
		jsonToQuery : _jsonToQuery
	};
});