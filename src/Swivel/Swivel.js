
/**
 * Swivel constructor
 */
var Swivel = function Swivel(config) {
    if (!(this instanceof Swivel)) {
        return new Swivel(config);
    }
};

/**
 * Swivel prototype
 */
var proto = Swivel.prototype;

/**
 * Create a new Builder instance
 *
 * @param String $slug
 * @return Builder
 */
proto.forFeature = function forFeature(slug) { };
proto.invoke = function invoke() { };
proto.setBucket = function setBucket() { };
