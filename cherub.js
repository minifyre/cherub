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
		lang:'en',
		output:console.log,
		parallel:true,
		perf:
		{
			now:()=>Date.now(),
			precision:4,
			units:'ms'
		},
		shuffle:true,
		text:
		{
			en:{passed:'passed',failed:'failed'}
		}
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
			minProps={name:'',tests:[]};
		test=cherub.assign(test,minProps);
		test=cherub.assign(test,parentProps);
		test.name=(parent.name+'/'+test.name).replace(/^\//,'');//inherit parent's base name
		return test;
	};
	cherub.num2percent=num=>((num*100).toFixed(2)).replace(/\.00|0$/,'')+'%';
	cherub.run=function(test)///use rest parameters
	{
		var {build,config,json2msg,shuffle}=cherub,
			{output,parallel,perf}=config,
			tests=build(test),
			passed=0,
			start=perf.now();
		var run=function(test)
		{
			var {args,assert,cleanup,func,name,rtn,setup}=test,
				start=perf.now();
			return Promise.resolve()
			.then(setup)
			.then(()=>args?func(...args):func())//run tests
			.then(val=>(assert(val,rtn)?{val}:{err:val}))//eval tests
			.catch(err=>({err}))
			.then(function(obj)//report info
			{
				var time=perf.now()-start;
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
				time=perf.now()-start,
				total=tests.length,
				failed=total-passed,//failed can be infered from totals & passed
				percentPassed=total?num2percent(passed/total):0,
				name=passed+'/'+total+' ('+percentPassed+')';
			json2msg({name,time},true);
		});
	};
	cherub.json2msg=function(json,show=false)
	{
		var {err,name,rtn,time}=json,
			{hidePassed,lang,output,text}=cherub.config,
			failed=json.hasOwnProperty('err'),
			type=failed?'failed':'passed',
			msg=name+' ('+cherub.reportTime(time)+') ';
		msg=text[lang][type]+': '+msg;
		msg=failed?msg+' '+err+'!='+rtn:msg;
		(failed||!hidePassed||show)?output(msg+'\n'):'';
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