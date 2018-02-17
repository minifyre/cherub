(function(args)
{
	'use strict';
	var [obj,prop]=args,
		cherub=obj[prop]={};
	var assertions=
	{
		stringify:(a,b)=>JSON.stringify(a)===JSON.stringify(b)
	},
		blank=args=>args,
		defaults=
		{
			args:undefined,
			assert:assertions.stringify,
			cleanup:blank,
			name:'',
			notes:'',
			rtn:undefined,
			setup:blank
		};
	cherub.build=function(test,inherits=defaults)
	{
		console.log(test);
		if (test.tests)
		{
			test.tests.forEach(function(test)
			{
				cherub.build(test,inherits);
			});
		}
		/*//build name path
		var tests=[];			
		test=Object.assign(defaults,test);
		if (test.func)
		{
			tests.push(test);
		}
		if (test.tests)
		{
			test.tests.forEach(function(test)
			{
				console.log(test);
			});
		}
		else
		{
			console.log(test);
		}
		return tests;*/
	};
	cherub.run=function(...tests)
	{
		tests.forEach(function(test)
		{
			cherub.build(test);
		});
		/*return tests.reduce(function(results,test)
		{
			return results;
		},{failed:0,passed:0});*/
	};
	return cherub;
})(typeof exports==='undefined'?[window,'cherub']:[module,'exports']);