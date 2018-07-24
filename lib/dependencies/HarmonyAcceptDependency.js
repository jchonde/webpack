/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/
"use strict";

const NullDependency = require("./NullDependency");
const HarmonyImportDependency = require("./HarmonyImportDependency");

/** @typedef {import("../Dependency")} Dependency */
/** @typedef {import("webpack-sources").ReplaceSource} ReplaceSource */
/** @typedef {import("../DependencyTemplate").DependencyTemplateContext} DependencyTemplateContext */

class HarmonyAcceptDependency extends NullDependency {
	constructor(range, dependencies, hasCallback) {
		super();
		this.range = range;
		this.dependencies = dependencies;
		this.hasCallback = hasCallback;
	}

	get type() {
		return "accepted harmony modules";
	}
}

HarmonyAcceptDependency.Template = class HarmonyAcceptDependencyTemplate extends NullDependency.Template {
	/**
	 * @param {Dependency} dependency the dependency for which the template should be applied
	 * @param {ReplaceSource} source the current replace source which can be modified
	 * @param {DependencyTemplateContext} templateContext the context object
	 * @returns {void}
	 */
	apply(dependency, source, templateContext) {
		const dep = /** @type {HarmonyAcceptDependency} */ (dependency);
		const { runtimeTemplate, moduleGraph } = templateContext;
		const content = dep.dependencies
			.filter(dependency =>
				HarmonyImportDependency.Template.isImportEmitted(
					dependency,
					source,
					templateContext
				)
			)
			.map(dependency =>
				dependency.getImportStatement(true, { runtimeTemplate, moduleGraph })
			)
			.join("");

		if (dep.hasCallback) {
			source.insert(
				dep.range[0],
				`function(__WEBPACK_OUTDATED_DEPENDENCIES__) { ${content}(`
			);
			source.insert(dep.range[1], ")(__WEBPACK_OUTDATED_DEPENDENCIES__); }");
			return;
		}

		source.insert(dep.range[1] - 0.5, `, function() { ${content} }`);
	}
};

module.exports = HarmonyAcceptDependency;
