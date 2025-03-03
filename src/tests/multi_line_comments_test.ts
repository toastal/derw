import * as assert from "@eeue56/ts-assert";
import { Ok } from "@eeue56/ts-core/build/main/lib/result";
import { blockKind, intoBlocks } from "../blocks";
import { compileTypescript } from "../compile";
import { generateJavascript } from "../generators/js";
import { generateTypescript } from "../generators/ts";
import { parse, stripComments } from "../parser";
import {
    ArrowToken,
    AssignToken,
    CloseBracketToken,
    ColonToken,
    IdentifierToken,
    OpenBracketToken,
    tokenize,
    WhitespaceToken,
} from "../tokens";
import {
    FixedType,
    Function,
    FunctionArg,
    FunctionCall,
    GenericType,
    Module,
    ModuleReference,
    MultilineComment,
    UnparsedBlock,
} from "../types";

const oneLine = `
{-
    hello
    world
-}
toString: any -> string
toString buffer = buffer.toString()
`.trim();

const multiLine = `
{-
    hello
    world
-}
toString: any -> string
toString buffer =
    buffer.toString()
`.trim();

const expectedOutput = `
function toString(buffer: any): string {
    return buffer.toString();
}
`.trim();

const expectedOutputJS = `
function toString(buffer) {
    return buffer.toString();
}
`.trim();

export function testIntoBlocks() {
    assert.deepStrictEqual(intoBlocks(oneLine), [
        UnparsedBlock(
            "MultilineCommentBlock",
            0,
            oneLine.split("\n").slice(0, 4)
        ),
        UnparsedBlock("FunctionBlock", 4, oneLine.split("\n").slice(4)),
    ]);
}

export function testIntoBlocksMultiLine() {
    assert.deepStrictEqual(intoBlocks(multiLine), [
        UnparsedBlock(
            "MultilineCommentBlock",
            0,
            multiLine.split("\n").slice(0, 4)
        ),
        UnparsedBlock("FunctionBlock", 4, multiLine.split("\n").slice(4)),
    ]);
}

export function testBlockKind() {
    assert.deepStrictEqual(blockKind(oneLine), Ok("MultilineComment"));
}

export function testBlockKindMultiLine() {
    assert.deepStrictEqual(blockKind(multiLine), Ok("MultilineComment"));
}

export function testParse() {
    assert.deepStrictEqual(
        parse(oneLine),
        Module(
            "main",
            [
                MultilineComment(),
                Function(
                    "toString",
                    FixedType("string", [ ]),
                    [ FunctionArg("buffer", GenericType("any")) ],
                    [ ],
                    ModuleReference([ "buffer" ], FunctionCall("toString", [ ]))
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
                MultilineComment(),
                Function(
                    "toString",
                    FixedType("string", [ ]),
                    [ FunctionArg("buffer", GenericType("any")) ],
                    [ ],
                    ModuleReference([ "buffer" ], FunctionCall("toString", [ ]))
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

export function testStripComments() {
    const tokens = tokenize(oneLine);
    const withoutComments = stripComments(tokens);

    assert.deepStrictEqual(withoutComments, [
        WhitespaceToken("\n"),
        IdentifierToken("toString"),
        ColonToken(),
        WhitespaceToken(" "),
        IdentifierToken("any"),
        WhitespaceToken(" "),
        ArrowToken(),
        WhitespaceToken(" "),
        IdentifierToken("string"),
        WhitespaceToken("\n"),
        IdentifierToken("toString"),
        WhitespaceToken(" "),
        IdentifierToken("buffer"),
        WhitespaceToken(" "),
        AssignToken(),
        WhitespaceToken(" "),
        IdentifierToken("buffer.toString"),
        OpenBracketToken(),
        CloseBracketToken(),
    ]);
}

export function testStripCommentsMultiLine() {
    const tokens = tokenize(multiLine);
    const withoutComments = stripComments(tokens);

    assert.deepStrictEqual(withoutComments, [
        WhitespaceToken("\n"),
        IdentifierToken("toString"),
        ColonToken(),
        WhitespaceToken(" "),
        IdentifierToken("any"),
        WhitespaceToken(" "),
        ArrowToken(),
        WhitespaceToken(" "),
        IdentifierToken("string"),
        WhitespaceToken("\n"),
        IdentifierToken("toString"),
        WhitespaceToken(" "),
        IdentifierToken("buffer"),
        WhitespaceToken(" "),
        AssignToken(),
        WhitespaceToken("\n    "),
        IdentifierToken("buffer.toString"),
        OpenBracketToken(),
        CloseBracketToken(),
    ]);
}
