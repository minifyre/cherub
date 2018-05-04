'use strict';
var input={},
	logic={},
	output={},
	cache=
	{
		default:
		{
			config:
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
			},
			inheritance:
			{
				assert:(a,b)=>JSON.stringify(a)===JSON.stringify(b),
				cleanup:logic.next,
				name:'',
				rtn:undefined,
				setup:logic.next
			}
		}
	};
function cherub(opts)
{
	var config=Object.assign({},cache.default.config,opts);
	input.run=function(...testTrees)
	{
		var {buildTests,shuffle}=logic,
			{runTest}=output,
			{now,parallel,report}=config,
			tests=buildTests(testTrees),
			start=now();
		tests=config.shuffle?shuffle(tests):tests;
		return output.runTests(tests,parallel)
		.then(results=>output.results(results,start));
	};
	logic.buildTest=function(test,inherits=cache.default.inheritance)
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
		test=Object.assign({},minProps,parentProps,test);//don't affect orignal test
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
	output.report=function(json,show=false)
	{
		var msg=logic.json2msg(json),
			failed=json.hasOwnProperty('err'),
			{hidePassed,report}=config;
		(failed||!hidePassed||show)?report(msg+'\n'):'';
		return failed?0:1;
	};
	output.results=function(results,start)
	{
		var time=config.now()-start,
			passed=results.reduce((sum,num)=>sum+=num,0),
			total=results.length,
			percentPassed=total?logic.num2percent(passed/total):0,
			name=passed+'/'+total+' ('+percentPassed+')';
		output.report({name,time},true);
	};
	output.runTest=function(test)
	{
		var {args,assert,cleanup,func,name,rtn,setup}=test,
			{report}=output,
			{now}=config,
			start=now();
		return Promise.resolve()
		.then(setup)
		.then(()=>args?func(...args):func())//run tests
		.then(val=>(assert(val,rtn)?{val}:{err:val}))//eval tests
		.catch(err=>({err}))
		.then(obj=>Object.assign(obj,{name,rtn,time:now()-start}))//compile info
		.then(report)
		.then(cleanup)
		.catch(logic.next);
	};
	output.runTests=function(tests,parallel)
	{
		var {runTest}=output;
		return (parallel?Promise.all(tests.map(runTest)):
		(function(sum=[])
		{
			var append=num=>sum.concat(num);
			return tests.reduce(function(promise,test)
			{
				return promise
				.then(num=>sum=append(num))
				.then(()=>runTest(test));
			},Promise.resolve())
			.then(append)
			.then(sum=>sum.splice(1));//take extra item off the front
		})());
	};
	return {run:input.run};
}
cherub.test=function()
{
	const
	obj={},
	data={},
	propsMulti='args,tests'.split(','),
	propsSingle='assert,cleanup,func,name,rtn,setup'.split(',');
	propsSingle.forEach(function(prop)
	{
		obj[prop]=val=>((data[prop]=val),obj);
	});
	propsMulti.forEach(function(prop)
	{
		obj[prop]=(...vals)=>((data[prop]=vals),obj);
	});
	obj.norm=()=>data;
	return obj;
};
export {cherub};