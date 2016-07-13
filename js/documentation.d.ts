import { KwyjiboMethodMountpoint } from "./controller";
export declare class MethodDoc {
    name: string;
    docString: string;
    mountpoints: KwyjiboMethodMountpoint[];
}
export declare class ControllerDocNode {
    name: string;
    docString: string;
    path: string;
    parent: ControllerDocNode;
    childs: ControllerDocNode[];
    methods: MethodDoc[];
}
export declare function getDocs(): ControllerDocNode[];
export declare function getDocsAsHTML(): string;
