#! /usr/bin/env node

console.log(
  'This script populates database with testing models. Specified database as argument - e.g.: populatedb mongodb+srv://cooluser:coolpassword@cluster0.a9azn.mongodb.net/local_library?retryWrites=true'
);

// Get arguments passed on command line
var userArgs = process.argv.slice(2);
if (!userArgs[0].startsWith('mongodb')) {
  console.log(
    'ERROR: You need to specify a valid mongodb URL as the first argument'
  );
  return;
}

var async = require('async');
var Comment = require('./models/comment');
var Post = require('./models/post');
var User = require('./models/user');

var mongoose = require('mongoose');
var mongoDB = userArgs[0];
mongoose.connect(mongoDB, { useNewUrlParser: true, useUnifiedTopology: true });
mongoose.Promise = global.Promise;
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

var comments = [];
var posts = [];
var users = [];

function userCreate(username, password, cb) {
  userdetail = {
    username,
    password,
  };

  var user = new User(userdetail);

  user.save(function (err) {
    if (err) {
      cb(err, null);
      return;
    }
    console.log('New User: ' + user);
    users.push(user);
    cb(null, user);
  });
}

function postCreate(title, message, timestamp, owner, ispublic, cb) {
  postDetail = {
    title,
    message,
    timestamp,
    owner,
    ispublic,
  };

  var post = new Post(postDetail);

  post.save(function (err) {
    if (err) {
      cb(err, null);
      return;
    }
    console.log('New Post: ' + post);
    posts.push(post);
    cb(null, post);
  });
}

function commentCreate(name, comment, timestamp, post, cb) {
  commentdetail = {
    name,
    comment,
    timestamp,
    post,
  };

  var comment = new Comment(commentdetail);

  comment.save(function (err) {
    if (err) {
      cb(err, null);
      return;
    }
    console.log('New comment: ' + comment);
    comments.push(comment);
    cb(null, comment);
  });
}

function createUsers(cb) {
  async.series(
    [
      function (callback) {
        userCreate('dakotapratt', 'password', callback);
      },
      function (callback) {
        userCreate('dpratt', 'password1', callback);
      },
    ],
    // optional callback
    cb
  );
}

function createPosts(cb) {
  async.series(
    [
      //0
      function (callback) {
        postCreate(
          'Post #1',
          'This is the first blog post message content',
          new Date(),
          users[0],
          true,
          callback
        );
      },
      //1
      function (callback) {
        postCreate(
          'Post #2',
          'This is the second blog post message content',
          new Date(),
          users[1],
          false,
          callback
        );
      },
    ],
    // optional callback
    cb
  );
}

function createComments(cb) {
  async.parallel(
    [
      function (callback) {
        commentCreate(
          'Bill',
          'This is a test comment. #1',
          new Date(),
          posts[0],
          callback
        );
      },
      function (callback) {
        commentCreate(
          'Sean',
          'This is another test comment. #2',
          new Date(),
          posts[0],
          callback
        );
      },
      function (callback) {
        commentCreate(
          'Joe',
          'This is a test comment. #3',
          new Date(),
          posts[0],
          callback
        );
      },
      function (callback) {
        commentCreate(
          'Sara',
          'This is a test comment. #1',
          new Date(),
          posts[1],
          callback
        );
      },
      function (callback) {
        commentCreate(
          'Kyle',
          'This is a test comment. #2',
          new Date(),
          posts[1],
          callback
        );
      },
    ],
    // optional callback
    cb
  );
}

async.series(
  [createUsers, createPosts, createComments],
  // Optional callback
  function (err, results) {
    if (err) {
      console.log('FINAL ERR: ' + err);
    }
    // All done, disconnect from database
    mongoose.connection.close();
  }
);
