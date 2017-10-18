/*-----------------------------------------------------------------------------
A simple echo bot for the Microsoft Bot Framework. 
-----------------------------------------------------------------------------*/

var restify = require('restify');
var builder = require('botbuilder');

// Setup Restify Server
var server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, function () {
   console.log('%s listening to %s', server.name, server.url); 
});
  
// Create chat connector for communicating with the Bot Framework Service
var connector = new builder.ChatConnector({
    appId: process.env.MicrosoftAppId,
    appPassword: process.env.MicrosoftAppPassword,
    stateEndpoint: process.env.BotStateEndpoint,
    openIdMetadata: process.env.BotOpenIdMetadata 
});

// Listen for messages from users 
server.post('/api/messages', connector.listen());

/*----------------------------------------------------------------------------------------
* Bot Storage: This is a great spot to register the private state storage for your bot. 
* We provide adapters for Azure Table, CosmosDb, SQL Azure, or you can implement your own!
* For samples and documentation, see: https://github.com/Microsoft/BotBuilder-Azure
* ---------------------------------------------------------------------------------------- */

// Create your bot with a function to receive messages from the user
var bot = new builder.UniversalBot(connector);

// Make sure you add code to validate these fields
// var luisAppId = process.env.LuisAppId;
// var luisAPIKey = process.env.LuisAPIKey;
// var luisAPIHostName = process.env.LuisAPIHostName || 'westus.api.cognitive.microsoft.com';

// const LuisModelUrl = 'https://' + luisAPIHostName + '/luis/v1/application?id=' + luisAppId + '&subscription-key=' + luisAPIKey;

// // Main dialog with LUIS
// var recognizer = new builder.LuisRecognizer(LuisModelUrl);
// var intents = new builder.IntentDialog({ recognizers: [recognizer] })
// /*
// .matches('<yourIntent>')... See details at http://docs.botframework.com/builder/node/guides/understanding-natural-language/
// */
// .onDefault((session) => {
//     session.send('Sorry, I did not understand \'%s\'.', session.message.text);
// });

bot.dialog('/', [greeting, specialRequirements, requirementsCheck]);  
bot.dialog('bookTest', []);

function hi(session){
    builder.Prompts.text(session,"Hi")
}

function greeting(session){
    builder.Prompts.text(session, "Hello. What is your name?");
}

function specialRequirements(session, results){
    //Get name from response to previous question
    session.userData.name = results.response;

    builder.Prompts.choice(session, 'Do you have any special requirements?', "Yes|No", {listStyle: builder.ListStyle.button});
}

function requirementsCheck(session, results){
    if(results.response.index == 0){
        session.endDialog("Sorry you cannot book online. Please call 0011223344");
    }else{
        session.beginDialog('bookTest');
    }
}

function dateOfBirth(session, results){
    builder.Prompts.text(session, "Please enter your Date of Birth in format dd/mm/yyyy");
}

function carReg(session, results){
    builder.Prompts.text(session,"Please enter your car registration");
}

function licenceNo(session, results){
    builder.Prompts.text(session,'Whats your driving licence no?');
}

function drivingLicenceNo(session, results){
    //Get specialRequirements responce from response to previous question
    session.userData.specialRequirements = results.response;

    builder.Prompts.number(session, 'What is Driving Licence No.?');
}

function testType(session, results){

    builder.Prompts.choice(session, 'What type of test would you like to book?', "Motorcar|Small Sized Motorcycle (120cc to 125cc)|Medium Sized Motorcycle (395cc and at least 25KW to 35KW power output)|Large Sized Motorcycle (at least 595cc and at least 40KW)|Moped|Taxi", {listStyle: builder.ListStyle.button});
}