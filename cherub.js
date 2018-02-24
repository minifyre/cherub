(function(args)
{
	'use strict';
	var [obj,prop]=args,
		config=
		{
			failed:'failed',
			hidePassed:true,
			now:()=>Date.now(),
			output:console.log,
			passed:'passed',
			parallel:true,
			precision:4,
			shuffle:true,
			units:'ms'
		},
		cherub=obj[prop]=function(opts)
		{
			config=Object.assign(config,opts);
			return cherub;
		},
		next=args=>args,
		defaults=
		{
			assert:(actual,expected)=>JSON.stringify(actual)===JSON.stringify(expected),
			cleanup:next,
			name:'',
			rtn:undefined,
			setup:next
		};
	cherub.assign=function(obj,defaults)
	{
		return Object.keys(defaults).reduce(function(obj,prop)
		{
			!obj.hasOwnProperty(prop)?obj[prop]=defaults[prop]:'';
			return obj;
		},obj);
	};
	cherub.build=function(test,inherits=defaults)
	{
		var tests=[];
		test=cherub.inherit(test,inherits);
		//don't add containers meant to pass on functions
		!test.tests.length&&test.func?tests.push(test):
		test.tests.forEach(function(subtest)//containers have tests or an empty array
		{
			tests.push(...cherub.build(subtest,test));
		});
		return tests;
	};
	cherub.inherit=function(test,parent)
	{
		var {assert,cleanup,func,rtn,setup}=parent,
			parentProps={assert,cleanup,func,rtn,setup},
			minProps={name:'',tests:[]};
		test=cherub.assign(test,minProps);
		test=cherub.assign(test,parentProps);
		test.name=(parent.name+'/'+test.name).replace(/^\//,'');//inherit parent's base name
		return test;
	};
	cherub.json2msg=function(json,show=false)
	{
		var {err,name,rtn,time}=json,
			{hidePassed,output}=config,
			failed=json.hasOwnProperty('err'),
			type=failed?'failed':'passed',
			msg=name+' ('+cherub.reportTime(time)+') ';
		msg=config[type]+': '+msg;
		msg=failed?msg+' '+err+'!='+rtn:msg;
		(failed||!hidePassed||show)?output(msg+'\n'):'';
	};
	cherub.num2percent=num=>((num*100).toFixed(2)).replace(/\.00|0$/,'')+'%';
	cherub.reportTime=function(time)
	{
		var {precision,units}=config;
		return time.toFixed(precision)+units;
	};
	cherub.run=function(...testTrees)
	{
		var {build,json2msg,shuffle}=cherub,
			{output,parallel,now}=config,
			passed=0,
			tests=testTrees.reduce(function(tests, test)
			{
				tests.push(...build(test));
				return tests;
			},[]),
			start=now();
		var run=function(test)
		{
			var {args,assert,cleanup,func,name,rtn,setup}=test,
				start=now();
			return Promise.resolve()
			.then(setup)
			.then(()=>args?func(...args):func())//run tests
			.then(val=>(assert(val,rtn)?{val}:{err:val}))//eval tests
			.catch(err=>({err}))
			.then(function(obj)//report info
			{
				var time=now()-start;
				json2msg(Object.assign(obj,{name,rtn,time}));
				return passed+=obj.hasOwnProperty('err')?0:1;
			})
			.then(cleanup)
			.catch(next);
		};
		tests=config.shuffle?shuffle(tests):tests;
		return (parallel?Promise.all(tests.map(run)):
		tests.reduce((promise,test)=>promise.then(()=>run(test)),Promise.resolve()))
		.then(function()//score
		{
			var {json2msg,num2percent}=cherub,
				time=now()-start,
				total=tests.length,
				failed=total-passed,//failed can be infered from totals & passed
				percentPassed=total?num2percent(passed/total):0,
				name=passed+'/'+total+' ('+percentPassed+')';
			json2msg({name,time},true);
		});
	};
	cherub.shuffle=function(old)
	{
		return old.reduce(function(arr,item,i)
		{
			var j=~~(Math.random()*(arr.length));
			[arr[i],arr[j]]=[arr[j],arr[i]];
			return arr;
		},old.slice(0));
	};
	return cherub;
})(typeof exports==='undefined'?[window,'cherub']:[module,'exports']);