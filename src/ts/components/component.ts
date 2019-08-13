'use strict'

export interface ComponentInterface {
    data: any,
    render?: () => void,
    componentDidUpdate: () => any,
    componentDidMount: () => any,
    componentWillDispose: () => any
}


export class ComponentBase implements ComponentInterface {
    data: any;
    componentDidMount() { }
    componentDidUpdate() { }
    componentWillDispose() { }
}
