/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/
"use strict";

const { RawSource, ReplaceSource } = require("webpack-sources");
const Generator = require("./Generator");
const AsyncDependenciesBlock = require("./AsyncDependenciesBlock");

/** @typedef {import("./NormalModule")} NormalModule */
/** @typedef {import("webpack-sources").Source} Source */
/** @typedef {import("./Generator").GenerateContext} GenerateContext */
/** @typedef {import("./Dependency")} Dependency */
/** @typedef {import("./DependenciesBlock")} DependenciesBlock */
/** @typedef {import("./DependencyTemplates")} DependencyTemplates */
/** @typedef {import("./RuntimeTemplate")} RuntimeTemplate */

// TODO: clean up this file
// replace with newer constructs

// TODO: remove DependencyVariables and replace them with something better

class JavascriptGenerator extends Generator {
	/**
	 * @param {NormalModule} module module for which the code should be generated
	 * @param {GenerateContext} generateContext context for generate
	 * @returns {Source} generated code
	 */
	generate(module, generateContext) {
		const originalSource = module.originalSource();
		if (!originalSource) {
			return new RawSource("throw new Error('No source available');");
		}

		const source = new ReplaceSource(originalSource);

		this.sourceBlock(module, module, [], generateContext, source);

		return source;
	}

	/**
	 *
	 * @param {NormalModule} module the module
	 * @param {DependenciesBlock} block the block
	 * @param {string[]} availableVars the availableVars
	 * @param {GenerateContext} generateContext the generateContext
	 * @param {ReplaceSource} source the source
	 * @returns {void}
	 */
	sourceBlock(module, block, availableVars, generateContext, source) {
		for (const dependency of block.dependencies) {
			this.sourceDependency(dependency, generateContext, source);
		}

		/**
		 * Get the variables of all blocks that we need to inject.
		 * These will contain the variable name and its expression.
		 * The name will be added as a parameter in a IIFE the expression as its value.
		 */
		const vars = block.variables.reduce((result, value) => {
			const variable = this.sourceVariables(
				value,
				availableVars,
				generateContext
			);

			if (variable) {
				result.push(variable);
			}

			return result;
		}, []);

		/**
		 * if we actually have variables
		 * this is important as how #splitVariablesInUniqueNamedChunks works
		 * it will always return an array in an array which would lead to a IIFE wrapper around
		 * a module if we do this with an empty vars array.
		 */
		if (vars.length > 0) {
			/**
			 * Split all variables up into chunks of unique names.
			 * e.g. imagine you have the following variable names that need to be injected:
			 * [foo, bar, baz, foo, some, more]
			 * we can not inject "foo" twice, therefore we just make two IIFEs like so:
			 * (function(foo, bar, baz){
			 *   (function(foo, some, more){
			 *     …
			 *   }(…));
			 * }(…));
			 *
			 * "splitVariablesInUniqueNamedChunks" splits the variables shown above up to this:
			 * [[foo, bar, baz], [foo, some, more]]
			 */
			const injectionVariableChunks = this.splitVariablesInUniqueNamedChunks(
				vars
			);

			// create all the beginnings of IIFEs
			const functionWrapperStarts = injectionVariableChunks.map(
				variableChunk => {
					return this.variableInjectionFunctionWrapperStartCode(
						variableChunk.map(variable => variable.name)
					);
				}
			);

			// and all the ends
			const functionWrapperEnds = injectionVariableChunks.map(variableChunk => {
				return this.variableInjectionFunctionWrapperEndCode(
					module,
					variableChunk.map(variable => variable.expression),
					block
				);
			});

			// join them to one big string
			const varStartCode = functionWrapperStarts.join("");

			// reverse the ends first before joining them, as the last added must be the inner most
			const varEndCode = functionWrapperEnds.reverse().join("");

			// if we have anything, add it to the source
			if (varStartCode && varEndCode) {
				const start =
					block instanceof AsyncDependenciesBlock && block.range
						? block.range[0]
						: -10;
				const end =
					block instanceof AsyncDependenciesBlock && block.range
						? block.range[1]
						: module.originalSource().size() + 1;
				source.insert(start + 0.5, varStartCode);
				source.insert(end + 0.5, "\n/* WEBPACK VAR INJECTION */" + varEndCode);
			}
		}

		for (const childBlock of block.blocks) {
			this.sourceBlock(
				module,
				childBlock,
				availableVars.concat(vars),
				generateContext,
				source
			);
		}
	}

	/**
	 * @param {Dependency} dependency the dependency
	 * @param {GenerateContext} generateContext the render context
	 * @param {ReplaceSource} source the source
	 * @returns {void}
	 */
	sourceDependency(dependency, generateContext, source) {
		const constructor =
			/** @type {new (...args: any[]) => Dependency} */ (dependency.constructor);
		const template = generateContext.dependencyTemplates.get(constructor);
		if (!template) {
			throw new Error(
				"No template for dependency: " + dependency.constructor.name
			);
		}
		template.apply(dependency, source, generateContext);
	}

	sourceVariables(variable, availableVars, ctx) {
		const name = variable.name;
		const expr = variable.expressionSource(ctx);

		if (
			availableVars.some(
				v => v.name === name && v.expression.source() === expr.source()
			)
		) {
			return;
		}
		return {
			name: name,
			expression: expr
		};
	}

	/*
	 * creates the start part of a IIFE around the module to inject a variable name
	 * (function(…){   <- this part
	 * }.call(…))
	 */
	variableInjectionFunctionWrapperStartCode(varNames) {
		const args = varNames.join(", ");
		return `/* WEBPACK VAR INJECTION */(function(${args}) {`;
	}

	contextArgument(module, block) {
		if (this === block) {
			return module.exportsArgument;
		}
		return "this";
	}

	/*
	 * creates the end part of a IIFE around the module to inject a variable name
	 * (function(…){
	 * }.call(…))   <- this part
	 */
	variableInjectionFunctionWrapperEndCode(module, varExpressions, block) {
		const firstParam = this.contextArgument(module, block);
		const furtherParams = varExpressions.map(e => e.source()).join(", ");
		return `}.call(${firstParam}, ${furtherParams}))`;
	}

	splitVariablesInUniqueNamedChunks(vars) {
		const startState = [[]];
		return vars.reduce((chunks, variable) => {
			const current = chunks[chunks.length - 1];
			// check if variable with same name exists already
			// if so create a new chunk of variables.
			const variableNameAlreadyExists = current.some(
				v => v.name === variable.name
			);

			if (variableNameAlreadyExists) {
				// start new chunk with current variable
				chunks.push([variable]);
			} else {
				// else add it to current chunk
				current.push(variable);
			}
			return chunks;
		}, startState);
	}
}

module.exports = JavascriptGenerator;
