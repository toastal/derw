import * as assert from "@eeue56/ts-assert";
import { Ok } from "@eeue56/ts-core/build/main/lib/result";
import { blockKind, intoBlocks } from "../blocks";
import { compileTypescript } from "../compile";
import { generateJavascript } from "../js_generator";
import { parse } from "../parser";
import { generateTypescript } from "../ts_generator";
import {
    BlockKinds,
    FixedType,
    FunctionType,
    GenericType,
    Module,
    Property,
    TypeAlias,
    UnparsedBlock,
} from "../types";

const oneLine = `
type alias Program msg model = { update: msg -> model -> model }
`.trim();

const multiLine = `
type alias Program msg model = {
    update: msg -> model -> model
}
`.trim();

const expectedOutput = `
type Program<msg, model> = {
    update: (arg0: msg, arg1: model) => model;
}

function Program<msg, model>(args: { update: (arg0: msg, arg1: model) => model }): Program<msg, model> {
    return {
        ...args,
    };
}
`.trim();

const expectedOutputJS = `
function Program(args) {
    return {
        ...args,
    };
}
`.trim();

export function testIntoBlocks() {
    assert.deepStrictEqual(intoBlocks(oneLine), [
        UnparsedBlock("TypeAliasBlock", 0, oneLine.split("\n")),
    ]);
}

export function testIntoBlocksMultiLine() {
    assert.deepStrictEqual(intoBlocks(multiLine), [
        UnparsedBlock("TypeAliasBlock", 0, multiLine.split("\n")),
    ]);
}

export function testBlockKind() {
    assert.deepStrictEqual(
        blockKind(oneLine),
        Ok<string, BlockKinds>("TypeAlias")
    );
}

export function testBlockKindMultiLine() {
    assert.deepStrictEqual(
        blockKind(multiLine),
        Ok<string, BlockKinds>("TypeAlias")
    );
}

export function testParse() {
    assert.deepStrictEqual(
        parse(oneLine),
        Module(
            "main",
            [
                TypeAlias(
                    FixedType("Program", [
                        GenericType("msg"),
                        GenericType("model"),
                    ]),
                    [
                        Property(
                            "update",
                            FunctionType([
                                GenericType("msg"),
                                GenericType("model"),
                                GenericType("model"),
                            ])
                        ),
                    ]
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
                TypeAlias(
                    FixedType("Program", [
                        GenericType("msg"),
                        GenericType("model"),
                    ]),
                    [
                        Property(
                            "update",
                            FunctionType([
                                GenericType("msg"),
                                GenericType("model"),
                                GenericType("model"),
                            ])
                        ),
                    ]
                ),
            ],
            [ ]
        )
    );
}

export function testGenerate() {
    const parsed = parse(oneLine);
    assert.strictEqual(generateTypescript(parsed), expectedOutput);
}

export function testGenerateMultiLine() {
    const parsed = parse(multiLine);
    assert.deepStrictEqual(generateTypescript(parsed), expectedOutput);
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
