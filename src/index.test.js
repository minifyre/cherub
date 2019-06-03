import {performance} from 'perf_hooks'
import cherub from './index.js'

const
sum=(a,b)=>a+b,
tests=
[
		[0,0,'zero'],//actual, expected, test name
		[()=>sum(1,2),3,'sum/positive'],//actual=function
		[()=>sum(-1,-2),-3,{name:'sum/negative'}],//options object
		[()=>undefinedVarible,0,'crash test'],//errors will not crash cherub
],
opts={now:()=>performance.now()},
customOpts={parallel:false,shuffle:false,reportTest:x=>x}
//todo: add something here to show the expected output was 75% passed
cherub(tests,opts)
cherub(tests,{...customOpts,...opts})