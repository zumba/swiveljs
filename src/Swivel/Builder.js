
/**
 * Builder constructor
 */
var Builder = function Builder() {

};

/**
 * Slug used when one is not provided
 *
 * @type String
 */
Builder.DEFAULT_SLUG = '__swivel_default';

/**
 * Builder prototype
 */
var BuilderPrototype = Builder.prototype;

/**
 * Create and return a new Behavior.
 *
 * If strategy is not a function, it will be wraped in a closure that returns the strategy.
 *
 * @param string slug
 * @param mixed strategy
 * @return Behavior
 */
BuilderPrototype.getBehavior = function getBehavior(slug, strategy) {
    if (!strategy) {
        strategy = slug;
        slug = Builder.DEFAULT_SLUG;
    }

    if (typeof strategy !== 'function') {
        strategy = getAnonymousStrategy(strategy);
    }
    slug = this.slug + FeatureMap.DELIMITER + slug;
    return new Behavior(slug, strategy);
};

/**
 * Wrapper for an anonymous strategy
 *
 * @param mixed value
 * @return Function
 */
var getAnonymousStrategy = function getAnonymousStrategy(value) {
    return function anonymousStrategy() {
        return value;
    };
};
