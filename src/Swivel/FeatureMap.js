
/**
 * FeatureMap constructor
 *
 * @param Object map
 */
var FeatureMap = function FeatureMap(map) {
    this.map = parse(map);
};

FeatureMap.DELIMITER = '.';

/**
 * Used by reduceToBitmask
 *
 * @param Number mask
 * @param Number index
 * @return Number
 */
var bitmaskIterator = function bitmaskIterator(mask, index) {
    return mask | (1 << (index - 1));
};

/**
 * Reduce an array of numbers to a bitmask if `list` is an array. Otherwise, will just return `list`
 *
 * @param mixed list
 * @return mixed bitmask
 */
var reduceToBitmask = function reduceToBitmask(list) {
    if (!isArray(list)) {
        return list;
    }

    return list.reduce(bitmaskIterator);
};

/**
 * Parse a human readable map into a map of bitmasks
 *
 * @param Object map
 * @return Object
 */
var parse = function parse(map) {
    var parsed = {};
    var key;
    for (key in map) {
        if (map.hasOwnProperty(key)) {
            parsed[key] = reduceToBitmask(map[key]);
        }
    }
    return parsed;
};
