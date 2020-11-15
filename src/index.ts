import { JSONPath as jp, JSONPathOptions } from 'jsonpath-plus';

type Path = JSONPathOptions['path'] | Object | [string, (queryData: any) => any]

const callMap = {
  string: (data: any, path: string, accept: any, key: string) => {
    if (!path.includes('$')) {
      accept[key] = path
      return
    }
    const got = jp({ path, json: data, resultType: 'all' })
    accept[key] = got[0]?.value
  },
  array: (data: any, pathArr: [string, Path], accept: any, key: string) => {
    const [arrPath, path] = pathArr;
    const got = jp({path: arrPath, json: data, resultType: 'all'}) || []
    if (got.length && path) {
      accept = accept[key] = []
      got[0].value?.forEach((item: any, index: number) => {
        stroll(item, path, accept, index)
      })
    } else accept[key] = got
  },
  object: (data: any, pathObj: any, accept: any, key: string) => {
    if (key !== undefined) accept = accept[key] = {}
    Object.keys(pathObj).forEach(p => stroll(data, pathObj[p], accept, p))
  },
  function: (data: any, pathFnArr: [string, (queryData: any) => any], accept: any, key: string) => {
    const [path, fn] = pathFnArr;
    const got = jp({path, json: data})
    accept[key] = fn ? fn(got[0]) : got
  }
}

type CallType = keyof typeof callMap

const callByType = (type: CallType) => callMap[type]

const type = (o: Path, type?: unknown) => Array.isArray(o) ? (type = typeof o[1], type === 'function' ? type : 'array') : typeof o as CallType

const stroll = (data: any, path: Path, accept: any, key?: string | number) => {
  const f = callByType(type(path))
  if (f) f(data, path, accept, key as string)
}


export default (data: any, pathTemplate: Path) => {
  const result = {}
  stroll(data, pathTemplate, result)
  return result;
};
