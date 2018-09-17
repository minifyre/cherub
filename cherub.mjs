export default async function cherub(tests=[],opts={})
{
	const
	settings=Object.assign({},config,opts),
	start=settings.now()
	if(settings.shuffle) tests=tests.reduce(util.shuffle,tests.slice())
	const results=await logic.runTests(tests,settings)
	await settings.report({tests:results,time:settings.now()-start})
}
const
logic={},
util={},
config=
{
	assert:(a,b)=>JSON.stringify(a)===JSON.stringify(b),
	cleanup:x=>x,
	now:Date.now,
	parallel:true,
	name:'unnamed test',
	report:function({tests,time})
	{
		const
		{log}=console,
		passed=tests.reduce((sum,x)=>sum+x.passed,0),
		total=tests.length,
		percent=(passed/total*100)
				.toFixed(4)
				.replace(/0+$/,'')
				.replace(/\.$/,'')
		log(`${passed}/${total} (${percent}%) passed in ${time.toFixed(4)}ms`)
	},
	reportTest:console.log,
	shuffle:true,
	setup:x=>x
}
Object.assign(cherub,{config,logic,util})
logic.runTests=function(tests,config)
{
	const
	{parallel}=config,
	run=test=>logic.test(test,config)
	return parallel?Promise.all(tests.map(run)):util.asyncMap(tests,run)
}
logic.test=async function([actualOrFn,expectedOrFn,optsOrName={}],config)
{
	const
	{is}=util,
	opts=is(optsOrName,'string')?{name:optsOrName}:opts,
	{setup,cleanup,name,now,reportTest}=Object.assign({},config,opts),
	start=now(),
	result=await Promise.resolve()
	.then(setup)
	.then(async function()
	{
		const
		actual=await is(actualOrFn,'function')?actualOrFn():actualOrFn,
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
util.is=(x,type)=>typeof x===type
util.asyncMap=function(arr,cb)
{
	const chain=async (promiseArr,item)=>[...await promiseArr,await cb(item)]
	return arr.reduce(chain,Promise.resolve([]))
}
util.shuffle=function(arr,_,i)
{
	const j=Math.floor(Math.random()*arr.length);
	[arr[i],arr[j]]=[arr[j],arr[i]]
	return arr
}