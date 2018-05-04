'use strict';
import {cherub} from './cherub.js';
/*THIS EXAMPLE ONLY WORKS IF THIS FILE AND CHERUB HAVE .MJS EXTENSIONS*/
//const performance=require('perf_hooks').performance;

const
sum=(a,b)=>a+b,
//config={now:()=>performance.now()},//upgrade timing to microseconds (Node v8.5.0+)
tests=//using non-chaining syntax
[
	{
		name:'math',
		tests:
		[{
			name:'sum',
			func:sum,
			tests:
			[
				{name:'positive (test 1)',args:[1,5],rtn:6},
				{name:'negative (test 2)',args:[-1,-5],rtn:-6},
				{name:'fail (test 3)',args:[-1,-5],rtn:0}
			]
		}]
	},
	{
		func:()=>0,
		name:'return 0 (test 4)',
		rtn:0
	}
];

cherub().run(...tests);