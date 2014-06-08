/** @jsx React.DOM */
(function () {
    var orList = function (items) {
        if (items.length == 1) {
            return items[0];
        } else {
            var last = items.pop();

            return items.join(", ") + " or " + last;
        }
    }

    var TargetingSummary = React.createClass({
       render: function () {
           var constraints = [];

           if (this.props.constraints.topics.length > 0) {
               var msg = "Have responded to " + orList(this.props.constraints.topics.map(function (obj) {
                   return obj.name;
               }));

               constraints.push(<li>{msg}</li>);
           }

           if (this.props.constraints.tags.length > 0) {
               var msg = "Have read articles about " + orList(this.props.constraints.tags.map(function (obj) {
                   return obj.name;
               }));

               constraints.push(<li>{msg}</li>);
           }

           if (constraints.length == 0) {
               return (
                    <div id="targeting-summary">Going to all users</div>
               );
           } else {
               return (
                   <div id="targeting-summary">
                       <p>Going to users who</p>

                       <ul>{constraints}</ul>
                   </div>
               );
           }
       }
    });

    var Location = React.createClass({
        getInitialState: function () {
            return {
                distance: 30,
                query: ""
            };
        },

        handleTextInput: function (event) {
            this.setState(React.addons.update(this.state, {
                $set: {
                    query: event.target.value
                }
            }));
        },

        handleSelect: function (event) {
            this.setState(React.addons.update(this.state, {
                $set: {
                    distance: event.target.value
                }
            }));
        },

        render: function () {
            return (
                <p>Users within
                    <select value={this.state.distance} onChange={this.handleSelect}>
                        <option value="5">5 miles</option>
                        <option value="10">10 miles</option>
                        <option value="30">30 miles</option>
                        <option value="100">100 miles</option>
                        <option value="300">300 miles</option>
                        <option value="500">500 miles</option>
                    </select>

                    of

                    <input className="form-control" name="geo" type="text" onChange={this.handleTextInput} value={this.state.query} />
                </p>
            );
        }
    });

    var tagsBloodHound = new Bloodhound({
        datumTokenizer: Bloodhound.tokenizers.obj.whitespace('name'),
        queryTokenizer: Bloodhound.tokenizers.whitespace,
        remote: "/helpers/tags?query=%QUERY"
    });

    tagsBloodHound.initialize();

    var ReadingHistory = React.createClass({
        componentDidMount: function () {
            var domNode = $(this.refs.readingHistoryInput.getDOMNode());

            domNode.typeahead({
                hint: false,
                highlight: true
            }, {
                name: "tags",
                displayKey: "name",
                source: tagsBloodHound.ttAdapter(),
                templates: {
                    suggestion: Handlebars.compile("<p>{{name}} <span class='tag-id'>{{id}}</span></p>")
                }
            });

            var that = this;

            var handleSelect = function (event, topic) {
                that.props.onAddTag(topic);
                domNode.val("");
            };

            $(domNode).on("typeahead:autocompleted", handleSelect);
            $(domNode).on("typeahead:selected", handleSelect);
        },

        componentWillUnmount: function () {
            $(this.refs.readingHistoryInput.getDOMNode()).typeahead("destroy");
        },

        render: function () {
            return (
                <p>Users who have read items tagged
                  <input className="form-control" type="text" name="tag" ref="readingHistoryInput" placeholder="Enter tag" />
                </p>
            );
        }
    });

    var topicsBloodHound = new Bloodhound({
        datumTokenizer: Bloodhound.tokenizers.obj.whitespace('name'),
        queryTokenizer: Bloodhound.tokenizers.whitespace,
        remote: "/helpers/topics?query=%QUERY"
    });

    topicsBloodHound.initialize();

    var PreviousParticipation = React.createClass({
        componentDidMount: function () {
            var domNode = $(this.refs.participationHistoryInput.getDOMNode());

            domNode.typeahead({
                hint: false,
                highlight: true
            }, {
                name: "topics",
                displayKey: "name",
                source: topicsBloodHound.ttAdapter()
            });

            var that = this;

            var handleSelect = function (event, topic) {
                that.props.onAddTopic(topic);
                domNode.val("");
            };

            $(domNode).on("typeahead:autocompleted", handleSelect);
            $(domNode).on("typeahead:selected", handleSelect);
        },

        render: function () {
            return (
                <p>
                    Users who have responded to
                    <input className="form-control" name="topic" type="text" ref="participationHistoryInput" placeholder="Enter topic" />
                </p>
            );
        }
    });

    var Constraints = React.createClass({
        getInitialState: function () {
            return {
                selectedConstraint: "",
                constraints: {
                    topics: [],
                    tags: [],
                    geoFences: []
                }
            };
        },

        handleChange: function (event) {
            this.updateState({
                $set: {
                    selectedConstraint: event.target.value
                }
            });
        },

        updateState: function (update) {
            this.setState(React.addons.update(this.state, update));
        },

        onAddTopic: function (topic) {
            this.updateState({
                constraints: {
                    topics: {
                        $push: [topic]
                    }
                }
            });
        },

        onAddTag: function (tag) {
            this.updateState({
                constraints: {
                    tags: {
                        $push: [tag]
                    }
                }
            });
        },

        render: function () {
            var constraintElement;

            switch (parseInt(this.state.selectedConstraint)) {
                case 1:
                    constraintElement = <Location />;
                    break;
                case 2:
                    constraintElement = <ReadingHistory onAddTag={this.onAddTag} />;
                    break;
                case 3:
                    constraintElement = <PreviousParticipation onAddTopic={this.onAddTopic} />;
                    break;
                default:
                    constraintElement = <p></p>;
            }

            return (
                <div>
                    <TargetingSummary constraints={this.state.constraints} />

                        <p>Constrain by <select className="form-control" name="constraint_type" value={this.state.selectedConstraint} onChange={this.handleChange}>
                                    <option value=""></option>
                                    <option value="1">Location</option>
                                    <option value="2">Reading history</option>
                                    <option value="3">Previous participation</option>
                            </select></p>

                        <div>{constraintElement}</div>
                </div>
            );
        }
    });

    React.renderComponent(
        <Constraints />,
        document.getElementById("constraints")
    );
})();