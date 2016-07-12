export declare class MethodDoc {
    name: string;
    docString: string;
}
export declare class ControllerDocNode {
    name: string;
    docString: string;
    childs: ControllerDocNode[];
    methods: MethodDoc[];
}
export declare function getDocs(): ControllerDocNode[];
