// *** main dependencies *** //
var express = require('express');
var path = require('path');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var passport = require('passport');
var session = require('express-session');
var mongoose = require('mongoose');
var passportTwitter = require('./auth/twitter');
var request = require('request');

var Twit = require('twit');
var config = require('./_config');

var User = require('./models/user');
var Tweet = require('./models/tweet');

// *** express instance *** //
var app = express();


// *** mongoose *** //
mongoose.connect('mongodb://localhost/twitterclone');


// *** config middleware *** //
app.use(logger('dev'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, '../client/build')));
app.use(session({
  secret: 'keyboard cat',
  resave: true,
  saveUninitialized: true
}));
app.use(passport.initialize());
app.use(passport.session());

// *** common config for Twit module *** //

const common_config = {
  consumer_key:         config.twitter.consumerKey,
  consumer_secret:      config.twitter.consumerSecret,
  timeout_ms:           60*1000 // optional HTTP request timeout to apply to all requests.
};

// *** main routes *** //

// twitter login route
app.get('/auth/twitter', passportTwitter.authenticate('twitter'));

// access token route
app.get('/access_token/:authToken/:oauthVerifier', function(req, res, next) {
  const authToken = req.params.authToken;
  const oauthVerifier = req.params.oauthVerifier;

  // post on oauth/access_token for access_token and access_token_secret
  // then get account/settings for username 
  // then save/update user
  request.post({
    headers: {
      'Authorization': `OAuth oauth_consumer_key=${config.twitter.consumerKey},oauth_nonce=${Date.now()},oauth_signature=${config.twitter.consumerSecret},oauth_signature_method="HMAC-SHA1",oauth_timestamp=${Date.now()},oauth_token=${authToken},oauth_version="1.0"`,
      'content-type' : 'application/x-www-form-urlencoded',
      'Accept': 'application/json'
    },
    url:     'https://api.twitter.com/oauth/access_token',
    body:    `oauth_verifier=${oauthVerifier}`
  }, function(error, response, body) {
    const splitBody = body.split('&');
    if (splitBody.length > 1) {
      const oauth_token = splitBody[0].split('=')[1];
      const oauth_token_secret = splitBody[1].split('=')[1];
      
      common_config.access_token = oauth_token;
      common_config.access_token_secret = oauth_token_secret;
      const T = new Twit(common_config);
      // get user settings
      T.get('account/settings' , function(err, data, response) {
        const updates = {
          name: data.screen_name
        };
        const options = {
          upsert: true,
          new: true
        };
        // update the user if s/he exists or add a new user
        User.findOneAndUpdate({name: data.screen_name}, updates, options, function(err, user) {
          if(err) {
            next(err);
          } else {
            res.json({
              oauth_token: oauth_token,
              oauth_token_secret: oauth_token_secret,
              username: data.screen_name,
              userId: user.id
            });
          }
        });
      });
    }
  });
});

// get user tweets
app.get('/tweets/:oauthToken/:oauthTokenSecret', function(req, res, next) {
  const params = req.params;
  const oauthToken = params.oauthToken;
  const oauthTokenSecret = params.oauthTokenSecret;
  
  const query = req.query;
  const count = query.count;
  const maxTweetId = query.max_id;
  
  // set count for tweets
  const timelineQueryObj = {count: count};
  // check max_id is value is valid
  // max_id is use for getting older tweets after this max_id(tweet_id)
  if (maxTweetId && maxTweetId !== 'undefined') {
    timelineQueryObj['max_id'] = maxTweetId;
  }

  common_config.access_token = oauthToken;
  common_config.access_token_secret = oauthTokenSecret;
  var T = new Twit(common_config);

  // get user home_timeline 
  T.get('statuses/home_timeline', timelineQueryObj , function(err, data, response) {
    if (err) {
      next(err);
    }
    res.json(data);
  });
});

// get tweet by id
app.get('/tweet/:tweetId/:oauthToken/:oauthTokenSecret', function(req, res, next) {
  const oauthToken = req.params.oauthToken;
  const oauthTokenSecret = req.params.oauthTokenSecret;
  const tweetId = req.params.tweetId;

  common_config.access_token = oauthToken;
  common_config.access_token_secret = oauthTokenSecret;
  var T = new Twit(common_config);
  // get single tweet
  T.get('statuses/show' , {id: tweetId}, function(err, data, response) {
    if (err) {
      next(err);
    }
    res.json(data);
  });
});

// vote(up/down) on tweet
// first find the user for pushing and removing id from downvotes and upvotes
// and get the tweet by id
// then handle upvote and downvote then save the tweet
app.post('/tweet/votes', function(req, res, next) {
  const body = req.body;

  User.findOne({'name': body.username}, function(err, user) {
    if (err) {
      next(err);
    }
    Tweet.findOne({tweetId: body.tweetId}, function(err, tweet) {
      if (err) {
        next(err);
      }

      const userDownVotesIndex = tweet.downvotes.indexOf(user.id)
      const userUpVotesIndex = tweet.upvotes.indexOf(user.id);
      if (body.voteType === 'up') {
        // check if user has downvoted
        if (userDownVotesIndex !== -1) {
          tweet.downvotes.splice(userDownVotesIndex, 1);
        }
        // check if user has not upvoted
        if (userUpVotesIndex === -1) {
          tweet.upvotes.push(user.id);
        }
      } else if (body.voteType === 'down') {
        // check if user has upvoted
        if (userUpVotesIndex !== -1) {
          tweet.upvotes.splice(userUpVotesIndex, 1);
        }
        // check if user has not upvoted
        if (userDownVotesIndex === -1) {
          tweet.downvotes.push(user.id);
        }
      }

      tweet.save(function(err, doc) {
        res.json(doc);
      });

    });
  })

});

// increment tweet views count
app.post('/tweet/views', function(req, res, next) {
  const body = req.body;

  const updates = {
    tweetId: body.tweetId,
    $inc: { totalViews: 1 }
  };

  const options = {
    upsert: true,
    new: true
  };

  // update the tweet if he exists or add a new tweet
  Tweet.findOneAndUpdate({tweetId: updates.tweetId}, updates, options, function(err, tweet) {
    if(err) {
      next(err);
    } else {
      res.json(tweet);
    }
  });

});

// handle client side routing
// send index.html on any route that is not specified on server
app.get('*', function(req, res, next) {
  res.sendFile(path.join(__dirname, '../client/build/index.html'));
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});


// *** error handlers *** //

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;
