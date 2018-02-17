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
	cherub.build=function(test,inherits=defaults)
	{
		var tests=[];
		test=cherub.inherit(test,inherits);
		if (!test.tests.length&&test.func)//do not add containers meant to pass on functions
		{
			tests.push(test);
		}
		if (test.tests)
		{
			test.tests.forEach(function(subtest)
			{
				tests.push(...cherub.build(subtest,test));
			});
		}
		return tests;
	};
	cherub.inherit=function(test,parent)
	{
		var {assert,cleanup,func,rtn,setup}=parent,
			parentProps={assert,cleanup,func,rtn,setup},
			minProps={name:'',notes:'',tests:[]};
		test=cherub.assign(test,minProps);
		test=cherub.assign(test,parentProps);
		test.name=(parent.name+'/'+test.name).replace(/^\//,'');//inherit parent's base name
		return test;
	};
	cherub.run=function(...tests)
	{
		tests.forEach(function(test)
		{
			console.log(cherub.build(test));
		});
		/*return tests.reduce(function(results,test)
		{
			return results;
		},{failed:0,passed:0});*/
	};
	return cherub;
})(typeof exports==='undefined'?[window,'cherub']:[module,'exports']);