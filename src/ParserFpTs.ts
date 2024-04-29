import { Either } from "effect";
import * as Monad from "fp-ts/Monad";
import * as Functor from "fp-ts/Functor";
import type { HKT } from "fp-ts/HKT";
import { pipe } from "fp-ts/lib/function";

export const URI = "Parser";
export type URI = typeof URI;

declare module "fp-ts/HKT" {
	interface URItoKind<A> {
		Response: Parser<A>;
	}
}

export type ParserResult<T> = Either.Either<[T, string], string>;
export type Parser<T> = (input: string) => ParserResult<T>;

export const monadParser: Monad.Monad<URI> = {
	ap: function <A, B>(
		fab: HKT<"Parser", (a: A) => B>,
		fa: HKT<"Parser", A>,
	): HKT<"Parser", B> {
		throw new Error("Function not implemented.");
	},
	URI: "Parser",
	map: function <A, B>(parser: Parser<A>, f: (a: A) => B): Parser<B> {
		return (input) =>
			Either.match(parser(input), {
				onRight: ([a, rest]) => Either.right([f(a), rest]),
				onLeft: (e) => Either.left(e),
			});
	},
	of: function <A>(a: A): HKT<"Parser", A> {
		throw new Error("Function not implemented.");
	},
	chain: function <A, B>(
		fa: HKT<"Parser", A>,
		f: (a: A) => HKT<"Parser", B>,
	): HKT<"Parser", B> {
		throw new Error("Function not implemented.");
	},
};
