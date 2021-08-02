import { generateTypescript } from "../generator";
import { parse } from "../parser";
import {
    Addition,
    Branch,
    CaseStatement,
    Const,
    Destructure,
    FixedType,
    FormatStringValue,
    Function,
    FunctionArg,
    IfStatement,
    Module,
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

const multiLine = `
sayHiToPet : Animal -> string
sayHiToPet pet =
    case pet of
        Dog { name } -> \`Good boy \${name}!\`
        Cat { lives } -> "You have " + lives + " lives remaining."
`.trim();

const expectedOutput = `
function sayHiToPet(pet: Animal): string {
    switch (pet.kind) {
        case "Dog": {
            const { name } = pet;
            return \`Good boy \${name}!\`;
        }
        case "Cat": {
            const { lives } = pet;
            return "You have " + lives + " lives remaining.";
        }
    }
}
`.trim();

export function testIntoBlocksMultiLine() {
    assert.deepStrictEqual(intoBlocks(multiLine), [
        UnparsedBlock("FunctionBlock", 0, multiLine.split("\n")),
    ]);
}

export function testBlockKindMultiLine() {
    assert.deepStrictEqual(blockKind(multiLine), Ok("Function"));
}

export function testParseMultiLine() {
    assert.deepStrictEqual(
        parse(multiLine),
        Module(
            "main",
            [
                Function(
                    "sayHiToPet",
                    FixedType("string", [ ]),
                    [ FunctionArg("pet", FixedType("Animal", [ ])) ],
                    CaseStatement(Value("pet"), [
                        Branch(
                            Destructure("Dog", "{ name }"),
                            FormatStringValue("Good boy ${name}!")
                        ),
                        Branch(
                            Destructure("Cat", "{ lives }"),
                            Addition(
                                StringValue("You have "),
                                Addition(
                                    Value("lives"),
                                    StringValue(" lives remaining.")
                                )
                            )
                        ),
                    ])
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