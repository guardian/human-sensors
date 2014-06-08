'use strict';
var ractive;

var pym = (function() {
    var lib = {};

    var _isSafeMessage = function(e, settings) {
        /*
        * Check the message to make sure it comes from an acceptable xdomain.
        * Defaults to '*' but can be overriden in config.
        */
        if (settings.xdomain !== '*') {
            // If origin doesn't match our xdomain, return.
            if (!e.origin.match(new RegExp(settings.xdomain + '$'))) { return; }
        }

        return true;
    }

    lib.Parent = function(id, url, config) {
        /*
        * A global function for setting up a responsive parent.
        * Use the config object to override the default settings.
        */
        this.id = id;
        this.url = url;
        this.el = document.getElementById(id);

        this.settings = {
            xdomain: '*'
        };

        this.constructIframe = function() {
            /*
            * A function which handles constructing an iframe inside a given element.
            */

            // Calculate the width of this element.
            var width = this.el.offsetWidth.toString();

            // Create an iframe element attached to the document.
            var node = document.createElement("iframe");

            // Save fragment id
            var hash = '';
            var hashIndex = this.url.indexOf('#');

            if (hashIndex > -1) {
                hash = this.url.substring(hashIndex, this.url.length);
                this.url = this.url.substring(0, hashIndex);
            }

            // If the URL contains querystring bits, use them.
            // Otherwise, just create a set of valid params.
            if (this.url.indexOf('?') < 0) {
                this.url += '?';
            } else {
                this.url += '&';
            }

            // Append the initial width as a querystring parameter, and the fragment id
            node.src = this.url + 'initialWidth=' + width + '&childId=' + this.id + hash;

            // Set some attributes to this proto-iframe.
            node.setAttribute('width', '100%');
            node.setAttribute('scrolling', 'no');
            node.setAttribute('marginheight', '0');
            node.setAttribute('frameborder', '0');

            // Append the iframe to our element.
            this.el.appendChild(node);

            // Add an event listener that will handle redrawing the child on resize.
            var that = this;
            window.addEventListener('resize', function(e) {
                that.sendWidthToChild();
            });
        }

        this.processChildMessage = function(e) {
            /*
            * Process a new message from the child.
            * Used to set the height on our iframe.
            */
            if (!_isSafeMessage(e, this.settings)) { return; }

            // Grab the message from the child and parse it.
            var match = e.data.match(/^responsivechild (\S+) (\d+)$/);

            // If there's no match or too many matches in the message, punt.
            if (!match || match.length !== 3) {
                return false;
            }

            // Get the ID from the message.
            var childId = match[1];

            // Is this message for me?
            if (childId != this.id) {
                return;
            }

            // Get the child's height from the message.
            var height = parseInt(match[2]);

            // Update the height.
            this.el.getElementsByTagName('iframe')[0].setAttribute('height', height + 'px');
        }

        this.sendWidthToChild = function() {
            /*
            * Transmit the current iframe width to the child.
            */

            // Get the width of the element.
            var width = this.el.offsetWidth.toString();

            // Pass the width out to the child so it can compute the height.
            this.el.getElementsByTagName('iframe')[0].contentWindow.postMessage('responsiveparent ' + this.id + ' ' + width, '*');
        }

        // Add any overrides to settings coming from config.
        for (var key in config) {
            this.settings[key] = config[key];
        }

        // Add a listener for processing messages from the child.
        var that = this;
        window.addEventListener('message', function(e) {
            return that.processChildMessage(e)
        }, false);

        // Construct the iframe in the container element.
        this.constructIframe();

        return this;
    };

    lib.Child = function(config) {
        /*
        * A global function for setting up a responsive child.
        * Use the config object to override the default settings.
        */
        this.parentWidth = null;
        this.id = null;

        this.settings = {
            renderCallback: null,
            xdomain: '*',
            polling: 0
        };

        this.getParameterByName = function(name) {
            /*
            * Generic function for parsing URL params.
            * Via http://stackoverflow.com/questions/901115/how-can-i-get-query-string-values-in-javascript
            */
            var regex = new RegExp("[\\?&]" + name.replace(/[\[]/, '\\\[').replace(/[\]]/, '\\\]') + '=([^&#]*)');
            var results = regex.exec(location.search);
            return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, " "));
        };

        this.sendHeightToParent = function() {
            /*
            * Transmit the current iframe height to the parent.
            * Make this callable from external scripts in case they update the body out of sequence.
            */

            // Get the child's height.
            var height = document.getElementsByTagName('body')[0].offsetHeight.toString();

            // Send the height to the parent.
            window.top.postMessage('responsivechild ' + this.id + ' '+ height, '*');
        };

        this.processParentMessage = function(e) {
            /*
            * Process a new message from parent frame.
            */

            // First, punt if this isn't from an acceptable xdomain.
            if (!_isSafeMessage(e, this.settings)) { return; }

            // Get the message from the parent.
            var match = e.data.match(/^responsiveparent (\S+) (\d+)$/);

            // If there's no match or it's a bad format, punt.
            if (!match || match.length !== 3) { return; }

            // Get the ID out of the message.
            var id = match[1];

            // Ensure message is meant for this child
            if (id != this.id) {
                return;
            }

            // Get the width out of the message.
            var width = parseInt(match[2]);

            // Change the width if it's different.
            if (width != this.parentWidth) {
                this.parentWidth = width;

                // Call the callback function if it exists.
                if (this.settings.renderCallback) {
                    this.settings.renderCallback(width);
                }

                // Send the height back to the parent.
                this.sendHeightToParent();
            }
        };

        // Initialize settings with overrides.
        for (var key in config) { this.settings[key] = config[key]; }

        // Set up a listener to handle any incoming messages.
        var that = this;
        window.addEventListener('message', function(e) {
            that.processParentMessage(e);
        }, false);

        // Identify what ID the parent knows this child as.
        this.id = this.getParameterByName('childId');

        // Get the initial width from a URL parameter.
        var width = parseInt(this.getParameterByName('initialWidth'));

        // If there's a callback function, call it.
        if (this.settings.renderCallback) {
            this.settings.renderCallback(width);
        }

        // Send the initial height to the parent.
        this.sendHeightToParent();

        // If we're configured to poll, create a setInterval to handle that.
        if (this.settings.polling) {
            window.setInterval(this.sendHeightToParent, this.settings.polling);
        }

        return this;
    };

    return lib;
}());

var pymChild = new pym.Child();




var app = (function(app, ractive, pymChild ){
		
        var apiBaseUri = 'http://' + window.location.host;
        var noServer = window.parent.location.search === '?static';
        var replyUrl, topicId, questionId;

        var el = document.getElementById('content');
        el.style.display = 'none';

	app.init = function(){

		ractive = new Ractive({
			el: 'content',
			template: '#template',
			data: {
				choices: [],
				results: [],
				showPrompt: false,
				showResults: false,
				readMore: ''
			}
		});
		
		ractive.on({
			submit: function(e,i){

			    var response = ractive.get('choices[' + i +']');
			    
                            if (noServer) {
			      app.showData({
                                  results: [
                                      {answer: 'yes', percent: 20},
                                      {answer: 'no',  percent: 80}
                                  ]
                              });
                            } else {
                                $.ajax({
                                    url: replyUrl,
                                    method: 'post',
                                    data: JSON.stringify({
                                        topic: topicId,
                                        question: questionId,
                                        value: response,
                                        session: app.getId()
                                    }),
                                    contentType: 'application/json'
                                }).done(app.showData);
                            }
			}
		});
		
		app.getQuestion();
		pymChild.sendHeightToParent();
	};
	
	app.showData = function(resp) {
		ractive.set('showPrompt', false);
		ractive.set('showResults', true);
		ractive.set('dek', 'Reader responses');
		ractive.set('readMoreHeader', 'Tell us more')
		ractive.set('readMore', 'We\'re working on a story about recovering heroin addicts.');
		
		
		ractive.set('results', resp.results);
		
		pymChild.sendHeightToParent();
	};
	
	app.getQuestion = function(){

		var id = app.getId();
		//console.log(id)
                if (noServer) {
                    showQuestion({
                        topic: {
                            name: 'Callout header',
                            trackGeo: true
                        },
                        question: {
                            question: 'What do you think?',
                            choices: [
                                'yes',
                                'no'
                            ]
                        },
                        replyUrl: '/api/topics/test/q',
                        trackUrl: '/api/locations'
                    });
                } else {
                    $.ajax({
                        url: apiBaseUri + '/api/topics',
                        data: {session: id}
                    }).done(showQuestion);
                }
	};

        function showQuestion(resp) {
            // Reveal if we have a question
            el.style.display = 'table';
	    pymChild.sendHeightToParent();

            console.log(resp)
            ractive.set('hed', resp.topic.name);
            ractive.set('dek', resp.question.question);
            ractive.set('choices', resp.question.choices);
			ractive.set('showPrompt', true);
            ractive.set('showResults', false);

            topicId = resp.topic.id;
            questionId = resp.question.id;
            replyUrl = apiBaseUri + resp.replyUrl;

            if (resp.topic.trackGeo) {
                var trackUrl = apiBaseUri + resp.trackUrl;
                navigator.geolocation.getCurrentPosition(function(position) {
                    $.ajax({
                        url: trackUrl,
                        method: 'post',
                        data: JSON.stringify({
                            latitude:  position.coords.latitude,
                            longitude: position.coords.longitude
                        }),
                        contentType: 'application/json'
                    });
                });
            }
        }

	app.getId = function(){
		var uid = localStorage.getItem('uid');
		if(uid == null){
			uid = 'sess-' + Math.floor(Math.random() * 1000000);
			localStorage.setItem('uid', uid);
		}
		
		return uid;
	}
	
	return app;
	
}({}, ractive, pymChild));

app.init();





