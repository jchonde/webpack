/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/
"use strict";

const Dependency = require("../Dependency");
const DependencyTemplate = require("../DependencyTemplate");

/** @typedef {import("webpack-sources").ReplaceSource} ReplaceSource */
/** @typedef {import("../util/createHash").Hash} Hash */
/** @typedef {import("../DependencyTemplates")} DependencyTemplates */
/** @typedef {import("../InitFragment")} InitFragment */
/** @typedef {import("../RuntimeTemplate")} RuntimeTemplate */

class NullDependency extends Dependency {
	get type() {
		return "null";
	}

	/**
	 * Update the hash
	 * @param {Hash} hash hash to be updated
	 * @returns {void}
	 */
	updateHash(hash) {}
}

NullDependency.Template = class NullDependencyTemplate extends DependencyTemplate {
	/**
	 * @param {Dependency} dependency the dependency for which the template should be applied
	 * @param {ReplaceSource} source the current replace source which can be modified
	 * @param {RuntimeTemplate} runtimeTemplate the runtime template
	 * @param {DependencyTemplates} dependencyTemplates the dependency templates
	 * @returns {void}
	 */
	apply(dependency, source, runtimeTemplate, dependencyTemplates) {}

	/**
	 * @param {Dependency} dependency the dependency for which the template should be applied
	 * @param {ReplaceSource} source the current replace source which can be modified
	 * @param {RuntimeTemplate} runtimeTemplate the runtime template
	 * @param {DependencyTemplates} dependencyTemplates the dependency templates
	 * @returns {InitFragment[]}
	 */
	getInitFragments(dependency, source, runtimeTemplate, dependencyTemplates) {
		return [];
	}
};

module.exports = NullDependency;
