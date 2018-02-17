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
			assert:assertions.stringify,
			cleanup:blank,
			name:'',
			notes:'',
			rtn:undefined,
			setup:blank
		};
	cherub.assign=function(obj,defaults)
	{
		return Object.keys(defaults).reduce(function(obj,prop)
		{
			if (!obj.hasOwnProperty(prop))
			{
				obj[prop]=defaults[prop];
			}
			return obj;
		},obj);
	};
	cherub.inherit=function(test,parent)
	{
		var {assert,cleanup,rtn,setup}=parent,
			parentProps={assert,cleanup,rtn,setup},
			minProps={name:'',notes:'',tests:[]};
		test=cherub.assign(test,minProps);
		test=cherub.assign(test,parentProps);
		test.name=(parent.name+'/'+test.name).replace(/^\//,'');//inherit parent's base name
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