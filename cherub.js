'use strict';
var input={},
	logic={},
	output={},
	config=///get into output
	{
		failed:'failed',
		hidePassed:true,
		now:()=>Date.now(),
		passed:'passed',
		parallel:true,
		precision:4,
		report:console.log,
		shuffle:true,
		units:'ms'
	};
logic.assign=function(obj,defaults)
{
	return Object.keys(defaults).reduce(function(obj,prop)
	{
		!obj.hasOwnProperty(prop)?obj[prop]=defaults[prop]:'';
		return obj;
	},obj);
};
logic.buildTest=function(test,inherits=defaults)
{
	test=logic.inherit(test,inherits);
	var {tests}=test,
		isNotContainer=!tests.length&&test.func;
	return isNotContainer?[test]:logic.buildTests(tests,test);
};
logic.buildTests=function(children,parent)
{
	return children.reduce(function(tests,test)
	{
		return tests.concat(...logic.buildTest(test,parent));
	},[]);
};
logic.inherit=function(test,parent)
{
	var {assert,cleanup,func,rtn,setup}=parent,
		parentProps={assert,cleanup,func,rtn,setup},
		minProps={name:'',tests:[]};
	test=logic.assign(test,minProps);
	test=logic.assign(test,parentProps);
	test.name=(parent.name+'/'+test.name).replace(/^\//,'');//prepend parent's name
	return test;
};
logic.json2msg=function(json)
{
	var {err,name,rtn,time}=json,
		failed=json.hasOwnProperty('err'),
		type=failed?'failed':'passed',
		msg=name+' ('+logic.num2timeStr(time)+') ';
	msg=config[type]+': '+msg;
	return failed?msg+' '+err+'!='+rtn:msg;
};
logic.next=arg=>arg;
logic.num2percent=num=>((num*100).toFixed(2)).replace(/\.00|0$/,'')+'%';
logic.num2timeStr=function(time)
{
	var {precision,units}=config;
	return time.toFixed(precision)+units;
};
logic.shuffle=function(old)
{
	return old.reduce(function(arr,item,i)
	{
		var j=~~(Math.random()*(arr.length));
		[arr[i],arr[j]]=[arr[j],arr[i]];
		return arr;
	},old.slice(0));
};
output.msg=function(json,show=false)
{
	var msg=logic.json2msg(json),
		failed=json.hasOwnProperty('err'),
		{hidePassed,report}=config;
	(failed||!hidePassed||show)?report(msg+'\n'):'';
};










var cherub=function(opts)
{
	config=Object.assign(config,opts);
	return cherub;
},
defaults=
{
	assert:(a,b)=>JSON.stringify(a)===JSON.stringify(b),
	cleanup:logic.next,
	name:'',
	rtn:undefined,
	setup:logic.next
};
cherub.run=function(...testTrees)
{
	var {buildTests}=logic,
		{now,parallel,report}=config,
		passed=0,
		tests=buildTests(testTrees),
		run=function(test)
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
				output.msg(Object.assign(obj,{name,rtn,time}));
				return passed+=obj.hasOwnProperty('err')?0:1;
			})
			.then(cleanup)
			.catch(logic.next);
		},
		start=now();
	tests=config.shuffle?logic.shuffle(tests):tests;
	return (parallel?Promise.all(tests.map(run)):
	tests.reduce((promise,test)=>promise.then(()=>run(test)),Promise.resolve()))
	.then(function()//score
	{
		var {num2percent}=logic,
			time=now()-start,
			total=tests.length,
			failed=total-passed,//failed can be infered from totals & passed
			percentPassed=total?num2percent(passed/total):0,
			name=passed+'/'+total+' ('+percentPassed+')';
		output.msg({name,time},true);
	});
};
export {cherub};