
/**
 * Builder constructor
 *
 * @param String slug
 * @param Bucket bucket
 */
var Builder = function Builder(slug, bucket) {
    this.slug = slug;
    this.bucket = bucket;
    this.behavior = null;
    this.args = null;
    this.defaultWaived = false;
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
 * Add a behavior to be executed later.
 *
 * Behavior will only be added if it is enabled for the user's bucket.
 *
 * @param String slug
 * @param mixed strategy
 * @param array args
 */
BuilderPrototype.addBehavior = function addBehavior(slug, strategy, args) {
    var behavior = this.getBehavior(slug, strategy);
    if (this.bucket.enabled(behavior)) {
        this.behavior = behavior;
        this.args = args || [];
    }
    return this;
};

/**
 * Add a default behavior.
 *
 * Will be used if all other behaviors are not enabled for the user's bucket.
 *
 * @param mixed strategy
 * @param array args
 */
BuilderPrototype.defaultBehavior = function defaultBehavior(strategy, args) {
    if (this.defaultWaived) {
        throw 'Defined a default behavior after `noDefault` was called.';
    }
    if (!this.behavior) {
        this.behavior = this.getBehavior(strategy);
        this.args = args || [];
    }
    return this;
};

/**
 * Execute the feature.
 *
 * @return mixed
 */
BuilderPrototype.execute = function execute() {
    return (this.behavior || this.getBehavior(null)).execute(this.args || []);
};

/**
 * Create and return a new Behavior.
 *
 * If strategy is not a function, it will be wraped in a closure that returns the strategy.
 *
 * @param String slug
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
 * Waive the default behavior for this feature.
 */
BuilderPrototype.noDefault = function noDefault() {
    if (this.behavior && this.behavior.slug === Builder.DEFAULT_SLUG) {
        throw 'Called `noDefault` after a default behavior was defined.';
    }
    this.defaultWaived = true;
    return this;
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
