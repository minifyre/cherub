# Cherub.js
A tiny testing framework with zero dependencies to guard against regression.

Cherub.js is designed to be lightweight & make writing tests a faster/easier with a concise syntax.

#### Example:
        
    //setup
    const
	sum=(a,b)=>a+b,
	{test}=cherub;
    cherub({hidePassed:false})//config
    .run(
    	test('math').tests//using chaining syntax
		(
			test('sum').func(sum).tests
			(
				test('positive (test 1)').args(1,5).rtn(6),
				test('negative (test 2)').args(-1,-5).rtn(-6),
				test('fail (test 3)').args(-1,-5).rtn(0)
			),
			test('return 0 (test 4)').func(()=>0).rtn(0)
		)
	);
        
    //output
    passed: math/sum/positive (test 1) (1.0000ms)
    passed: math/return 0 (test 4) (4.0000ms)
    failed: math/sum/fail (test 3) (5.0000ms)  -6!=0
    passed: math/sum/negative (test 2) (5.0000ms)
    passed: 3/4 (75%) (5.0000ms)

Supports:

* Asynchronous Testing (promise-based)
* Browser & Node.js compatibility
* Different Assertion Libraries (uses `JSON.stringify` values by default for simple comparisons)
* Atomic Testing by default (or to maintain order `cherub({shuffle:false})`)
* Running tests concurrently by default (or sequentially `cherub({parallel:false})`)
* Configurable output (default is `cherub({report:console.log})`)
* Configurable performance reporting (default is millisecond accuracy with `Date.now()`)

      //microsecond accuracy
           
      //Node.js only (compatible with 8.5.0+)
      var performance=require('perf_hooks').performance
        
      //browser/node.js
      cherub({now:()=>performance.now()})