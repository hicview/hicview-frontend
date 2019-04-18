/*
args: {
  arg1: {},
  arg2: {} ...
}
--------------------
fillParam: {
  arg1: arg1,
  arg2: arg2
}
--------------------
merge args.arg1 => fillParam.arg1
*/
function argsParser (args, fillParam) {
  let fills = Object.assign(fillParam)
  if (args !== undefined) {
    Object.keys(args).forEach(arg => {
      if (Object.keys(fills).includes(arg)) {
        let fill = fills[arg]
        Object.keys(args[arg]).forEach(prop => {
	  fill[prop] = args[arg][prop]
        })
      }
    })
  }
  return fills
}

export { argsParser }
