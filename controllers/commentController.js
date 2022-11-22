const Comment = require('../models/comment');
const Post = require('../models/post');
const { body, validationResult } = require('express-validator');

exports.comments_list = function (req, res, next) {
  // Fetch all comments
  // Return JSON
  Comment.find({ post: req.params.postid }).exec(function (err, list_comments) {
    if (err) {
      res
        .json({
          message: `Can't find post with id: ${req.params.postid}`,
          error: err,
        })
        .status(400);
      return next(err);
    }
    res.json(list_comments);
  });
};

exports.comment_detail = function (req, res, next) {
  // Fetch specific comment
  // Return JSON
  Post.findById(req.params.postid, (err, post) => {
    if (err) {
      res
        .json({
          message: `Can't find post with id: ${req.params.postid}`,
          error: err,
        })
        .status(400);
      return next(err);
    }
    Comment.findById(req.params.commentid)
      .populate('post')
      .exec(function (err, results) {
        if (err) {
          return next(err);
        }
        res.json(results);
      });
  });
};

exports.comment_post = [
  body('name', 'must provide name').trim().isLength({ min: 1 }).escape(),
  body('comment', 'must provide a comment')
    .trim()
    .isLength({ min: 1 })
    .escape(),
  (req, res, next) => {
    const errors = validationResult(req);

    Post.findById(req.params.postid, (err, post) => {
      if (err) {
        res
          .json({
            message: `Can't find post with id: ${req.params.postid}`,
            error: err,
          })
          .status(400);
        return next(err);
      }
      if (!errors.isEmpty()) {
        res.json(errors);
      } else {
        const comment = new Comment({
          name: req.body.name,
          comment: req.body.comment,
          timestamp: new Date(),
          post: req.params.postid,
        });

        comment.save((err) => {
          if (err) {
            next(err);
          } else {
            res.json({ status: 'Success', comment });
          }
        });
      }
    });
  },
];

// Fetch specific comment
exports.comment_delete = (req, res, next) => {
  Comment.findByIdAndRemove(req.params.commentid, (err, comment) => {
    if (err) {
      return next(err);
    }
    console.log(
      `Successfully removed comment with id: ${req.params.commentid}`
    );
    res.json({ status: 'Successfully removed comment', comment }).status(200);
  });
};

exports.comment_update = [
  // Validate and sanitize fields.
  body('name', 'New name must be a string.').optional().isString(),
  body('comment', 'New comment must be a string.').optional().isString(),
  // Process request after validation and sanitization.
  async (req, res, next) => {
    // Extract the validation errors from a request.
    const errors = validationResult(req);
    const originalComment = await Comment.findById(req.params.commentid).exec();
    console.log(originalComment.name);

    Post.findById(req.params.postid, (err, post) => {
      if (err) {
        res
          .json({
            message: `Can't find post with id: ${req.params.postid}`,
            error: err,
          })
          .status(400);
        return next(err);
      }

      // Create a commemt object with provided data and old id/data.
      const comment = new Comment({
        _id: req.params.commentid, //This is required, or a new ID will be assigned!
        name: req.body.name ? req.body.name : originalComment.name,
        comment: req.body.comment ? req.body.comment : originalComment.comment,
        timestamp: originalComment.timestamp,
        edited_timestamp: new Date(),
      });
      if (!errors.isEmpty()) {
        // There are errors.
        res.json(errors).status(400);
      } else {
        // Data is valid. Update the record.
        Comment.findByIdAndUpdate(
          req.params.commentid,
          comment,
          { returnDocument: 'after' },
          (err, updatedcomment) => {
            if (err) {
              return next(err);
            }
            // Successful: redirect to type detail page.
            res.json({
              status: 'Success',
              old: originalComment,
              updatedcomment,
            });
          }
        );
      }
    });
  },
];
