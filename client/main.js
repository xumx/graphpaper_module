Meteor.startup(function() {
    //Fixture
    if (Squares.find().count() == 0) {
        Squares.insert({
            data: {},
            view: module.view,
            height: module.height,
            width: module.width,
            x: 1,
            y: 1
        });
    }
});

UI.registerHelper('module', function() {
    return module;
});

UI.registerHelper('square', function() {
    return Squares.findOne({});
});
