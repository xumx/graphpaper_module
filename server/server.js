Meteor.startup(function() {
   Meteor.call('reset');
});

Meteor.methods({
    reset: function() {
        Squares.remove({});

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
