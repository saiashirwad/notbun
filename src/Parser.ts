import { Either } from "effect";
import { isRight } from "effect/Either";

type Input = string;

export type ParserResult<T> = Either.Either<[T, Input], string>;
export type Parser<T> = (input: Input) => ParserResult<T>;

export const map =
	<A, B>(parser: Parser<A>, f: (a: A) => B): Parser<B> =>
	(input) =>
		Either.match(parser(input), {
			onRight: ([a, rest]) => Either.right([f(a), rest]),
			onLeft: (e) => Either.left(e),
		});

export const flatMap =
	<A, B>(parser: Parser<A>, f: (a: A) => Parser<B>): Parser<B> =>
	(input) =>
		Either.match(parser(input), {
			onRight: ([a, rest]) => f(a)(rest),
			onLeft: (e) => Either.left(e),
		});

export const andThen =
	<A, B>(parserA: Parser<A>, parserB: Parser<B>): Parser<readonly [A, B]> =>
	(input) =>
		Either.match(parserA(input), {
			onRight: ([a, rest]) =>
				Either.match(parserB(rest), {
					onLeft: (e) => Either.left(e),
					onRight: ([b, rest]) => Either.right([[a, b], rest]),
				}),
			onLeft: (e) => Either.left(e),
		});

export const getRest = <T>(
	parserOutput: Either.Either<[T, Input], string>,
): string => {
	return Either.match(parserOutput, {
		onLeft: () => "",
		onRight: ([_, rest]) => rest,
	});
};

export const char =
	(ch: string): Parser<string> =>
	(input) => {
		if (input.startsWith(ch)) {
			return Either.right([ch, input.slice(1)]);
		}
		return Either.left(`${ch} not matched!`);
	};

export const alphabet: Parser<string> = (input) => {
	const [first, ...rest] = input;
	if (/^[a-zA-Z]$/.test(first)) {
		return Either.right([first, input.slice(1)]);
	}
	return Either.left("Not alphabet");
};

export const betweenChars =
	<T>([start, end]: [string, string], parser: Parser<T>): Parser<T> =>
	(input) => {
		return map(
			andThen((input) => {
				if (!input.startsWith(start)) {
					return Either.left(`Not surrounded by ${start} ${end}`);
				}
				if (input.at(-1) !== end) {
					return Either.left(`Expected matching ${end} for ${start}`);
				}
				return Either.right([undefined, input.slice(1, -1)]);
			}, parser),
			([_, t]) => t,
		)(input);
	};

const many_ =
	<T>(count: number) =>
	(parser: Parser<T>): Parser<Array<T>> =>
	(input) => {
		const acc: T[] = [];
		let rest = input;
		while (true) {
			const result = parser(rest);
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
	};

const skipMany_ =
	<T>(count: number) =>
	(parser: Parser<T>): Parser<undefined> =>
	(input) => {
		const acc: T[] = [];
		let rest = input;
		while (true) {
			const result = parser(rest);
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
	};

export const skipUntil =
	<T>(parser: Parser<T>): Parser<undefined> =>
	(input) => {
		let rest = input;
		while (true) {
			if (rest.length === 0) {
				return Either.left("oops");
			}
			const result = parser(input);
			if (Either.isRight(result)) {
				return Either.right([undefined, rest]);
			}
			rest = rest.slice(1);
		}
		return Either.left("wtf");
	};

// export const between =
// 	<T>(
// 		[start, end]: [Parser<unknown>, Parser<unknown>],
// 		parser: Parser<T>,
// 	): Parser<T> =>
// 	(input) => {};

export const many = <T>(parser: Parser<T>) => many_<T>(0)(parser);
export const many1 = <T>(parser: Parser<T>) => many_<T>(1)(parser);
export const manyN = <T>(parser: Parser<T>, n: number) => many_<T>(n)(parser);

export const skipMany = <T>(parser: Parser<T>) => skipMany_<T>(0)(parser);
export const skipMany1 = <T>(parser: Parser<T>) => skipMany_<T>(1)(parser);
export const skipManyN = <T>(parser: Parser<T>, n: number) =>
	skipMany_<T>(n)(parser);

export const newLine = char("\n");

export const spaces = <T>(parser: Parser<T>) =>
	map(andThen(skipMany(char(" ")), parser), ([_, t]) => t);

export const choice =
	(parsers: Array<Parser<unknown>>): Parser<unknown> =>
	(input) => {
		for (const parser of parsers) {
			const result = parser(input);
			if (Either.isRight(result)) {
				return result;
			}
		}
		return Either.left("None of the choices could be satisfied");
	};

export const Combinators = {
	"<|>": choice,
};
