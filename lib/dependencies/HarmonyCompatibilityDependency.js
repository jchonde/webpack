/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/
"use strict";

const NullDependency = require("./NullDependency");

/** @typedef {import("../Dependency")} Dependency */
/** @typedef {import("webpack-sources").ReplaceSource} ReplaceSource */
/** @typedef {import("../DependencyTemplate").DependencyTemplateContext} DependencyTemplateContext */

class HarmonyCompatibilityDependency extends NullDependency {
	constructor(originModule) {
		super();
		this.originModule = originModule;
	}

	get type() {
		return "harmony export header";
	}
}

HarmonyCompatibilityDependency.Template = class HarmonyExportDependencyTemplate extends NullDependency.Template {
	/**
	 * @param {Dependency} dependency the dependency for which the template should be applied
	 * @param {ReplaceSource} source the current replace source which can be modified
	 * @param {DependencyTemplateContext} templateContext the context object
	 * @returns {void}
	 */
	apply(dependency, source, { runtimeTemplate }) {
		const dep = /** @type {HarmonyCompatibilityDependency} */ (dependency);
		const usedExports = dep.originModule.usedExports;
		if (usedExports !== false && !Array.isArray(usedExports)) {
			const content = runtimeTemplate.defineEsModuleFlagStatement({
				exportsArgument: dep.originModule.exportsArgument
			});
			source.insert(-10, content);
		}
	}
};

module.exports = HarmonyCompatibilityDependency;
