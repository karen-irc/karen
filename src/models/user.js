var _ = require("lodash");
var assign = require("object-assign");

module.exports = User;

function User(attr) {
	_.merge(this, assign({
		mode: "",
		name: ""
	}, attr));
}
