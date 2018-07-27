/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/
"use strict";

const NullDependency = require("./NullDependency");
const webpackMissingModule = require("./WebpackMissingModule").module;

/** @typedef {import("../Dependency")} Dependency */
/** @typedef {import("webpack-sources").ReplaceSource} ReplaceSource */
/** @typedef {import("../DependencyTemplate").DependencyTemplateContext} DependencyTemplateContext */

class UnsupportedDependency extends NullDependency {
	constructor(request, range) {
		super();
		this.request = request;
		this.range = range;
	}
}

UnsupportedDependency.Template = class UnsupportedDependencyTemplate extends NullDependency.Template {
	/**
	 * @param {Dependency} dependency the dependency for which the template should be applied
	 * @param {ReplaceSource} source the current replace source which can be modified
	 * @param {DependencyTemplateContext} templateContext the context object
	 * @returns {void}
	 */
	apply(dependency, source, { runtimeTemplate }) {
		const dep = /** @type {UnsupportedDependency} */ (dependency);
		source.replace(
			dep.range[0],
			dep.range[1],
			webpackMissingModule(dep.request)
		);
	}
};

module.exports = UnsupportedDependency;
