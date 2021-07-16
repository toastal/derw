export type Type = {
    kind: "Type";
    name: string;
    args: Type[];
};

export function Type(name: string, args: Type[]): Type {
    return {
        kind: "Type",
        name,
        args,
    };
}

export type TagArg = {
    kind: "TagArg";
    name: string;
    type: Type;
};

export function TagArg(name: string, type: Type): TagArg {
    return {
        kind: "TagArg",
        name,
        type,
    };
}

export type Tag = {
    kind: "Tag";
    name: string;
    args: TagArg[];
};

export function Tag(name: string, args: TagArg[]): Tag {
    return {
        kind: "Tag",
        name,
        args,
    };
}

export type UnionType = {
    kind: "UnionType";
    type: Type;
    tags: Tag[];
};

export function UnionType(type: Type, tags: Tag[]): UnionType {
    return {
        kind: "UnionType",
        type,
        tags,
    };
}

export type FunctionArg = {
    kind: "FunctionArg";
    name: string;
    type: Type;
};

export function FunctionArg(name: string, type: Type): FunctionArg {
    return {
        kind: "FunctionArg",
        name,
        type,
    };
}

export type Value = {
    kind: "Value";
    body: string;
};

export function Value(body: string): Value {
    return {
        kind: "Value",
        body,
    };
}

export type IfStatement = {
    kind: "IfStatement";
    predicate: Expression;
    ifBody: Expression;
    elseBody: Expression;
};

export function IfStatement(
    predicate: Expression,
    ifBody: Expression,
    elseBody: Expression
): IfStatement {
    return {
        kind: "IfStatement",
        predicate,
        ifBody,
        elseBody,
    };
}

export type Expression = IfStatement | Value;

export type Function = {
    kind: "Function";
    name: string;
    returnType: Type;
    args: FunctionArg[];
    body: Expression;
};

export function Function(
    name: string,
    returnType: Type,
    args: FunctionArg[],
    body: Expression
): Function {
    return {
        kind: "Function",
        name,
        returnType,
        args,
        body,
    };
}

export type BlockKinds = "UnionType" | "Function";

export type Block = UnionType | Function;

export type Module = {
    kind: "Module";
    name: string;
    body: Block[];
    errors: string[];
};

export function Module(name: string, body: Block[], errors: string[]): Module {
    return {
        kind: "Module",
        name,
        body,
        errors,
    };
}
