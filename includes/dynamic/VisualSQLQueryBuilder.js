
var VisualSQLTables = new Array();
var VisualSQLJoinInCoda = '';
var VisualSQLdatasourcedbname = '';

//************************************ SQL PARSER ************************/
(function (f) {
	if (typeof exports === "object" && typeof module !== "undefined") {
		module.exports = f()
	} else if (typeof define === "function" && define.amd) {
		define([], f)
	} else {
		var g;
		if (typeof window !== "undefined") {
			g = window
		} else if (typeof global !== "undefined") {
			g = global
		} else if (typeof self !== "undefined") {
			g = self
		} else {
			g = this
		}
		g.simpleSqlParser = f()
	}
})(function () {
	var define,
	module,
	exports;
	return (function e(t, n, r) {
		function s(o, u) {
			if (!n[o]) {
				if (!t[o]) {
					var a = typeof require == "function" && require;
					if (!u && a)
						return a(o, !0);
					if (i)
						return i(o, !0);
					var f = new Error("Cannot find module '" + o + "'");
					throw f.code = "MODULE_NOT_FOUND",
					f
				}
				var l = n[o] = {
					exports : {}
				};
				t[o][0].call(l.exports, function (e) {
					var n = t[o][1][e];
					return s(n ? n : e)
				}, l, l.exports, e, t, n, r)
			}
			return n[o].exports
		}
		var i = typeof require == "function" && require;
		for (var o = 0; o < r.length; o++)
			s(r[o]);
		return s
	})({
		1 : [function (require, module, exports) {
				'use strict';

				module.exports.sql2ast = require('./src/sql2ast.js');
				module.exports.ast2sql = require('./src/ast2sql.js');

			}, {
				"./src/ast2sql.js" : 5,
				"./src/sql2ast.js" : 6
			}
		],
		2 : [function (require, module, exports) {
				// pass
				var Parsimmon = {};

				Parsimmon.Parser = (function () {
					"use strict";

					// The Parser object is a wrapper for a parser function.
					// Externally, you use one to parse a string by calling
					//   var result = SomeParser.parse('Me Me Me! Parse Me!');
					// You should never call the constructor, rather you should
					// construct your Parser from the base parsers and the
					// parser combinator methods.
					function Parser(action) {
						if (!(this instanceof Parser))
							return new Parser(action);
						this._ = action;
					};

					var _ = Parser.prototype;

					function makeSuccess(index, value) {
						return {
							status : true,
							index : index,
							value : value,
							furthest : -1,
							expected : []
						};
					}

					function makeFailure(index, expected) {
						return {
							status : false,
							index : -1,
							value : null,
							furthest : index,
							expected : [expected]
						};
					}

					function mergeReplies(result, last) {
						if (!last)
							return result;
						if (result.furthest > last.furthest)
							return result;

						var expected = (result.furthest === last.furthest)
						 ? result.expected.concat(last.expected)
						 : last.expected;

						return {
							status : result.status,
							index : result.index,
							value : result.value,
							furthest : last.furthest,
							expected : expected
						}
					}

					function assertParser(p) {
						if (!(p instanceof Parser))
							throw new Error('not a parser: ' + p);
					}

					function formatExpected(expected) {
						if (expected.length === 1)
							return expected[0];

						return 'one of ' + expected.join(', ')
					}

					function formatGot(stream, error) {
						var i = error.index;

						if (i === stream.length)
							return ', got the end of the stream'

							var prefix = (i > 0 ? "'..." : "'");
						var suffix = (stream.length - i > 12 ? "...'" : "'");

						return ' at character ' + i + ', got ' + prefix + stream.slice(i, i + 12) + suffix
					}

					var formatError = Parsimmon.formatError = function (stream, error) {
						return 'expected ' + formatExpected(error.expected) + formatGot(stream, error)
					};

					_.parse = function (stream) {
						var result = this.skip(eof)._(stream, 0);

						return result.status ? {
							status : true,
							value : result.value
						}
						 : {
							status : false,
							index : result.furthest,
							expected : result.expected
						};
					};

					// [Parser a] -> Parser [a]
					var seq = Parsimmon.seq = function () {
						var parsers = [].slice.call(arguments);
						var numParsers = parsers.length;

						return Parser(function (stream, i) {
							var result;
							var accum = new Array(numParsers);

							for (var j = 0; j < numParsers; j += 1) {
								result = mergeReplies(parsers[j]._(stream, i), result);
								if (!result.status)
									return result;
								accum[j] = result.value
									i = result.index;
							}

							return mergeReplies(makeSuccess(i, accum), result);
						});
					};

					var seqMap = Parsimmon.seqMap = function () {
						var args = [].slice.call(arguments);
						var mapper = args.pop();
						return seq.apply(null, args).map(function (results) {
							return mapper.apply(null, results);
						});
					};

					/**
					 * Allows to add custom primitive parsers
					 */
					var custom = Parsimmon.custom = function (parsingFunction) {
						return Parser(parsingFunction(makeSuccess, makeFailure));
					};

					var alt = Parsimmon.alt = function () {
						var parsers = [].slice.call(arguments);
						var numParsers = parsers.length;
						if (numParsers === 0)
							return fail('zero alternates')

							return Parser(function (stream, i) {
								var result;
								for (var j = 0; j < parsers.length; j += 1) {
									result = mergeReplies(parsers[j]._(stream, i), result);
									if (result.status)
										return result;
								}
								return result;
							});
					};

					// -*- primitive combinators -*- //
					_.or = function (alternative) {
						return alt(this, alternative);
					};

					_.then = function (next) {
						if (typeof next === 'function') {
							throw new Error('chaining features of .then are no longer supported, use .chain instead');
						}

						assertParser(next);
						return seq(this, next).map(function (results) {
							return results[1];
						});
					};

					// -*- optimized iterative combinators -*- //
					// equivalent to:
					// _.many = function() {
					//   return this.times(0, Infinity);
					// };
					// or, more explicitly:
					// _.many = function() {
					//   var self = this;
					//   return self.then(function(x) {
					//     return self.many().then(function(xs) {
					//       return [x].concat(xs);
					//     });
					//   }).or(succeed([]));
					// };
					_.many = function () {
						var self = this;

						return Parser(function (stream, i) {
							var accum = [];
							var result;
							var prevResult;

							for (; ; ) {
								result = mergeReplies(self._(stream, i), result);

								if (result.status) {
									i = result.index;
									accum.push(result.value);
								} else {
									return mergeReplies(makeSuccess(i, accum), result);
								}
							}
						});
					};

					// equivalent to:
					// _.times = function(min, max) {
					//   if (arguments.length < 2) max = min;
					//   var self = this;
					//   if (min > 0) {
					//     return self.then(function(x) {
					//       return self.times(min - 1, max - 1).then(function(xs) {
					//         return [x].concat(xs);
					//       });
					//     });
					//   }
					//   else if (max > 0) {
					//     return self.then(function(x) {
					//       return self.times(0, max - 1).then(function(xs) {
					//         return [x].concat(xs);
					//       });
					//     }).or(succeed([]));
					//   }
					//   else return succeed([]);
					// };
					_.times = function (min, max) {
						if (arguments.length < 2)
							max = min;
						var self = this;

						return Parser(function (stream, i) {
							var accum = [];
							var start = i;
							var result;
							var prevResult;

							for (var times = 0; times < min; times += 1) {
								result = self._(stream, i);
								prevResult = mergeReplies(result, prevResult);
								if (result.status) {
									i = result.index;
									accum.push(result.value);
								} else
									return prevResult;
							}

							for (; times < max; times += 1) {
								result = self._(stream, i);
								prevResult = mergeReplies(result, prevResult);
								if (result.status) {
									i = result.index;
									accum.push(result.value);
								} else
									break;
							}

							return mergeReplies(makeSuccess(i, accum), prevResult);
						});
					};

					// -*- higher-level combinators -*- //
					_.result = function (res) {
						return this.map(function (_) {
							return res;
						});
					};
					_.atMost = function (n) {
						return this.times(0, n);
					};
					_.atLeast = function (n) {
						var self = this;
						return seqMap(this.times(n), this.many(), function (init, rest) {
							return init.concat(rest);
						});
					};

					_.map = function (fn) {
						var self = this;
						return Parser(function (stream, i) {
							var result = self._(stream, i);
							if (!result.status)
								return result;
							return mergeReplies(makeSuccess(result.index, fn(result.value)), result);
						});
					};

					_.skip = function (next) {
						return seq(this, next).map(function (results) {
							return results[0];
						});
					};

					_.mark = function () {
						return seqMap(index, this, index, function (start, value, end) {
							return {
								start : start,
								value : value,
								end : end
							};
						});
					};

					_.desc = function (expected) {
						var self = this;
						return Parser(function (stream, i) {
							var reply = self._(stream, i);
							if (!reply.status)
								reply.expected = [expected];
							return reply;
						});
					};

					// -*- primitive parsers -*- //
					var string = Parsimmon.string = function (str) {
						var len = str.length;
						var expected = "'" + str + "'";

						return Parser(function (stream, i) {
							var head = stream.slice(i, i + len);

							if (head === str) {
								return makeSuccess(i + len, head);
							} else {
								return makeFailure(i, expected);
							}
						});
					};

					var regex = Parsimmon.regex = function (re, group) {
						var anchored = RegExp('^(?:' + re.source + ')', ('' + re).slice(('' + re).lastIndexOf('/') + 1));
						var expected = '' + re;
						if (group == null)
							group = 0;

						return Parser(function (stream, i) {
							var match = anchored.exec(stream.slice(i));

							if (match) {
								var fullMatch = match[0];
								var groupMatch = match[group];
								if (groupMatch != null)
									return makeSuccess(i + fullMatch.length, groupMatch);
							}

							return makeFailure(i, expected);
						});
					};

					var succeed = Parsimmon.succeed = function (value) {
						return Parser(function (stream, i) {
							return makeSuccess(i, value);
						});
					};

					var fail = Parsimmon.fail = function (expected) {
						return Parser(function (stream, i) {
							return makeFailure(i, expected);
						});
					};

					var letter = Parsimmon.letter = regex(/[a-z]/i).desc('a letter')
						var letters = Parsimmon.letters = regex(/[a-z]*/i)
						var digit = Parsimmon.digit = regex(/[0-9]/).desc('a digit');
					var digits = Parsimmon.digits = regex(/[0-9]*/)
						var whitespace = Parsimmon.whitespace = regex(/\s+/).desc('whitespace');
					var optWhitespace = Parsimmon.optWhitespace = regex(/\s*/);

					var any = Parsimmon.any = Parser(function (stream, i) {
							if (i >= stream.length)
								return makeFailure(i, 'any character');

							return makeSuccess(i + 1, stream.charAt(i));
						});

					var all = Parsimmon.all = Parser(function (stream, i) {
							return makeSuccess(stream.length, stream.slice(i));
						});

					var eof = Parsimmon.eof = Parser(function (stream, i) {
							if (i < stream.length)
								return makeFailure(i, 'EOF');

							return makeSuccess(i, null);
						});

					var test = Parsimmon.test = function (predicate) {
						return Parser(function (stream, i) {
							var char = stream.charAt(i);
							if (i < stream.length && predicate(char)) {
								return makeSuccess(i + 1, char);
							} else {
								return makeFailure(i, 'a character matching ' + predicate);
							}
						});
					};

					var oneOf = Parsimmon.oneOf = function (str) {
						return test(function (ch) {
							return str.indexOf(ch) >= 0;
						});
					};

					var noneOf = Parsimmon.noneOf = function (str) {
						return test(function (ch) {
							return str.indexOf(ch) < 0;
						});
					};

					var takeWhile = Parsimmon.takeWhile = function (predicate) {
						return Parser(function (stream, i) {
							var j = i;
							while (j < stream.length && predicate(stream.charAt(j)))
								j += 1;
							return makeSuccess(j, stream.slice(i, j));
						});
					};

					var lazy = Parsimmon.lazy = function (desc, f) {
						if (arguments.length < 2) {
							f = desc;
							desc = undefined;
						}

						var parser = Parser(function (stream, i) {
								parser._ = f()._;
								return parser._(stream, i);
							});

						if (desc)
							parser = parser.desc(desc)

								return parser;
					};

					var index = Parsimmon.index = Parser(function (stream, i) {
							return makeSuccess(i, i);
						});

					//- fantasyland compat

					//- Monoid (Alternative, really)
					_.concat = _.or;
					_.empty = fail('empty')

						//- Applicative
						_.of = Parser.of = Parsimmon.of = succeed

						_.ap = function (other) {
						return seqMap(this, other, function (f, x) {
							return f(x);
						})
					};

					//- Monad
					_.chain = function (f) {
						var self = this;
						return Parser(function (stream, i) {
							var result = self._(stream, i);
							if (!result.status)
								return result;
							var nextParser = f(result.value);
							return mergeReplies(nextParser._(stream, result.index), result);
						});
					};

					return Parser;
				})();
				module.exports = Parsimmon;

			}, {}
		],
		3 : [function (require, module, exports) {
				module.exports = require('./build/parsimmon.commonjs');
				exports.version = require('./package.json').version;

			}, {
				"./build/parsimmon.commonjs" : 2,
				"./package.json" : 4
			}
		],
		4 : [function (require, module, exports) {
				module.exports = {
					"_args" : [
						[{
								"name" : "parsimmon",
								"raw" : "parsimmon@0.7.0",
								"rawSpec" : "0.7.0",
								"scope" : null,
								"spec" : "0.7.0",
								"type" : "version"
							},
							"D:\\simpleSqlParser"
						]
					],
					"_from" : "parsimmon@0.7.0",
					"_id" : "parsimmon@0.7.0",
					"_inCache" : true,
					"_installable" : true,
					"_location" : "/parsimmon",
					"_npmUser" : {
						"email" : "jjmadkisson@gmail.com",
						"name" : "jayferd"
					},
					"_npmVersion" : "1.4.14",
					"_phantomChildren" : {},
					"_requested" : {
						"name" : "parsimmon",
						"raw" : "parsimmon@0.7.0",
						"rawSpec" : "0.7.0",
						"scope" : null,
						"spec" : "0.7.0",
						"type" : "version"
					},
					"_requiredBy" : [
						"/"
					],
					"_resolved" : "https://registry.npmjs.org/parsimmon/-/parsimmon-0.7.0.tgz",
					"_shasum" : "652fc7cbade73c5edb42a266ec556c906d82c9fb",
					"_shrinkwrap" : null,
					"_spec" : "parsimmon@0.7.0",
					"_where" : "C:\\simpleSqlParser",
					"author" : {
						"email" : "jneen at jneen dot net",
						"name" : "Jeanine Adkisson"
					},
					"bugs" : {
						"url" : "https://github.com/jneen/parsimmon/issues"
					},
					"dependencies" : {
						"pjs" : "5.x"
					},
					"description" : "A monadic LL(infinity) parser combinator library",
					"devDependencies" : {
						"chai" : "1.5.x",
						"mocha" : "1.8.x",
						"uglify-js" : "2.x"
					},
					"directories" : {},
					"dist" : {
						"shasum" : "652fc7cbade73c5edb42a266ec556c906d82c9fb",
						"tarball" : "https://registry.npmjs.org/parsimmon/-/parsimmon-0.7.0.tgz"
					},
					"files" : [
						"index.js",
						"src",
						"test",
						"Makefile",
						"package.json",
						"build/parsimmon.commonjs.js",
						"build/parsimmon.browser.js",
						"build/parsimmon.browser.min.js"
					],
					"keywords" : [
						"parsing",
						"parse",
						"parser combinators"
					],
					"main" : "index.js",
					"maintainers" : [{
							"email" : "jjmadkisson@gmail.com",
							"name" : "jayferd"
						}, {
							"email" : "jneen@jneen.net",
							"name" : "jneen"
						}
					],
					"name" : "parsimmon",
					"optionalDependencies" : {},
					"readme" : "ERROR: No README data found!",
					"repository" : {
						"type" : "git",
						"url" : "git://github.com/jneen/parsimmon.git"
					},
					"scripts" : {
						"test" : "make test"
					},
					"version" : "0.7.0"
				}

			}, {}
		],
		5 : [function (require, module, exports) {
				'use strict';

				module.exports = function (astObject) {
					/*if (typeof ast === 'object' && ast.status === true) ast = ast.value;
					else return false;*/
					if (typeof astObject !== 'object' || astObject.status !== true)
						return false;

					function select(ast) {
						var result = 'SELECT ';
						result += ast.select.map(function (item) {
							return item.expression;
						}).join(', ');
						return result;
					}

					function from(ast) {
						var result = '';
						if (ast.from.length > 0) {
							result += 'FROM ';
							result += ast.from.map(function (item) {
								return item.expression;
							}).join(', ');
						}
						return result;
					}

					function join(ast) {
						return ast.join.map(function (item) {
							var result = '';
							if (item.type === 'inner')
								result += 'INNER JOIN ';
							else if (item.type === 'left')
								result += 'LEFT JOIN ';
							else if (item.type === 'right')
								result += 'RIGHT JOIN ';
							else
								return '';
							result += item.table;
							if (item.alias !== null)
								result += ' AS ' + item.alias;
							result += ' ON ';
							result += item.condition.expression;
							return result;
						}).join(' ');
					}

					function where(ast) {
						var result = '';
						if (ast.where !== null)
							result += 'WHERE ' + ast.where.expression;
						return result;
					}

					function group(ast) {
						var result = '';
						if (ast.group.length > 0) {
							result += 'GROUP BY ';
							result += ast.group.map(function (item) {
								return item.expression;
							}).join(', ');
						}
						return result;
					}

					function order(ast) {
						var result = '';
						if (ast.order.length > 0) {
							result += 'ORDER BY ';
							result += ast.order.map(function (item) {
								return item.expression;
							}).join(', ');
						}
						return result;
					}

					function limit(ast) {
						var result = '';
						if (ast.limit !== null) {
							result += 'LIMIT ';
							if (ast.limit.from !== null)
								result += ast.limit.from + ', ';
							result += ast.limit.nb;
						}
						return result;
					}

					function into(ast) {
						return 'INSERT INTO ' + ast.into.expression;
					}

					function values(ast) {
						var result = '';
						var targets = ast.values.filter(function (item) {
								return item.target !== null;
							});
						if (targets.length > 0) {
							result += '(';
							result += targets.map(function (item) {
								return item.target.expression;
							}).join(', ');
							result += ') ';
						}
						result += 'VALUES (';
						result += ast.values.map(function (item) {
							return item.value;
						}).join(', ');
						result += ')';
						return result;
					}

					function table(ast) {
						return 'UPDATE ' + ast.table.expression;
					}

					function update(ast) {
						var result = 'SET ';
						result += ast.values.map(function (item) {
							return item.target.expression + ' = ' + item.value;
						}).join(', ');
						return result;
					}

					var ast = astObject.value;
					var parts = [];
					if (ast.type === 'select') {
						parts.push(select(ast));
						parts.push(from(ast));
						parts.push(join(ast));
						parts.push(where(ast));
						parts.push(group(ast));
						parts.push(order(ast));
						parts.push(limit(ast));
					} else if (ast.type === 'insert') {
						parts.push(into(ast));
						parts.push(values(ast));
					} else if (ast.type === 'update') {
						parts.push(table(ast));
						parts.push(update(ast));
						parts.push(where(ast));
					} else if (ast.type === 'delete') {
						parts.push('DELETE');
						parts.push(from(ast));
						parts.push(where(ast));
					} else
						return false;

					return parts.filter(function (item) {
						return item !== '';
					}).join(' ');
				};

			}, {}
		],
		6 : [function (require, module, exports) {
				'use strict';
				var Parsimmon = require('parsimmon');

				/********************************************************************************************
				ALIASES
				 ********************************************************************************************/

				var seq = Parsimmon.seq;
				var alt = Parsimmon.alt;
				var regex = Parsimmon.regex;
				var string = Parsimmon.string;
				var optWhitespace = Parsimmon.optWhitespace;
				var whitespace = Parsimmon.whitespace;
				var lazy = Parsimmon.lazy;

				/********************************************************************************************
				COMMON PATTERNS
				 ********************************************************************************************/

				// Make a parser optionnal
				// "empty" parameter will be returned as result if the optionnal parser can't match
				function opt(parser, empty) {
					if (typeof empty == 'undefined')
						return parser.or(Parsimmon.succeed([]));
					return parser.or(Parsimmon.succeed(empty));
				}

				// Join results of a parser
				function mkString(node) {
					return node.join('');
				}

				// Add an item to an optionnal list and return the final list
				function mergeOptionnalList(node) {
					node[0].push(node[1]);
					return node[0];
				}

				// Generate a parser that accept a comma-separated list of something
				function optionnalList(parser) {
					return seq(
						parser.skip(optWhitespace).skip(string(',')).skip(optWhitespace).many(),
						parser.skip(optWhitespace)).map(mergeOptionnalList);
				}

				// Remove first and last character of a string
				function removeQuotes(str) {
					return str.replace(/^([`'"])(.*)\1$/, '$2');
				}

				// Add the starting and ending char positions of matches of a given parser
				function getPos(parser) {
					return seq(
						Parsimmon.index,
						parser,
						Parsimmon.index).map(function (node) {
						var pos = {
							start : node[0],
							end : node[2],
						};
						if (typeof node[1] == 'object') {
							var n = node[1];
							n.position = pos;
							return n;
						} else {
							pos.out = node[1];
							return pos;
						}
					});
				}

				/********************************************************************************************
				LOW LEVEL PARSERS
				 ********************************************************************************************/

				// The name of a column/table
				var colName = alt(
						regex(/(?!(FROM|WHERE|GROUP BY|ORDER BY|LIMIT|INNER|LEFT|RIGHT|JOIN|ON|VALUES|SET)\s)[a-z*][a-z0-9_]*/i),
						regex(/`[^`\\]*(?:\\.[^`\\]*)*`/));

				// A string
				var str = alt(
						regex(/"[^"\\]*(?:\\.[^"\\]*)*"/),
						regex(/'[^'\\]*(?:\\.[^'\\]*)*'/));

				// A function expression
				var func = seq(
						alt(
							regex(/[a-zA-Z0-9_]+\(/),
							string('(')),
						/*eslint-disable no-use-before-define*/
						opt(lazy(function () {
								return argList;
							})).map(mkString),
						/*eslint-enable no-use-before-define*/
						string(')')).map(mkString);

				// A table.column expression
				var tableAndColumn = seq(
						colName,
						string('.'),
						colName);

				// An operator
				var operator = alt(
						string('+'),
						string('-'),
						string('*'),
						string('/'),
						string('&&'),
						string('&'),
						string('~'),
						string('||'),
						string('|'),
						string('^'),
						regex(/XOR/i),
						string('<=>'),
						string('='),
						string('!='),
						string('>='),
						string('>>'),
						string('>'),
						string('<='),
						string('<<'),
						string('<'),
						regex(/IS NULL/i),
						regex(/IS NOT/i),
						regex(/IS NOT NULL/i),
						regex(/IS/i),
						regex(/LIKE/i),
						regex(/NOT LIKE/i),
						string('%'),
						regex(/MOD/i),
						regex(/NOT/i),
						regex(/OR\s/i), // A space is forced after so this doesn't get mixed up with ORDER BY
						regex(/AND/i),
						regex(/IN/i));

				// A number
				var number = regex(/[-]?\d+\.?\d*/);

				/********************************************************************************************
				EXPRESSION PARSERS
				 ********************************************************************************************/

				// List (following IN, for example)
				var list = seq(
						string('('),
						optWhitespace,
						seq(
							alt(
								number,
								str),
							optWhitespace,
							opt(string(',')),
							optWhitespace,
							opt(
								alt(
									number,
									str))).map(mkString),
						optWhitespace,
						string(')')).map(mkString);

				// Expression
				var expression = seq(
						alt(
							tableAndColumn.map(function (node) {
								return {
									expression : node.join(''),
									table : removeQuotes(node[0]),
									column : removeQuotes(node[2]),
								};
							}),
							func.map(function (node) {
								return {
									expression : node,
									table : null,
									column : null,
								};
							}),
							colName.map(function (node) {
								return {
									expression : node,
									table : null,
									column : removeQuotes(node),
								};
							}),
							str.map(function (node) {
								return {
									expression : node,
									table : null,
									column : null,
								};
							}),
							number.map(function (node) {
								return {
									expression : node,
									table : null,
									column : null,
								};
							}),
							list.map(function (node) {
								return {
									expression : node,
									table : null,
									column : null,
								};
							})),
						opt(seq(
								optWhitespace,
								operator,
								opt(seq(
										optWhitespace,
										lazy(function () {
											return expression;
										}).map(function (node) {
											return node.expression;
										})).map(mkString), null)).map(mkString), null)).map(function (node) {
						if (node[1] !== null) {
							node[0] = node[0].expression;
							return {
								expression : node.join(''),
								table : null,
								column : null,
							};
						} else
							return node[0];
					});

				// Expression following a SELECT statement
				var colListExpression = seq(
						expression,
						opt(// Alias
							seq(
								optWhitespace,
								opt(regex(/AS\s/i)),
								alt(colName, str)).map(function (node) {
								var n = {};
								n.alias = removeQuotes(node[2]);
								n.expression = node.join('');
								return n;
							}),
							null)).map(function (node) {
						var n = node[0];
						n.alias = (node[1] !== null) ? node[1].alias : null;
						n.expression += ((node[1] !== null) ? node[1].expression : '');
						return n;
					});

				// Expression inside a function
				var argListExpression = expression.map(function (node) {
						return node.expression;
					});

				// Expression following a FROM statement
				var tableListExpression = seq(
						alt(
							tableAndColumn.map(mkString),
							colName),
						opt(// Alias
							seq(
								optWhitespace,
								opt(regex(/AS\s/i)),
								alt(colName, str)).map(function (node) {
								return {
									alias : removeQuotes(node[2]),
									expression : node.join(''),
								};
							}),
							null)).map(function (node) {
						var n = {};
						n.table = node[0];
						n.alias = (node[1] !== null) ? node[1].alias : null;
						n.expression = node[0] + ((node[1] !== null) ? node[1].expression : '');
						return n;
					});

				// JOIN expression (including JOIN statements)
				var joinExpression = seq(
						opt(seq(
								regex(/INNER|LEFT|RIGHT/i),
								whitespace).map(function (node) {
								return node[0].toLowerCase();
							}), null),
						regex(/JOIN/i),
						optWhitespace,
						getPos(tableListExpression),
						optWhitespace,
						regex(/ON/i),
						optWhitespace,
						getPos(expression)).map(function (node) {
						var n = {};
						n.type = node[0] || 'inner';
						n.table = node[3].table;
						n.alias = node[3].alias;
						n.position = node[3].position;
						n.condition = {
							expression : node[7].expression,
							position : node[7].position,
						};
						return n;
					});

				// Expression following a WHERE statement
				var whereExpression = getPos(expression).map(function (node) {
						return {
							expression : node.expression,
							position : node.position,
						};
					});

				// Expression following an ORDER BY statement
				var orderListExpression = seq(
						expression,
						opt(seq(
								optWhitespace,
								regex(/ASC|DESC/i)), null)).map(function (node) {
						return {
							expression : node[0].expression + ((node[1] !== null) ? node[1].join('') : ''),
							order : (node[1] !== null) ? node[1][1] : 'ASC',
							table : node[0].table,
							column : node[0].column,
						};
					});

				// Expression following a LIMIT statement
				var limitExpression = seq(
						number,
						opt(seq(
								optWhitespace,
								string(','),
								optWhitespace,
								number), null)).map(function (node) {
						if (node[1] === null) {
							return {
								from : null,
								nb : parseInt(node[0], 10),
							};
						} else {
							return {
								from : parseInt(node[0], 10),
								nb : parseInt(node[1][3], 10),
							};
						}
					});

				// Expression designating a column before VALUES in INSERT query
				var insertColListExpression = alt(
						tableAndColumn.map(function (node) {
							return {
								expression : node.join(''),
								column : removeQuotes(node[2]),
							};
						}),
						colName.map(function (node) {
							return {
								expression : node,
								column : removeQuotes(node),
							};
						}));

				// Expression following a VALUES statement
				var valueExpression = expression.map(function (node) {
						return node.expression;
					});

				// Expression that assign a value to a column
				var assignExpression = seq(
						insertColListExpression,
						optWhitespace,
						string('='),
						optWhitespace,
						expression).map(function (node) {
						return {
							target : node[0],
							value : node[4].expression,
						};
					});

				/********************************************************************************************
				HIGH LEVEL PARSERS
				 ********************************************************************************************/

				// List of arguments inside a function
				var argList = seq(
						seq(argListExpression, optWhitespace, string(','), optWhitespace).map(mkString).many(),
						argListExpression.skip(optWhitespace)).map(mergeOptionnalList);

				// List of expressions following a SELECT statement
				var colList = optionnalList(getPos(colListExpression));

				// List of table following a FROM statement
				var tableList = optionnalList(getPos(tableListExpression));

				// List of table following an GROUP BY statement
				var groupList = optionnalList(getPos(expression));

				// List of table following an ORDER BY statement
				var orderList = optionnalList(getPos(orderListExpression));

				// List of joins (including JOIN statements)
				var joinList = optWhitespace.then(joinExpression).skip(optWhitespace).many();

				// List of columns before VALUES in INSERT query
				var insertColList = optionnalList(insertColListExpression);

				// List of values following a VALUES statement
				var valuesList = optionnalList(valueExpression);

				// List of assign expression following a SET statement
				var assignList = optionnalList(assignExpression);

				/********************************************************************************************
				MAIN PARSERS
				 ********************************************************************************************/

				// SELECT parser
				var selectParser = seq(
						regex(/SELECT/i).skip(optWhitespace).then(opt(colList)),
						opt(regex(/FROM/i).skip(optWhitespace).then(opt(tableList)), []),
						opt(joinList),
						opt(regex(/WHERE/i).skip(optWhitespace).then(opt(whereExpression)), null),
						opt(regex(/\s?GROUP BY/i).skip(optWhitespace).then(opt(groupList))),
						opt(regex(/\s?ORDER BY/i).skip(optWhitespace).then(opt(orderList))),
						opt(regex(/\s?LIMIT/i).skip(optWhitespace).then(opt(limitExpression)), null)).map(function (node) {
						return {
							type : 'select',
							select : node[0],
							from : node[1],
							join : node[2],
							where : node[3],
							group : node[4],
							order : node[5],
							limit : node[6],
						};
					});

				// INSERT parser
				var insertParser = seq(
						regex(/INSERT INTO/i).skip(optWhitespace).then(tableListExpression),
						optWhitespace,
						opt(
							seq(
								string('('),
								insertColList,
								string(')')).map(function (node) {
								return node[1];
							})),
						optWhitespace,
						regex(/VALUES\s?\(/i).skip(optWhitespace).then(valuesList),
						string(')')).map(function (node) {
						var values = [];
						var bigger = Math.max(node[2].length, node[4].length);

						for (var i = 0; i < bigger; ++i) {
							values[i] = {
								target : node[2][i] || null,
								value : node[4][i] || null,
							};
						}

						return {
							type : 'insert',
							into : node[0],
							values : values,
						};
					});

				// UPDATE parser
				var updateParser = seq(
						regex(/UPDATE/i).skip(optWhitespace).then(tableListExpression),
						optWhitespace,
						regex(/SET/i).skip(optWhitespace).then(assignList),
						optWhitespace,
						opt(regex(/WHERE/i).skip(optWhitespace).then(opt(whereExpression)), null)).map(function (node) {
						return {
							type : 'update',
							table : node[0],
							values : node[2],
							where : node[4],
						};
					});

				// DELETE parser
				var deleteParser = seq(
						regex(/DELETE FROM/i).skip(optWhitespace).then(opt(tableList)),
						opt(regex(/WHERE/i).skip(optWhitespace).then(opt(whereExpression)), null)).map(function (node) {
						return {
							type : 'delete',
							from : node[0],
							where : node[1],
						};
					});

				// Main parser
				var p = alt(selectParser, insertParser, updateParser, deleteParser);

				/********************************************************************************************
				PUBLIC FUNCTIONS
				 ********************************************************************************************/

				module.exports = function (sql) {
					var result = p.parse(sql);
					if (result.status === false)
						result.error = Parsimmon.formatError(sql, result);
					return result;
				};

			}, {
				"parsimmon" : 3
			}
		]
	}, {}, [1])(1)
});

//************************************ EXTJS SQL BUILDER ************************/
var addToDrawPanel = function (d, component, index, eOpts) {
	var s = d.getSize();
	var rh = d.getResizeHandler();
	rh.call(d, s);
};

Ext.define('visualsqlquerybuilder.SQLTableSprite', {
	extend : 'Ext.draw.sprite.Sprite',
	alias : ['widget.sqltablesprite'],
	bConnections : false,
	prev : [0, 0],
	startDrag : function (id) {
		var me = this;
		log('startdrag SQLTableSprite');
		// get a reference to a sqltable
		var win = Ext.getCmp(id);

		// get the main sqlTablePanel
		var sqlTablePanel = Ext.get('SQLTablePanel').component;

		// get the main sqlTablePanel position
		var xyParentPos = sqlTablePanel.el.getXY();

		// get the size of the previously added sqltable
		var xyChildPos = win.el.getXY();

		var drawcontainer = sqlTablePanel.down('draw');
		var surface = drawcontainer.getSurface();

		//DAFARE transformToViewBox NON ESISTE
		me.prev = [xyChildPos[0] - xyParentPos[0] + 2, xyChildPos[1] - xyParentPos[1] + 2];
		//me.prev = surface.transformToViewBox(xyChildPos[0] - xyParentPos[0] + 2, xyChildPos[1] - xyParentPos[1] + 2);
	},
	endDrag : function () {
		//DAFARE NON CI ENTRA E NN SA DOVE E'
		log('endDrag SQLTableSprite');
	},
	onDrag : function (relPosMovement) {
		//DAFARE NON CI ENTRA E NN SA DOVE E'
		log('onDrag SQLTableSprite');
		var xy;
		var me = this;
		var attr = this.attr;
		log('onDrag');
		// move the sprite
		// calculate new x and y position

		var newX = me.prev[0] + relPosMovement[0];
		var newY = me.prev[1] + relPosMovement[1];
		// set new x and y position and redraw sprite
		me.setAttributes({
			x : newX,
			y : newY
		}, true);
	}
});

Ext.define('visualsqlquerybuilder.SQLTableModel', {
	extend : 'Ext.data.Model',
	fields : [{
			name : 'id',
			type : 'string'
		}, {
			name : 'tableName',
			type : 'string'
		}, {
			name : 'tableAlias',
			type : 'string'
		}, {
			name : 'extra',
			type : 'string'
		}
	]
});

Ext.define('visualsqlquerybuilder.SQLTableStore', {
	extend : 'Ext.data.Store',
	autoSync : true,
	model : 'visualsqlquerybuilder.SQLTableModel',
	proxy : {
		type : 'memory'
	}
});

Ext.define('visualsqlquerybuilder.SQLJoin', {
	extend : 'Ext.data.Model',
	fields : [{
			name : 'id',
			type : 'string'
		}, {
			name : 'leftTableId',
			type : 'string'
		}, {
			name : 'rightTableId',
			type : 'string'
		}, {
			name : 'leftTableField',
			type : 'string'
		}, {
			name : 'rightTableField',
			type : 'string'
		}, {
			name : 'joinCondition',
			type : 'string'
		}, {
			name : 'joinType',
			type : 'string'
		}
	],
	createUUID : function () {
		// http://www.ietf.org/rfc/rfc4122.txt
		var s = [];
		var hexDigits = "0123456789abcdef";
		for (var i = 0; i < 36; i++) {
			s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1);
		}
		s[14] = "4"; // bits 12-15 of the time_hi_and_version field to 0010
		s[19] = hexDigits.substr((s[19] & 0x3) | 0x8, 1); // bits 6-7 of the clock_seq_hi_and_reserved to 01
		s[8] = s[13] = s[18] = s[23] = "-";

		var uuid = s.join("");
		return uuid;
	}
});

Ext.define('visualsqlquerybuilder.JoinStore', {
	extend : 'Ext.data.Store',
	autoSync : true,
	model : 'visualsqlquerybuilder.SQLJoin',
	proxy : {
		type : 'memory'
	}
});

Ext.define('visualsqlquerybuilder.SQLFieldsModel', {
	extend : 'Ext.data.Model',
	fields : [{
			name : 'id',
			type : 'string'
		}, {
			name : 'tableName',
			type : 'string'
		}, {
			name : 'tableId',
			type : 'string'
		}, {
			name : 'extCmpId',
			type : 'string'
		}, {
			name : 'tableAlias',
			type : 'string'
		}, {
			name : 'field',
			type : 'string'
		}, {
			name : 'output',
			type : 'boolean'
		}, {
			name : 'expression',
			type : 'string'
		}, {
			name : 'aggregate',
			type : 'string'
		}, {
			name : 'alias',
			type : 'string'
		}, {
			name : 'sorttype',
			type : 'string'
		}, {
			name : 'sortorder',
			type : 'int'
		}, {
			name : 'grouping',
			type : 'boolean'
		}, {
			name : 'criteria',
			type : 'string'
		}
	]
});

Ext.define('visualsqlquerybuilder.SQLFieldsStore', {
	extend : 'Ext.data.Store',
	autoSync : true,
	model : 'visualsqlquerybuilder.SQLFieldsModel',
	proxy : {
		type : 'memory'
	}
});

Ext.define('visualsqlquerybuilder.SQLSelect', {
	config : {
		typesql : '',
		tables : '',
		joins : '',
		fields : '',
		sqlinput : '',
		ast : '',
		lastTableName : '',
		lastTableId : '',
	},
	constructor : function () {

		log('constructor SQLSelect');
		this.tables = Ext.create('visualsqlquerybuilder.SQLTableStore', {
				storeId : 'SQLTableStore'
			});

		// handle all updates on sql tables
		this.tables.on('update', this.handleSQLTableUpdate, this);
		this.tables.on('add', this.handleSQLTableAdd, this);
		this.tables.on('remove', this.handleSQLTableRemove, this);

		this.fields = Ext.create('visualsqlquerybuilder.SQLFieldsStore', {
				storeId : 'SQLFieldsStore'
			});

		this.fields.on('update', this.handleSQLFieldChanges, this);
		this.fields.on('remove', this.handleSQLFieldRemove, this);

		this.joins = Ext.create('visualsqlquerybuilder.JoinStore', {
				storeId : 'JoinStore'
			});

		this.joins.on('update', this.handleSQLJoinChanges, this);
		this.joins.on('add', this.handleSQLJoinChanges, this);
		this.joins.on('remove', this.handleSQLJoinChanges, this);

		this.callParent(arguments);
	},
	handleSQLTableUpdate : function (tableStore, table, operation) {
		log('handleSQLTableUpdate SQLSelect');
		if (operation == 'commit') {
			this.updateFieldTableData(table);
			this.updateJoinTableData(table);
			this.updateSQLOutput();
		}
	},
	handleSQLTableAdd : function (tableStore, table, index) {
		this.updateSQLOutput();
	},
	handleSQLTableRemove : function (tableStore, table, index) {
		log('handleSQLTableUpdate handleSQLTableRemove');
		var aJoins = [];
		// get table joins and remove them
		aJoins = this.getJoinsByTableId(table[0].get('id'));
		// loop over the joins array
		for (var i = 0, l = aJoins.length; i < l; i++) {
			// remove join from store
			this.removeJoinById(aJoins[i].get('id'));
		}
		this.updateSQLOutput();
	},
	handleSQLJoinChanges : function (joinStore, join) {
		this.updateSQLOutput();
	},
	updateFieldTableData : function (table) {
		log('handleSQLTableUpdate updateFieldTableData');
		var tableId,
		expression,
		tableAlias,
		tableName;
		tableId = table.get('id');
		tableAlias = table.get('tableAlias');
		tableName = table.get('tableName');
		// loop over all fields of the fields store
		this.fields.each(function (field) {
			// check if current field belongs to sql table
			if (field.get('tableId') == tableId) {
				if (tableAlias != '') {
					// we have a table alias
					expression = tableAlias + '.' + field.get('field');
				} else {
					// no table alias
					expression = tableName + '.' + field.get('field');
				};
				field.beginEdit();
				// update the field table alias
				field.set('tableAlias', tableAlias);
				// update the field expression
				field.set('expression', expression);
				field.commit(true);
				field.endEdit();
			}
		});
		return;
	},
	updateJoinTableData : function (table) {
		log('handleSQLTableUpdate updateJoinTableData');
		var joins,
		tableId;
		tableId = table.get('id');
		joins = this.getJoinsByTableId(tableId);
		for (var i = 0, rightTable, leftTable, joinCondition = '', l = joins.length; i < l; i++) {
			leftTable = this.getTableById(joins[i].get('leftTableId'));
			rightTable = this.getTableById(joins[i].get('rightTableId'));

			if (leftTable.get('tableAlias') != '') {
				joinCondition = joinCondition + leftTable.get('tableAlias') + '.' + joins[i].get('leftTableField') + '=';
			} else {
				joinCondition = joinCondition + leftTable.get('tableName') + '.' + joins[i].get('leftTableField') + '=';
			}

			if (rightTable.get('tableAlias') != '') {
				joinCondition = joinCondition + rightTable.get('tableAlias') + '.' + joins[i].get('rightTableField');
			} else {
				joinCondition = joinCondition + rightTable.get('tableName') + '.' + joins[i].get('rightTableField');
			}
			joins[i].beginEdit();
			joins[i].set('joinCondition', joinCondition);
			joins[i].commit(true);
			joins[i].endEdit();
		}
	},
	handleSQLFieldChanges : function (fieldStore, model, operation) {
		log('handleSQLTableUpdate handleSQLFieldChanges');
		if (operation == 'commit') {
			this.updateSQLOutput();
		}
	},
	handleSQLFieldRemove : function (fieldStore) {
		this.updateSQLOutput();
	},
	updateSQLOutput : function () {
		log('handleSQLTableUpdate updateSQLOutput');
		var sqlOutput,
		sqlHTML,
		SQLOutputPanel;
		sqlOutput = this.getSQL();
		sqlHTML = '<pre class="brush: sql">' + sqlOutput + '</pre>';
		SQLOutputPanel = Ext.getCmp('SQLOutputPanel');
		//SQLOutputPanel.update(sqlHTML);
		SQLOutputPanel.setValue(sqlOutput);
	},
	sortTablesByJoins : function (tables, oUsedTables) {
		log('handleSQLTableUpdate sortTablesByJoins');
		var aTables = [],
		aJoins = [],
		oUsedTables = oUsedTables || {};

		// loop over tables
		for (var i = 0, aCondition = [], aJoin, l = tables.length; i < l; i++) {
			// check if current table is a new one
			if (tables[i] == null)
				return;
			if (!oUsedTables.hasOwnProperty(tables[i].get('id'))) {
				// it is a new one
				aTables.push(tables[i]);
				// mark table as used
				oUsedTables[tables[i].get('id')] = true;
				// get any joins for the current table
				aJoin = this.getJoinsByTableId(tables[i].get('id'));
				// loop over the join tables
				for (var j = 0, joinTable, len = aJoin.length; j < len; j++) {
					// check if it is a new join
					if (!oUsedTables.hasOwnProperty(aJoin[j].get('id'))) {
						// mark join as used
						oUsedTables[aJoin[j].get('id')] = true;
						if (tables[i].get('id') != aJoin[j].get('leftTableId')) {
							joinTable = this.getTableById(aJoin[j].get('leftTableId'));
							this.changeLeftRightOnJoin(aJoin[j]);
						} else {
							joinTable = this.getTableById(aJoin[j].get('rightTableId'));
						}
						var oTemp = this.sortTablesByJoins([joinTable], oUsedTables);
						oUsedTables = oTemp.oUsedTables;
						aTables = aTables.concat(oTemp.aTables);
					}
				}
			}
		}

		return {
			aTables : aTables,
			oUsedTables : oUsedTables
		};
	},
	changeLeftRightOnJoin : function (join) {
		log('handleSQLTableUpdate changeLeftRightOnJoin');
		var leftTable,
		leftTableField,
		rightTable,
		rightTableField,
		joinCondition = '';
		// prepare new data
		leftTable = this.getTableById(join.get('rightTableId'));
		leftTableField = join.get('rightTableField');
		rightTable = this.getTableById(join.get('leftTableId'));
		rightTableField = join.get('leftTableField');

		if ((rightTable == null) || (leftTable == null))
			return;

		// construct new joinCondition
		if (leftTable.get('tableAlias') != '') {
			joinCondition = joinCondition + leftTable.get('tableAlias') + '.' + join.get('rightTableField') + '=';
		} else {
			joinCondition = joinCondition + leftTable.get('tableName') + '.' + join.get('rightTableField') + '=';
		}

		if (rightTable.get('tableAlias') != '') {
			joinCondition = joinCondition + rightTable.get('tableAlias') + '.' + join.get('leftTableField');
		} else {
			joinCondition = joinCondition + rightTable.get('tableName') + '.' + join.get('leftTableField');
		}

		// start transaction
		join.beginEdit();
		// change left and right join table data
		join.set('leftTableId', leftTable.get('id'));
		join.set('leftTableField', leftTableField);
		join.set('rightTableId', rightTable.get('id'));
		join.set('rightTableField', rightTableField);
		join.set('joinCondition', joinCondition);
		// silent commit without firing store events
		// this prevents endless loop
		join.commit(true);
		join.endEdit();
		// end transaction
		return;
	},

	setExternalSQL : function (strsql) {
		log('handleSQLTableUpdate setSQL');
		var me = this;
		this.sqlinput = strsql;

		// PARSER SQL TO DESIGNER
		me.ast = simpleSqlParser.sql2ast(strsql);
		if (me.ast.status == true) {
			me.typesql = 'SELECT';

			//add where array
			if (me.ast.value.where != null) {
				var whereArray = me.ast.value.where.expression.split(/ AND | OR /);
				me.ast.value.where = [];
				for (var i = 0; i < whereArray.length; i++) {
					var expressionArray = whereArray[i].split(" ");
					var appo = {
						expression : whereArray[i],
						field : expressionArray[0].trim(),
						condition : whereArray[i].substr(expressionArray[0].length),
						loaded : false
					};
					me.ast.value.where.push(appo);
				}
			}

			//add table from join
			me.ast.value.join.forEach(function (obj) {
				me.ast.value.from.push(obj);
			});
			me.toDesignerTable();

			//wait to all store loaded
			return new Ext.Promise(function (resolve, reject) {
				me.ast.value.from.forEach(function (obj) {
					Ext.getStore('SQLTS' + obj.table).load({
						callback : function (records, operation, success) {
							Ext.getCmp('SQLTableTree').store.findRecord('text', 'ord').data.loaded
							if (success) {
								for (var i = 0; i < me.ast.value.from.length; i++) {
									if ('SQLTS' + me.ast.value.from[i].table == this.id)
										me.ast.value.from[i].loaded = true;
								};
								//test if all store loaded
								if (me.DesignerTableLoaded()) {
									me.toDesignerJoin();
									me.toDesignerField();
									// reset orignal sql, generator mistake where
									var sqlHTML = '<pre class="brush: sql">' + me.sqlinput + '</pre>';
									var SQLOutputPanel = Ext.getCmp('SQLOutputPanel');
									SQLOutputPanel.setValue(me.sqlinput);
								}
							}
						}
					});
				});
			});

		} else {
			var sqlHTML = '<pre class="brush: sql">' + this.sqlinput + '</pre>';
			var SQLOutputPanel = Ext.getCmp('SQLOutputPanel');
			SQLOutputPanel.setValue(this.sqlinput);
		}
	},
	setSQL : function (strsql) {
		log('handleSQLTableUpdate setSQL');
		var me = this;

		this.sqlinput = strsql;
		var sqlHTML = '<pre class="brush: sql">' + this.sqlinput + '</pre>';
		var SQLOutputPanel = Ext.getCmp('SQLOutputPanel');
		SQLOutputPanel.setValue(this.sqlinput);

	},

	removeAllObj : function () {
		log('handleSQLTableUpdate removeAllObj');
		var me = this;
		//cancella tutte le tabelle
		var sqlTablePanel = Ext.getCmp('SQLTablePanel');
		/*
		while (true){
		if (VisualSQLTables.length == 0) break;
		var VSQLT = Ext.getCmp(VisualSQLTables[0].name);
		if (VSQLT != undefined){
		VSQLT.close();
		}
		};
		 */

		for (i = 0; i < VisualSQLTables.length; i++) {
			var VSQLT = Ext.getCmp(VisualSQLTables[i].name);
			if (VSQLT != undefined) {
				//new Ext.Promise(function (resolve, reject) {
				var VSQLT = Ext.getCmp(VisualSQLTables[i].name);
				//VSQLT.close();
				//VSQLT.doClose();
				if (VSQLT.fireEvent('close') !== false) {
					log('OK' + VSQLT.name);
				}
				// });
			}
		};

		/*wait to all store loaded
		while (true){
		if (VisualSQLTables.length == 0)  {
		return;
		}else{
		new Ext.Promise(function (resolve, reject) {
		var VSQLT = Ext.getCmp(VisualSQLTables[0].name);
		VSQLT.close();
		});
		}
		}*/
		return true;
	},

	toDesignerTable : function () {
		log('handleSQLTableUpdate toDesignerTable');
		var sqlTablePanel = Ext.getCmp('SQLTablePanel');
		var tablestore = Ext.getCmp('SQLTableTree').store.data.items;
		var newtab;
		var me = this;

		if (typeof me.ast == 'undefined') {
			return false;
		}
		if (me.ast.status != true) {
			return false;
		}

		//table
		for (var i = 0; i < me.ast.value.from.length; i++) {
			newtab = sqlTablePanel.add({
					xtype : 'sqltable',
					constrain : true,
					title : me.ast.value.from[i].alias,
					text : me.ast.value.from[i].table,
					titlealias : me.ast.value.from[i].alias
				});
			newtab.show();
			me.ast.value.from[i].loaded = false;
			me.lastTableName = me.ast.value.from[i].table;
		};
	},
	DesignerTableLoaded : function () {
		var me = this;
		for (var i = 0; i < me.ast.value.from.length; i++) {
			if (me.ast.value.from[i].loaded == false)
				return false
		}
		return true;
	},
	toDesignerField : function () {
		log('handleSQLTableUpdate toDesignerField');
		var tablestore = Ext.getCmp('SQLTableTree').store.data.items;
		var sqlTablePanel = Ext.getCmp('SQLTablePanel');
		var me = this;

		if (typeof me.ast == 'undefined') {
			return false;
		}
		if (this.ast.status != true) {
			return false;
		}
		//field
		for (var i = 0; i < me.ast.value.select.length; i++) {
			var obj = me.ast.value.select[i];
			var tableName = '';
			var fieldName = '';
			var fieldId = '';
			var fieldExtCmpId = '';
			var fieldNameTable = '';
			var tabid = '';
			var TableDotField = 0;
			var fieldstore = '';
			var criteriaExp = '';
			var groupExp = false;
			var field = Ext.create('visualsqlquerybuilder.SQLFieldsModel');

			//PARSER SQL find name,table,alias field
			if (obj.alias == null) {
				TableDotField = obj.expression.indexOf(".");
				if (TableDotField > 0) {
					tableName = obj.expression.substr(0, TableDotField);
					TableDotField = TableDotField + 1;
					fieldName = obj.expression.substr(TableDotField, obj.expression.length - TableDotField);
				} else {
					tableName = me.lastTableName;
					fieldName = obj.expression;
				}
				fieldNameTable = tableName + '.' + fieldName;
				fieldNameTable = fieldNameTable.trim();

				//find table
				tabid = ux.vqbuilder.sqlSelect.getTableIdByName(tableName);
				fieldstore = Ext.data.StoreManager.get('SQLTS' + tableName);
				var record = fieldstore.findRecord('field', fieldName);

				//error in definition fied of table
				if (record != null) {
					fieldId = record.get('id');
					fieldExtCmpId = record.get('extCmpId');
				}

				//find where
				if (me.ast.value.where != null) {
					for (var j = 0; j < me.ast.value.where.length; j++) {
						var objwhere = me.ast.value.where[j];
						if ((objwhere.field == fieldNameTable) && (objwhere.loaded != true)) {
							criteriaExp = objwhere.condition;
							me.ast.value.where[j].loaded = true;
							//DAFARE OR AND SU MULTICOLONNA
						}
					}
				}

				//find group
				if (me.ast.value.group != null) {
					for (var j = 0; j < me.ast.value.group.length; j++) {
						var objgroup = me.ast.value.group[j];
						if ((objgroup.expression == fieldNameTable) && (objgroup.loaded != true)) {
							groupExp = true;
							me.ast.value.group[j].loaded = true;
							//DAFARE OR AND SU MULTICOLONNA
						}
					}
				}

				//add field to grid
				field.set('expression', fieldNameTable);
				field.set('output', true);
				field.set('id', fieldId);
				field.set('field', fieldName);
				field.set('tableId', tabid);
				field.set('tableName', tableName);
				field.set('criteria', criteriaExp);
				field.set('grouping', groupExp);
				field.set('extCmpId', fieldExtCmpId);
			} else {
				var AppoExp = "AS " + obj.alias
					fieldNameTable = obj.expression.substr(0, obj.expression.length - AppoExp.length);
				fieldNameTable = fieldNameTable.trim();

				//find where
				if (me.ast.value.where != null) {
					for (var j = 0; j < me.ast.value.where.length; j++) {
						var objwhere = me.ast.value.where[j];
						if ((objwhere.field == fieldNameTable) && (objwhere.loaded != true)) {
							criteriaExp = objwhere.condition;
							me.ast.value.where[j].loaded = true;
							//DAFARE OR AND SU MULTICOLONNA
						}
					}
				}

				//find group
				if (me.ast.value.group != null) {
					for (var j = 0; j < me.ast.value.group.length; j++) {
						var objgroup = me.ast.value.group[j];
						if ((objgroup.expression == fieldNameTable) && (objgroup.loaded != true)) {
							groupExp = true;
							me.ast.value.group[j].loaded = true;
							//DAFARE OR AND SU MULTICOLONNA
						}
					}
				}

				//add field to grid
				field.set('expression', AppoExp);
				field.set('output', true);
				field.set('id', 0);
				field.set('field', fieldNameTable);
				field.set('alias', obj.alias);
				field.set('tableId', 0);
				field.set('tableName', tableName);
				field.set('criteria', criteriaExp);
				field.set('grouping', groupExp);
				field.set('extCmpId', 0);
			}
			me.ast.value.select[i].loaded = true;
			me.fields.add(field);
		};

		//field not visible in where

		if (me.ast.value.where != null) {
			for (var j = 0; j < me.ast.value.where.length; j++) {
				var objwhere = me.ast.value.where[j];
				TableDotField = objwhere.field.indexOf(".");
				if (TableDotField > 0) {
					tableName = objwhere.field.substr(0, TableDotField);
					TableDotField = TableDotField + 1;
					fieldName = objwhere.field.substr(TableDotField, objwhere.field.length - TableDotField);
				} else {
					tableName = me.lastTableName;
					fieldName = objwhere.field;
				}
				fieldNameTable = tableName + '.' + fieldName;
				fieldNameTable = fieldNameTable.trim();

				//find table
				tabid = ux.vqbuilder.sqlSelect.getTableIdByName(tableName);
				fieldstore = Ext.data.StoreManager.get('SQLTS' + tableName);
				var record = fieldstore.findRecord('field', fieldName);
				if (objwhere.loaded != true) {
					//add field to grid
					var field = Ext.create('visualsqlquerybuilder.SQLFieldsModel');
					field.set('expression', objwhere.field);
					field.set('output', false);
					field.set('id', record.get('id'));
					field.set('tableId', tabid);
					field.set('field', objwhere.field);
					field.set('criteria', objwhere.condition);
					field.set('extCmpId', record.get('extCmpId'));
					me.fields.add(field);
					me.ast.value.where[j].loaded = true;
				}
			}
		}
	},

	toDesignerJoin : function () {
		log('handleSQLTableUpdate toDesignerJoin');
		var me = this;

		//JOIN

		if (this.ast.status != true) {
			return false;
		}
		this.ast.value.join.forEach(function (obj) {
			me.lastTableName = obj.table;

			me.addJoinExpression(obj.table, obj.type, obj.condition.expression);
		});
	},

	getSQL : function (e) {
		log('handleSQLTableUpdate getSQL');
		//item = me.getItemFromEvent(e) || me.activeItem;
		var TypeSQL = 'SELECT';
		var sqlOutput = '';
		var aJoins = [],
		aOutputFields = [],
		oJoinTables = {},
		aTables = [],
		aJoinTables = [];
		var aCriteriaFields = [],
		aGroupFields = [],
		aOrderFields = [],
		aAggregateFields = [];
		var selectFieldsSQL = '',
		fromSQL = '',
		aFromSQL = [],
		criteriaSQL = '',
		orderBySQL = '',
		groupBySQL = '',
		joinSQL = '';
		var fieldSeperator = ', ',
		bFirst = true,
		bPartOfJoin = false;
		var AppoAggregate = '',
		AppoAggregatePost = '',
		AppoAs = '';

		//type
		if (this.hasOwnProperty('typesql')) {
			TypeSQL = this.typesql;
		}

		//field
		if (this.hasOwnProperty('fields')) {
			this.fields.each(function (field) {
				// should the field be a part of the output
				if (field.get('output')) {
					aOutputFields.push(field);
				}
				// any criteria
				if (field.get('criteria') != '') {
					aCriteriaFields.push(field);
				}
				// check for grouping
				if (field.get('grouping')) {
					aGroupFields.push(field);
				}
				// check for sorting
				if (field.get('sorttype') != '') {
					aOrderFields.push(field);
				}
			});
		}

		// tables
		// sorting of tables
		this.tables.each(function (table) {
			aTables.push(table);
		});

		aTables = this.sortTablesByJoins(aTables).aTables;

		if (this.hasOwnProperty('joins')) {
			this.joins.each(function (join) {
				aJoins.push(join);
			});
		}

		//from
		for (var k = 0, aJoin = [], oJoinTables = {}, joinCondition = '', joinType, leftTable, rightTable, l = aTables.length; k < l; k++) {
			if (k == aTables.length - 1) {
				fieldSeperator = '';
			} else {
				fieldSeperator = ', ';
			};

			// is the current table the first one
			if (bFirst) {
				// yes it is the first

				// table id merken
				oJoinTables[aTables[k].get('id')] = true;

				bFirst = false;

				// check if current table is not the last one in the loop
				if ((k + 1) < aTables.length) {
					// get joins where joins leftTableID is a property of oJoinTables and joins rightTableID equal to aTables[i+1].get('id')
					for (var h = 0, len = aJoins.length; h < len; h++) {
						if (oJoinTables.hasOwnProperty(aJoins[h].get('leftTableId')) && aJoins[h].get('rightTableId') == aTables[k + 1].get('id')) {
							aJoin.push(aJoins[h]);
						}
						if (oJoinTables.hasOwnProperty(aJoins[h].get('rightTableId')) && aJoins[h].get('leftTableId') == aTables[k + 1].get('id')) {
							this.changeLeftRightOnJoin(aJoins[h]);
							aJoin.push(aJoins[h]);
						}
					}

					// check if we have a join
					if (aJoin.length > 0) {
						// yes we have a join between aTables[k] and aTables[k+1] with at least one join condition

						leftTable = aTables[k];
						rightTable = aTables[k + 1];

						// table id merken
						oJoinTables[rightTable.get('id')] = true;

						for (var j = 0, fieldSeperator = '', ln = aJoin.length; j < ln; j++) {
							if (j == aJoin.length - 1) {
								fieldSeperator = '';
							} else {
								fieldSeperator = ' AND ';
							};
							joinType = aJoin[j].get('joinType');
							joinCondition = joinCondition + aJoin[j].get('joinCondition') + fieldSeperator;
						}

						// reset the join array
						aJoin = [];

						if (joinSQL != '') {
							joinSQL = joinSQL + ', ';
						}

						if (leftTable.get('tableAlias') != '') {
							// we have an leftTable alias
							joinSQL = joinSQL + leftTable.get('tableName') + ' ' + leftTable.get('tableAlias') + ' ' + joinType + ' JOIN ';
						} else {
							//no alias
							joinSQL = joinSQL + leftTable.get('tableName') + ' ' + joinType + ' JOIN ';
						}

						if (rightTable.get('tableAlias') != '') {
							// we have an rightTable alias
							joinSQL = joinSQL + rightTable.get('tableName') + ' ' + rightTable.get('tableAlias') + ' ON ' + joinCondition;
						} else {
							//no alias
							joinSQL = joinSQL + rightTable.get('tableName') + ' ON ' + joinCondition;
						}

						// clear joinCondition
						joinCondition = '';

					} else {
						// no join between aTables[i+1] and the one before
						bFirst = true;
						oJoinTables = {};
						// check for tableAlias
						if (aTables[k].get('tableAlias') != '') {
							fromSQL = aTables[k].get('tableName') + ' ' + aTables[k].get('tableAlias');
						} else {
							fromSQL = aTables[k].get('tableName');
						}
						aFromSQL.push(fromSQL);
					}
				} else {
					// its the last and only one in the loop
					// check for tableAlias
					if (aTables[k].get('tableAlias') != '') {
						fromSQL = aTables[k].get('tableName') + ' ' + aTables[k].get('tableAlias');
					} else {
						fromSQL = aTables[k].get('tableName');
					}
					aFromSQL.push(fromSQL);
				}
			} else {
				// no, it is not the first table

				bFirst = true;

				// check if current table is not the last one in the loop
				if ((k + 1) < aTables.length) {
					// get joins where joins leftTableID is a property of oJoinTables and joins rightTableID equal to aTables[i+1].get('id')
					for (var h = 0, len = aJoins.length; h < len; h++) {
						if (oJoinTables.hasOwnProperty(aJoins[h].get('leftTableId')) && aJoins[h].get('rightTableId') == aTables[k + 1].get('id')) {
							aJoin.push(aJoins[h]);
						}
						if (oJoinTables.hasOwnProperty(aJoins[h].get('rightTableId')) && aJoins[h].get('leftTableId') == aTables[k + 1].get('id')) {
							this.changeLeftRightOnJoin(aJoins[h]);
							aJoin.push(aJoins[h]);
						}
					}

					// check if we have a join
					if (aJoin.length > 0) {
						// yes we have a join between aTables[k] and aTables[k+1] with at least one join condition

						rightTable = aTables[k + 1];

						// table id merken
						oJoinTables[rightTable.get('id')] = true;

						for (var j = 0, fieldSeperator = '', ln = aJoin.length; j < ln; j++) {
							if (j == aJoin.length - 1) {
								fieldSeperator = '';
							} else {
								fieldSeperator = ' AND ';
							};
							joinType = aJoin[j].get('joinType');
							joinCondition = joinCondition + aJoin[j].get('joinCondition') + fieldSeperator;
						}

						// reset the join array
						aJoin = [];

						bFirst = false;

						if (rightTable.get('tableAlias') != '') {
							// we have an rightTable alias
							joinSQL = joinSQL + ' ' + joinType + ' JOIN ' + rightTable.get('tableName') + ' ' + rightTable.get('tableAlias') + ' ON ' + joinCondition;
						} else {
							//no alias
							joinSQL = joinSQL + ' ' + joinType + ' JOIN ' + rightTable.get('tableName') + ' ON ' + joinCondition;
						}

						// clear joinCondition
						joinCondition = '';
					} else {
						bFirst = true;
						oJoinTables = {};
					}
				} else {
					// its the last and only one
					// check for tableAlias
					oJoinTables = {};
				}
			}
		}

		fromSQL = aFromSQL.join(', ');

		if (joinSQL != '' && fromSQL != '') {
			joinSQL = joinSQL + ', ';
		}

		fromSQL = ' FROM ' + joinSQL + fromSQL;

		// output fields
		for (var i = 0, l = aOutputFields.length; i < l; i++) {
			// check if it is the last array member
			if (i == aOutputFields.length - 1) {
				fieldSeperator = '';
			} else {
				fieldSeperator = ', ';
			};
			// yes, output

			// check alias
			if (aOutputFields[i].get('alias') != '') {
				// yes, we have an field alias
				AppoAs = ' AS ' + aOutputFields[i].get('alias');
			} else {
				// no field alias
				AppoAs = '';
			}

			// check aggregate
			if (aOutputFields[i].get('aggregate') != '') {
				// yes, we have an field aggregate
				AppoAggregate = aOutputFields[i].get('aggregate') + '(';
				AppoAggregatePost = ') ';
				//check alias on field aggregate
				if (AppoAs == '') {
					AppoAs = 'AS ' + 'EXPR' + [i];
					//DAFARE NN LO FA
					aOutputFields[i].get('alias').setValue = AppoAs;
				}
			} else {
				// no field aggregate
				AppoAggregate = '';
				AppoAggregatePost = '';
			}

			selectFieldsSQL = selectFieldsSQL + AppoAggregate + aOutputFields[i].get('expression') + AppoAggregatePost + AppoAs + fieldSeperator
		}

		//where
		for (var i = 0, l = aCriteriaFields.length; i < l; i++) {
			if (i == 0) {
				criteriaSQL = criteriaSQL + ' WHERE ';
			} else {
				criteriaSQL = criteriaSQL + 'AND ';
			}
			if (i == aCriteriaFields.length - 1) {
				fieldSeperator = '';
			} else {
				fieldSeperator = ' ';
			}
			criteriaSQL = criteriaSQL + aCriteriaFields[i].get('expression') + ' ' + aCriteriaFields[i].get('criteria') + fieldSeperator;
		}

		//group by
		for (var i = 0, l = aGroupFields.length; i < l; i++) {
			// check if it is the last array member
			if (i == aGroupFields.length - 1) {
				fieldSeperator = '';
			} else {
				fieldSeperator = ', ';
			}
			if (i == 0) {
				groupBySQL = ' GROUP BY ';
			}
			groupBySQL = groupBySQL + aGroupFields[i].get('expression') + fieldSeperator;
		}

		//order by  DAFARE l'order dei sort  aOrderFields[i].get('sortorder')
		for (var i = 0, l = aOrderFields.length; i < l; i++) {
			// check if it is the last array member
			if (i == aOrderFields.length - 1) {
				fieldSeperator = '';
			} else {
				fieldSeperator = ', ';
			}
			if (i == 0) {
				orderBySQL = ' ORDER BY ';
			}
			orderBySQL = orderBySQL + aOrderFields[i].get('expression') + ' ' + aOrderFields[i].get('sorttype') + fieldSeperator;
		}

		return TypeSQL + ' ' + selectFieldsSQL + fromSQL + criteriaSQL + groupBySQL + orderBySQL;
	},

	addTable : function (table) {
		log('handleSQLTableUpdate addTable');
		var keys = {};
		this.tables.add(table);
		keys.tableId = table.data.id;
		keys.tableAlias = table.data.tableAlias;
		keys.tableName = table.data.tableName;
		keys.id = 'SQLTW' + table.data.tableName;
		keys.name = 'SQLTW' + table.data.tableName;
		keys.storeloaded = false;
		VisualSQLTables[VisualSQLTables.length++] = keys;
	},
	removeTableById : function (tableId) {
		log('handleSQLTableUpdate removeTableById');
		var table = this.tables.getById(tableId);
		this.tables.remove(table);

		for (i = 0; i < VisualSQLTables.length; i++) {
			if (VisualSQLTables[i].tableId == tableId) {
				VisualSQLTables.splice(i, 1);
			}
		}
	},
	getTableById : function (tableId) {
		return this.tables.getById(tableId);
	},
	getTableIdByName : function (tableName) {
		log('handleSQLTableUpdate getTableIdByName');
		if (this.tables.findRecord('tableName', tableName) != null) {
			return this.tables.findRecord('tableName', tableName).get('id');
		} else {
			log('handleSQLTableUpdate getTableIdByName ERROR ' + tableName);
			return null;
		}
	},
	getFieldIdByName : function (tableName, fieldName) {
		log('handleSQLTableUpdate getFieldIdByName');
		var fieldstore = Ext.data.StoreManager.get('SQLTS' + tableName);
		var record = fieldstore.findRecord('field', fieldName);
		return record.get('id')
	},

	addFieldRecord : function (record, bOutput) {
		log('handleSQLTableUpdate addFieldRecord');
		var tableAlias,
		model,
		expression;
		// get the tableAlias
		tableAlias = this.getTableById(record.get('tableId')).get('tableAlias');
		// build the expression
		// check if the tableAlias is not an empty string
		if (tableAlias != '') {
			// alias is not an empty string
			expression = tableAlias + '.' + record.get('field');
		} else {
			// alias is an empty string
			expression = record.get('tableName') + '.' + record.get('field');
		};
		// get a new field instance
		model = this.getNewField();
		// set the expression
		model.set('expression', expression);
		// set output to false per default
		model.set('output', bOutput);
		// set an id, so it is possible to remove rows if the associated table is removed
		model.set('id', record.get('id'));
		// set the field
		model.set('field', record.get('field'));
		// set the alias
		if (record.get('alias') != '')
			model.set('alias', record.get('alias'));
		// copy tableId to the new model instance
		model.set('tableId', record.get('tableId'));
		// copy cmp id of origin sqltable to the new model instance
		model.set('extCmpId', record.get('extCmpId'));
		this.addField(model);
	},
	addField : function (field) {
		log('handleSQLTableUpdate addField');
		this.fields.add(field);
	},
	removeFieldById : function (id) {
		log('handleSQLTableUpdate removeFieldById');
		var field;
		field = this.fields.getById(id);
		this.fields.remove(field);
	},
	removeFieldsByTableId : function (tableId) {
		log('handleSQLTableUpdate removeFieldsByTableId');
		var aRecords = [];
		this.fields.each(function (model) {
			if (model.get('tableId') == tableId) {
				aRecords.push(model);
			}
		});
		this.fields.remove(aRecords);
	},
	getNewField : function () {
		log('handleSQLTableUpdate getNewField');
		return Ext.create('visualsqlquerybuilder.SQLFieldsModel');
	},

	getJoinsByTableId : function (tableId) {
		log('handleSQLTableUpdate getJoinsByTableId');
		var aReturn = [];
		this.joins.each(function (join) {
			if (join.get('leftTableId') == tableId || join.get('rightTableId') == tableId) {
				aReturn.push(join);
			}
		});
		return aReturn;
	},
	removeJoinById : function (joinID) {
		log('handleSQLTableUpdate removeJoinById');
		var join;
		join = this.joins.getById(joinID);
		this.joins.remove(join);
	},
	addJoin : function (join) {
		log('handleSQLTableUpdate addJoin');
		this.joins.add(join);
	},

	/*NUOVO MENU EDIT JOIN*/
	//connection.line.on('contextmenu', this.showSQLJoinCM, this);
	showSQLJoinCM : function (event, el) {
		log('SQLSelect showSQLJoinCM');
		var cm;
		// stop the browsers event bubbling
		event.stopEvent();
		// create context menu
		cm = Ext.create('Ext.menu.Menu', {
				items : [{
						text : 'Edit',
						iconCls : 'x-fa fa-pencil-square',
						handler : Ext.Function.bind(function () {}, this)
					}, {
						text : 'Remove',
						iconCls : 'x-fa fa-trash-o',
						handler : Ext.Function.bind(function () {
							// remove any connection lines from surface and from array ux.vqbuilder.connections
							ux.vqbuilder.connections = Ext.Array.filter(ux.vqbuilder.connections, function (connection) {
									var bRemove = true;
									if (this.uuid == connection.uuid) {
										this.line.remove();
										this.bgLine.remove();
										this.miniLine1.remove();
										this.miniLine2.remove();
										bRemove = false;
									}
									return bRemove;
								}, this);
							ux.vqbuilder.sqlSelect.removeJoinById(this.uuid);
						}, this)
					}, {
						text : 'Close Menu',
						iconCls : 'x-fa fa-sign-out',
						handler : Ext.emptyFn
					}
				]
			});
		// show the contextmenu next to current mouse position
		cm.showAt(event.getXY());
	},

	addJoinExpression : function (jointable, jointype, joinexp) {
		log('handleSQLTableUpdate addJoinExpression');
		// es: "aaamenu.CT_ID = aaaform.ID"
		var TableDotField = 0;
		var tablestore = Ext.getCmp('SQLTableTree').store.data.items;
		var sqlTablePanel = Ext.getCmp('SQLTablePanel');
		var me = this;

		TableDotField = joinexp.indexOf("=");
		var FieldA = joinexp.substr(0, TableDotField).trim();
		TableDotField = TableDotField + 1;
		var FieldB = joinexp.substr(TableDotField, joinexp.length - TableDotField).trim();

		//principale
		FieldA = FieldA.trim();
		TableDotField = FieldA.indexOf(".");
		tableName = FieldA.substr(0, TableDotField).trim();
		TableDotField = TableDotField + 1;
		FieldA = FieldA.substr(TableDotField, FieldA.length - TableDotField).trim();
		var leftTableId = me.getTableIdByName(tableName);
		var leftTableName = tableName;
		var leftTable = Ext.getCmp('SQLTW' + leftTableName);
		var leftTableField = FieldA;

		//secondaria o in join
		FieldB = FieldB.trim();
		TableDotField = FieldB.indexOf(".");
		tableName = FieldB.substr(0, TableDotField).trim();
		TableDotField = TableDotField + 1;
		FieldB = FieldB.substr(TableDotField, FieldB.length - TableDotField).trim();
		var rightTableId = me.getTableIdByName(tableName);
		var rightTableName = tableName;
		var rightTable = Ext.getCmp('SQLTW' + rightTableName);
		var rightTableField = FieldB;

		//add field to grid
		var join = Ext.create('visualsqlquerybuilder.SQLJoin');

		//add menu on line
		var showJoinCM = function (event, el) {
			// stop the browsers event bubbling
			event.stopEvent();
			// create context menu
			var cm = Ext.create('Ext.menu.Menu', {
					items : [{
							text : 'Edit',
							iconCls : 'x-fa fa-pencil-square',
							handler : Ext.Function.bind(function () {}, leftTable)
						}, {
							text : 'Remove',
							iconCls : 'x-fa fa-trash-o',
							handler : Ext.Function.bind(function () {
								// remove any connection lines from surface and from array ux.vqbuilder.connections
								ux.vqbuilder.connections = Ext.Array.filter(ux.vqbuilder.connections, function (connection) {
										var bRemove = true;
										if (leftTable.uuid == connection.uuid) {
											leftTable.line.remove();
											leftTable.bgLine.remove();
											leftTable.miniLine1.remove();
											leftTable.miniLine2.remove();
											bRemove = false;
										}
										return bRemove;
									}, leftTable);
								ux.vqbuilder.sqlSelect.removeJoinById(leftTable.uuid);
							}, leftTable)
						}, {
							text : 'Close',
							iconCls : 'x-fa fa-arrows-alt',
							handler : Ext.emptyFn
						}
					]
				});
			// show the contextmenu next to current mouse position
			cm.showAt(event.getXY());
		};

		//var sqlTable2 = Ext.getCmp(node.parentElement.parentNode.parentElement.id);
		//leftTable = leftTable.up('window');
		//rightTable = rightTable.up('window');
		leftTable.shadowSprite.bConnections = true;
		rightTable.shadowSprite.bConnections = true;

		var aBBPos = [0, 1];
		var connection = rightTable.connection(leftTable.shadowSprite, rightTable.shadowSprite, "#000", aBBPos);

		leftTable.connectionUUIDs.push(connection.uuid);
		rightTable.connectionUUIDs.push(connection.uuid);
		ux.vqbuilder.connections.push(connection);

		connection.bgLine.on('contextmenu', showJoinCM, connection);
		connection.line.on('contextmenu', showJoinCM, connection);

		join.set('id', connection.uuid);

		join.set('leftTableId', leftTableId);
		join.set('leftTableField', leftTableField);

		join.set('rightTableId', rightTableId);
		join.set('rightTableField', rightTableField);

		join.set('joinType', jointype);
		join.set('joinCondition', joinexp);

		me.addJoin(join);
	},

	arrayRemove : function (array, filterProperty, filterValue) {
		log('handleSQLTableUpdate arrayRemove');
		var aReturn;
		aReturn = Ext.Array.filter(array, function (item) {
				var bRemove = true;
				if (item[filterProperty] == filtervalue) {
					bRemove = false;
				}
				return bRemove;
			});
		return aReturn
	}
});

Ext.define('visualsqlquerybuilder.SQLTablePanel', {
	extend : 'Ext.panel.Panel',
	alias : ['widget.sqltablepanel'],
	id : 'SQLTablePanel',
	items : [{
			xtype : 'draw',
			id : 'drawContainer',
			itemId : 'drawContainer',
			//renderTo:Ext.getCmp('SQLTablePanel'),
			listeners : {
				afterrender : function () {
					this.initDropTarget();
				}
				//add: 'addToDrawPanel'
			},
			initDropTarget : function () {
				// init draw component inside qbwindow as a DropTarget
				log('SQLTablePanel arrayRemove');
				this.dropTarget = Ext.create('Ext.dd.DropTarget', this.el, {
						ddGroup : 'sqlDDGroup',
						notifyDrop : function (source, event, data) {
							var sqlTablePanel;
							// add a sqltable to the sqlTablePanel component
							sqlTablePanel = Ext.getCmp('SQLTablePanel');
							sqlTablePanel.add({
								xtype : 'sqltable',
								constrain : true,
								title : data.records[0].get('alias'),
								text : data.records[0].get('originName'),
								titlealias : data.records[0].get('alias'),
							}).show();
							return true;
						}
					});
			},
			addToDrawPanel : function (d, component, index, eOpts) {
				var s = d.getSize();
				var rh = d.getResizeHandler();
				rh.call(d, s);
			},
			sprites : []
		}
	]
});

Ext.define('visualsqlquerybuilder.SQLOutputPanel', {
	extend : 'Ext.panel.Panel',
	alias : ['widget.sqloutputpanel'],
	mixins : ['Ext.form.field.Field'],
	id : 'SQLOutputPanel',
	text : '',

	config : {
		sqlTextConfig : {},
	},

	layout : {
		type : 'hbox'
	},

	referenceHolder : true,

	listeners : {
		afterlayout : function () {
			//DAFARE
			//SyntaxHighlighter.highlight();
		}
	},

	initComponent : function () {
		log('SQLOutputPanel initComponent');
		var me = this,
		sqlTextConfig = me.sqlTextConfig;

		me.items = [
			Ext.apply({
				xtype : 'codeeditor',
				modecode: 'text/x-mysql',
				mode: 'text/x-mysql',
				reference : 'sqlTextField',
				width : '100%',
				height : '100%',
				ignoreOnSubmit : true,
				toolbarHidden : true,
			}, sqlTextConfig)
		];

		this.callParent(arguments);
	},

	getSubmitData : function () {
		log('SQLOutputPanel getSubmitData');
		var me = this,
		data = null;
		data = {};
		data[me.getName()] = '' + me.lookupReference('sqlTextField').getValue();
		return data;
	},

	getValue : function () {
		log('SQLOutputPanel getValue');
		var me = this;
		return me.lookupReference('sqlTextField').getValue();
	},

	setValue : function (value) {
		log('SQLOutputPanel setValue');
		var me = this;

		if (value == null) {
			return;
		} else {
			me.lookupReference('sqlTextField').setValue(value);
		}
	},

	getInputId : function () {
		log('SQLOutputPanel getInputId');
		return null;
	},
});

Ext.define('visualsqlquerybuilder.SQLFieldsGrid', {
	//requires: ['Ext.ux.CheckColumn'],
	extend : 'Ext.grid.Panel',
	alias : ['widget.sqlfieldsgrid'],
	id : 'SQLFieldsGrid',
	store : 'SQLFieldsStore',
	columnLines : true,
	plugins : [Ext.create('Ext.grid.plugin.CellEditing', {
			clicksToEdit : 1
		})],
	viewConfig : {
		listeners : {
			render : function (view) {
				this.dd = {};
				this.dd.dropZone = new Ext.grid.ViewDropZone({
						view : view,
						ddGroup : 'SQLTableGridDDGroup',
						handleNodeDrop : function (data, record, position) {
							// Was soll nach dem Drop passieren?
						}
					});
			},
			drop : function (node, data, dropRec, dropPosition) {
				// add new rows to the SQLFieldsGrid after a drop
				for (var i = 0, l = data.records.length; i < l; i++) {
					ux.vqbuilder.sqlSelect.addFieldRecord(data.records[i], false);
				}
			}
		}
	},
	columns : [{
			xtype : 'actioncolumn',
			menuDisabled : true,
			text : 'Action',
			width : 60,
			moveGridRow : function (grid, record, index, direction) {
				var store = grid.getStore();
				if (direction < 0) {
					index--;
					if (index < 0) {
						return;
					}
				} else {
					index++;
					if (index >= grid.getStore().getCount()) {
						return;
					}
				}
				// prepare manual syncing
				store.suspendAutoSync();
				// disable firing store events
				store.suspendEvents();
				// remove record and insert record at new index
				store.remove(record);
				store.insert(index, record);
				// enable firing store events
				store.resumeEvents();
				store.resumeAutoSync();
				// manual sync the store
				store.sync();
			},
			items : [{
					iconCls : 'x-fa fa-arrow-up',
					tooltip : 'Move Column Up',
					getClass : function (value, metadata, record) {
						var store,
						index;
						store = record.store;
						index = store.indexOf(record);
						if (index == 0) {
							return 'x-action-icon-disabled';
						} else {
							return 'x-grid-center-icon';
						}
					},
					handler : function (grid, rowIndex, colIndex) {
						var rec = grid.getStore().getAt(rowIndex);
						this.moveGridRow(grid, rec, rowIndex, -1);
					}
				}, {
					iconCls : 'x-fa fa-arrow-down',
					getClass : function (value, metadata, record) {
						var store,
						index;
						store = record.store;
						index = store.indexOf(record);
						if ((index + 1) == store.getCount()) {
							return 'x-action-icon-disabled';
						} else {
							return 'x-grid-center-icon';
						}
					},
					tooltip : 'Move Column Down',
					handler : function (grid, rowIndex, colIndex) {
						var rec = grid.getStore().getAt(rowIndex);
						this.moveGridRow(grid, rec, rowIndex, 1);
					}
				}, {
					iconCls : 'x-fa fa-trash-o',
					tooltip : 'Delete Column',
					handler : function (grid, rowIndex, colIndex) {
						var rec = grid.getStore().getAt(rowIndex),
						store,
						tableId,
						tableGrid,
						selectionModel,
						bDel = true;
						// rec contains column grid model, the one to remove
						// get tableId of original sqltable
						tableId = rec.get('extCmpId');
						// get the sql tables grid and its selection
						tableGrid = Ext.getCmp(tableId).down('gridpanel');
						selectionModel = tableGrid.getSelectionModel();
						Ext.Array.each(selectionModel.getSelection(), function (selection) {
							// deselect the selection wich corresponds to the column
							// we want to remove from the column grid
							if (rec.get('id') == selection.get('id')) {
								// deselect current selection
								// deselection will lead to removal, look for method deselect at the SQLTableGrid
								selectionModel.deselect(selection);
								bDel = false;
							}
						});
						if (bDel) {
							store = grid.getStore();
							store.remove(rec);
						}
					}
				}
			]
		}, {
			xtype : 'checkcolumn',
			sortable : false,
			text : 'Output',
			flex : 0.075,
			menuDisabled : true,
			dataIndex : 'output',
			align : 'center'
		}, {
			xtype : 'gridcolumn',
			text : 'Expression',
			sortable : false,
			menuDisabled : true,
			flex : 0.225,
			dataIndex : 'expression',
			editor : 'textfield'
		}, {
			xtype : 'gridcolumn',
			text : 'Aggregate',
			flex : 0.125,
			sortable : false,
			menuDisabled : true,
			dataIndex : 'aggregate',
			editor : Ext.create('Ext.form.ComboBox', {
				store :
				Ext.create('Ext.data.Store', {
					fields : ['ID', 'NOME'],
					data : [{
							"ID" : "SUM",
							"NOME" : "SOMMA"
						}, {
							"ID" : "COUNT",
							"NOME" : "CONTA"
						}, {
							"ID" : "AVG",
							"NOME" : "MEDIA"
						}, {
							"ID" : "MIN",
							"NOME" : "PRIMO"
						}, {
							"ID" : "MAX",
							"NOME" : "ULTMO"
						},
					]
				}),
				queryMode : 'local',
				displayField : 'NOME',
				valueField : 'ID'
			}),
		}, {
			xtype : 'gridcolumn',
			text : 'Alias',
			flex : 0.125,
			sortable : false,
			menuDisabled : true,
			dataIndex : 'alias',
			editor : 'textfield'
		}, {
			xtype : 'gridcolumn',
			text : 'Sort Type',
			flex : 0.125,
			sortable : false,
			menuDisabled : true,
			dataIndex : 'sorttype',
			editor : Ext.create('Ext.form.ComboBox', {
				store :
				Ext.create('Ext.data.Store', {
					fields : ['ID', 'NOME'],
					data : [{
							"ID" : "ASC",
							"NOME" : "ASC"
						}, {
							"ID" : "DESC",
							"NOME" : "DESC"
						},
					]
				}),
				queryMode : 'local',
				displayField : 'NOME',
				valueField : 'ID'
			}),
		}, {
			xtype : 'gridcolumn',
			text : 'Sort Order',
			flex : 0.125,
			sortable : false,
			menuDisabled : true,
			dataIndex : 'sortorder',
			editor : 'textfield'
		}, {
			xtype : 'checkcolumn',
			text : 'Grouping',
			flex : 0.075,
			sortable : false,
			menuDisabled : true,
			dataIndex : 'grouping',
			align : 'center'
		}, {
			xtype : 'gridcolumn',
			text : 'Criteria',
			flex : 0.125,
			sortable : false,
			menuDisabled : true,
			dataIndex : 'criteria',
			editor : 'textfield'
		}
	],
	initComponent : function () {
		log('SQLFieldsGrid initComponent');
		this.callParent(arguments);
	}
});

Ext.define('visualsqlquerybuilder.SQLTableTree', {
	extend : 'Ext.tree.Panel',
	alias : ['widget.sqltabletree'],
	id : 'SQLTableTree',
	listeners : {
		afterrender : function () {
			this.initTreeDragZone();
		},
		itemdblclick : function (view, record, el, index, event) {
			var sqlTablePanel;
			// add a sqltable to the sqlTablePanel component
			sqlTablePanel = Ext.getCmp('SQLTablePanel');
			sqlTablePanel.add({
				xtype : 'sqltable',
				constrain : true,
				text : record.get('originName'),
				title : record.get('alias'),
				titlealias : record.get('alias'),
			}).show();

		}
	},
	initTreeDragZone : function () {
		log('SQLTableTree initTreeDragZone');
		// init tree view as a ViewDragZone
		this.view.dragZone = new Ext.tree.ViewDragZone({
				view : this.view,
				ddGroup : 'sqlDDGroup',
				dragText : '{0} Aggiunta Tabella{1}',
				repairHighlightColor : 'c3daf9',
				repairHighlight : Ext.enableFx
			});
	},
	initComponent : function () {
		log('SQLTableTree initComponent');

		this.store = Ext.create('Ext.data.TreeStore', {
				root : {
					text : 'Tables',
					expanded : true
				},
				proxy : {
					type : 'ajax',
					url : '/includes/io/dictionarydbsql.php?method=getTables&datasourcedbname=' + VisualSQLdatasourcedbname,
					//url: '/io/dictionaryouvsql.php?method=getTables&datasourcedbname=' + VisualSQLdatasourcedbname,
				}
			});

		this.callParent(arguments);
	}
});

Ext.define('visualsqlquerybuilder.SQLTableGrid', {
	extend : 'Ext.grid.Panel',
	alias : ['widget.sqltablegrid'],
	border : false,
	hideHeaders : true,
	multiSelect : false,
	viewConfig : {
		listeners : {
			bodyscroll : function () {
				var scrollOffset,
				sqlTable;
				// the bodyscroll event of the view was fired
				// get scroll information
				scrollOffset = this.el.getScroll();
				// get the parent sqltable
				sqlTable = this.up('sqltable');
				// change shadowSprites scrollTop property
				sqlTable.shadowSprite.scrollTop = scrollOffset.top;

				/* redraw all connections to reflect scroll action
				var sqlTablePanel = Ext.get('SQLTablePanel').component;
				var VisualSQLQueryBuilder = Ext.get('VisualSQLQueryBuilder').component;
				var MySurface = sqlTablePanel.down('draw').getSurface();
				MySurface.removeAll();
				 */
				for (var i = ux.vqbuilder.connections.length; i--; ) {
					sqlTable.connection(ux.vqbuilder.connections[i]);
				}
			},
			render : function (view) {
				this.dd = {};
				// init the view as a DragZone
				this.dd.dragZone = new Ext.view.DragZone({
						view : view,
						ddGroup : 'SQLTableGridDDGroup',
						dragText : '{0} selected table column{1}',
						onInitDrag : function (x, y) {
							log('onInitDrag');
							var me = this;
							var data = me.dragData;
							var view = data.view;
							var selectionModel = view.getSelectionModel();
							var record = view.getRecord(data.item);
							var e = data.event;
							data.records = [record];

							log('datarec' + data.records);
							//me.ddel.update(me.getDragText());
							//me.proxy.update(me.ddel.dom);
							me.onStartDrag(x, y);
							return true;
						}
					});
				// init the view as a DropZone
				this.dd.dropZone = new Ext.grid.ViewDropZone({
						view : view,
						ddGroup : 'SQLTableGridDDGroup',
						handleNodeDrop : function (data, record, position) {
							// Was soll nach dem Drop passieren?
							log('handleNodeDrop');
						},
						onNodeOver : function (node, dragZone, e, data) {
							log('onNodeOver');
							var me = this,
							view = me.view,
							pos = me.getPosition(e, node),
							overRecord = view.getRecord(node),
							draggingRecords = data.records;

							if (!Ext.Array.contains(data.records, me.view.getRecord(node))) {
								if (!Ext.Array.contains(draggingRecords, overRecord) && data.records[0].get('field') != '*') {
									me.valid = true;
									// valid drop target
									// todo show drop invitation
								} else {
									// invalid drop target
									me.valid = false;
								}
							}
							return me.valid ? me.dropAllowed : me.dropNotAllowed;
						},
						onContainerOver : function (dd, e, data) {
							log('onContainerOver');
							var me = this;
							// invalid drop target
							me.valid = false;
							return me.dropNotAllowed;
						}
					});
			},
			drag : function (id) {
				var me = this;
				log('drag gridpanel');
			},
			startDrag : function (id) {
				var me = this;
				log('startdrag gridpanel');
			},
			drop : function (node, data, dropRec, dropPosition) {
				log('drop');

				//DAFARE MENU TASTO DX SU JOIN
				var showJoinCM = function (event, el) {
					// stop the browsers event bubbling
					event.stopEvent();
					// create context menu
					var cm = Ext.create('Ext.menu.Menu', {
							items : [{
									text : 'Edit',
									iconCls : 'x-fa fa-pencil-square',
									handler : Ext.Function.bind(function () {}, this)
								}, {
									text : 'Remove',
									iconCls : 'x-fa fa-trash-o',
									handler : Ext.Function.bind(function () {
										// remove any connection lines from surface and from array ux.vqbuilder.connections
										ux.vqbuilder.connections = Ext.Array.filter(ux.vqbuilder.connections, function (connection) {
												var bRemove = true;
												if (this.uuid == connection.uuid) {
													this.line.remove();
													this.bgLine.remove();
													this.miniLine1.remove();
													this.miniLine2.remove();
													bRemove = false;
												}
												return bRemove;
											}, this);
										ux.vqbuilder.sqlSelect.removeJoinById(this.uuid);
									}, this)
								}, {
									text : 'Close',
									iconCls : 'x-fa fa-sign-out',
									handler : Ext.emptyFn
								}
							]
						});
					// show the contextmenu next to current mouse position
					cm.showAt(event.getXY());
				};

				var sqlTable1 = data.view.up('window');
				sqlTable1.shadowSprite.bConnections = true;

				//sqlTable2 = Ext.getCmp(node.boundView).up('window');
				//var sqlTable2 = Ext.getCmp(node.parentElement.parentNode.parentElement.id);
				//sqlTable2 = sqlTable2.up('window');

				var sqlTable2 = Ext.getCmp(this.id).up('window')
					sqlTable2.shadowSprite.bConnections = true;

				var dropTable = ux.vqbuilder.sqlSelect.getTableById(sqlTable1.tableId);
				var targetTable = ux.vqbuilder.sqlSelect.getTableById(sqlTable2.tableId);

				aBBPos = [data.item.dataset.recordindex, node.dataset.recordindex];
				var connection = sqlTable2.connection(sqlTable1.shadowSprite, sqlTable2.shadowSprite, "#000", aBBPos);

				sqlTable1.connectionUUIDs.push(connection.uuid);
				sqlTable2.connectionUUIDs.push(connection.uuid);
				ux.vqbuilder.connections.push(connection);

				//DAFARE MENU TASTO DX SU JOIN
				// bgLine is white(invisble) and its stroke-width is 10
				// so it is easier to capture the dblclick event
				connection.bgLine.on('contextmenu', showJoinCM, connection);
				// line is black and its stroke-width is 1
				connection.line.on('contextmenu', showJoinCM, connection);

				// create an instance of the join model
				var join = Ext.create('visualsqlquerybuilder.SQLJoin');
				// set join id
				join.set('id', connection.uuid);

				// sqlTable1 is the left table
				join.set('leftTableId', sqlTable1.tableId);
				join.set('leftTableField', data.records[0].data.field);

				// sqlTable2 is the right table
				join.set('rightTableId', sqlTable2.tableId);
				//join.set('rightTableField', sqlTable2.down('grid').store.getAt(node.viewIndex).get('field'));
				join.set('rightTableField', sqlTable2.down('grid').store.getAt(this.all.indexOf(node)).get('field'));

				// set the default join type to INNER
				join.set('joinType', 'INNER');
				var joinCondition = '';
				if (dropTable.get('tableAlias') != '') {
					joinCondition = joinCondition + dropTable.get('tableAlias') + '.' + join.get('leftTableField') + '=';
				} else {
					joinCondition = joinCondition + dropTable.get('tableName') + '.' + join.get('leftTableField') + '=';
				}
				if (targetTable.get('tableAlias') != '') {
					joinCondition = joinCondition + targetTable.get('tableAlias') + '.' + join.get('rightTableField');
				} else {
					joinCondition = joinCondition + targetTable.get('tableName') + '.' + join.get('rightTableField');
				}
				join.set('joinCondition', joinCondition);
				ux.vqbuilder.sqlSelect.addJoin(join);
			}
		},
	},
	initComponent : function () {
		log('SQLTableGrid initComponent');

		this.columns = [{
				xtype : 'gridcolumn',
				width : 16,
				dataIndex : 'key',
				renderer : function (val, meta, model) {
					if (val == 'PRI') {
						meta.style = 'background-image:url(/includes/dynamic/resources/images/key.gif) !important;background-position:2px 3px;background-repeat:no-repeat;';
					}
					if (val == 'MUL') {
						meta.style = 'background-image:url(/includes/dynamic/resources/images/mul.gif) !important;background-position:2px 3px;background-repeat:no-repeat;';
						var joinCondition = model.get('foreign');
						log('CHIAVE TROVATA' + joinCondition);
						if (joinCondition != '') {
							//DAFARE
							log('FOREIGN TROVATA' + joinCondition);
							VisualSQLJoinInCoda = joinCondition;
						}
					}
					return '&nbsp;';
				}
			}, {
				xtype : 'gridcolumn',
				flex : 1,
				dataIndex : 'field',
				renderer : function (val, meta, model) {
					if (model.get('alias') != '') {
						if (model.get('key') == 'PRI') {
							return '<span style="font-weight: bold;">' + model.get('alias') + '</span>&nbsp;&nbsp;<span style="color:#aaa;">(' + val + ')</span>';
						}
						return model.get('alias') + '&nbsp;&nbsp;<span style="color:#999;">(' + val + ')</span>';
					} else {
						if (model.get('key') == 'PRI') {
							return '<span style="font-weight: bold;">' + val + '</span>&nbsp;&nbsp;<span style="color:#aaa;">' + model.get('type') + '</span>';
						}
						return val + '&nbsp;&nbsp;<span style="color:#999;">' + model.get('type') + '</span>';

					}
				}
			}
		];

		this.selModel = Ext.create('Ext.selection.CheckboxModel', {
				mode : 'SIMPLE',
				checkOnly : true,
				listeners : {
					select : function (selModel, data) {
						// add new rows to the SQLFieldsGrid after a selection change
						ux.vqbuilder.sqlSelect.addFieldRecord(data, true);
					},
					deselect : function (selModel, data) {
						var store,
						model;
						// remove row from SQLFieldsGrid after deselection
						ux.vqbuilder.sqlSelect.removeFieldById(data.get('id'));
					}
				}
			});

		log('SQLTableGrid initComponent END');
		this.callParent(arguments);
		log('SQLTableGrid initComponent END2');
	}
});

Ext.define('visualsqlquerybuilder.SQLTable', {
	extend : 'Ext.window.Window',
	alias : ['widget.sqltable'],
	minWidth : 120,
	cascadeOnFirstShow : 20,
	height : 180,
	width : 200,
	titlealias : '',
	title : '',
	text : '',
	shadowSprite : {},
	tableId : '',
	connectionUUIDs : [],
	bMouseDown : false,
	layout : {
		type : 'fit'
	},
	closable : true,
	listeners : {
		show : function () {
			this.initSQLTable();
		},
		beforeclose : function () {
			this.closeSQLTable();
		},
		click : {
			element : 'el', //bind to the underlying el property on the panel
			fn : function (object, selectedIndex, node, event) {

				//DAFARE INUTILE DD LINK
				log('clickonobj');
				var ObjParent = selectedIndex;
				var ObjParentId = '';
				var CurrentObjectExt = null;
				while (true) {
					if (ObjParent.id != '') {
						ObjParentId = ObjParent.id;
						CurrentObjectExt = Ext.get(ObjParentId).component;
						if (CurrentObjectExt !== undefined) {
							break;
						}
					}
					ObjParent = ObjParent.parentNode;
				}
				/*
				var overrides = {
				endDrag: function() {
				log('endDrag');
				//var CurrentObjectExt = DesignPanel.getForm().findField(CurrentObjectName)
				//var CurrentObjectExt = Ext.get(CurrentObjectId).component;
				//var CurrentObjectName = CurrentObjectExt.name;
				}
				}

				//dragadrop
				var dd = Ext.create('Ext.dd.DD', CurrentObjectExt, 'myDDGroup', {
				isTarget  : false
				});
				Ext.apply(dd, overrides);
				 */
			}
		},
	},
	closeSQLTable : function () {
		log('SQLTable closeSQLTable' + this.text);
		// remove fields / columns from sqlFieldsStore
		ux.vqbuilder.sqlSelect.removeFieldsByTableId(this.tableId);

		// remove table from sqlTables store inside ux.vqbuilder.sqlSelect
		ux.vqbuilder.sqlSelect.removeTableById(this.tableId);

		// unregister mousedown event
		this.getHeader().el.un('mousedown', this.regStartDrag, this);
		// unregister mousemove event
		Ext.EventManager.un(document, 'mousemove', this.moveWindow, this);

		//DAFARE
		// remove sprite from surface
		var sqlTablePanel = Ext.get('SQLTablePanel').component;
		var VisualSQLQueryBuilder = Ext.get('VisualSQLQueryBuilder').component;
		var MySurface = sqlTablePanel.down('draw').getSurface()
			MySurface.remove(this.shadowSprite, false);
		//MySurface.renderFrame();
		//Ext.getCmp('SQLTablePanel').down('draw').getSurface().remove(this.shadowSprite, false);

		//DAFARE
		// remove any connection lines from surface and from array ux.vqbuilder.connections
		ux.vqbuilder.connections = Ext.Array.filter(ux.vqbuilder.connections, function (connection) {
				var bRemove = true;
				for (var j = 0, l = this.connectionUUIDs.length; j < l; j++) {
					if (connection.uuid == this.connectionUUIDs[j]) {
						connection.line.remove();
						connection.bgLine.remove();
						connection.miniLine1.remove();
						connection.miniLine2.remove();
						bRemove = false;
					}
				}
				return bRemove;
			}, this);

		//REMOVE STORE
		Ext.StoreMgr.lookup('SQLTS' + this.text).destroy();

	},
	initSQLTable : function () {
		log('SQLTable initSQLTable');
		// get the main sqlTablePanel
		var me = this;
		//var sqlTablePanel = Ext.getCmp('SQLTablePanel');
		var sqlTablePanel = Ext.get('SQLTablePanel').component;
		var VisualSQLQueryBuilder = Ext.get('VisualSQLQueryBuilder').component;
		var MySurface = sqlTablePanel.down('draw').getSurface()

			// get the main sqlTablePanel position
			var xyParentPos = sqlTablePanel.el.getXY();

		// get position of the previously added sqltable
		var xyChildPos = this.el.getXY();

		// get the size of the previously added sqltable
		var childSize = this.el.getSize();

		// create a sprite of type rectangle and set its position and size
		// to position and size of the the sqltable
		var MySprites = [];
		var MySprite = Ext.create('visualsqlquerybuilder.SQLTableSprite', {
				//type: 'circle',
				type : 'rect',
				//fillStyle: '#79BB3F',
				stroke : '#fff',
				height : childSize.height - 4,
				width : childSize.width - 4,
				//r: childSize.width - 4,
				x : xyChildPos[0] - xyParentPos[0] + 2,
				y : xyChildPos[1] - xyParentPos[1] + 2,
				scrollTop : 0
			});
		/*
		var MySprite = {
		type: 'circle',
		fillStyle: '#79BB3F',
		x: xyChildPos[0] - xyParentPos[0] + 2,
		y: xyChildPos[1] - xyParentPos[1] + 2,
		};
		 */
		MySprites.push(MySprite);
		// add the sprite to the surface of the sqlTablePanel
		//DAFARE DRAW
		//this.shadowSprite = sqlTablePanel.down('draw').surface.add(sprite).show(true);
		MySurface.add(MySprites);
		this.shadowSprite = MySprite;
		MySurface.renderFrame();

		// handle resizeing of sqltabel
		this.resizer.on('resize', function (resizer, width, height, event) {
			this.shadowSprite.setAttributes({
				width : width - 6,
				height : height - 6
			}, true);
			// also move the associated connections
			for (var i = ux.vqbuilder.connections.length; i--; ) {
				this.connection(ux.vqbuilder.connections[i]);
			}
		}, this);

		this.getHeader().el.on('contextmenu', this.showSQLTableCM, this);
		this.getHeader().el.on('dblclick', this.showTableAliasEditForm, this);
		this.getHeader().origValue = '';

		// register a function for the mousedown event on the previously added sqltable and bind to this scope
		this.getHeader().el.on('mousedown', this.regStartDrag, this);

		// register method this.moveWindow for the mousemove event on the document and bind to this scope
		Ext.EventManager.on(document, 'mousemove', this.moveWindow, this);

		// register a function for the mouseup event on the document and add the this scope
		Ext.EventManager.on(document, 'mouseup', function () {
			// save the mousedown state
			//this.bMouseDown = false;
		}, this);

		/*
		// register a function for the mousedown event on the previously added sqltable and bind to this scope
		this.getHeader().el.on('mousedown', this.regStartDrag, this);
		// register a function for the mouseup event on the document and add the this scope
		Ext.EventManager.on(document, 'mouseup', function(){
		// save the mousedown state
		this.bMouseDown = false;
		log (this.getXY()[0] + ' ' + this.getXY()[1]);
		// get relative x and y values (offset)
		//var relPosMovement = this.getOffset('point');
		var relPosMovement = this.getXY();
		// move the sprite to the position of the window
		this.shadowSprite.onDrag(relPosMovement);
		// check if the sprite has any connections
		if (this.shadowSprite.bConnections) {
		// also move the associated connections
		for (var i = ux.vqbuilder.connections.length; i--;) {
		this.connection(ux.vqbuilder.connections[i]);
		}
		}
		}, this);
		 */
		log('init tab' + this.text);
	},
	showSQLTableCM : function (event, el) {
		log('SQLTable showSQLTableCM');
		var cm;
		// stop the browsers event bubbling
		event.stopEvent();
		// create context menu
		cm = Ext.create('Ext.menu.Menu', {
				items : [{
						text : 'Add/Edit Alias',
						iconCls : 'x-fa fa-pencil-square',
						handler : Ext.Function.bind(function () {
							this.showTableAliasEditForm();
						}, this)
					}, {
						text : 'Remove Table',
						iconCls : 'x-fa fa-trash-o',
						handler : Ext.Function.bind(function () {
							// remove the sqltable
							this.close();
						}, this)
					}, {
						text : 'Close Menu',
						iconCls : 'x-fa fa-sign-out',
						handler : Ext.emptyFn
					}
				]
			});
		// show the contextmenu next to current mouse position
		cm.showAt(event.getXY());
	},
	showTableAliasEditForm : function (event, el) {
		log('SQLTable showTableAliasEditForm');
		var table,
		header,
		title,
		titleId;
		table = ux.vqbuilder.sqlSelect.getTableById(this.tableId);
		header = this.getHeader();
		titleId = '#' + header.getId() + '_hd';
		title = this.down(titleId);
		header.remove(title);
		header.insert(0, [{
					xtype : 'textfield',
					flex : 0.95,
					parentCmp : header,
					parentTableModel : table,
					initComponent : function () {

						this.setValue(this.parentTableModel.get('tableAlias'));

						this.on('render', function (field, event) {
							// set focus to the textfield Benutzerkennung
							field.focus(true, 200);
						}, this);

						this.on('specialkey', function (field, event) {
							if (event.getKey() == event.ENTER) {
								if (field.getValue() != this.parentCmp.origValue) {
									this.parentTableModel.set('tableAlias', field.getValue());
									this.parentCmp.origValue = field.getValue();
								}
								this.removeTextField();
								this.addTitle();
							}
						}, this);

						this.on('blur', function (field, event) {
							if (field.getValue() != this.parentCmp.origValue) {
								this.parentTableModel.set('tableAlias', field.getValue());
								this.parentCmp.origValue = field.getValue();
							}
							this.removeTextField();
							this.addTitle();
						}, this);

						this.callParent(arguments);
					},
					removeTextField : function () {
						var next;
						next = this.next();
						this.parentCmp.remove(next);
						this.parentCmp.remove(this);
					},
					addTitle : function () {
						var titleText;
						if (this.parentTableModel.get('tableAlias') != '') {
							titleText = this.parentTableModel.get('tableAlias') + ' ( ' + this.parentTableModel.get('tableName') + ' )';
						} else {
							titleText = this.parentTableModel.get('tableName');
						}
						this.parentCmp.insert(0, {
							xtype : 'component',
							ariaRole : 'heading',
							focusable : false,
							noWrap : true,
							flex : 1,
							id : this.parentCmp.id + '_hd',
							style : 'text-align:' + this.parentCmp.titleAlign,
							cls : this.parentCmp.baseCls + '-text-container',
							renderTpl : this.parentCmp.getTpl('headingTpl'),
							renderData : {
								title : titleText,
								cls : this.parentCmp.baseCls,
								ui : this.parentCmp.ui
							},
							childEls : ['textEl']
						});
					}
				}, {
					xtype : 'component',
					flex : 0.05
				}
			]);
	},
	regStartDrag : function () {
		log('SQLTable regStartDrag');
		// save the mousedown state
		this.bMouseDown = true;
		// start the drag of the sprite
		this.shadowSprite.startDrag(this.getId());
	},
	moveWindow : function (event, domEl, opt) {
		var relPosMovement;
		// check mousedown
		if (this.bMouseDown) {
			this.bMouseDown = false;
			// get relative x and y values (offset)
			relPosMovement = this.getOffset('point');
			// move the sprite to the position of the window
			this.shadowSprite.onDrag(relPosMovement);
			// check if the sprite has any connections
			if (this.shadowSprite.bConnections) {
				// also move the associated connections
				for (var i = ux.vqbuilder.connections.length; i--; ) {
					this.connection(ux.vqbuilder.connections[i]);
				}
			}
		}
	},
	getLeftRightCoordinates : function (obj1, obj2, aBBPos) {
		log('SQLTable getLeftRightCoordinates');

		// BoundingBox Koordinaten für beide Sprites abrufen
		var columHeight = 33,
		headerHeight = 46;

		var bb1 = obj1.getBBox();
		if (obj1.attr.x == undefined)
			obj1.attr.x = obj1.x;
		if (obj1.attr.y == undefined)
			obj1.attr.y = obj1.y;
		// y Wert für connection Points auf der linken und rechten Seite von bb1
		bb1.x = obj1.attr.x;
		bb1.y = obj1.attr.y;
		bb1.width = obj1.width;
		bb1.height = obj1.height;
		bb1.pY = bb1.y + headerHeight + ((aBBPos[0]) * columHeight) + (columHeight / 2) - obj1.scrollTop;
		//bb1.pY = obj1.y + headerHeight + ((aBBPos[0] - 1) * columHeight) + (columHeight / 2) - obj1.scrollTop;

		var bb2 = obj2.getBBox();
		if (obj2.attr.x == undefined)
			obj2.attr.x = obj2.x;
		if (obj2.attr.y == undefined)
			obj2.attr.y = obj2.y;
		// y Wert für connection Points auf der linken und rechten Seite von bb2
		bb2.x = obj2.attr.x - obj2.width;
		bb2.y = obj2.attr.y;
		bb2.width = obj2.width;
		bb2.height = obj2.height;
		bb2.pY = bb2.y + headerHeight + ((aBBPos[1]) * columHeight) + (columHeight / 2) - obj2.scrollTop;
		//bb2.pY = obj2.y + headerHeight + ((aBBPos[0] - 1) * columHeight) + (columHeight / 2) - obj2.scrollTop;

		var p = [];
		// code für linke boundingBox
		if (bb1.pY > (bb1.y + 4) && bb1.pY < (bb1.y + bb1.height - 4)) {
			p.push({
				x : bb1.x - 1, // Punkt auf linker Seite auf Höhe der verknüpften Spalte
				y : bb1.pY
			});
			p.push({
				x : bb1.x + bb1.width + 1, // Punkt auf rechter Seite auf Höhe der verknüpften Spalte
				y : bb1.pY
			});
		} else {
			if (bb1.pY < (bb1.y + 4)) {
				p.push({
					x : bb1.x - 1, // Punkt auf linker Seite max. obere Position
					y : bb1.y + 4
				});
				p.push({
					x : bb1.x + bb1.width + 1, // Punkt auf rechter Seite max. obere Position
					y : bb1.y + 4
				});
			} else {
				p.push({
					x : bb1.x - 1, // Punkt auf linker Seite max. untere Position
					y : bb1.y + bb1.height - 4
				});
				p.push({
					x : bb1.x + bb1.width + 1, // Punkt auf rechter Seite max. untere Position
					y : bb1.y + bb1.height - 4
				});
			};
		};

		//  code für rechte boundingBox
		if (bb2.pY > (bb2.y + 4) && bb2.pY < (bb2.y + bb2.height - 4)) {
			p.push({
				x : bb2.x - 1, // Punkt auf linker Seite auf Höhe der verknüpften Spalte
				y : bb2.pY
			});
			p.push({
				x : bb2.x + bb2.width + 1, // Punkt auf rechter Seite auf Höhe der verknüpften Spalte
				y : bb2.pY
			});
		} else {
			if (bb2.pY < (bb2.y + 4)) {
				p.push({
					x : bb2.x - 1, // Punkt auf linker Seite max. obere Position
					y : bb2.y + 4
				});
				p.push({
					x : bb2.x + bb2.width + 1, // Punkt auf rechter Seite max. obere Position
					y : bb2.y + 4
				});
			} else {
				p.push({
					x : bb2.x - 1, // Punkt auf linker Seite max. untere Position
					y : bb2.y + bb2.height - 4
				});
				p.push({
					x : bb2.x + bb2.width + 1, // Punkt auf rechter Seite max. untere Position
					y : bb2.y + bb2.height - 4
				});
			}
		};

		// Schleife über die Punkte der ersten BoundingBox
		var leftBoxConnectionPoint,
		rightBoxConnectionPoint;
		var dx;
		for (var i = 0; i < 2; i++) {
			// Schleife über die Punkte der zweiten BoundingBox
			for (var j = 2; j < 4; j++) {
				// Berechnung der Offsets zwischen den jeweils vier Punkten beider BoundingBoxes
				dx = Math.abs(p[i].x - p[j].x),
				dy = Math.abs(p[i].y - p[j].y);
				// bb1 links mit bb2 rechts
				if (((i == 0 && j == 3) && dx < Math.abs(p[1].x - p[2].x)) || ((i == 1 && j == 2) && dx < Math.abs(p[0].x - p[3].x))) {
					leftBoxConnectionPoint = p[i];
					rightBoxConnectionPoint = p[j];
				}
			}
		};

		//dafare imposizione
		leftBoxConnectionPoint = p[1];
		rightBoxConnectionPoint = p[3];

		return {
			leftBoxConnectionPoint : leftBoxConnectionPoint,
			rightBoxConnectionPoint : rightBoxConnectionPoint
		};

	},
	connection : function (obj1, obj2, line, aBBPos) {
		log('SQLTable connection');

		//inverter line JOIN LEFT RIGHT?
		if (obj1.line && obj1.from && obj1.to && obj1.aBBPos) {
			line = obj1;
			obj1 = line.from;
			obj2 = line.to;
			aBBPos = line.aBBPos;
		}

		// set reference to the wright surface
		var sqlTablePanel = Ext.get('SQLTablePanel').component;
		var VisualSQLQueryBuilder = Ext.get('VisualSQLQueryBuilder').component;
		var MySurface = sqlTablePanel.down('draw').getSurface();
		// var MySurface = obj1.getSurface();

		// get coordinates for the left and right box
		var LeftRightCoordinates = this.getLeftRightCoordinates(obj1, obj2, aBBPos);

		var MyColor = typeof line == "string" ? line : "#000";

		var line1,
		line2;
		// check if the LeftBox is still on the left side or not
		if (LeftRightCoordinates.leftBoxConnectionPoint.x - LeftRightCoordinates.rightBoxConnectionPoint.x < 0) {
			line1 = 12;
			line2 = 12;
		} else {
			line1 = -12;
			line2 = -12;
		}

		// define the path between the left and the right box
		var MyPath = ["M", LeftRightCoordinates.leftBoxConnectionPoint.x,
			LeftRightCoordinates.leftBoxConnectionPoint.y, "H",
			LeftRightCoordinates.leftBoxConnectionPoint.x + line1, "L",
			LeftRightCoordinates.rightBoxConnectionPoint.x - line2, LeftRightCoordinates.rightBoxConnectionPoint.y, "H",
			LeftRightCoordinates.rightBoxConnectionPoint.x].join(",");

		var miniLine1 = ["M", LeftRightCoordinates.leftBoxConnectionPoint.x, LeftRightCoordinates.leftBoxConnectionPoint.y, "H", LeftRightCoordinates.leftBoxConnectionPoint.x + line1].join(",");

		var miniLine2 = ["M", LeftRightCoordinates.rightBoxConnectionPoint.x - line2, LeftRightCoordinates.rightBoxConnectionPoint.y, "H", LeftRightCoordinates.rightBoxConnectionPoint.x].join(",");

		//check if it is a new connection or not
		if (line && line.line) {
			// old connection, only change path
			var MyminiLine1 = Ext.create('Ext.draw.Sprite', {
					type : 'path',
					path : miniLine1,
					stroke : MyColor,
					fill : 'none',
					'stroke-width' : 2
				});
			var Myline = Ext.create('Ext.draw.Sprite', {
					type : 'path',
					path : MyPath,
					stroke : MyColor,
					fill : 'none',
					'stroke-width' : 1
				});
			var MybgLine = Ext.create('Ext.draw.Sprite', {
					type : 'path',
					path : MyPath,
					opacity : 0,
					stroke : '#fff',
					fill : 'none',
					'stroke-width' : 10
				});
			var MyminiLine2 = Ext.create('Ext.draw.Sprite', {
					type : 'path',
					path : miniLine2,
					stroke : MyColor,
					fill : 'none',
					'stroke-width' : 2
				});

			var MySprites = [];
			MySprites.push(MyminiLine1);
			MySprites.push(Myline);
			MySprites.push(MybgLine);
			MySprites.push(MyminiLine2);

			//var OldMySprite = MySurface.down('uuid=' . line.uuid).component();
			MySurface.remove(line.line);
			MySurface.remove(line.bgLine);
			MySurface.remove(line.miniLine1);
			MySurface.remove(line.miniLine2);
			MySurface.add(MySprites);

			MySurface.renderFrame();

			line.line = Myline;
			line.bgLine = MybgLine;
			line.miniLine1 = MyminiLine1;
			line.miniLine2 = MyminiLine2;

		} else {
			// new connection
			var MyminiLine1 = Ext.create('Ext.draw.Sprite', {
					type : 'path',
					path : miniLine1,
					stroke : MyColor,
					fill : 'none',
					'stroke-width' : 2
				});
			var Myline = Ext.create('Ext.draw.Sprite', {
					type : 'path',
					path : MyPath,
					stroke : MyColor,
					fill : 'none',
					'stroke-width' : 1
				});
			var MybgLine = Ext.create('Ext.draw.Sprite', {
					type : 'path',
					path : MyPath,
					opacity : 0,
					stroke : '#fff',
					fill : 'none',
					'stroke-width' : 10
				});
			var MyminiLine2 = Ext.create('Ext.draw.Sprite', {
					type : 'path',
					path : miniLine2,
					stroke : MyColor,
					fill : 'none',
					'stroke-width' : 2
				});

			var MySprites = [];
			MySprites.push(MyminiLine1);
			MySprites.push(Myline);
			MySprites.push(MybgLine);
			MySprites.push(MyminiLine2);

			MySurface.add(MySprites);
			MySurface.renderFrame();

			return {
				line : Myline,
				miniLine1 : MyminiLine1,
				miniLine2 : MyminiLine2,
				bgLine : MybgLine,
				from : obj1,
				to : obj2,
				aBBPos : aBBPos,
				uuid : this.createUUID()
			};
		}
	},
	initComponent : function () {
		log('SQLTable initComponent');
		// asign a uuid to the window, this builds relationship with sqlTable
		this.tableId = this.createUUID();
		this.id = 'SQLTW' + this.text;
		this.name = 'SQLTW' + this.text;
		var store = Ext.create('Ext.data.Store', {
				autoLoad : true,
				async : false,
				id : 'SQLTS' + this.text,
				fields : [{
						name : 'id',
						type : 'string'
					}, {
						name : 'tableName',
						type : 'string'
					}, {
						name : 'tableId',
						type : 'string',
						defaultValue : this.tableId
					}, {
						name : 'field',
						type : 'string'
					}, {
						name : 'extCmpId',
						type : 'string',
						defaultValue : this.id
					}, {
						name : 'type',
						type : 'string'
					}, {
						name : 'null',
						type : 'string'
					}, {
						name : 'key',
						type : 'string'
					}, {
						name : 'default',
						type : 'string'
					}, {
						name : 'extra',
						type : 'string'
					}
				],
				proxy : {
					type : 'ajax',
					//url: '/io/dictionaryouvsql.php?method=getTableInfo&datasourcedbname=' + VisualSQLdatasourcedbname,
					url : '/includes/io/dictionarydbsql.php?method=getTableInfo&datasourcedbname=' + VisualSQLdatasourcedbname,
					extraParams : {
						objname : this.text,
						objtype : '',
					},
					reader : {
						type : 'json'
					}
				},
				listeners : {
					load : function () {}
				},
			});
		// add sql table to ux.vqbuilder.sqlSelect tables store
		// also asign same id as stores uuid
		var tableModel = Ext.create('visualsqlquerybuilder.SQLTableModel', {
				id : this.tableId,
				tableName : this.text,
				tableAlias : this.titlealias,
				extra : this.extra
			});
		ux.vqbuilder.sqlSelect.addTable(tableModel);

		this.items = [{
				xtype : 'sqltablegrid',
				store : store
			}
		];

		this.callParent(arguments);
		log('created tab' + this.text);
	},
	getOffset : function (constrain) {
		log('SQLTable getOffset');
		var xy = this.dd.getXY(constrain),
		s = this.dd.startXY;
		// return the the difference between the current and the drag&drop start position
		return [xy[0] - s[0], xy[1] - s[1]];
	},
	createUUID : function () {
		log('SQLTable createUUID');
		// http://www.ietf.org/rfc/rfc4122.txt
		var s = [];
		var hexDigits = "0123456789abcdef";
		for (var i = 0; i < 36; i++) {
			s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1);
		}
		s[14] = "4"; // bits 12-15 of the time_hi_and_version field to 0010
		s[19] = hexDigits.substr((s[19] & 0x3) | 0x8, 1); // bits 6-7 of the clock_seq_hi_and_reserved to 01
		s[8] = s[13] = s[18] = s[23] = "-";

		var uuid = s.join("");
		return uuid;
	},
	beforeShow : function () {
		log('SQLTable beforeShow');
		var aWin,
		prev,
		o;
		// cascading window positions
		if (this.cascadeOnFirstShow) {
			o = (typeof this.cascadeOnFirstShow == 'number') ? this.cascadeOnFirstShow : 20;
			// get all instances from xtype sqltable
			aWin = Ext.ComponentQuery.query('sqltable');
			// start position if there is only one table
			if (aWin.length == 1) {
				this.x = o;
				this.y = o;
			} else {
				// loop through all instances from xtype sqltable
				for (var i = 0, l = aWin.length; i < l; i++) {
					if (aWin[i] == this) {
						if (prev) {
							this.x = prev.x + o;
							this.y = prev.y + o;
						}
					}
					if (aWin[i].isVisible()) {
						prev = aWin[i];
					}
				}
			}
			this.setPosition(this.x, this.y);
		}
	}
});


Ext.define('VisualSQLQueryTest', {
	extend : 'dynamicgrid',
	alias : 'widget.sqltest',
	height : 600,
	width : 900,
	name : 'VisualSQLQueryTest',
	title : 'Visual SQL Query Test',
	datasourcetype : '',
	datasource : '',
	valueField : 'ID',
	datasourcedbname : '',
	height : 200,
	initComponent : function () {
		log('VisualSQLQueryTest initComponent');
		var me = this;
		VisualSQLdatasourcedbname = me.datasourcedbname;

		var DS_VisualSQLQueryTest = Ext.create('Ext.data.Store', {
				storeId : "DS_VisualSQLQueryTest",
				autoLoad : true, //(carica in avvio)
				fields : [],
				async : false,
				columns : [],
				async : false,
				proxy : {
					type : 'ajax',
					url : '/includes/io/DataRead.php',
					params : {
						datasourcetype : me.datasourcetype,
						datasource : me.datasource,
						datasourcedbname : me.datasourcedbname,
						start : 1,
						limit : 100,
						datawhere : ''
					},
					reader : {
						keepRawData : true,
						type : 'json',
						rootProperty : 'data',
						totalProperty : 'total',
						successProperty : 'success',
						messageProperty : 'message',
						//idProperty: 'node',
					},
					listeners : {
						exception : function (proxy, response, operation) {
							Ext.MessageBox.show({
								title : 'REMOTE EXCEPTION',
								msg : operation.getError(),
								icon : Ext.MessageBox.ERROR,
								buttons : Ext.Msg.OK
							});
						},
						load : function (data) {
							var VisualSQLQueryBuilder = Ext.get('VisualSQLQueryBuilder').component;
							VisualSQLQueryBuilder.getView().refresh();
							log('LoadedFormLoadDataSource');
						},
						loaded : function (data) {
							var VisualSQLQueryBuilder = Ext.get('VisualSQLQueryBuilder').component;
							VisualSQLQueryBuilder.getView().refresh();
							log('LoadedFormLoadDataSource');
						}
					}
				}
			});

		var config = {
			name : 'TestSQLGrid',
			store : DS_VisualSQLQueryTest,
			datasource : '',
			datasourcetype : '',
			valueField : 'ID',
		};

		Ext.apply(me, config);
		me.callParent(arguments);
	},
});


Ext.define('VisualSQLQueryBuilder', {
	extend : 'Ext.window.Window',
	alias : 'widget.qbwindow',
	mixins : ['Ext.form.field.Field'],
	requires : ['Ext.draw.*', ],
	height : 600,
	width : 900,
	text : '',
	datasourcedbname : '',
	fieldLabel : '',
	name : 'VisualSQLQueryBuilder',
	id : 'VisualSQLQueryBuilder',
	title : 'Visual SQL Query Builder',
	closable : true,
	closeAction : 'hide',
	floating : true,
	maximizable : true,
	resizable : true,
	config : {
		SqlStringConfig : {},
		statusview : 'designer',
	},
	layout : {
		type : 'border'
	},
	listeners : {
		beforehide : function (win) {
			ux.vqbuilder.sqlSelect.removeAllObj();
		}
	},
	referenceHolder : true,
	afterRender : function () {
		log('VisualSQLQueryBuilder afterRender');
		var me = this;
		VisualSQLdatasourcedbname = me.datasourcedbname;
		ux.vqbuilder.datasourcedbname = me.datasourcedbname;
		me.callParent();
	},
	initComponent : function () {
		log('VisualSQLQueryBuilder initComponent');
		var me = this;
		VisualSQLdatasourcedbname = me.datasourcedbname;

		var config = {
			statusview : 'designer',
		};
		Ext.apply(me, config);

		var SqlStringConfig = me.SqlStringConfig;

		// create user extension namespace ux.vqbuilder
		Ext.namespace('ux.vqbuilder');
		ux.vqbuilder.connections = [];
		ux.vqbuilder.sqlSelect = Ext.create('visualsqlquerybuilder.SQLSelect');

		me.items = [
			Ext.apply({
				xtype : 'sqloutputpanel',
				border : false,
				region : 'center',
				scrollable : true,
				html : '<pre class="brush: sql">SQL Output Window</pre>',
				margin : 5,
				height : 150,
				split : true
			}, SqlStringConfig),
			Ext.apply({
				xtype : 'panel',
				id : 'subpanelnorth',
				border : false,
				height : 400,
				margin : 5,
				layout : {
					type : 'border'
				},
				region : 'north',
				split : true,
				items : [{
						xtype : 'sqltablepanel',
						border : false,
						region : 'center',
						height : 280,
						split : true,
						layout : 'fit',
						scrollable : true
					}, {
						xtype : 'sqlfieldsgrid',
						border : false,
						region : 'south',
						height : 120,
						split : true
					}, {
						xtype : 'sqltabletree',
						border : false,
						region : 'west',
						width : 200,
						height : 400,
						split : true
					}
				]
			}),
			Ext.apply({
				xtype : 'panel',
				id : 'subpanelsqlnorth',
				border : false,
				height : 400,
				margin : 5,
				hidden : true,
				layout : {
					type : 'border'
				},
				region : 'north',
				split : true,
				items : [{
						xtype : 'sqltest',
						border : false,
						region : 'center',
						height : 280,
						split : true,
						layout : 'fit'
					},
				]
			}),
		];

		// add toolbar to the dockedItems
		me.dockedItems = [{
				xtype : 'toolbar',
				dock : 'top',
				items : [{
						text : "Save",
						iconCls : 'x-fa fa-floppy-o',
						xtype : 'button',
						id : 'SaveSQLButton',
						listeners : {
							click : function () {
								var me = this;
								var SQLOutputPanel = Ext.getCmp('SQLOutputPanel');
								var VisualSQLQueryBuilder = Ext.get('VisualSQLQueryBuilder').component;
								VisualSQLQueryBuilder.fireEvent('applySQL', SQLOutputPanel.getValue());
								//VisualSQLQueryBuilder.fireEvent('close');
								//me.fireEvent('applySQL',SQLOutputPanel.getValue());
								VisualSQLQueryBuilder.hide();
							},
						}
					}, {
						text : "Run/Design",
						iconCls : 'x-fa fa-bolt',
						xtype : 'button',
						id : 'RunSQLButton',
						listeners : {
							click : function () {
								var subpanelnorth = Ext.getCmp('subpanelnorth');
								var subpanelsqlnorth = Ext.getCmp('subpanelsqlnorth');
								var VisualSQLQueryBuilder = Ext.get('VisualSQLQueryBuilder').component;
								if (VisualSQLQueryBuilder.statusview == 'designer') {
									//metti in visualizzazione SQL
									subpanelnorth.hide();
									subpanelsqlnorth.setDisabled(true);
									//subpanelsqlnorth.store.removeAll();
									var DS_VisualSQLQueryTest = Ext.data.StoreManager.get('DS_VisualSQLQueryTest');
									var SQLOutputPanel = Ext.getCmp('SQLOutputPanel');
									log('load sql test' + SQLOutputPanel.getValue());
									SQLOutputPanel.sqltext = SQLOutputPanel.getValue();
									DS_VisualSQLQueryTest.reload({
										params : {
											datasourcetype : 'SELECT',
											datasource : SQLOutputPanel.sqltext,
											start : 1,
											limit : 100,
											datawhere : ''
										},
									});
									subpanelsqlnorth.show();
									subpanelsqlnorth.setDisabled(false);
									VisualSQLQueryBuilder.statusview = 'sqltest'
								} else {
									//metti in visualizzazione Designer
									subpanelnorth.show();
									subpanelsqlnorth.hide();
									VisualSQLQueryBuilder.statusview = 'designer'
								}
								subpanelnorth.updateLayout();
							},
						}
					}, {
						xtype : 'tbfill'
					}, {
						text : "SELECT",
						iconCls : 'fa fa-table',
						xtype : 'button',
						id : 'SelectSQLButton',
						listeners : {
							click : function () {
								ux.vqbuilder.sqlSelect.typesql = 'SELECT';
								ux.vqbuilder.sqlSelect.updateSQLOutput();
							},
						}
					}, {
						text : "UPDATE",
						iconCls : 'fa fa-bolt',
						xtype : 'button',
						id : 'UpdateSQLButton',
						listeners : {
							click : function () {
								ux.vqbuilder.sqlSelect.typesql = 'UPDATE';
								ux.vqbuilder.sqlSelect.updateSQLOutput();
							},
						}
					}, {
						text : "DELETE",
						iconCls : 'x-fa fa-trash-o',
						xtype : 'button',
						id : 'DeleteSQLButton',
						listeners : {
							click : function () {
								ux.vqbuilder.sqlSelect.typesql = 'DELETE';
								ux.vqbuilder.sqlSelect.updateSQLOutput();
							},
						}
					}, {
						text : "INSERT",
						iconCls : 'x-fa fa-asterisk',
						xtype : 'button',
						id : 'InsertSQLButton',
						listeners : {
							click : function () {
								ux.vqbuilder.sqlSelect.typesql = 'INSERT';
								ux.vqbuilder.sqlSelect.updateSQLOutput();
							},
						}
					}
				]
			}
		];

		// apply to the initialConfig
		Ext.apply(me.initialConfig, me);

		me.callParent(arguments);
	},
	getSubmitData : function () {
		log('VisualSQLQueryBuilder getSubmitData');
		var me = this;
		var SQLOutputPanel = Ext.getCmp('SQLOutputPanel');
		return SQLOutputPanel.getValue();
	},
	setValue : function (value) {
		log('VisualSQLQueryBuilder setValue');
		var me = this;
		if (value == null) {
			return;
		} else {
			// apply to the initialConfig
			//Ext.apply(this, this.initialConfig);
			ux.vqbuilder.sqlSelect.setExternalSQL(value);
		}
	},
	getInputId : function () {
		log('VisualSQLQueryBuilder getInputId');
		return null;
	},
	getValue : function () {
		log('VisualSQLQueryBuilder getValue');
		var me = this;
		var SQLOutputPanel = Ext.getCmp('SQLOutputPanel');
		return SQLOutputPanel.getValue();
	},
});