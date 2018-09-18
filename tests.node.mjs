//for node 8.5-10 run with `node --experimental-modules tests.node.mjs` (9/2018)
import {performance} from 'perf_hooks'
import cherub from './cherub.mjs'
const
sum=(a,b)=>a+b,
tests=
[
		[0,0,'zero'],//actual, expected, test name
		[()=>sum(1,2),3,'sum/positive'],//actual=function
		[()=>sum(-1,-2),-3,{name:'sum/negative'}],//options object
		[()=>undefinedVarible,0,'crash test'],//errors will not crash cherub
],
opts={now:()=>performance.now()}
cherub(tests,opts)