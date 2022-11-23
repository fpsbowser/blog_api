const Comment = require('../models/comment');
const Post = require('../models/post');
const async = require('async');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');

exports.posts_list = function (req, res, next) {
  // Fetch all posts
  // Return JSON
  Post.find({}).exec(function (err, list_posts) {
    if (err) {
      return next(err);
    }
    res.json(list_posts);
  });
};

exports.post_detail = function (req, res, next) {
  // Fetch specific post
  // Return JSON
  Post.findById(req.params.postid).exec(function (err, results) {
    if (err) {
      return next(err);
    }
    res.json(results);
  });
};

// Async parallel find post and all comments for post
// Fetch specific post
exports.post_delete = (req, res, next) => {
  jwt.verify(req.token, process.env.API_SECRET, (err) => {
    if (err) {
      res
        .json({
          message:
            "You don't have Authorization for this operation, please login to an account with authorization",
          status: 403,
        })
        .status(403);
    } else {
      // Authorized User
      async.parallel(
        {
          post(callback) {
            Post.findById(req.params.postid).exec(callback);
          },
          post_comments(callback) {
            Comment.find({ post: req.params.postid }).exec(callback);
          },
        },
        (err, results) => {
          if (err) {
            return next(err);
          }
          // Check to see if post has comments.
          if (results.post_comments.length > 0) {
            // Post has comments.
            // Admin must delete all comments first
            console.log(
              'Failed to delete post because the post has comments! Please delete all comments before attempting to delete a post.'
            );
            res
              .json({
                status:
                  'Failed to delete post because the post has comments! Please delete all comments before attempting to delete a post.',
                post_comments_count: results.post_comments.length,
              })
              .status(400);
            return;
          }
          // Post has no comments. Delete object and send JSON response
          Post.findByIdAndRemove(req.params.postid, (err, post) => {
            if (err) {
              return next(err);
            }
            // Success
            console.log(`Successfully removed post with id: ${post._id}`);
            res.json({ status: 'Successfully removed post', post }).status(200);
          });
        }
      );
    }
  });
};

exports.post_create = [
  body('title', 'must provide title').trim().isLength({ min: 1 }),
  body('message', 'must provide message').trim().isLength({ min: 1 }),
  body('ispublic', 'must specify true or false')
    .trim()
    .isLength({ min: 1 })
    .escape(),
  (req, res, next) => {
    jwt.verify(req.token, process.env.API_SECRET, (err, data) => {
      if (err) {
        res
          .json({
            message:
              "You don't have Authorization for this operation, please login to an account with authorization",
            status: 403,
          })
          .status(403);
      } else {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
          res.json(errors);
        } else {
          const post = new Post({
            title: req.body.title,
            message: req.body.message,
            timestamp: new Date(),
            owner: data.id,
            ispublic: req.body.ispublic,
          });

          post.save((err) => {
            if (err) {
              next(err);
            } else {
              res.json({ status: 'success', post });
            }
          });
        }
      }
    });
  },
];

exports.post_update = [
  // Validate and sanitize fields.
  body('title', 'New title must be a string.').optional().isString(),
  body('message', 'New message must be a string.').optional().isString(),
  body('ispublic', 'Must provide boolean value.').optional().isBoolean(),
  // Process request after validation and sanitization.
  async (req, res, next) => {
    const originalPost = await Post.findById(req.params.postid).exec();
    jwt.verify(req.token, process.env.API_SECRET, (err, data) => {
      if (err) {
        res
          .json({
            message:
              "You don't have Authorization for this operation, please login to an account with authorization",
            status: 403,
          })
          .status(403);
      } else {
        // Extract the validation errors from a request.
        const errors = validationResult(req);
        console.log(originalPost.title);
        // Create a post object with provided data and old id/data.
        const post = new Post({
          _id: req.params.postid, //This is required, or a new ID will be assigned!
          title: req.body.title ? req.body.title : originalPost.title,
          message: req.body.message ? req.body.message : originalPost.message,
          timestamp: originalPost.timestamp,
          owner: originalPost.owner,
          ispublic: req.body.ispublic
            ? req.body.ispublic
            : originalPost.ispublic,
          edited_timestamp: new Date(),
        });
        if (!errors.isEmpty()) {
          // There are errors.
          res.json(errors).status(400);
        } else {
          // Data is valid. Update the record.
          Post.findByIdAndUpdate(
            req.params.postid,
            post,
            { returnDocument: 'after' },
            (err, updatedpost) => {
              if (err) {
                return next(err);
              }
              // Successful: redirect to type detail page.
              res.json({ status: 'Success', old: originalPost, updatedpost });
            }
          );
        }
      }
    });
  },
];
