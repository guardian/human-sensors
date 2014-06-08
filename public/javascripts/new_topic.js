/** @jsx React.DOM */
(function () {
    var TargetingSummary = React.createClass({
       render: function () {
           var message = "Going to all users";

           return (
                <p id="targeting-summary">{message}</p>
           );
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

                    <input name="geo" type="text" onChange={this.handleTextInput} value={this.state.query} />
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
            $(this.refs.readingHistoryInput.getDOMNode()).typeahead({
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
        },

        componentWillUnmount: function () {
            $(this.refs.readingHistoryInput.getDOMNode()).typeahead("destroy");
        },

        render: function () {
            return (
                <p>Users who have read items tagged
                  <input type="text" name="tag" ref="readingHistoryInput" placeholder="Enter tag" />
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

            var handleSelect = function (event, topic) {
                this.props.onAddTopic(topic);
                domNode.val("");
            };

            $(domNode).on("typeahead:autocompleted", handleSelect);
            $(domNode).on("typeahead:selected", handleSelect);
        },

        render: function () {
            return (
                <p>
                    Users who have responded to
                    <input name="topic" type="text" class="midline" ref="participationHistoryInput" placeholder="Enter topic" />
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
                    $push: {
                        topics: [topic]
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
                    constraintElement = <ReadingHistory />;
                    break;
                case 3:
                    constraintElement = <PreviousParticipation onAddTopic={this.onAddTopic.bind(this)} />;
                    break;
                default:
                    constraintElement = <p></p>;
            }

            return (
                <div>
                    <TargetingSummary constraints={this.state.constraints} />

                        <p>Constrain by <select name="constraint_type" value={this.state.selectedConstraint} onChange={this.handleChange}>
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