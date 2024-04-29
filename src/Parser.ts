import { Either } from "effect";

export type ParserResult<T> = Either.Either<[T, string], string>;
export type Parser<T> = (input: string) => ParserResult<T>;

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

export const pure =
	<T>(x: T): Parser<T> =>
	(input) =>
		Either.right([x, input]);

export const ap =
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

export const Do: Parser<{}> = pure({});

// export const bind: {
// 	<N extends string, A extends object, B>(
// 		name: Exclude<N, keyof A>,
// 		f: (a: A) => Parser<B>,
// 	): (
// 		self: Parser<A>,
// 	) => Parser<{ [K in N | keyof A]: K extends keyof A ? A[K] : B }>;
// 	<A extends object, N extends string, B>(
// 		self: Parser<A>,
// 		name: Exclude<N, keyof A>,
// 		f: (a: A) => Parser<B>,
// 	): Parser<{ [K in N | keyof A]: K extends keyof A ? A[K] : B }>;
// } = dual(
// 	3,
// 	<A, N extends string, B>(
// 		self: Parser<A>,
// 		name: Exclude<N, keyof A>,
// 		f: (a: A) => Parser<B>,
// 	): Parser<{ [K in keyof A | N]: K extends keyof A ? A[K] : B }> =>
// 		flatMap(self, (a) =>
// 			map(f(a), (b) => Object.assign({}, a, { [name]: b }) as any),
// 		),
// );

// export interface ParserTypeLambda extends TypeLambda {
// 	readonly type: Parser<this["Target"]>;
// }
//
// const adapter = Gen.adapter<ParserTypeLambda>();
