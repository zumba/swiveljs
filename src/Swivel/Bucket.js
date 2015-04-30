
/**
 * Bucket constructor
 */
var Bucket = function Bucket(featureMap, index) {
    this.featureMap = featureMap;
    this.index = index;
};

/**
 * Check if a behavior is enabled for a particular context/bucket combination
 *
 * @param Behavior behavior
 * @return boolean
 */
Bucket.prototype.enabled = function enabled(behavior) {
    return this.featureMap.enabled(behavior.slug, this.index);
};
