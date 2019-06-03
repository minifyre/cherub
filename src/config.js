export const
assert=(a,b)=>JSON.stringify(a)===JSON.stringify(b),
cleanup=x=>x,
now=Date.now,
parallel=true,
name='unnamed test',
report=({tests,time})=>
{
	const
	passed=tests.reduce((sum,x)=>sum+(x.passed?1:0),0),
	total=tests.length,
	[percent,ms]=[(passed/total*100),time]
				.map(x=>x.toFixed(4).replace(/0+$/,'').replace(/\.$/,''))
	console.log(`${passed}/${total} (${percent}%) tests passed in ${ms}ms`)
},
reportTest=x=>!x.passed&&console.error(`"${x.name}" failed:`,x),
shuffle=true,
setup=x=>x