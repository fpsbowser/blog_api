const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const commentSchema = new Schema({
  name: { type: String, required: true },
  comment: { type: String, required: true },
  timestamp: { type: Date, required: true },
  post: { type: Schema.Types.ObjectId, ref: 'Post', required: true },
  edited_timestamp: { type: Date },
});

module.exports = mongoose.model('Comment', commentSchema);
