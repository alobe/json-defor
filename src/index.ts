import { JSONPath as jp } from 'jsonpath-plus';

export type Data = any;

export type Path =
  | string
  | [string, (queryData: Data) => Data]
  | (() => Data)
  | Object;

const QueryFn = {
  string: (data: Data, path: string): Data => {
    if (!path.includes('$')) return path;
    const got = jp({ path, json: data, resultType: 'all' }) || [];
    return got[0]?.value;
  },
  array: (data: Data, pathArr: [string, Path]): Data => {
    const [arrPath, path] = pathArr;
    const got = jp({ path: arrPath, json: data, resultType: 'all' }) || [];
    if (got.length && path) {
      return ((got[0].value || []) as Data[]).reduce(
        (acc, val) => [...acc, stroll(val, path)],
        []
      );
    } else return got;
  },
  object: (data: Data, pathObj: any): Data =>
    Object.keys(pathObj).reduce(
      (acc, key) => ({ ...acc, [key]: stroll(data, pathObj[key]) }),
      {}
    ),
  function: (data: Data, pathFnArr: [string, (queryData: Data) => Data]) => {
    const [path, fn] = pathFnArr;
    const got = jp({ path, json: data }) || [];
    return fn ? fn(got[0]) : got;
  },
  constant: (data: Data, pathFn: () => Data) => pathFn(),
};

type FnKeys = keyof typeof QueryFn;

const getFnTypeViaPath = (o: Path, type?: unknown) => (
  (type = typeof o),
  type === 'function'
    ? 'constant'
    : Array.isArray(o)
    ? ((type = typeof o[1]), type === 'function' ? type : 'array')
    : (typeof o as FnKeys)
);

const stroll = (data: Data, path: Path) =>
  QueryFn[getFnTypeViaPath(path)]?.(data, path);

export default stroll;
