import {
	alphabet,
	andThen,
	betweenChars,
	many,
	map,
	regExp,
	skipUntil,
	spaces,
	string,
	trimSpaces,
} from "./src/Parser";

const aParser = string("a");
const bParser = string("b");
const manyAParser = many(aParser);
const word = many(alphabet);

// data LispVal = Atom String
//              | List [LispVal]
//              | DottedList [LispVal] LispVal
//              | Number Integer
//              | String String
//              | Bool Bool

type StringLiteral = {
	type: "string";
	value: string;
};
type NumberLiteral = {
	type: "number";
	value: number;
};
type Boolean = "true" | "false";
type None = "None";

type Literals = StringLiteral | NumberLiteral | Boolean | None;

// function lol() {
// 	const constParser = string("const");
// 	const parser = map(
// 		andThen(
// 			constParser,
// 			trimSpaces(
// 				many(
// 					trimSpaces(
// 						map(andThen(skipUntil(word), word), ([_, s]) => s.join("")),
// 					),
// 				),
// 			),
// 		),
// 		([_, words]) => {
// 			return `Words: ${words.join(",")}`;
// 		},
// 	);
// 	const result = parser("const    hi \n there what the hell \n what   ");
// 	console.log(result);
// }
// lol();
//
// // const result = choice([manyAParser, aParser, bParser]).run("aacsd");
// //
// // console.log(result);

const IDENTIFIER = /[a-zA-Z_][a-zA-Z0-9_]*/;
const STRING = /"([^"\\]|\\.)*"/;

const parser = betweenChars(
	["[", "]"],
	many(
		trimSpaces(
			map(regExp(STRING), (s) => {
				return s.slice(1, -1);
			}),
		),
	),
);
const result = parser('["hithere! what" "no"]');

console.log(result);
