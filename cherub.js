(function(args)
{
	'use strict';
	var [obj,prop]=args,
		cherub=obj[prop]=function(name='Unamed Test')
		{
			var {assert,handler,next}=cherub,
				obj={args:undefined,assert,cleanup:next,func:next,name,rtn:'',setup:next};
			cherub.tests.push(obj);
			return new Proxy(obj,handler);
		};
	Object.assign(cherub,
	{
		assert:(res,ans)=>JSON.stringify(res)===JSON.stringify(ans),
		defaults:{hidePassed:true,parallel:true,shuffle:true},
		handler:
		{
			get:function(obj,prop)
			{
				return function(...val)
				{
					obj[prop]=prop==='args'?val:val[0];
					return new Proxy(obj,cherub.handler);
				};
			}
		},
		fail:function(name,time,...msg)
		{
			cherub.totals.failed+=1;
			cherub.output(name+': failed'+cherub.perf.report(time)+'\n',...msg);
		},
		num2percent:num=>((num*100).toFixed('2')).replace(/\.00|0$/,'')+'%',
		next:(...args)=>args,
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
		run:function(test)
		{
			var {args,assert,cleanup,func,name,rtn,setup}=test,
				{fail,next,pass,perf}=cherub,
				start=perf.now();
			return Promise.resolve().then(setup)
			.then(()=>args?func(...args):func())
			.then(res=>(assert(res,rtn)?pass:fail)(name,perf.now()-start,res,'!==',rtn))
			.catch(err=>fail(name,perf.now()-start,err,'!==',rtn))
			.then(cleanup)
			.catch(next);
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
	});
})(typeof exports==='undefined'?[window,'cherub']:[module,'exports']);