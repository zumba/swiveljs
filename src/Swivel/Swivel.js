
/**
 * Swivel constructor
 */
var Swivel = function Swivel(config) {
    if (!(this instanceof Swivel)) {
        return new Swivel(config);
    }
    if (!config) {
        config = {};
    }
    var map = config.map || {};
    var callback = config.callback || function() {};
    var featureMap = map instanceof FeatureMap ? map : new FeatureMap(map);
    this.bucket = new Bucket(featureMap, config.bucketIndex, callback);
};

/**
 * Swivel prototype
 */
var SwivelPrototype = Swivel.prototype;

/**
 * Create a new Builder instance
 *
 * @param String slug
 * @return Builder
 */
SwivelPrototype.forFeature = function forFeature(slug) {
    return new Builder(slug, this.bucket);
};

/**
 * Syntactic sugar for creating simple feature toggles (ternary style)
 *
 * @param String slug
 * @param mixed a
 * @param mixed b
 * @return mixed
 */
SwivelPrototype.invoke = function invoke(slug, a, b) {
    var parts = slug.split(DELIMITER);
    return this.forFeature(parts.shift())
        .addBehavior(parts.join(DELIMITER), a)
        .defaultBehavior(b)
        .execute();
};

/**
 * Syntactic sugar for creating simple feature toggles (ternary style)
 *
 * Uses Builder::addValue
 *
 * @param String slug
 * @param mixed a
 * @param mixed b
 * @return mixed
 */
SwivelPrototype.returnValue = function returnValue(slug, a, b) {
    var parts = slug.split(DELIMITER);
    return this.forFeature(parts.shift())
        .addValue(parts.join(DELIMITER), a)
        .defaultValue(b)
        .execute();
};

/**
 * Set the Swivel Bucket
 *
 * @param Bucket bucket
 * @return Swivel
 */
SwivelPrototype.setBucket = function setBucket(bucket) {
    this.bucket = bucket;
    return this;
};
