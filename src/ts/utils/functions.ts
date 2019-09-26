/**
 * Deep copy function for TypeScript.
 * @param T Generic type of target/copied value.
 * @param target Target value to be copied.
 * @see Source project, ts-deepcopy https://github.com/ykdr2017/ts-deepcopy
 * @see Code pen https://codepen.io/erikvullings/pen/ejyBYg
 */
import * as nj from 'numjs'
import { HiCArray } from '../types/array'

export const deepCopy = <T>(target: T): T => {
    if (target === null) {
        return target;
    }
    if (target instanceof Date) {
        return new Date(target.getTime()) as any;
    }
    if (target instanceof Array) {
        const cp = [] as any[];
        (target as any[]).forEach((v) => { cp.push(v); });
        return cp.map((n: any) => deepCopy<any>(n)) as any;
    }
    if (typeof target === 'object' && target !== {}) {
        const cp = { ...(target as { [key: string]: any }) } as { [key: string]: any };
        Object.keys(cp).forEach(k => {
            cp[k] = deepCopy<any>(cp[k]);
        });
        return cp as T;
    }
    return target;
};

export function isNdArray(d: any): d is nj.NdArray {
    return (<nj.NdArray>d).convolve !== undefined
}

export const arrayLength = (data: Array<number> | nj.NdArray<number> | HiCArray): number | number[] => {
    if (data instanceof HiCArray) {
        return (data.data as nj.NdArray).shape
    } else if (isNdArray(data)) {
        return (data as nj.NdArray).shape
    } else if (data instanceof Array) {
        return data.length
    }
}
