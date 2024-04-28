import { Either } from "effect";
import { Parser } from "./src/Parser";

const hParser = Parser.char("h");
const iParser = Parser.char("i");

const hiParser = Parser.flatMap((h: string) => {
	return Parser.map((i: string) => h + i, iParser);
}, hParser);

const result = hiParser("ih");

console.log(result);
