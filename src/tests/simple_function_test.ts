import * as assert from "@eeue56/ts-assert";
import { Ok } from "@eeue56/ts-core/build/main/lib/result";
import { blockKind, intoBlocks } from "../blocks";
import { compileTypescript } from "../compile";
import { generateJavascript } from "../generators/js";
import { generateTypescript } from "../generators/ts";
import { parse } from "../parser";
import {
    FixedType,
    Function,
    FunctionArg,
    IfStatement,
    Module,
    UnparsedBlock,
    Value,
} from "../types";

const oneLine = `
isTrue: boolean -> boolean
isTrue value = if value then true else false
`.trim();

const multiLine = `
isTrue: boolean -> boolean
isTrue value =
    if value then
        true
    else
        false
`.trim();

const expectedOutput = `
function isTrue(value: boolean): boolean {
    if (value) {
        return true;
    } else {
        return false;
    }
}
`.trim();

const expectedOutputJS = `
function isTrue(value) {
    if (value) {
        return true;
    } else {
        return false;
    }
}
`.trim();

export function testIntoBlocks() {
    assert.deepStrictEqual(intoBlocks(oneLine), [
        UnparsedBlock("FunctionBlock", 0, oneLine.split("\n")),
    ]);
}

export function testIntoBlocksMultiLine() {
    assert.deepStrictEqual(intoBlocks(multiLine), [
        UnparsedBlock("FunctionBlock", 0, multiLine.split("\n")),
    ]);
}

export function testBlockKind() {
    assert.deepStrictEqual(blockKind(oneLine), Ok("Function"));
}

export function testBlockKindMultiLine() {
    assert.deepStrictEqual(blockKind(multiLine), Ok("Function"));
}

export function testParse() {
    assert.deepStrictEqual(
        parse(oneLine),
        Module(
            "main",
            [
                Function(
                    "isTrue",
                    FixedType("boolean", [ ]),
                    [ FunctionArg("value", FixedType("boolean", [ ])) ],
                    [ ],
                    IfStatement(
                        Value("value"),
                        Value("true"),
                        [ ],
                        Value("false"),
                        [ ]
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
                Function(
                    "isTrue",
                    FixedType("boolean", [ ]),
                    [ FunctionArg("value", FixedType("boolean", [ ])) ],
                    [ ],
                    IfStatement(
                        Value("value"),
                        Value("true"),
                        [ ],
                        Value("false"),
                        [ ]
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

export function testGenerateJS() {
    const parsed = parse(multiLine);
    const generated = generateJavascript(parsed);
    assert.strictEqual(generated, expectedOutputJS);
}

export function testGenerateOneLineJS() {
    const parsed = parse(oneLine);
    const generated = generateJavascript(parsed);
    assert.strictEqual(generated, expectedOutputJS);
}
