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
var formSelector = 'form[action="/Login"]';
var profileSelector = 'profile-icon';
var loggedInSelector = 'button.searchTab';

//for filehandling
var fs = require('fs');

//load genres from commandline (into an array)

var titles = [];
var cookieFile = 'netflixlogin.txt';

if (!casper.cli.has("title")) { casper.echo("\nUsage: casperjs titles.js --title=<title-id>").exit(); }

titles.push(casper.cli.get("title")); 



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
          casper.capture('login.png');
      },5000);


      casper.then(function fillAndSubmitLoginForm(){
        casper.then(function () {
          this.echo("Login form loaded. Fill&Submit.");
          casper.capture('login-form.png');
          casper.fillSelectors('form.login-form', {
            "input[name='email']" :    "",
            "input[name='password']" : ""
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
          casper.capture('browse_wizard.png');
        },5000);

        casper.then(function(){
          this.echo("Trying to click on first profile.");
           casper.evaluate(function(){
              document.getElementsByClassName('profile-icon')[0].click();
           });
        });

        casper.waitForSelector(loggedInSelector, function(){
          this.echo("Fully logged in with selected profile. Happy crawling o/.");
          casper.capture('browse_loggedin.png');
        },null,5000);
  }

  casper.openTitle = function(titleUrl){
    this.open(titleUrl);
    this.waitForSelector('div#pane-Overview.jawBonePane', function(){
    this.capture('title.png');
    this.echo("Title has been opened");     
    });
}

//div.title.has-jawbone-nav-transition

casper.getTitle = function(){
  var title = this.evaluate(function(){
    var title = document.getElementsByClassName('title has-jawbone-nav-transition')[0].innerText;
    return title;
  });

    return title;
}

casper.getYear = function(){
  var year = this.evaluate(function(){
    var year = document.getElementsByClassName('year')[0].innerText;
    return year;
  });

    return year;
}

casper.getMaturity = function(){
  var maturity = this.evaluate(function(){
    var maturity = document.getElementsByClassName('maturity-number')[0].innerText;
    return maturity;
  });

    return maturity;
}

casper.getRating = function(){
  var scriptTag = this.fetchText('script');
  var begin = scriptTag.indexOf('\"average\":');
  var getToAvg = scriptTag.substr(begin);

  var end = getToAvg.indexOf('},');
  var averageAttribute = getToAvg.substr(0, end);

  var value = averageAttribute.indexOf(":");
  var average = averageAttribute.substr(value+1);

  return average;
}

casper.getSubtitles = function(){
  var subtitles = this.evaluate(function(){
      var sub = document.getElementsByClassName('subtitles')[0];
      var subtitles = sub.getElementsByTagName('ul')[0].innerText; 
      return subtitles;
  });

    return subtitles;
}


casper.getAudio = function(){
  var audio = this.evaluate(function(){
      var sub = document.getElementsByClassName('audio')[0];
      var audio = sub.getElementsByTagName('ul')[0].innerText; 
      return audio;
  });

    return audio;
}




casper.getInfo = function(title){

  var movie = {};

  casper.then(function(){
    this.openTitle('https://www.netflix.com/title/'+title);
  });

  casper.then(function(){
        
       movie.title = this.getTitle();
       movie.year = this.getYear();
       movie.maturity = this.getMaturity();
       movie.rating = this.getRating();
});

    casper.then(function(){
      this.evaluate(function(){
              document.getElementById('tab-ShowDetails').click();
           });
    });


    casper.then(function(){
         this.waitUntilVisible("div.audio", function(){
         this.echo("Clicked on details tab");
         this.capture("details.png");   
         movie.subtitles = this.getSubtitles();
         movie.audio = this.getAudio();        
        });      
     });

    casper.then(function(){

    var movie_str = JSON.stringify(movie);
    var name = 'pera';

   var request = new XMLHttpRequest();

    request.open("POST", "process.php", true);

 //   request.setRequestHeader("Content-type", "application/json");

    request.send(name);





      /*     this.echo(movie.title);
           this.echo(movie.year);
           this.echo(movie.maturity);
           this.echo(movie.rating);
           this.echo(movie.subtitles);
           this.echo(movie.audio);
           */
        })
    }; 
/*

    casper.waitFor(function check() {

     return this.evaluate(function(){
          var loaded = document.addEventListener("load", function(){
              return true;
            }); 
          return loaded;
          });

    }, function onReceived() {
        this.echo('loaded');
        this.echo("Clicked on details tab");
        this.capture("details.png");       
    }); 







    var me = casper.evaluate(function(){
        if(netflix.falkorCache.videos[titleid].title.value){
          var result = "posotji";
        } else {
          var result = "ne postoji";
        }
        return result;
      });

      return me;



  casper.saveToFile = function(id){
     fs.write('ids.txt', id + '\r\n', 'a');
     
};
*/



/*
 casper.then(function(){
    
    

    
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



*/


casper.then(function(){
  casper.each(titles, function(self, title){
    self.getInfo(title);
  });
});


    casper.run();


    
