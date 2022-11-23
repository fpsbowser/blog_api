var express = require('express');
var router = express.Router();

const comment_controller = require('../controllers/commentController');
const post_controller = require('../controllers/postController');
const auth_controller = require('../controllers/authController');

//MIDDLEWARE
const verifyToken = (req, res, next) => {
  console.log('Verify Token RAN');

  const bearerHeader = req.headers['authorization'];
  if (typeof bearerHeader !== 'undefined') {
    const bearer = bearerHeader.split(' ');
    const bearerToken = bearer[1];
    // Set token
    req.token = bearerToken;
    next();
  } else {
    // Forbidden
    return res
      .json({
        message: "You don't have Authorization for this operation",
        status: 403,
      })
      .status(403);
  }
};

/* GET API home page. */
router.get('/', function (req, res, next) {
  res.json({ message: 'blog_api home' });
});

router.get('/posts', post_controller.posts_list);

router.post('/posts', verifyToken, post_controller.post_create);

router.get('/posts/:postid', post_controller.post_detail);

router.put('/posts/:postid', verifyToken, post_controller.post_update);

router.delete('/posts/:postid', verifyToken, post_controller.post_delete);

// COMMENTS
router.get('/posts/:postid/comments', comment_controller.comments_list);

router.delete(
  '/posts/:postid/comments',
  verifyToken,
  comment_controller.comments_list_delete
);

router.post('/posts/:postid/comments', comment_controller.comment_post);

router.get(
  '/posts/:postid/comments/:commentid',
  comment_controller.comment_detail
);

router.put(
  '/posts/:postid/comments/:commentid',
  verifyToken,
  comment_controller.comment_update
);

router.delete(
  '/posts/:id/comments/:commentid',
  verifyToken,
  comment_controller.comment_delete
);

// LOGIN & AUTHENTICATION
router.post('/login', auth_controller.post_login);

router.post('/signup', auth_controller.post_signup);

module.exports = router;
