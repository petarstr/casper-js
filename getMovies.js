var casper = require('casper').create({
    verbose: true,
    logLevel: 'error',
    pageSettings: {
        loadImages: false,//The script is much faster when this field is set to false
        loadPlugins: false,
        userAgent: 'Mozilla/5.0 (Windows NT 6.3; WOW64; rv:49.0) Gecko/20100101 Firefox/49.0'
    }
});

casper.options.viewportSize = {width: 1920, height: 1080};//Set bigger screen
 
//define urls
var homeUrl = 'https://netflix.com';
var loginUrl = '/Login';
var browseUrl = '/browse';

//define selectors
var loginSelector = 'a.authLinks.signupBasicHeader';
//var formSelector = 'form[action="/Login"]';
var formSelector = 'form.login-form';
var profileSelector = 'profile-icon';
var loggedInSelector = 'button.searchTab';

var genres = [];

//for filehandling
var fs = require('fs');
var stream = fs.open('files/genres.txt', 'r');

//load all genres into array
while(!stream.atEnd()) {
    var line = stream.readLine();
    genres.push(line);
}

//visit netflix and check if we are logged in

casper.start(homeUrl, function() {
    if (this.exists(loginSelector)) {
        this.logIn();
    } else {
        this.echo("We are already logged in.");
        this.profileSelection();
    }
});


  casper.logIn = function(){

      casper.then(function(){
          this.echo("We are not logged in.");
          casper.click(loginSelector);
          this.echo("Clicked on sign in button.");
    });

      casper.waitForUrl(loginUrl, function(){
          this.echo("Redirected to /login");
          casper.capture('images/login.png');
      },5000);


      casper.then(function fillAndSubmitLoginForm(){
        casper.waitForSelector(formSelector, function () {
          this.echo("Login form loaded. Fill&Submit.");
          casper.capture('images/login-form.png');
          casper.fillSelectors(formSelector, {
            "input[name='email']" :    "nflx@xdxdxd.de",
            "input[name='password']" : "schwerespasswort123"
          }, false); //dont autosubmit
        casper.click('button.btn.login-button.btn-submit.btn-small');
        });
      });

       casper.then(function(){
            this.profileSelection();
       });
    };




  casper.profileSelection = function(){
        
        casper.waitForUrl('/browse', function(){
          this.echo("Redirected to /browse - profile selection.");
          casper.capture('images/browse_wizard.png');
        },5000);

        casper.then(function(){
          this.echo("Trying to click on first profile.");
           casper.evaluate(function(){
              document.getElementsByClassName('profile-icon')[0].click();
           });
        });

        casper.waitForSelector(loggedInSelector, function(){
          this.echo("Fully logged in with selected profile. Happy crawling o/.");
          casper.capture('images/browse_loggedin.png');
        },null,5000);
  
  }







// New defined function to get current body height

casper.getHeight = function(){

    var bodyLength = casper.evaluate(function(){
      return document.body.scrollHeight;
    });
    return bodyLength;
  };


// New defined function to compare old body height with a new one after scrolling, with a recursion

casper.scrollDown = function(newBodyLength){
  this.wait(10000, function(){
  var bodyLength = this.getHeight();
  this.echo(bodyLength);

    if(bodyLength != newBodyLength){
           this.scrollToBottom();
           this.echo("Scrolled");
           this.scrollDown(bodyLength);
    }   
  });
};

casper.saveToFile = function(id){
     fs.write('files/ids.txt', id + '\r\n', 'a');
     
};

casper.openGenre = function(genre){
    this.open(genre);
    this.capture('images/genre.png');
    this.echo("Genre has been opened");
}


casper.on('error', function(msg,backtrace) {
  this.capture('./out/error.png');
  throw new ErrorFunc("fatal","error","filename",backtrace,msg);
});


//open genre and collect all ids.
casper.getAll = function(genre){


  casper.then(function(){
      this.openGenre(genre);
  });

  casper.waitForUrl(/genre/, function(){
      this.scrollDown(0); 
  });

  casper.then(function(){
    this.capture('images/scrolled.png');
  });

  casper.then(function(){
    var page = this.getPageContent();
    var regEx = /video_id(%22:)?(":)?(\d+)/g;

    var match = regEx.exec(page);
    var counter = 0;
    var ids = [];

    while(match !== null) {
       
       ids.push(match[3]);
       this.saveToFile(match[3]);
       match = regEx.exec(page);
       
        counter++;
    }

   // console.log(genre);
    console.log("Current genre is: " + this.getCurrentUrl());
    console.log("IDs from this genre: ");

    for(var i = 0; i < ids.length; i++){
      console.log(ids[i]);
    }

    console.log(ids.length);
    console.log("IDs written to file");

  });
}


//Loop genres
casper.then(function(){
  casper.each(genres, function(self, genre){
    self.getAll(genre);
  });
});

 
casper.run();




