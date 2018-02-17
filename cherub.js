(function(args)
{
	'use strict';
	var [obj,prop]=args,
		cherub=obj[prop]={},
		assertions=
		{
			equal:(actual,expected)=>actual===expected,
			stringify:(...args)=>assertions.equal(...args.map(JSON.stringify))
		},
		next=args=>args,
		defaults=
		{
			assert:assertions.stringify,
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
	cherub.config=
	{
		hidePassed:true,
		output:console.log,
		parallel:true,
		perf:
		{
			now:()=>Date.now(),
			precision:4,
			units:'ms'
		},
		shuffle:true
	};
	cherub.reportTime=function(time)
	{
		var {precision,units}=cherub.config.perf;
		return time.toFixed(precision)+units;
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
	cherub.num2percent=num=>((num*100).toFixed(2)).replace(/\.00|0$/,'')+'%';
	cherub.run=function(test)///use rest parameters
	{
		var {build,config,fail,pass,shuffle}=cherub,
			{output,parallel,perf}=config,
			tests=build(test),
			passed=0,
			start=perf.now();
		var run=function(test)
		{
			var {args,assert,cleanup,func,name,notes,rtn,setup}=test,
				start=perf.now();
			return Promise.resolve()
			.then(setup)
			.then(()=>args?func(...args):func())//run tests
			.then(val=>({func:assert(val,rtn)?pass:fail,val}))//eval tests
			.catch(err=>({func:fail,val:err}))
			.then(obj=>Object.assign(obj,{name,notes,rtn,time:perf.now()-start}))//compile info
			.then(obj=>passed+=obj.func(obj))//report info
			.then(cleanup)
			.catch(next);
		};
		tests=config.shuffle?shuffle(tests):tests;
		return (parallel?Promise.all(tests.map(run)):
		tests.reduce((promise,test)=>promise.then(()=>run(test)),Promise.resolve()))
		.then(function()//score
		{
			var {num2percent,reportTime}=cherub,
				time=perf.now()-start,
				total=tests.length,
				failed=total-passed,//failed can be infered from totals & passed
				percentPassed=total?num2percent(passed/total):0;
			output(percentPassed+' Passed: '+passed+'/'+total+' '+reportTime(time)+'\n');
		});
	};
	cherub.fail=function(obj)///merge with pass
	{
		var {output,perf}=cherub.config,
			{name,rtn,time,val}=obj;
		output(name+': failed ('+cherub.reportTime(time)+') '+val+'!='+rtn+'\n');
		return 0;
	};
	cherub.pass=function(obj)
	{
		var {output,perf}=cherub.config,
			{name,time}=obj;///if (cherub.config.hidePassed)
		output(name+': passed ('+cherub.reportTime(time)+')');
		return 1;
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