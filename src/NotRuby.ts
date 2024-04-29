import {
	alphabet,
	char,
	betweenChars,
	choice,
	many,
	many1,
	matchString,
	digit,
	optional,
	regExp,
	trimSpaces,
	sepBy,
} from "./Combinators";
import { Parser } from "./Parser";

const sign = choice([char("+"), char("-")]) as Parser<"+" | "-">;

const integer = Parser.Do()
	.bind("sign", optional(sign))
	.bind("digits", ({ sign }) =>
		many1(digit).map(
			(digits) => Number(digits.join("")) * (sign === "-" ? -1 : 1),
		),
	)
	.map(({ digits }) => digits);

const identifier = regExp(/[a-zA-Z_][a-zA-Z0-9_]*/);

const optionalSomething = Parser.Do()
	.bind("optional", optional(matchString("?")))
	.bind("var", identifier);

const arrayOfInts = betweenChars(
	["[", "]"],
	sepBy(char(","), trimSpaces(integer), true),
);

const result = arrayOfInts.run("[-1  ,   +2   , -3 ]");
console.log(result);
