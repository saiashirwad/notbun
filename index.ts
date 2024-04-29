import {
	alphabet,
	betweenChars,
	many,
	regExp,
	skipUntil,
	string,
	trimSpaces,
} from "./src/Combinators";
import { ap, map } from "./src/Parser";

const aParser = string("a");
const bParser = string("b");
const manyAParser = many(aParser);
const word = many(alphabet);

function lol() {
	const constParser = string("const");
	const parser = map(
		ap(
			constParser,
			trimSpaces(
				many(
					trimSpaces(map(ap(skipUntil(word), word), ([_, s]) => s.join(""))),
				),
			),
		),
		([_, words]) => {
			return `Words: ${words.join(",")}`;
		},
	);
	const result = parser("const    hi \n there what the hell \n what   ");
	console.log(result);
}
lol();

// // const result = choice([manyAParser, aParser, bParser]).run("aacsd");
// //
// // console.log(result);

const IDENTIFIER = /[a-zA-Z_][a-zA-Z0-9_]*/;
const STRING = /"([^"\\]|\\.)*"/;

// const parser = betweenChars(
// 	["[", "]"],
// 	many(
// 		trimSpaces(
// 			map(regExp(STRING), (s) => {
// 				return s.slice(1, -1);
// 			}),
// 		),
// 	),
// );
// const result = parser('["hithere! what" "no"]');
//
// console.log(result);
