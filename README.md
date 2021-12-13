# derw

An Elm-inspired language that transpiles to TypeScript

# Usage

You can run the derw compiler via npx. You must provide files via `--files`.

```bash
npx @eeue56/derw

Compiles Derw code
Provide entry files via --files
  --files [string...]:      Filenames to be given
  --target ts | js | derw:	Target either TS or JS output
  --output string:		    Output directory name
  --verify :		        Run typescript compiler on generated files to ensure valid output
  --debug :		            Show a parsed object tree
  --only string:		    Only show a particular object
  --run :		            Should be run via ts-node/node
  --format :		        Format the files given in-place
  -h, --help :		        This help text
```

# Example

You can find a bunch of examples in [examples](./examples), along with the Typescript they generate. But the general gist is: Elm-compatible syntax where possible.

```elm
type Result a b
    = Err { error: a }
    | Ok { value: b }

asIs : Result a b -> Result a b
asIs result =
    case result of
        Err { error } -> Err { error }
        Ok { value } -> Ok { value }
```

# Roadmap

## 0.0.1 alpha

-   [x] Arrays `[ ]`, `[ 1, 2, 3 ]`, `[ [ 1, 2, 3 ], [ 3, 2, 1 ] ]`
-   [x] Booleans `true`, `false`
-   [x] Boolean equality `1 < 2`, `1 <= 2`, `1 == 2`, `1 != 2`, `1 > 2`, `1 >= 2`
-   [x] Boolean operations `true && false`, `not true`, `true || false`
-   [x] Strings `""`, `"hello world"`
-   [x] Format strings ` `` `, `` `Hello ${name}` ``
-   [x] Numbers `-1`, `0`, `1`, `-1.1`, `1.1`
-   [x] Addition `1 + 2`, `"Hello" + name`
-   [x] Subtraction `2 - 1`
-   [x] Multiplication `2 * 1`
-   [x] Division `2 / 1`
-   [x] Pipe `[1, 2, 3] |> List.fold add`, `List.fold add <| [1, 2, 3]`
-   [ ] Compose `>>`, `<<`
-   [x] Constants `hello = "hello world"`
-   [x] Function definitions
-   [x] Lists `[ 1, 2, 3 ]`, `[ "hello", "world" ]`
-   [x] List ranges `[ 1..5 ]`, `[ start..end ]`

```elm
add : number -> number -> number
add x y = x + y
```

-   [x] Function calls

```elm
three = add 1 2
```

-   [x] Module references

```elm
three = List.map identity [ 1, 2, 3 ]
```

-   [x] Union types

```elm
type Result a b
    = Err { error: a }
    | Ok { value: b }
```

-   [x] Type variables

```
type Thing a = Thing a
```

-   [x] Type aliases

```elm
type User =
    { name: string }
```

-   [x] Object literals

```elm
user: User
user = { name: string }
```

-   [ ] Imports

```elm
import List
import Result exposing (map)
```

-   [x] Exports

```elm
exposing (map)
```

-   [x] Let statements

```elm
sayHiTo : User -> string
sayHiTo user =
    let
        name = user.name
    in
        "Hello " + name

sayHelloTo : User -> string
sayHelloTo user =
    let
        getName: User -> string
        getName user = user.name
    in
        "Hello" + getName user
```

-   [x] If statements

```elm
type Animal = Animal { age: number }
sayHiTo : Animal -> string
sayHiTo animal =
    if animal.age == 1 of
        "Hello little one!"
    else
        "You're old"
```

-   [x] Case..of

```elm
type Animal = Dog | Cat
sayHiTo : Animal -> string
sayHiTo animal =
    case animal of
        Dog -> "Hi dog!"
        Cat -> "Hi cat!"
```

-   [x] Destructing in case..of

```elm
type User = User { name: string }

sayHiTo : User -> string
sayHiTo user =
    case user of
        User { name } -> "Hi " + name + !"
```

-   [ ] List destructing

```elm

sayHiTo : List number -> string
sayHiTo xs =
    case xs of
        [] -> "Empty"
        x::ys -> "Hello " + x + (sayHiTo ys)
```

-   [x] Constructing union types

```elm
type User = User { name: string }
noah = User { name: "Noah" }
```

-   [x] lambdas `\x -> x + 1`, `\x y -> x + y`
-   [x] Typescript output
-   [x] Javscript output
-   [x] Module resolution
-   [x] CLI
-   [x] Type checking
-   [x] Syntax highlighting for editors

## 1.0.0

-   [x] An automatic formatter with no options
-   [ ] A standard library
-   [ ] Support for [Coed](https://github.com/eeue56/coed)
-   [ ] Testing support via [Bach](https://github.com/eeue56/bach)
-   [ ] Benchmarking support via [Mainc](https://github.com/eeue56/mainc)

# Divergence from Elm

-   All top level consts or functions must have type definitions
-   Format strings ``
-   No need for module names in the module file itself. Use `exposing` instead

# Editor language support

Currently VSCode syntax highlighting is supported by this extenstion: https://github.com/eeue56/derw-syntax. It is not on the marketplace because Microsoft account creation was down when I tried.

Instead, you can do:

```
git clone https://github.com/eeue56/derw-syntax
cp -r derw-syntax ~/.vscode/extensions/derw-syntax-0.0.1
```

# Name

derw which means oak. Oak is one of the native trees in Wales, famous for it's long life, tall stature, and hard, good quality wood. An English speaker might pronounce it as "deh-ru".
