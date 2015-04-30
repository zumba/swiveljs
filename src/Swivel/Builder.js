
/**
 * Builder constructor
 *
 * @param String slug
 * @param Bucket bucket
 */
var Builder = function Builder(slug, bucket) {
    this.slug = slug;
    this.bucket = bucket;
    this.waived = false;
    setBehavior.call(this);
};

/**
 * Slug used when one is not provided
 *
 * @type String
 */
var DEFAULT_SLUG = '__swivel_default';

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
        setBehavior.call(this, behavior, args);
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
    if (this.waived) {
        throw 'Defined a default behavior after `noDefault` was called.';
    }
    if (!this.behavior) {
        setBehavior.call(this, this.getBehavior(strategy), args);
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
        slug = DEFAULT_SLUG;
    }

    if (typeof strategy !== 'function') {
        strategy = getAnonymousStrategy(strategy);
    }
    return new Behavior(this.slug + DELIMITER + slug, strategy);
};

/**
 * Waive the default behavior for this feature.
 */
BuilderPrototype.noDefault = function noDefault() {
    var behavior = this.behavior;
    if (behavior && behavior.slug === DEFAULT_SLUG) {
        throw 'Called `noDefault` after a default behavior was defined.';
    }
    this.waived = true;
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

/**
 * Set the behavior and args.
 *
 * @param Behavior behavior
 * @param array args
 */
var setBehavior = function setBehavior(behavior, args) {
    this.behavior = behavior || null;
    this.args = args || [];
};
