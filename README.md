# Cherub.js
A tiny testing framework with zero dependencies to guard against regression.

Cherub.js is designed to be lightweight (currently 88 lines) & make writing tests a faster/easier with a concise syntax.

#### Example:

    var Test=cherub,
    	sum=(a,b)=>a+b,
    	mult=(a,b)=>a*b,
    	four=()=>4;
        
    //setup
    Test('1.) Add 2 Numbers').func(sum).args(1,2).rtn(3);
    Test('2.) Multiply 2 Numbers').func(mult).args(1,2).rtn(2);
    Test('3.) Multiply By 0').func(mult).args(0,2).rtn(0);
    Test('4.) Return 4').func(four).rtn(4);
    
    //run
	Test.start();
    
    //outputs
    2.) Multiply 2 Numbers: passed (in 0.0000ms)
    3.) Multiply By 0: passed (in 0.0000ms)
    4.) Return 4: passed (in 1.0000ms)
    1.) Add 2 Numbers: passed (in 1.0000ms)
    100% Passed: 4/4 (in 2.0000ms)

Supports:

* Asynchronous Testing (promise-based)
* Browser & Node.js compatibility
* Different Assertion Libraries (uses `JSON.stringify` by default for simple comparisons)
* Atomic Testing by default (or to maintain order `Test.start({shuffle:false})`)
* Running tests concurrently by default (or sequentially `Test.start({parallel:false})`)
* Configurable output (default is `cherub.output=console.log`)
* Configurable performance reporting (default is millisecond accuracy with `Date.now()`)
  *     //microsecond accuracy
           
        //Node.js only (compatible with 8.5.0+)
        var performance=require('perf_hooks').performance
        
        //browser/node.js
        cherub.perf.now=()=>performance.now();
        cherub.units='μs';