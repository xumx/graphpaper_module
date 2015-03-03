Square = function(tile, widget) {
    if (tile.isTile && widget && currentCanvas.get()) {
        var canvas = currentCanvas.get();
        var newSquare = {
            x: tile.x,
            y: tile.y,
            height: widget.height,
            width: widget.width,
            view: widget.view,
            canvasId: canvas._id,
            data: {},
            link: []
        }

        if (has(widget, 'data')) {
            newSquare.data = widget.data;
        }

        if (has(widget, 'params')) {
            newSquare.data.params = widget.params;
        }

        Squares.insert(newSquare, {
            tx: true
        });

    } else {
        _.extend(this, tile);
    }


};

Square.prototype.observe = function(changeHandler) {
    check(changeHandler, Function);

    Squares.find({
        _id: this._id
    }).observeChanges({
        changed: changeHandler
    });
}

Square.prototype.setSize = function(height, width) {
    check(height, Match.Integer);
    check(width, Match.Integer);

    if (height > 0 && width > 0) {
        this.update({
            $set: {
                height: height,
                width: width
            }
        });
    } else {
        console.warn("Invalid size in Square.setSize");
    }
}

Square.prototype.update = function(modifier, callback) {
    Squares.update(this._id, modifier, {
        callback: callback
    });
}

Square.prototype.removeFlag = function() {
    Squares.update(this._id, {
        'deleted': true
    }, {
        tx: true
    });
}

Square.prototype.remove = function() {
    Squares.remove(this._id);
}

Square.prototype.setText = function(text) {
    this.text = text;
    this.data = {
        value: Action.resolveLinks(text, this.link)
    }

    this.update({
        $set: {
            text: this.text,
            intent: null,
            command: null,
            data: this.data,
            view: 'text'
        }
    });


    this.propagate();
};

Square.prototype.toIntent = function(text) {
    var query = text || this.text;
    query = Action.resolveLinks(query, this.link);

    if (query[0] === '=') {
        this.setIntent("evaluate");
    } else if (SimpleSchema.RegEx.Url.test(query)) {
        this.setData({
            type: 'embed',
            params: {
                url: query
            }
        });

        this.setView("embed", 3, 4);
    } else {
        var widget = Widgets.findOne({
            names: query
        });

        if (widget) {
            var d = {}
            if (has(widget, 'data')) {
                d = widget.data;
            }

            if (has(widget, 'params')) {
                d.params = widget.params;
            }

            this.setData(d);

            if (this.height <= 1 && this.width <= 1) {
                this.setView(widget.view, widget.height, widget.width);
            } else {
                this.setView(widget.view);
            }

        } else {
            this.setData({
                value: '<h4>' + query + '</h4>'
            });
            this.setView('text', 1, _.min([3, Math.ceil(query.length / 4)]));
        }

        if (false) {
            var that = this;
            var promises = [];

            promises[0] = new Promise(function(resolve, reject) {
                //Ask wit.ai
                var request = URI(API.wit.endpoint).query({
                    q: query
                }).toString();

                Meteor.call('proxy', request.toString(), {
                    headers: {
                        'Authorization': 'Bearer ' + API.wit.token
                    }
                }, function(error, result) {
                    if (!_.isEmpty(result.data.outcomes)) {
                        resolve(result.data.outcomes);
                    } else {
                        console.log("No wit result");
                    }
                });
            });

            Promise.all(promises).then(function(results) {
                var wit = results[0][0];
                console.log(wit);
                that.setIntent(wit.intent, wit.entities);
            }, function() {
                console.warn("unresolved promises");
            });
        }
    }
};

Square.prototype.setIntent = function(intent, entities) {
    this.intent = intent;
    Squares.update(this._id, {
        $set: {
            intent: intent,
            command: null,
            data: null,
            view: null
        }
    });

    if (intent == "evaluate") {
        this.setCommand(this.text);
    } else {
        this.setCommand(this.toCommand(this.intent));
        this.setData(entities);
    }
};

Square.prototype.toCommand = function(intent) {
    var query = '!' + intent;
    return query;
};

Square.prototype.setCommand = function(command) {
    this.command = command;
    Squares.update(this._id, {
        $set: {
            command: command
        }
    });

    this.setData(this.evaluate());
    this.setView("text", 1, 2);
    this.propagate();
};

Square.prototype.setData = function(data) {
    this.data = data;
    Squares.update(this._id, {
        $set: {
            data: this.data
        }
    });
};

Square.prototype.evaluate = function(externalData) {
    if (this.command) {
        var command = Action.resolveLinks(this.command, this.link);
        if (command[0] === '!') {
            var fn = Formula[command.substring(1)];
            if (typeof fn === 'function') {
                return {
                    value: _.bind(fn, this, this.data, externalData)()
                };
            } else {
                console.warn('Intent not found', command);
                this.setView(command.substring(1).trim());
            }
        } else if (command[0] === '=') {
            var fun = command.substring(1).replace(/(\w+\()/g, function(v) {
                return 'Formula.' + v.toUpperCase();
            });

            console.log(fun);
            var result = eval(fun);
            if (result !== null || result !== undefined) {
                return {
                    value: result
                };
            }
        }
    }
}

Square.prototype.setView = function(view, height, width) {
    this.view = view;
    var square = this;
    var changes = {}

    // check(height, Match.Integer);
    // check(width, Match.Integer);

    if (view) changes.view = view;
    if (height) changes.height = height;
    if (width) changes.width = width;

    Squares.update(this._id, {
        $set: changes
    }, function() {
        // Action.resolveOverlap(square._id, Action.checkOverlap(square._id))
    });
};

Square.prototype.dataLinks = function() {
    var linkArray = _.map(this.link, function(link) {
        var source = Squares.findOne(link);
        return source.data;
    });
    return linkArray;
};

Square.prototype.propagate = function() {
    //Propagate changes
    Squares.find({
        link: this._id
    }).forEach(function(tile) {
        tile.refresh();
    });
};

Square.prototype.refresh = function() {
    console.log('refreshing ', this._id)
    if (this.command) {
        this.data = this.evaluate();
    } else {
        this.data = {
            value: Action.resolveLinks(this.text, this.link)
        }
    }

    this.setData(this.data);
    this.propagate();
}

Square.prototype.enhance = Square.prototype.toIntent;
