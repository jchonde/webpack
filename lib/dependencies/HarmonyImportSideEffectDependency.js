/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/
"use strict";
const HarmonyImportDependency = require("./HarmonyImportDependency");

/** @typedef {import("./DependencyReference")} DependencyReference */
/** @typedef {import("../Dependency")} Dependency */
/** @typedef {import("../ModuleGraph")} ModuleGraph */
/** @typedef {import("../DependencyTemplate").DependencyTemplateContext} DependencyTemplateContext */

class HarmonyImportSideEffectDependency extends HarmonyImportDependency {
	constructor(request, originModule, sourceOrder, parserScope) {
		super(request, originModule, sourceOrder, parserScope);
	}

	/**
	 * Returns the referenced module and export
	 * @param {ModuleGraph} moduleGraph module graph
	 * @returns {DependencyReference} reference
	 */
	getReference(moduleGraph) {
		const module = moduleGraph.getModule(this);

		if (module && module.factoryMeta.sideEffectFree) return null;

		return super.getReference(moduleGraph);
	}

	get type() {
		return "harmony side effect evaluation";
	}
}

HarmonyImportSideEffectDependency.Template = class HarmonyImportSideEffectDependencyTemplate extends HarmonyImportDependency.Template {
	/**
	 * @param {Dependency} dependency the dependency for which the template should be applied
	 * @param {DependencyTemplateContext} templateContext the context object
	 * @returns {number} order
	 */
	getHarmonyInitOrder(dependency, templateContext) {
		const dep = /** @type {HarmonyImportSideEffectDependency} */ (dependency);
		const { moduleGraph } = templateContext;
		const module = moduleGraph.getModule(dep);
		if (module && module.factoryMeta.sideEffectFree) return NaN;
		return super.getHarmonyInitOrder(dep, templateContext);
	}
};

module.exports = HarmonyImportSideEffectDependency;
