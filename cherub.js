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
	cherub.inherit=function(test,parent)
	{
		if (!test.hasOwnProperty('name'))
		{
			test.name='';
		}
		if (parent.name.length)
		{
			test.name=parent.name+'/'+test.name;
		}
		/*
		Notes- why this test
		Func
		Args
		Rtn
		Assert
		Setup
		Cleanup
		tests
		*/
		return test;
	};
	cherub.build=function(test,inherits=defaults)
	{
		test=cherub.inherit(test,inherits);
		console.log(test);
		if (test.tests)
		{
			test.tests.forEach(function(subtest)
			{
				cherub.build(subtest,test);
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