import {
	string,
	flatMap,
	many,
	andThen,
	spaces,
	map,
	betweenChars,
	alphabet,
	skipUntil,
} from "./src/Parser";

const aParser = string("a");
const bParser = string("b");
const manyAParser = many(aParser);
const word = many(alphabet);

function lol() {
	let rest = "abb";
	// const parser = between(
	// 	["(", ")"],
	// 	andThen(
	// 		andThen(andThen(manyAParser, bParser), char("c")),
	// 		map(spaces(char("a")), (s) => {
	// 			return s;
	// 		}),
	// 	),
	// );
	// const parser_ = map(parser, (a) => {
	// 	return "lol";
	// });
	const constParser = string("const");
	const parser = map(
		andThen(
			constParser,
			spaces(
				many(
					spaces(map(andThen(skipUntil(word), word), ([_, s]) => s.join(""))),
				),
			),
		),
		([_, words]) => {
			return `Words: ${words.join(",")}`;
		},
	);
	const result = parser("const hi there what the hell");
	console.log(result);
}
lol();

// const result = choice([manyAParser, aParser, bParser]).run("aacsd");
//
// console.log(result);
