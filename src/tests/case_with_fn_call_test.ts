import * as assert from "@eeue56/ts-assert";
import { Ok } from "@eeue56/ts-core/build/main/lib/result";
import { blockKind, intoBlocks } from "../blocks";
import { compileTypescript } from "../compile";
import { generateJavascript } from "../generators/js";
import { generateTypescript } from "../generators/ts";
import { parse } from "../parser";
import {
    Branch,
    CaseStatement,
    Destructure,
    FixedType,
    Function,
    FunctionArg,
    FunctionCall,
    FunctionType,
    GenericType,
    ListValue,
    Module,
    UnparsedBlock,
    Value,
} from "../types";

const oneLine = `
filterMapHelp: (a -> Maybe b) -> a -> List b -> List b
filterMapHelp fn a xs =
    case fn a of
        Just { value } ->
            append xs [ value ]
        Nothing ->
            xs
`.trim();

const multiLine = `
filterMapHelp: (a -> Maybe b) -> a -> List b -> List b
filterMapHelp fn a xs =
    case fn a of
        Just { value } ->
            append xs [ value ]
        Nothing ->
            xs
`.trim();

const expectedOutput = `
function filterMapHelp<a, b>(fn: (arg0: a) => Maybe<b>, a: a, xs: b[]): b[] {
    const _res97517640 = fn(a);
    switch (_res97517640.kind) {
        case "Just": {
            const { value } = _res97517640;
            return append(xs, [ value ]);
        }
        case "Nothing": {
            return xs;
        }
    }
}
`.trim();

const expectedOutputJS = `
function filterMapHelp(fn, a, xs) {
    const _res97517640 = fn(a);
    switch (_res97517640.kind) {
        case "Just": {
            const { value } = _res97517640;
            return append(xs, [ value ]);
        }
        case "Nothing": {
            return xs;
        }
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
    const blocks = intoBlocks(oneLine);

    assert.deepStrictEqual(
        blocks.map((block) => blockKind(block.lines.join("\n"))),
        [ Ok("Function") ]
    );
}

export function testBlockKindMultiLine() {
    const blocks = intoBlocks(multiLine);

    assert.deepStrictEqual(
        blocks.map((block) => blockKind(block.lines.join("\n"))),
        [ Ok("Function") ]
    );
}

export function testParse() {
    assert.deepStrictEqual(
        parse(oneLine),
        Module(
            "main",
            [
                Function(
                    "filterMapHelp",
                    FixedType("List", [ GenericType("b") ]),
                    [
                        FunctionArg(
                            "fn",
                            FunctionType([
                                GenericType("a"),
                                FixedType("Maybe", [ GenericType("b") ]),
                            ])
                        ),
                        FunctionArg("a", GenericType("a")),
                        FunctionArg(
                            "xs",
                            FixedType("List", [ GenericType("b") ])
                        ),
                    ],
                    [ ],
                    CaseStatement(FunctionCall("fn", [ Value("a") ]), [
                        Branch(
                            Destructure("Just", "{ value }"),
                            FunctionCall("append", [
                                Value("xs"),
                                ListValue([ Value("value") ]),
                            ]),
                            [ ]
                        ),
                        Branch(Destructure("Nothing", ""), Value("xs"), [ ]),
                    ])
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
                    "filterMapHelp",
                    FixedType("List", [ GenericType("b") ]),
                    [
                        FunctionArg(
                            "fn",
                            FunctionType([
                                GenericType("a"),
                                FixedType("Maybe", [ GenericType("b") ]),
                            ])
                        ),
                        FunctionArg("a", GenericType("a")),
                        FunctionArg(
                            "xs",
                            FixedType("List", [ GenericType("b") ])
                        ),
                    ],
                    [ ],
                    CaseStatement(FunctionCall("fn", [ Value("a") ]), [
                        Branch(
                            Destructure("Just", "{ value }"),
                            FunctionCall("append", [
                                Value("xs"),
                                ListValue([ Value("value") ]),
                            ]),
                            [ ]
                        ),
                        Branch(Destructure("Nothing", ""), Value("xs"), [ ]),
                    ])
                ),
            ],
            [ ]
        )
    );
}

export function testGenerate() {
    const parsed = parse(oneLine);

    assert.deepStrictEqual(generateTypescript(parsed), expectedOutput);
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
