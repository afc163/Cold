Cold.add("ajax", function(){
	
	var _jsonToQuery = function(data){
		if(Cold.isString(data)){
			return data;
		}
		var q = '';
		for(var p in data){
			q += (p + '=' + data[p] + '&');
		}
		if(q !== ''){
			q = q.slice(0, -1);
		}
		return q.toLowerCase();
	};

	var _addQuery = function(url, data){
		return url + ( (url.indexOf('?') != -1) ? '&' : '?' ) + _jsonToQuery(data);
	};

	var getRequest = function(){
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
		timeout		: 30 * 1000,
		returnType	: 'json',	// json | xml | html | text | jsonp & script is undefined
		callbackKey : 'callback',	//for josnp function
		callbackName: null,			//for josnp function		
		onSuccess	: function(){},
		onError		: function(){}
	};

	var ajax = function(url, option){
		if (url == '' || url == null) {
			throw new Error('ajax need parameter url.');
		}
		var XHR = getRequest(), method;
		Cold.extend(option, _defaultOption);
		method = option.method.toLowerCase();

		XHR.onreadystatechange = function(){
			var data = '';
			if(XHR.readyState === 4){
				if(XHR.status === 200 || XHR.status === 0){
					switch(option.returnType){
						case 'text':
						case 'html':
							data = XHR.responseText;
							break;
						case 'xml':
							data = XHR.responseXML;
							break;
						case 'script':
							break;
						case 'jsonp':
							break;
						case 'json':
							data = eval('('+ XHR.responseText +')');
							break;
					}
					option.onSuccess && option.onSuccess(data);
				}
				else{
					option.onError && option.onError();
				}
			}
		};
		if(option.data && method === 'get'){
			option.data['rd'] = new Date().valueOf();
			url = _addQuery(url, option.data);
		}
		XHR.open(method, url, option.async);
		XHR.setRequestHeader('Content-Type', option.contentType + ';charset=' + option.charset.toLowerCase());
		XHR.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
		XHR.send( (method === 'post') ? _jsonToQuery(data) : null);
		return XHR;
	};

	var get = function(url, option){
		option = option || {};
		option['method'] = 'get';
		return ajax(url, option);
	};

	var post = function(url, option){
		option = option || {};
		option['method'] = 'post';
		return ajax(url, option);
	};

	var getXml = function(url, option){
		option = option || {};
		option['method'] = 'get';
		option['returnType'] = 'xml';
		return ajax(url, option);
	};

	var getText = function(url, option){
		option = option || {};
		option['method'] = 'get';
		option['returnType'] = 'text';
		return ajax(url, option);
	};

	var getScript = function(url, callback){
	
	};

	var jsonp = function(url, option) {
		if (url == '' || url == null) {
			throw new Error('jsonp need parameter url.');
		}
		Cold.extend(option, _defaultOption);
		if(option.callbackName) {
			Cold.namespace(option.callbackName, option.onSuccess);
		}
		else {
			//初始化callback回调
			if (!cold.callbackIndex) {
				cold.callbackIndex = 0;
			}
			cold.callbacks = Cold.cache.callbacks || {};
			//绑定callback方法
			cold.callbackIndex++;
			var callbackName = 'jsonpcallback'+cold.callbackIndex;
			cold.callbacks[callbackName] = option.onSuccess;
		}
		//拼装jsonp的url
		option.data[option.callbackKey] = option.callbackName ? option.callbackName : ('cold.callbacks.' + callbackName);
		option.data['rd'] = new Date().valueOf();
		url = _addQuery(url, option.data);
		//发送请求
		return Cold.addScript(url);
	};
	
	return {
		getXHR		: getRequest,
		ajax		: ajax,
		get			: get,
		post		: post,
		getXml		: getXml,
		getText		: getText,
		getScript	: getScript,
		jsonp		: jsonp
	};

});
