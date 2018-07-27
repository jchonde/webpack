/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/
"use strict";

const NullDependency = require("./NullDependency");

/** @typedef {import("../Dependency")} Dependency */
/** @typedef {import("webpack-sources").ReplaceSource} ReplaceSource */
/** @typedef {import("../DependencyTemplate").DependencyTemplateContext} DependencyTemplateContext */

class LocalModuleDependency extends NullDependency {
	constructor(localModule, range, callNew) {
		super();
		localModule.flagUsed();
		this.localModule = localModule;
		this.range = range;
		this.callNew = callNew;
	}
}

LocalModuleDependency.Template = class LocalModuleDependencyTemplate extends NullDependency.Template {
	/**
	 * @param {Dependency} dependency the dependency for which the template should be applied
	 * @param {ReplaceSource} source the current replace source which can be modified
	 * @param {DependencyTemplateContext} templateContext the context object
	 * @returns {void}
	 */
	apply(dependency, source, templateContext) {
		const dep = /** @type {LocalModuleDependency} */ (dependency);
		if (!dep.range) return;
		const moduleInstance = dep.callNew
			? `new (function () { return ${dep.localModule.variableName()}; })()`
			: dep.localModule.variableName();
		source.replace(dep.range[0], dep.range[1] - 1, moduleInstance);
	}
};

module.exports = LocalModuleDependency;
