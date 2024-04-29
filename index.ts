import {
	alphabet,
	choice,
	betweenChars,
	many,
	matchString,
	skipSpaces,
	trimSpaces,
} from "./src/Combinators";
import { Parser } from "./src/Parser";

const lolParser = choice([matchString("abc"), matchString("cde")]);

const parser = Parser.Do()
	.bind(
		"a",
		Parser.Do()
			.bind("a", matchString("hi"))
			.bind("b", matchString("lol"))
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

const result = parser.run("hilolccde  (dccdccdcc)    ");

console.log(JSON.stringify(result, null, 2));
