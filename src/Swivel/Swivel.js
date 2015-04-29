
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
    var featureMap = map instanceof FeatureMap ? map : new FeatureMap(map);
    this.bucket = new Bucket(featureMap, config.bucketIndex);
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

SwivelPrototype.invoke = function invoke() {

};

SwivelPrototype.setBucket = function setBucket() {

};
