const parser = require("@babel/parser");
const traverse = require("@babel/traverse").default;
const generate = require("@babel/generator").default;
const types = require("@babel/types");

const sourceCode = `
    console.log(1);

    function func() {
        console.info(2);
    }

    export default class Clazz {
        say() {
            console.debug(3);
        }
        render() {
            return 1;
        }
    }
`;

const ast = parser.parse(sourceCode, {
    sourceType: "unambiguous",
});

traverse(ast, {
    CallExpression(path, state) {
        if (
            types.isMemberExpression(path.node.callee) &&
            path.node.callee.object.name === "console" &&
            ["log", "info", "error", "debug"].includes(
                path.node.callee.property.name
            )
        ) {
            const { line, column } = path.node.loc.start;
            path.node.arguments.unshift(
                types.stringLiteral(`filename: (${line}, ${column})`)
            );
        }
    },
});

const { code, map } = generate(ast);
console.log(code);
