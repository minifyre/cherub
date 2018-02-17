/*
defaults:{hidePassed:true,parallel:true,shuffle:true},

fail:function(name,time,...msg)
{
	cherub.totals.failed+=1;
	cherub.output(name+': failed'+cherub.perf.report(time)+'\n',...msg);
},
num2percent:num=>((num*100).toFixed('2')).replace(/\.00|0$/,'')+'%',
perf:
{
	now:()=>Date.now(),
	report:time=>' (in '+time.toFixed(4)+cherub.perf.units+')',
	units:'ms'
},
output:console.log,
pass:function(test,time)
{
	cherub.totals.passed+=1;
	if (cherub.hidePassed)
	{
		cherub.output(test+': passed'+cherub.perf.report(time));
	}	
},
score:function(time)
{
	var {num2percent,output,totals}=cherub,
		{failed,passed}=totals,
		total=failed+passed,
		percentPassed=total?num2percent(passed/total):0;
	output(percentPassed+' Passed: '+passed+'/'+total+cherub.perf.report(time)+'\n');
	cherub.totals={failed:0,passed:0};
},
shuffle:function(old)
{
	return old.reduce(function(arr,item,i)
	{
		var j=~~(Math.random()*(arr.length));
		[arr[i],arr[j]]=[arr[j],arr[i]];
		return arr;
	},old.slice(0));
},
tests:[],
totals:{failed:0,passed:0},
start:function(opts={})
{
	var {defaults,hidePassed,next,perf,output,run,score,shuffle,tests}=cherub,
		start=perf.now();
	opts=Object.assign(defaults,opts);
	output('Start Testing ('+JSON.stringify(opts)+')');
	tests=opts.shuffle?shuffle(tests):tests;
	return (opts.parallel?Promise.all(tests.map(run)):
	tests.reduce((promise,test)=>promise.then(()=>run(test)),Promise.resolve()))
	.catch(next).then(()=>score(perf.now()-start));
}
tests.forEach(function(test)
{
	var {args,assert,cleanup,func,name,notes,rtn,setup}=test,
		{fail,next,pass,perf}=cherub,///add these
		start=perf.now();
	return Promise.resolve()
	.then(setup)
	.then(()=>args?func(...args):func())
	.then(actual=>(assert(actual,rtn)?pass:fail)(name,perf.now()-start,actual,'!==',rtn))///pass notes here
	.catch(err=>fail(name,perf.now()-start,err,'!==',rtn))
	.then(cleanup)
	.catch(next);
});
*/

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
		blank=args=>args,
		defaults=
		{
			assert:assertions.stringify,
			cleanup:blank,
			name:'',//is this necessary if it is a minimal prop?
			notes:'',//is this necessary if it is a minimal prop?
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
		//do not add containers meant to pass on functions
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
			minProps={name:'',notes:'',tests:[]};
		test=cherub.assign(test,minProps);
		test=cherub.assign(test,parentProps);
		test.name=(parent.name+'/'+test.name).replace(/^\//,'');//inherit parent's base name
		return test;
	};
	cherub.run=function(test)
	{
		var tests=cherub.build(test),
			results={failed:0,passed:0};
		console.log(tests);
		///run tests
	};
	return cherub;
})(typeof exports==='undefined'?[window,'cherub']:[module,'exports']);