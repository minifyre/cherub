export default async function cherub(tests=[],opts={})
{
	const
	settings=Object.assign({},cherub.config,opts),
	start=settings.now()
	if(settings.shuffle) tests=tests.reduce(cherub.shuffle,tests.slice())
	const results=await cherub.runTests(tests,settings)
	await settings.report({tests:results,time:settings.now()-start})
}
cherub.asyncMap=function(arr,cb)
{
	const chain=async (promiseArr,item)=>[...await promiseArr,await cb(item)]
	return arr.reduce(chain,Promise.resolve([]))
}
cherub.config=
{
	assert:(a,b)=>JSON.stringify(a)===JSON.stringify(b),
	cleanup:x=>x,
	now:Date.now,
	parallel:true,
	name:'unnamed test',
	report:function({tests,time})
	{
		const
		passed=tests.reduce((sum,x)=>sum+(x.passed?1:0),0),
		total=tests.length,
		[percent,ms]=[(passed/total*100),time]
					.map(x=>x.toFixed(4).replace(/0+$/,'').replace(/\.$/,''))
		console.log(`${passed}/${total} (${percent}%) tests passed in ${ms}ms`)
	},
	reportTest:x=>!x.passed&&console.error(`"${x.name}" failed:`,x),
	shuffle:true,
	setup:x=>x
}
cherub.is=(x,type)=>typeof x===type
cherub.runTests=function(tests,config)
{
	const
	{parallel}=config,
	run=test=>cherub.test(test,config)
	return parallel?Promise.all(tests.map(run)):cherub.asyncMap(tests,run)
}
cherub.shuffle=function(arr,_,i)
{
	const j=Math.floor(Math.random()*arr.length);
	[arr[i],arr[j]]=[arr[j],arr[i]]
	return arr
}
cherub.test=async function([actualOrFn,expectedOrFn,optsOrName={}],config)
{
	const
	{is}=cherub,
	opts=is(optsOrName,'string')?{name:optsOrName}:optsOrName,
	{setup,cleanup,name,now,reportTest}=Object.assign({},config,opts),
	start=now(),
	result=await Promise.resolve()
	.then(setup)
	.then(async function()
	{
		const
		actual=is(actualOrFn,'function')?await actualOrFn():actualOrFn,
		[assert,...args]=	is(expectedOrFn,'function')?[expectedOrFn,actual]:
							[config.assert,actual,expectedOrFn]
		return await assert(...args)
	})
	.then(async x=>(await cleanup(),x))
	.then(passed=>({passed}))
	.catch(error=>({passed:false,error}))
	.then(x=>Object.assign({name,time:now()-start},x))
	if(reportTest) await reportTest(result)
	return result
}