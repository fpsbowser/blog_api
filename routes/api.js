var express = require('express');
var router = express.Router();

const comment_controller = require('../controllers/commentController');
const post_controller = require('../controllers/postController');
const user_controller = require('../controllers/userController');

/* GET API home page. */
router.get('/', function (req, res, next) {
  res.json({ message: 'api home' });
});

// router.post('/', function (req, res, next) {
//   res.json({ message: 'post api' });
// });

router.get('/posts', post_controller.posts_list);

router.post('/posts', post_controller.post_create);

router.get('/posts/:id', post_controller.post_detail);

router.put('/posts/:id', post_controller.post_update);

router.delete('/posts/:id', post_controller.post_delete);

// COMMENTS
router.get('/posts/:id/comments', comment_controller.comments_list);

router.post('/posts/:id/comments/', comment_controller.comment_post);

router.get('/posts/:id/comments/:commentid', comment_controller.comment_detail);

router.put('/posts/:id/comments/:commentid', comment_controller.comment_update);

router.delete(
  '/posts/:id/comments/:commentid',
  comment_controller.comment_delete
);

module.exports = router;
