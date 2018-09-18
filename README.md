# Cherub.js

A tiny testing framework with zero dependencies to guard against regression.

Cherub.js is designed to be flexible/lightweight & make writing tests faster/easier.

## Example (browser/node.js)

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
    opts={now:()=>performance.now()}//microsecond accuracy
    cherub(tests,opts)

    //console output
    "crash test" failed:
    {name:"crash test",time:0.7...,passed:false,error:object}
    //passed tests are not logged by default
    //(can be changed by passing {reportTest:someFunction} to cherub)
    3/4 (75%) tests passed in 4.7ms
    //final output can be configured by passing {report:someFunction} to cherub
    //report function takes an object {tests:[],time}

Supports:

* Async Testing
* Atomic Testing
  * to maintaining testing order use `cherub(tests,{shuffle:false})`
* Browser & Node.js
* Different Assertion Libraries
  * defaults to `JSON.stringify(acutal)===JSON.stringify(expected)`
  * for a different default use `cherub(tests,{assert:customAssertionFn})`
  * for custom assertions on a test-by-test basis:
    * `[expected,actual,{name:'generic test',assert:customAssertionFn}]` or
    * `[expectedValue,customAssertionFn,'test name']`
* Concurrent Testing
  * for sequential testing use `cherub(tests,{parallel:false})`
* Configurable
  * reporting
  * timing precision
    * default is millisecond accuracy with `Date.now()`
    * for microsecond accuracy use `cherub(tests,{now:()=>performance.now()})`
      * on node.js (8.5.0+) `import {performance} from './perf_hooks.js'`