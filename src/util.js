export const
asyncMap=(arr,cb)=>
{
	const chain=async (promiseArr,...xs)=>[...await promiseArr,await cb(...xs)]
	return arr.reduce(chain,Promise.resolve([]))
},
is=(x,type)=>typeof x===type,
shuffle=(arr,_,i)=>
{
	const j=Math.floor(Math.random()*arr.length);
	[arr[i],arr[j]]=[arr[j],arr[i]]
	return arr
}