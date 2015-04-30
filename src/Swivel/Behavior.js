
/**
 * Behavior constructor
 *
 * @param String slug
 * @param Function strategy
 */
var Behavior = function Behavior(slug, strategy) {
    this.slug = slug;
    this.strategy = strategy;
};

/**
 * Execute the behavior's strategy and return the result
 *
 * @param array args
 * @return mixed
 */
Behavior.prototype.execute = function execute(args) {
    return this.strategy.apply(null, args || []);
};
