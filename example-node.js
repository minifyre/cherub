'use strict';
const Test=require('./cherub.js'),
	  performance=require('perf_hooks').performance;
Test.perf.now=()=>performance.now();//upgrade timing to microseconds (Node v8.5.0+)
var sum=(a,b)=>a+b,
	mult=(a,b)=>a*b,
	four=()=>4;
Test('1.) Add 2 Numbers').func(sum).args(1,2).rtn(3);
Test('2.) Multiply 2 Numbers').func(mult).args(1,2).rtn(2);
Test('3.) Multiply By 0').func(mult).args(0,2).rtn(0);
Test('4.) Return 4').func(four).rtn(4);
Test.start();//{parallel:false,shuffle:false};