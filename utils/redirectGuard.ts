/**
 * Replace the current route exactly once for a given router instance.
 * Some router instances may be reused; guard against double-replacing.
 */
export const replaceOnce = (router: any, path: string) => {
	try {
		// mark the router so we only replace once per mount
		const marker = "__yarsu_replaced_once__";
		if ((router as any)[marker]) return;
		(router as any)[marker] = true;
		// prefer replace; fall back to push if replace is not available
		if (typeof router.replace === "function") {
			router.replace(path);
			return;
		}
		if (typeof router.push === "function") {
			router.push(path);
			return;
		}
	} catch (err) {
		console.error("redirectGuard.replaceOnce error:", err);
	}
};

export default replaceOnce;

