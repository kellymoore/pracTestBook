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
bot.dialog('bookTest', [drivingLicenceNo, dateOfBirth, testType, testCenter, availableDates]);
bot.dialog('moreTestCenters', [moreTestCentersCountry, moreTestCenters]);
bot.dialog('appointmentTime', []);

function hi(session){
    builder.Prompts.text(session,"Hi")
}

function greeting(session){
    //This will change to options - Book theory, book practical, change/cancel test
    builder.Prompts.text(session, "Hello. What is your name?");
}

function specialRequirements(session, results){
    session.userData.name = results.response;
    session.send("We provide a number of facilities for candidates with disabilities. It is important that you let us know if you: \n - are deaf or have severe hearing difficulties; \n - are in any way restricted in your movements \n - have any physical disability.");

    builder.Prompts.choice(session, 'Do you have any special requirements?', "Yes|No", {listStyle: builder.ListStyle.button});
}

function requirementsCheck(session, results){
    if(results.response.index == 0){
        session.endDialog("Sorry you cannot book online. Please call 0011223344");
    }else{
        session.beginDialog('bookTest');
    }
}

function drivingLicenceNo(session, results){
    builder.Prompts.number(session, 'What is your Driving Licence No.?');
}

function dateOfBirth(session, results){
    builder.Prompts.text(session, "Please enter your Date of Birth in format dd/mm/yyyy");
}

function testType(session, results){
    session.userData.dob = results.response;
    builder.Prompts.choice(session, 'What type of test would you like to book?', "Motorcar|Small Sized Motorcycle (120cc to 125cc)|Medium Sized Motorcycle (395cc and at least 25KW to 35KW power output)|Large Sized Motorcycle (at least 595cc and at least 40KW)|Moped|Taxi", {listStyle: builder.ListStyle.button});
}

//Test Center
function testCenter(session, results){
    session.userData.testType = results.response.entity;
    builder.Prompts.choice(session, "Please select a test centre. The 3 test centers nearest to you that perform "+session.userData.testType+ "tests are:","Belfast - Balmoral|Belfast - Dill Road | Mallusk | More ", {listStyle: builder.ListStyle.button} );
}

function testCenterCheck(session, results){
    if (results.response.entity == "More"){
        //Display more test centers
    }else{
        //move onto next dialog
    }
}

function moreTestCentersCountry(){

}

function moreTestCenters(session){
    builder.Prompts.choice(session, 'What type of test would you like to book?', "Motorcar|Small Sized Motorcycle (120cc to 125cc)|Medium Sized Motorcycle (395cc and at least 25KW to 35KW power output)|Large Sized Motorcycle (at least 595cc and at least 40KW)|Moped|Taxi", {listStyle: builder.ListStyle.button});    
}

//Avilable Dates or choose others
function availableDates(session, results){
    session.userData.testCenter = results.response.entity;
    
    builder.Prompts.choice(session,"Please select an appointment time. The next available appointments at "+session.userData.testCenter+ "on 26/10/2017 are:","10.30am | 11.45am | 2.30pm | 3.15pm" ,  {listStyle: 3});
   
}

//Payment
function payment(session, results){
    
}

function carReg(session, results){
    builder.Prompts.text(session,"Please enter your car registration");
}

//Confirmation
function confirmation(session, results){
    var card = createReceiptCard(session);
    var msg = new builder.Message(session).addAttachment(card);
    
    session.send(msg);
}
function createReceiptCard(session) {
    return new builder.ReceiptCard(session)
        .title('John Doe')
        .facts([
            builder.Fact.create(session, '1234', 'Order Number'),
            builder.Fact.create(session, 'VISA 5555-****', 'Payment Method')
        ])
        .items([
            builder.ReceiptItem.create(session, '$ 38.45', 'Data Transfer')
                .quantity(368),
                //.image(builder.CardImage.create(session, 'https://github.com/amido/azure-vector-icons/raw/master/renders/traffic-manager.png')),
            builder.ReceiptItem.create(session, '$ 45.00', 'App Service')
                .quantity(720),
                //.image(builder.CardImage.create(session, 'https://github.com/amido/azure-vector-icons/raw/master/renders/cloud-service.png'))
        ])
        .tax('$ 7.50')
        .total('$ 90.95')
        .buttons([
            builder.CardAction.openUrl(session, 'https://azure.microsoft.com/en-us/pricing/', 'More Information')
                .image('https://raw.githubusercontent.com/amido/azure-vector-icons/master/renders/microsoft-azure.png')
        ]);
}

