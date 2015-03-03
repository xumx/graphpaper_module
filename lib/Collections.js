Widgets = new Meteor.Collection(null);
Squares = new Meteor.Collection('square', {
    transform: function(tile) {
        tile.xpx = tile.x * 100;
        tile.ypx = tile.y * 100;
        tile.heightpx = tile.height * 100;
        tile.widthpx = tile.width * 100;

        return new Square(tile);
    }
});

Canvases = new Meteor.Collection('canvas', {
    transform: function(canvas) {
        return new Canvas(canvas);
    }
});