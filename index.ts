import {
	alphabet,
	betweenChars,
	choice,
	digit,
	many,
	many1,
	matchString,
	regExp,
	trimSpaces,
} from "./src/Combinators";
import { Parser } from "./src/Parser";

const NUMBER = many1(digit).map((x) => Number(x.join("")));
const IDENTIFIER = regExp(/[a-zA-Z_][a-zA-Z0-9_]*/);

const lolParser = choice([
	matchString("abc"),
	Parser.Do()
		.bind("h", matchString("h"))
		.bind("e", matchString("e"))
		.bind("c", matchString("c"))
		.bind("k", matchString("k")),
]);

const parser = Parser.Do()
	.bind(
		"a",
		Parser.Do()
			.bind("a", matchString("hi"))
			.bind("b", (s) => matchString("lol"))
			.bind("c", alphabet)
			.bind("lol", lolParser),
	)
	.bind(
		"d",
		trimSpaces(
			betweenChars(
				["(", ")"],
				many(
					Parser.Do()
						.bind("d", matchString("d"))
						.bind("c", many(matchString("c"))),
				),
			),
		),
	);
