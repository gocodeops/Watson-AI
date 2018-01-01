const express = require('express');
const app = express()

// watson Chatbot
var ConversationV1 = require('watson-developer-cloud/conversation/v1');
// Set up Conversation service.
var conversation = new ConversationV1({
    username: '', // replace with username from service key
    password: '', // replace with password from service key
    path: { workspace_id: '' }, // replace with workspace ID
    version_date: '2017-07-22'
});

app.get('/mitta/:message', function(req, res) {
    // Start conversation with empty message.
    conversation.message({}, processResponse);

    var i = 0;
    var endConversation = false;

    // Process the conversation response.
    function processResponse(err, response) {
        i++;

        if (err) {
            console.error(err); // something went wrong
            return;
        }

        // stop the chat when entering second response
        if (i >= 2) {
            if (response.output.action === 'display_time') {
                res.send('The current time is ' + new Date().toLocaleTimeString());
            } else {
                if (response.output.text.length != 0) {
                    res.send({ "message": response.output.text[0], "action": response.output.action });
                }
            }
            endConversation = true;
        }

        // If we're not done, prompt for the next round of input.
        if (!endConversation) {
            var newMessageFromUser = req.params.message;
            conversation.message({
                input: { text: newMessageFromUser },
                // Send back the context to maintain state.
                context: response.context,
            }, processResponse)
        }
    }
});

// start the ExpressJS Server
app.listen(3000, function() {
    console.log('Listening on port 3000!');
});
