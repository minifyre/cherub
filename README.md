# Cherub.js
A tiny testing framework with zero dependencies to guard against regression.

Cherub.js is designed to be lightweight (currently 84 lines) & make writing tests a faster/easier with a concise syntax.

examples/browser-and-node.js

    'use strict';
    var Test=typeof exports==='undefined'?cherub:require('./cherub.js'),//browser+node.js compatible
    	sum=(a,b)=>a+b,
    	mult=(a,b)=>a*b,
    	four=()=>4;
    Test('1.) Add 2 Numbers').func(sum).args(1,2).rtn(3);
    Test('2.) Multiply 2 Numbers').func(mult).args(1,2).rtn(2);
    Test('3.) Multiply By 0').func(mult).args(0,2).rtn(0);
    Test('4.) Return 4').func(four).rtn(4);
	Test.start();
 
outputs:

    Start Testing ({"parallel":true,"shuffle":true})
    3.) Multiply By 0: passed in (0.4383ms)
    2.) Multiply 2 Numbers: passed in (0.6021ms)
    1.) Add 2 Numbers: passed in (0.6785ms)
    4.) Return 4: passed in (0.7581ms)
    100% Passed: 4/4 in 2.6451ms


Supports:
* Asynchronous Testing (promise-based)
* Node.js & Browsers (Node v8.5.0+ for `performance.now` compatibility)
* Different Assertion Libraries (uses `JSON.stringify` by default for simple comparisons)
* Running tests concurrently by default (or sequentially `Test.start({parallel:false})`)
* Atomic Testing by default (or to maintain order `Test.start({shuffle:false})`)
* Configurable output (default is `cherub.output=console.log`)