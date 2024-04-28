import {
	char,
	flatMap,
	many,
	andThen,
	spaces,
	map,
	betweenChars,
	alphabet,
	skipUntil,
} from "./src/Parser";

const aParser = char("a");
const bParser = char("b");
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
	const parser = map(andThen(skipUntil(word), word), ([_, s]) => s.join(""));
	const result = parser("hithere");
	console.log(result);
}
lol();

// const result = choice([manyAParser, aParser, bParser]).run("aacsd");
//
// console.log(result);
