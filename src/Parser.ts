import { Either, Option } from "effect";
import type { TypeLambda } from "effect/HKT";
import * as Gen from "effect/Utils";

export namespace Parser {
	type Input = string;

	export type Parser<T> = (input: Input) => Either.Either<[T, Input], string>;

	interface ParserTypeLambda extends TypeLambda {
		readonly type: Parser<"a">;
	}

	const adapter = Gen.adapter<ParserTypeLambda>();

	export const gen: Gen.Gen<ParserTypeLambda, Gen.Adapter<ParserTypeLambda>> = (
		f,
	) => {
		const iterator = f(adapter);
		let state: IteratorYieldResult<any> | IteratorReturnResult<any> =
			iterator.next();
		if (state.done) {
		} else {
			let current = state.value;
			if (Gen.isGenKind(current)) {
				current = current.value;
			} else {
				current = Gen.yieldWrapGet(current);
			}
		}
	};

	export const map =
		<A, B>(f: (a: A) => B, parser: Parser<A>): Parser<B> =>
		(input) =>
			Either.match(parser(input), {
				onLeft: (e) => Either.left(e),
				onRight: ([a, rest]) => Either.right([f(a), rest]),
			});

	export const flatMap =
		<A, B>(f: (a: A) => Parser<B>, parser: Parser<A>): Parser<B> =>
		(input) =>
			Either.match(parser(input), {
				onRight: ([a, rest]) => f(a)(rest),
				onLeft: (e) => Either.left(e),
			});

	export const char =
		(ch: string): Parser<string> =>
		(input) => {
			if (input.startsWith(ch)) {
				return Either.right([ch, input.slice(1)]);
			}
			return Either.left(`${ch} not matched!`);
		};
}
