import {
    allErrors,
    bothFlag,
    empty,
    help,
    longFlag,
    oneOf,
    parse,
    parser,
    string,
} from "@eeue56/baner";
import { readFile, writeFile } from "fs/promises";
import path from "path";
import { install } from "./install";
import { fileExists } from "./utils";

const validTemplates = [ "web" ];

const templateParser = parser([
    longFlag("path", "path of Derw file to create", string()),
    longFlag("template", "Template to use", oneOf(validTemplates)),
    bothFlag("h", "help", "This help text", empty()),
]);

function showInfoHelp() {
    console.log(help(templateParser));
}

async function copyWebTemplate(path: string): Promise<void> {
    const template = `
import "../derw-packages/derw-lang/html/src/Html" exposing ( HtmlNode, RunningProgram, div, text, program, attribute, class_ )

type alias Model = {
}

initialModel: Model
initialModel =
    { }

type Msg =
    Noop

update: Msg -> Model -> (Msg -> void) -> Model
update msg model send =
    case msg of
        Noop ->
            model

view: Model -> HtmlNode Msg
view model =
    div [ ] [ ] [ text "Hello" ]

root: any
root =
    document.getElementById "root"

main: RunningProgram Model Msg
main =
    program {
        initialModel: initialModel,
        view: view,
        update: update,
        root: root
    }
    `.trim();

    if (await fileExists(path)) {
        console.log("Already a file!");
        process.exit(1);
    }

    await writeFile(path, template);
}

async function appendGitIgnore(dir: string): Promise<void> {
    let gitIgnore = "";
    const gitIgnorePath = path.join(dir, ".gitignore");

    try {
        gitIgnore = await (await readFile(gitIgnorePath)).toString();
    } catch (e) {}

    gitIgnore =
        gitIgnore +
        `

# derw

derw-packages/
src/**/*.ts
`;

    await writeFile(gitIgnorePath, gitIgnore);
}

export async function template(
    isInPackageDirectory: boolean,
    argv: string[]
): Promise<void> {
    const program = parse(templateParser, argv);

    if (program.flags["h/help"].isPresent) {
        showInfoHelp();
        return;
    }

    const errors = allErrors(program);
    if (errors.length > 0) {
        console.log("Errors:");
        console.log(errors.join("\n"));
        process.exit(1);
    }

    const path =
        program.flags.path.isPresent &&
        program.flags.path.arguments.kind === "ok" &&
        (program.flags.path.arguments.value as string);

    const template =
        program.flags.template.isPresent &&
        program.flags.template.arguments.kind === "ok" &&
        (program.flags.template.arguments.value as string);

    if (!path) {
        console.log("You must provide a path via --path");
        return;
    }

    if (template === "web") {
        await copyWebTemplate(path);
        await install(isInPackageDirectory, [
            "--name",
            "derw-lang/html",
            "--version",
            "main",
        ]);
    } else {
        console.log(
            `Template ${template} is unknown. Try one of: ${validTemplates.join(
                ", "
            )}`
        );
    }
}
