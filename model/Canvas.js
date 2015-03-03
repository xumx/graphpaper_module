Canvas = function(canvas) {
    _.extend(this, canvas);
};

Canvas.prototype.observe = function(changeHandler) {
    Canvases.find({
        _id: this._id
    }).observeChanges({
        changed: changeHandler
    });;
}

Canvas.prototype.update = function(modifier, callback) {
    Canvases.update(this._id, modifier, {
        callback: callback
    });
}

Canvas.prototype.setData = function(data) {
    Canvases.update(this._id, {
        $set: {
            data: data
        }
    });
}

Canvas.prototype.setBackground = function(background) {
    check(background, Match.Any);
    Canvases.update(this._id, {
        $set: {
            background: background
        }
    });
};

Canvas.prototype.setTitle = function(title) {
    check(title, String);
    Canvases.update(this._id, {
        $set: {
            title: title
        }
    });
};

Canvas.prototype.setSize = function(width, height) {
    check(height, Match.Integer);
    check(width, Match.Integer);

    Canvases.update(this._id, {
        $set: {
            width: width,
            height: height
        }
    });
};

Canvas.prototype.addFavourite = function() {
    Canvases.update(this._id, {
        $set: {
            star: true
        }
    });
    console.log('Add Favourite');
};

Canvas.prototype.removeFavourite = function() {
    Canvases.update(this._id, {
        $set: {
            star: false
        }
    });
    console.log('Remove Favourite');
};

Canvas.prototype.remove = function() {
    Canvases.remove(this._id, function() {
        Router.go('/')
    });
};

Canvas.prototype.togglePublishAsTemplate = function() {
    Meteor.call('Canvas.publishAsTemplate', this._id, this.template, function(error, result) {});
};

Canvas.prototype.togglePublishAsCommunity = function() {
    Meteor.call('Canvas.publishAsCommunity', this._id, (this.permission === 'public'), function(error, result) {});
};

Canvas.prototype.setPublicView = function() {
    Meteor.call('Canvas.setPublicView', this._id, function(error, result) {});
};

Canvas.prototype.setPublicEdit = function() {
    Meteor.call('Canvas.setPublicEdit', this._id, function(error, result) {});
};

Canvas.prototype.setTeam = function() {
    Meteor.call('Canvas.setTeam', this._id, function(error, result) {});
};

Canvas.prototype.setPrivate = function() {
    Meteor.call('Canvas.setPrivate', this._id, function(error, result) {});
};

Canvas.prototype.addTeamMember = function(userId) {
    Meteor.call('Canvas.addTeamMember', this._id, userId, function(error, result) {});
};

Canvas.prototype.deleteTeamMember = function(userId) {
    Meteor.call('Canvas.deleteTeamMember', this._id, userId, function(error, result) {});
};

Canvas.prototype.screenshot = function() {
    var height = this.height * 100;
    var width = this.width * 100;

    if (Meteor.isClient) {
        html2canvas(document.getElementById('canvas-container'), {
            onrendered: function(canvas) {
                var win = window.open();
                win.document.write("<br><img src='" + canvas.toDataURL() + "'/>");
                win.print();
                win.close();
            },
            height: height,
            width: width
        });
    }
}

var removeTeamRights = function(canvasId, owner) {
    var cursor = Roles.getUsersInRole(['read'], canvasId);
    var users = cursor.fetch();
    users = _.reject(users, function(user) {
        return user._id === owner;
    });

    if (users.length > 0) {
        Roles.removeUsersFromRoles(users, ['read', 'write', 'manage'], canvasId);
    }
}

Meteor.methods({
    'Canvas.insert': function(canvas) {
        canvas = Canvases.simpleSchema().clean(canvas);
        check(canvas, Match.Any);
        check(canvas._id, Match.ID);

        var userId = Meteor.userId();
        check(userId, Match.ID);
        canvas.owner = userId

        Canvases.insert(canvas);
        Roles.addUsersToRoles(userId, ['manage', 'read', 'write'], canvas._id);
    },
    'Canvas.setPublicView': function(canvasId) {
        check(canvasId, Match.ID);

        if (Roles.userIsInRole(this.userId, ['manage'], canvasId)) {
            Canvases.update(canvasId, {
                $set: {
                    permission: 'publicview'
                }
            });

            var owner = this.userId;
            removeTeamRights(canvasId, owner);
        } else {
            throw new Meteor.Error(403, "Permission denied.");
        }
    },

    'Canvas.setPublicEdit': function(canvasId) {
        check(canvasId, Match.ID);

        if (Roles.userIsInRole(this.userId, ['manage'], canvasId)) {
            Canvases.update(canvasId, {
                $set: {
                    permission: 'publicedit'
                }
            });

            var owner = this.userId;
            removeTeamRights(canvasId, owner);
        } else {
            throw new Meteor.Error(403, "Permission denied.");
        }
    },

    'Canvas.setTeam': function(canvasId) {
        check(canvasId, Match.ID);

        if (Roles.userIsInRole(this.userId, ['manage'], canvasId)) {
            Canvases.update(canvasId, {
                $set: {
                    permission: 'team'
                }
            });
        } else {
            throw new Meteor.Error(403, "Permission denied.");
        }
    },

    'Canvas.setPrivate': function(canvasId) {
        check(canvasId, Match.ID);

        if (Roles.userIsInRole(this.userId, ['manage'], canvasId)) {

            Canvases.update(canvasId, {
                $set: {
                    permission: 'private'
                }
            });

            var owner = this.userId;
            removeTeamRights(canvasId, owner);
        } else {
            throw new Meteor.Error(403, "Permission denied.");
        }
    },

    'Canvas.addTeamMember': function(canvasId, userId) {
        check(canvasId, Match.ID);
        check(userId, Match.ID);

        if (Roles.userIsInRole(this.userId, ['manage'], canvasId)) {
            Roles.setUserRoles(userId, ['read', 'write', 'manage'], canvasId);
            console.log('Added team member: ', userId);
        } else {
            throw new Meteor.Error(403, "Permission denied.");
        }
    },

    'Canvas.deleteTeamMember': function(canvasId, userId) {
        check(canvasId, Match.ID);
        check(userId, Match.ID);

        var canvas = Canvases.findOne(canvasId);
        if (Roles.userIsInRole(this.userId, ['manage'], canvasId) && userId !== canvas.owner) {
            Roles.setUserRoles(userId, [], canvasId)
        } else {
            throw new Meteor.Error(403, "Permission denied.");
        }
    },

    'Canvas.publishAsTemplate': function(canvasId, template) {
        check(canvasId, Match.ID);
        check(template, Match.Optional(Boolean));

        if (template === undefined) template = false;

        if (Roles.userIsInRole(this.userId, ['admin'])) {
            Canvases.update(canvasId, {
                $set: {
                    template: !template
                }
            });
        } else {
            throw new Meteor.Error(403, "Permission denied.");
        }
    },

    'Canvas.publishAsCommunity': function(canvasId, isCommunity) {
        check(canvasId, Match.ID);
        check(isCommunity, Match.Optional(Boolean));

        if (isCommunity === undefined) isCommunity = false;

        if (Roles.userIsInRole(this.userId, ['admin'])) {
            if (isCommunity) {
                Canvases.update(canvasId, {
                    $set: {
                        permission: 'private'
                    }
                });
            } else {
                Canvases.update(canvasId, {
                    $set: {
                        permission: 'public'
                    }
                });
            }

        } else {
            throw new Meteor.Error(403, "Permission denied.");
        }
    }
});
