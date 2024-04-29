// /**
//  * @category generators
//  * @since 2.0.0
//  */
// export const gen: Gen.Gen<OptionTypeLambda, Gen.Adapter<OptionTypeLambda>> = (
// 	f,
// ) => {
// 	const iterator = f(adapter);
// 	let state: IteratorYieldResult<any> | IteratorReturnResult<any> =
// 		iterator.next();
// 	if (state.done) {
// 		return some(state.value);
// 	} else {
// 		let current = state.value;
// 		if (Gen.isGenKind(current)) {
// 			current = current.value;
// 		} else {
// 			current = Gen.yieldWrapGet(current);
// 		}
// 		if (isNone(current)) {
// 			return current;
// 		}
// 		while (!state.done) {
// 			state = iterator.next(current.value as never);
// 			if (!state.done) {
// 				current = state.value;
// 				if (Gen.isGenKind(current)) {
// 					current = current.value;
// 				} else {
// 					current = Gen.yieldWrapGet(current);
// 				}
// 				if (isNone(current)) {
// 					return current;
// 				}
// 			}
// 		}
// 		return some(state.value);
// 	}
// };
