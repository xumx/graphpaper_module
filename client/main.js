reset = function () {
	Meteor.call('reset');	
}

UI.registerHelper('module', function() {
    return module;
});

UI.registerHelper('square', function() {
    return Squares.findOne({});
});
