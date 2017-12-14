# ExEngine-Plus
ExEngine Plus is a collection of server modules allowing game developers to develop online games with RPGmaker MV.

# What is this repository for?
For game developers using RPGmaker MV to create online functionallity such as:
1. Cloud saves
1. Highscores
1. Chat
1. and so much more.
# How do I get set up?

note it has been awhile since I setup this on a server the following is the gist of what it takes to setup and will most likely be updated later

index.html needs the following code: `<script type="text/javascript" src="/socket.io/socket.io.js"></script> <script type="text/javascript"> var socket = io(); window.onbeforeunload = function(e) { socket.disconnect(); }; window.onload = function(e) { socket.connect('https://localhost', {secure: true}); }; </script>`

install Node.js on server install npm on server install repository dependencies using npm install

create an SSL certificate using https://certbot.eff.org/

go to the config directory of the game use command node config.js configure all of the options using command line

Go back to the games main directory use command node index.js

In a browser type in the address of your game Example: *https://www.gameexample.com

# APIs
# API Chat
Send a global text message:
```javascript 
socket.emit('sendChat', 'string');
```

Receive a global text message
```javascript 
/**
data.name: 'name of sender'
data.text: 'message'
*/
socket.on('receiveChat', function (data) {...});
```

Send private message:

```javascript 
socket.emit('sendPrivate', 'to', 'message');
```

Receive a private message
```javascript
/**
data.name: 'name of sender'
data.text: 'message'
*/
socket.on('receivePrivate', function (data) {...});
```
# API metrics
Receive skill data
```javascript
/**
request.name: 'name of actor or enemy'
request.collection: 'name of collection you are accessing'

data.skills: array of objects
data.skills[i].id: skill id
data.skills[i].name: skill name
data.skills[i].uses: skill uses
data.skills[i].skillDamage: array of damage
data.skills[i].avgTargets: array of targets
*/
socket.emit('retrieveData', request, function (data) {...})
```
# Contribution guidelines

    Writing tests:
    
    Code review:
    
    Other guidelines:
    See something in the code that should be changed or want to add a new feature open a pull request. 
    When you contribute to code please add your name to the contributors list. 

# Who do I talk to?

    Repo owner (Sarlecc)
