import { Either } from "effect";
import type { Prettify } from "./Utils";

export type ParserResult<T> = Either.Either<[T, string], string>;

export class Parser<A> {
	constructor(public run: (input: string) => ParserResult<A>) {}

	map<B>(f: (a: A) => B): Parser<B> {
		return new Parser((input) =>
			Either.match(this.run(input), {
				onRight: ([a, rest]) => Either.right([f(a), rest]),
				onLeft: (e) => Either.left(e),
			}),
		);
	}

	flatMap<B>(f: (a: A) => Parser<B>): Parser<B> {
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

	static Do = () => {
		return Parser.pure({});
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

	bind<K extends string, B>(
		k: K,
		other: Parser<B> | ((a: A) => Parser<B>),
	): Parser<Prettify<A & { [k in K]: B }>> {
		return this.flatMap((a) => {
			const parser = other instanceof Parser ? other : other(a);
			return parser.flatMap((b) =>
				Parser.pure(Object.assign({}, a, { [k.toString()]: b }) as any),
			);
		});
	}
}
