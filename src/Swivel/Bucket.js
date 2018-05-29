
/**
 * Bucket constructor
 */
var Bucket = function Bucket(featureMap, index, callback) {
    this.featureMap = featureMap;
    this.index = index;
    this.callback = typeof callback === 'function' ? callback : function() {};
};

/**
 * Check if a behavior is enabled for a particular context/bucket combination
 *
 * @param Behavior behavior
 * @return boolean
 */
Bucket.prototype.enabled = function enabled(behavior) {
    var slug = behavior.slug;
    if (!this.featureMap.slugExists(slug)) {
        this.callback(slug);
    }
    return this.featureMap.enabled(slug, this.index);
};
