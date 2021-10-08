import { generateTypescript } from "../generator";
import { parse } from "../parser";
import {
    Const,
    FixedType,
    Function,
    FunctionArg,
    FunctionCall,
    GenericType,
    IfStatement,
    LeftPipe,
    ListValue,
    Module,
    ModuleReference,
    RightPipe,
    StringValue,
    Tag,
    Type,
    UnionType,
    UnparsedBlock,
    Value,
} from "../types";

import { intoBlocks, blockKind } from "../blocks";
import * as assert from "assert";
import { Ok } from "@eeue56/ts-core/build/main/lib/result";
import { compileTypescript } from "../compile";

const oneLine = `
helloWorld: List number
helloWorld = List.foldl add <| [ 1, 2, 3]
`.trim();

const multiLine = `
helloWorld: List number
helloWorld =
    List.foldl add
        <| [ 1, 2, 3]
`.trim();

const expectedOutput = `
const helloWorld: number[] = List.foldl(add)([ 1, 2, 3 ]);
`.trim();

export function testIntoBlocks() {
    assert.deepStrictEqual(intoBlocks(oneLine), [
        UnparsedBlock("ConstBlock", 0, oneLine.split("\n")),
    ]);
}

export function testIntoBlocksMultiLine() {
    assert.deepStrictEqual(intoBlocks(multiLine), [
        UnparsedBlock("ConstBlock", 0, multiLine.split("\n")),
    ]);
}

export function testBlockKind() {
    assert.deepStrictEqual(blockKind(oneLine), Ok("Const"));
}

export function testBlockKindMultiLine() {
    assert.deepStrictEqual(blockKind(multiLine), Ok("Const"));
}

export function testParse() {
    assert.deepStrictEqual(
        parse(oneLine),
        Module(
            "main",
            [
                Const(
                    "helloWorld",
                    FixedType("List", [ FixedType("number", [ ]) ]),
                    RightPipe(
                        ModuleReference(
                            [ "List" ],
                            FunctionCall("foldl", [ Value("add") ])
                        ),
                        ListValue([ Value("1"), Value("2"), Value("3") ])
                    )
                ),
            ],
            [ ]
        )
    );
}

export function testParseMultiLine() {
    assert.deepStrictEqual(
        parse(multiLine),
        Module(
            "main",
            [
                Const(
                    "helloWorld",
                    FixedType("List", [ FixedType("number", [ ]) ]),
                    RightPipe(
                        ModuleReference(
                            [ "List" ],
                            FunctionCall("foldl", [ Value("add") ])
                        ),
                        ListValue([ Value("1"), Value("2"), Value("3") ])
                    )
                ),
            ],
            [ ]
        )
    );
}

export function testGenerate() {
    const parsed = parse(multiLine);
    const generated = generateTypescript(parsed);
    assert.strictEqual(generated, expectedOutput);
}

export function testGenerateOneLine() {
    const parsed = parse(oneLine);
    const generated = generateTypescript(parsed);
    assert.strictEqual(generated, expectedOutput);
}

export function testCompile() {
    const parsed = parse(oneLine);
    const generated = generateTypescript(parsed);
    const compiled = compileTypescript(generated);

    assert.deepStrictEqual(
        compiled.kind,
        "ok",
        (compiled.kind === "err" && compiled.error.toString()) || ""
    );
}

export function testCompileMultiLine() {
    const parsed = parse(multiLine);
    const generated = generateTypescript(parsed);
    const compiled = compileTypescript(generated);

    assert.deepStrictEqual(
        compiled.kind,
        "ok",
        (compiled.kind === "err" && compiled.error.toString()) || ""
    );
}