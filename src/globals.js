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
