if (Meteor.isClient) {
    // first initiation of this square
    Template.todo.created = function() {
        console.log(this);
        console.log(this.data);
    };

    Template.todo.helpers({
        // variable mainPage: boolean
        count: function() {
            var square = Squares.findOne(this._id);
            console.log('count', square)
            var count = _.filter(square.data.things, function(value, key, list) {
                return !value.done;
            }).length;

            return count;
        }
    });

    Template.todo.events({
        'click .do': function(event, template) {
            var square = template.data;
            var checked = event.target.checked;
            console.log(checked);

            // item.completed = !item.completed;
            // get the array index of this element
            var arrIndex = arrayObjectIndexOf(square.data.things, this._id, '_id');

            // prepare the modifier
            var modifier = {
                $set: {}
            };

            modifier.$set['data.things.' + arrIndex + '.done'] = checked;
            // update the value
            square.update(modifier);
        },
        'click .delete': function(event, template) {
            var square = template.data;
            var thing = this;
            square.update({
                $pull: {
                    'data.things': {
                        _id: thing._id
                    }
                }
            });
        },
        'keypress input': function(event, template) {
            var square = template.data;
            var title = event.target.value;

            if (event.keyCode == 13) {
                square.update({
                    $push: {
                        'data.things': {
                            _id: Random.id(),
                            title: title,
                            done: false
                        }
                    }
                });
                event.target.value = '';
            }
        }
    });
}
