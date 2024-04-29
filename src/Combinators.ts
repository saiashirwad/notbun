import { Either } from "effect";
import { Parser } from "./Parser-2";
import { getRest } from "./Utils";

export const matchString = (str: string): Parser<string> =>
	new Parser((input) => {
		if (input.startsWith(str)) {
			return Either.right([str, input.slice(str.length)]);
		}
		return Either.left(`${str} not matched!`);
	});

export const alphabet: Parser<string> = new Parser((input) => {
	const [first, ...rest] = input;
	const expr = /^[a-zA-Z]$/;
	if (/^[a-zA-Z]$/.test(first)) {
		return Either.right([first, input.slice(1)]);
	}
	return Either.left("Not alphabet");
});

export const betweenChars = <T>(
	[start, end]: [string, string],
	parser: Parser<T>,
): Parser<T> =>
	new Parser((input) =>
		new Parser((input_) => {
			if (!input.startsWith(start)) {
				return Either.left(`Not surrounded by ${start} ${end}`);
			}
			if (input.at(-1) !== end) {
				return Either.left(`Not surrounded by ${start} and ${end}`);
			}
			return Either.right([undefined, input.slice(1, -1)]);
		})
			.zip(parser)
			.map(([_, t]) => t)
			.run(input),
	);

const many_ =
	<T>(count: number) =>
	(parser: Parser<T>): Parser<Array<T>> =>
		new Parser((input) => {
			const acc: T[] = [];
			let rest = input;
			while (true) {
				const result = parser.run(rest);
				if (Either.isLeft(result)) {
					if (acc.length >= count) {
						return Either.right([acc, rest]);
					} else {
						return Either.left(
							`many_(${count}) expected, but only ${acc.length} found`,
						);
					}
				}
				rest = getRest(result);
				acc.push(result.right[0]);
			}
			return Either.right([acc, rest]);
		});

const skipMany_ =
	<T>(count: number) =>
	(parser: Parser<T>): Parser<undefined> =>
		new Parser((input) => {
			const acc: T[] = [];
			let rest = input;
			while (true) {
				const result = parser.run(rest);
				if (Either.isLeft(result)) {
					if (acc.length >= count) {
						return Either.right([undefined, rest]);
					} else {
						return Either.left(
							`skipMany_(${count}) expected, but only ${acc.length} found`,
						);
					}
				}
				rest = getRest(result);
				acc.push(result.right[0]);
			}
			return Either.right([undefined, rest]);
		});

export const skipUntil = <T>(parser: Parser<T>): Parser<undefined> =>
	new Parser((input) => {
		let rest = input;
		while (true) {
			if (rest.length === 0) {
				return Either.left("oops");
			}
			const result = parser.run(input);
			if (Either.isRight(result)) {
				return Either.right([undefined, rest]);
			}
			rest = rest.slice(1);
		}
		return Either.left("wtf");
	});

export const many = <T>(parser: Parser<T>) => many_<T>(0)(parser);
export const many1 = <T>(parser: Parser<T>) => many_<T>(1)(parser);
export const manyN = <T>(parser: Parser<T>, n: number) => many_<T>(n)(parser);

export const skipMany = <T>(parser: Parser<T>) => skipMany_<T>(0)(parser);
export const skipMany1 = <T>(parser: Parser<T>) => skipMany_<T>(1)(parser);
export const skipManyN = <T>(parser: Parser<T>, n: number) =>
	skipMany_<T>(n)(parser);

// export const newLine = string("\n");

// export const spaces = <T>(parser: Parser<T>) =>
// 	map(ap(skipMany(matchString(" ")), parser), ([_, t]) => t);

// export const trimSpaces =
// 	<T>(parser: Parser<T>): Parser<T> =>
// 	(input) =>
// 		map(
// 			ap((input) => {
// 				const result = input.trim();
// 				return Either.right([undefined, result]);
// 			}, parser),
// 			([_, t]) => t,
// 		)(input);

// export const choice =
// 	(parsers: Array<Parser<unknown>>): Parser<unknown> =>
// 	(input) => {
// 		for (const parser of parsers) {
// 			const result = parser(input);
// 			if (Either.isRight(result)) {
// 				return result;
// 			}
// 		}
// 		return Either.left("None of the choices could be satisfied");
//
//
// 	};

export const regExp = (exp: RegExp): Parser<string> =>
	new Parser((input) => {
		const idx = input.search(exp);
		if (input.search(exp) === 0) {
			const result = input.match(exp);
			if (!result) {
				return Either.left("oops");
			}
			const first = result[0]!;
			const rest = input.slice(first.length);
			return Either.right([first, rest]);
		}
		return Either.left("oops");
	});
