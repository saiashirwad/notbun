import { alphabet, betweenChars, many, matchString } from "./src/Combinators";
import { Parser } from "./src/Parser-2";

const parser = Parser.Do()
	.bind(
		"a",
		Parser.Do()
			.bind("a", matchString("hi"))
			.bind("b", matchString("lol"))
			.bind("c", alphabet),
	)
	.bind(
		"d",
		betweenChars(
			["(", ")"],
			many(
				Parser.Do()
					.bind("d", matchString("d"))
					.bind("c", many(matchString("c"))),
			),
		),
	);

const result = parser.run("hilolc(dccdccdcc)");

console.log(JSON.stringify(result, null, 2));
