(function(args)
{
	'use strict';
	var [obj,prop]=args,
		cherub=obj[prop]={};
	var assertions=
		{
			equal:(actual,expected)=>actual===expected,
			stringify:(...args)=>assertions.equal(...args.map(JSON.stringify))
		},
		next=args=>args,
		defaults=
		{
			assert:assertions.stringify,
			cleanup:next,
			name:'',//is this necessary if it is a minimal prop?
			notes:'',//is this necessary if it is a minimal prop?
			rtn:undefined,
			setup:next
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
		//do not add containers meant to pass on functions
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
			report:time=>' (in '+time.toFixed(4)+cherub.perf.units+')',
			units:'ms'
		},
		shuffle:true
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
	cherub.num2percent=num=>((num*100).toFixed('2')).replace(/\.00|0$/,'')+'%';
	cherub.run=function(test)
	{
		var {build,config,fail,pass,shuffle}=cherub,
			{perf}=config,
			tests=build(test),
			results={failed:0,passed:0};
		tests=config.shuffle?shuffle(tests):tests;
		console.log(tests);
		//reduce with a total of passed tests, failed can be infered from totals
		tests.forEach(function(test)
		{
			var {args,assert,cleanup,func,name,notes,rtn,setup}=test,
				start=perf.now();
			return Promise.resolve()
			.then(setup)
			.then(()=>args?func(...args):func())//run tests
			.then(val=>({func:assert(val,rtn)?pass:fail,val}))//eval tests
			.catch(err=>({func:fail,val:err}))
			.then(obj=>Object.assign(obj,{name,notes,time:perf.now()-start}))//compile info
			.then(obj=>obj.func(obj))//report info
			.then(cleanup)
			.catch(next);
		});
	};
	
	function start(opts={})///TEMP
	{
		cherub.config.output('Start Testing');
		return (opts.parallel?Promise.all(tests.map(run)):
		tests.reduce((promise,test)=>promise.then(()=>run(test)),Promise.resolve()))
		.then(()=>score(perf.now()-start));
	}
	
	
	
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

/*
fail:function(obj)
{
	cherub.totals.failed+=1;
	cherub.output(name+': failed'+cherub.perf.report(time)+'\n',...msg);
}
pass:function(obj)
{
	cherub.totals.passed+=1;
	if (cherub.hidePassed)
	{
		cherub.output(test+': passed'+cherub.perf.report(time));
	}
}
score:function(time)
{
	var {num2percent,output,totals}=cherub,
		{failed,passed}=totals,
		total=failed+passed,
		percentPassed=total?num2percent(passed/total):0;
	output(percentPassed+' Passed: '+passed+'/'+total+cherub.perf.report(time)+'\n');
	cherub.totals={failed:0,passed:0};
}
*/