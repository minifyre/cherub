(function(args)
{
	'use strict';
	var [obj,prop]=args,
		cherub=obj[prop]={};
	var assertions=
	{
		stringify:(a,b)=>JSON.stringify(a)===JSON.stringify(b)
	};
	var build=function(test)
	{
		//build path
		var blank=args=>args,
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
		test=Object.assign(test,defaults);
		console.log(test);
	};
	var run=function(...tests)
	{
		tests.forEach(function(test)
		{
			build(test);
		});
		/*return tests.reduce(function(results,test)
		{
			return results;
		},{failed:0,passed:0});*/
	};
	return cherub;
})(typeof exports==='undefined'?[window,'cherub']:[module,'exports']);