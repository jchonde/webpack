/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/
"use strict";

/** @typedef {import("./Dependency")} Dependency */
/** @typedef {import("webpack-sources").ReplaceSource} ReplaceSource */
/** @typedef {import("./RuntimeTemplate")} RuntimeTemplate */
/** @typedef {import("./DependencyTemplates")} DependencyTemplates */
/** @typedef {import("./ModuleGraph")} ModuleGraph */

/**
 * @typedef {Object} DependencyTemplateContext
 * @property {RuntimeTemplate} runtimeTemplate
 * @property {DependencyTemplates} dependencyTemplates
 * @property {ModuleGraph} moduleGraph
 */

class DependencyTemplate {
	/**
	 * @abstract
	 * @param {Dependency} dependency the dependency for which the template should be applied
	 * @param {ReplaceSource} source the current replace source which can be modified
	 * @param {DependencyTemplateContext} templateContext the context object
	 * @returns {void}
	 */
	apply(dependency, source, templateContext) {
		throw new Error("DependencyTemplate.apply must be overriden");
	}
}

module.exports = DependencyTemplate;
