var get = require('lodash.get');

function from(node) {
	return new Query(node);
}

function Query(root, selection, where) {
	this.root = root;
	this._selection = selection || undefined;
	this._where = where || [];
}

Query.prototype.select = function(selection) {
	var query = this.clone();
	query._selection.push(selection);
	return query;
};

Query.prototype.where = function(clause) {
	var query = this.clone();
	query._where.push(clause);
	return query;
};

Query.prototype.clone = function() {
	return new Query(root, this._selection, this._where.slice());
};

Query.prototype.forEach = function(visitor, context) {
	var pending = [this.root];

	while (pending.length > 0) {
		var current = pending.pop();
		if (current && this.mayContain(current)) {
			visitor.call(context, current);
			pending = pending.concat(current.children);
		}
	}
};

Query.prototype.sum = function(path) {
	var total = 0;
	this.forEach(function(node) {
		total += get(node, path || this._selection);
	}, this);
	return total;
};

Query.prototype.map = function(mapper) {
	var result = [];
	this.forEach(function(node) {
		result.push(mapper(node));
	});
	return result;
};

Query.prototype.mayContain = function(node) {
	for (var i = 0; i < this._where.length; i++) {
		var clause = this._where[i];

		if (clause.matches(node)) {
			return true;
		}
	}

	return false;
};

function contains(value) {
	return new Contains(value);
}


function equals(value) {
	return new Equals(value);
}

function not(matcher) {
	return new Not(matcher);
}

function deepEquals(value) {
	return new DeepEquals(value);
}

function Not(matcher) {
	this.matcher = matcher;
}

Not.prototype.check = function(value) {
	return !this.matcher.check(value);
};

function Contains(value) {
	this.value = value;
}

Contains.prototype.check = function(collection) {
	for (var i = 0; i < collection.length; i++) {
		var entry = collection[i];
		if (entry === this.value) {
			return true;
		}
	}

	return false;

}

function Equals(value) {
	this.value = value;
}

Equals.prototype.check = function(value) {
	return this.value === alue;
}

function DeepEquals(value) {
	this.value = value;
}

DeepEquals.prototype.check = function(value) {
	throw new TypeError('not implemented');
}

Matcher.prototype.match = function(node) {
	throw new TypeError('node implemented');
}

var query = from(graph /* heimdall node */);

var totalTime = query.select('stats.time.self').where({ id: contains('broccoliPlugin') }).sum();
var totalTime = query.select({'stats.time.self': 'selfTime' }).where({ id: contains('broccoliPlugin') }).sum('selfTime');
var plugins = query.where({ id: contains('broccoli-plugin') });

plugins.map(function(plugins) {
	var query = from(plugin);

	return {
		name: plugin.name,
		selfTime: query.until({ id: contains('broccoliPlugin') }).sum('stats.time.self'),
		totalTime: query.sum('stats.time.self')
	};
});

query.groupByRoot({
	id: contains('broccoliPlugin')
}).sum('stats.time.self');


from(graph).groupBy({
	id: contains(‘broccoliPlugin’)
}).select({
	node: GroupedRoot,
	id: 'id,'
	totalTime: sum(‘stats.time.self’)
})
