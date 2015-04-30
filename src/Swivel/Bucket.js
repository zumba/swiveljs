
/**
 * Bucket constructor
 */
var Bucket = function Bucket(featureMap, index) {
    this.featureMap = featureMap;
    this.index = index;
};

/**
 * Ordinal Bitmasks
 */
Bucket.FIRST = 1;
Bucket.SECOND = 2;
Bucket.THIRD = 4;
Bucket.FOURTH = 8;
Bucket.FIFTH = 16;
Bucket.SIXTH = 32;
Bucket.SEVENTH = 64;
Bucket.EIGHTH = 128;
Bucket.NINTH = 256;
Bucket.TENTH = 512;
Bucket.ALL = 1023;


/**
 * Check if a behavior is enabled for a particular context/bucket combination
 *
 * @param Behavior behavior
 * @return boolean
 */
Bucket.prototype.enabled = function enabled(behavior) {
    return this.featureMap.enabled(behavior.slug, this.index);
};
