var crypto = require('crypto')
var request = require('request')
var url = require('url')
var irc = require('./IRC/lib/irc')
var ntwitter = require('ntwitter')
var twitter = require('twitter')
var qs = require('querystring')

// separate accounts to post and search because twitter was sending me 500s
// when I tried to use the same oauth creds for both twitter() and ntwitter()

var postOauth = {
  consumer_key: '',
  consumer_secret: '',
  access_token_key: '',
  access_token_secret: ''
}

var searchOauth = {
  consumer_key: '',
  consumer_secret: '',
  access_token_key: '',
  access_token_secret: ''
}

var botName = "sandybot"
var botChannel = "#sandyaid"

var bot = new irc({ server: 'irc.freenode.net'});
bot.connect(function () {
  bot.nick(botName)
  bot.join(botChannel)
})

bot.addListener('privmsg', function(msg) {
  // { person: { nick: 'mbalho', user: '~max'},
  //     command: 'PRIVMSG',
  //     params: [ '#sandyaid', 'sandybot: test' ] }
  if (msg.params[0].indexOf(botChannel) === -1) return
  if (msg.params[1].indexOf(botName + ':') !== 0) return
  var tweetID = msg.params[1]
  tweetID = tweetID.replace(botName + ': ', '')
  tweetID = tweetID.split(' ')[0]
  bot.privmsg(botChannel, 'tweeting ' + tweetID + '...' )
  twitter.retweetStatus(tweetID, function(data) {
    console.log('retweeted', tweetID)
  })
})

var twitter = new twitter(postOauth)
var tweets = new ntwitter(searchOauth)

tweets.stream('statuses/filter', { track: 'sandyaid, sandyvolunteer' }, function(stream) {
  stream.on('data', function(tweet) {
    if (tweet.text.match(/^RT/)) return
    bot.privmsg('#sandyaid', 'Tweet ' + tweet.id_str + " - @" + tweet.user.screen_name + ': ' + tweet.text)
  });
  console.log("listening for tweets...");
});
