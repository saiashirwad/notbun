import { Either } from "effect";

export type ParserResult<T> = Either.Either<[T, string], string>;

class Parser<A> {
	constructor(public run: (input: string) => ParserResult<A>) {}

	map<B>(f: (a: A) => B): Parser<B> {
		return new Parser((input) =>
			Either.match(this.run(input), {
				onRight: ([a, rest]) => Either.right([f(a), rest]),
				onLeft: (e) => Either.left(e),
			}),
		);
	}

	then<B>(f: (a: A) => Parser<B>): Parser<B> {
		return new Parser((input) =>
			Either.match(this.run(input), {
				onRight: ([a, rest]) => f(a).run(rest),
				onLeft: (e) => Either.left(e),
			}),
		);
	}

	static pure = <A>(a: A): Parser<A> => {
		return new Parser((input) => Either.right([a, input]));
	};

	zip<B>(parserB: Parser<B>): Parser<readonly [A, B]> {
		return new Parser((input) =>
			Either.match(this.run(input), {
				onRight: ([a, rest]) =>
					Either.match(parserB.run(rest), {
						onLeft: (e) => Either.left(e),
						onRight: ([b, rest]) => Either.right([[a, b], rest]),
					}),
				onLeft: (e) => Either.left(e),
			}),
		);
	}
}

const char = (ch: string) =>
	new Parser((input) => {
		if (input.startsWith(ch)) {
			return Either.right([ch, input.slice(ch.length)]);
		}
		return Either.left("oops");
	});
