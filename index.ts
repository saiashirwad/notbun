import { char, choice, many } from "./src/Parser";

const aParser = char("a");
const bParser = char("b");
const manyAParser = many(aParser);

const result = choice([manyAParser, aParser, bParser]).run("aacsd");

console.log(result);
