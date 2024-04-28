import { Either } from "effect";
import type { TypeLambda } from "effect/HKT";
import * as Gen from "effect/Utils";

export namespace Parser {
	type Input = string;

	export type Parser<T> = {
		run: (input: Input) => Either.Either<[T, Input], string>;
	};

	interface ParserTypeLambda extends TypeLambda {
		readonly type: Parser<"something">;
	}

	const adapter = Gen.adapter<ParserTypeLambda>();

	// export const gen: Gen.Gen<ParserTypeLambda, Gen.Adapter<ParserTypeLambda>> = (
	// 	f,
	// ) => {
	// 	const iterator = f(adapter);
	// 	let state: IteratorYieldResult<any> | IteratorReturnResult<any> =
	// 		iterator.next();
	// 	if (state.done) {
	// 	} else {
	// 		let current = state.value;
	// 		if (Gen.isGenKind(current)) {
	// 			current = current.value;
	// 		} else {
	// 			current = Gen.yieldWrapGet(current);
	// 		}
	// 	}
	// };

	export const map = <A, B>(parser: Parser<A>, f: (a: A) => B): Parser<B> => ({
		run: (input) =>
			Either.match(parser.run(input), {
				onLeft: (e) => Either.left(e),
				onRight: ([a, rest]) => Either.right([f(a), rest]),
			}),
	});

	export const flatMap = <A, B>(
		parser: Parser<A>,
		f: (a: A) => Parser<B>,
	): Parser<B> => ({
		run: (input) =>
			Either.match(parser.run(input), {
				onRight: ([a, rest]) => f(a).run(rest),
				onLeft: (e) => Either.left(e),
			}),
	});

	export const getRest = <T>(
		parserOutput: Either.Either<[T, Input], string>,
	): string => {
		return Either.match(parserOutput, {
			onLeft: () => "",
			onRight: ([_, rest]) => rest,
		});
	};

	// export const getResult = <T>(
	// 	parserOutput: Either.Either<[T, Input], string>,
	// ): Option.Option<T> => {
	// 	return Either.match(parserOutput, {
	// 		onLeft: () => Option.none(),
	// 		onRight: ([result, _]) => Option.some(result),
	// 	});
	// };
}

export const char = (ch: string): Parser.Parser<string> => ({
	run: (input) => {
		if (input.startsWith(ch)) {
			return Either.right([ch, input.slice(1)]);
		}
		return Either.left(`${ch} not matched!`);
	},
});

export const between =
	(start: string) =>
	(end: string): Parser.Parser<undefined> => ({
		run: (input) => {
			if (!input.startsWith(start)) {
				return Either.left(`Not surrounded by ${start} ${end}`);
			}
			if (input.at(-1) !== end) {
				return Either.left(`Expected matching ${end} for ${start}`);
			}
			return Either.right([undefined, input.slice(1, -1)]);
		},
	});

const many_ =
	<T>(count: number) =>
	(parser: Parser.Parser<T>): Parser.Parser<Array<T>> => ({
		run: (input) => {
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
				rest = Parser.getRest(result);
				acc.push(result.right[0]);
			}
			return Either.right([acc, rest]);
		},
	});

const skipMany_ =
	<T>(count: number) =>
	(parser: Parser.Parser<T>): Parser.Parser<undefined> => ({
		run: (input) => {
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
				rest = Parser.getRest(result);
				acc.push(result.right[0]);
			}
			return Either.right([undefined, rest]);
		},
	});

export const many = <T>(parser: Parser.Parser<T>) => many_<T>(0)(parser);
export const many1 = <T>(parser: Parser.Parser<T>) => many_<T>(1)(parser);
export const manyN = <T>(parser: Parser.Parser<T>, n: number) =>
	many_<T>(n)(parser);

export const skipMany = <T>(parser: Parser.Parser<T>) =>
	skipMany_<T>(0)(parser);
export const skipMany1 = <T>(parser: Parser.Parser<T>) =>
	skipMany_<T>(1)(parser);
export const skipManyN = <T>(parser: Parser.Parser<T>, n: number) =>
	skipMany_<T>(n)(parser);

export const choice = (
	parsers: Array<Parser.Parser<unknown>>,
): Parser.Parser<unknown> => ({
	run: (input) => {
		for (const parser of parsers) {
			const result = parser.run(input);
			if (Either.isRight(result)) {
				return result;
			}
		}
		return Either.left("None of the choices could be satisfied");
	},
});
