/**
 * Delimiter
 *
 * @type String
 */
var DELIMITER = '.';

/**
 * Native reduce
 *
 * @type Function
 */
var reduce = Array.prototype.reduce;

/**
 * @type Function
 */
var toString = Object.prototype.toString;

/**
 * Is array?
 *
 * @param mixed a
 * @return Boolean
 */
var isArray = function isArray(a) {
    return toString.call(a) === '[object Array]';
};
