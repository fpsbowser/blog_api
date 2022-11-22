const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const postSchema = new Schema({
  title: { type: String, required: true },
  message: { type: String, required: true },
  timestamp: { type: Date, required: true },
  owner: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  // comments: [{ type: Schema.Types.ObjectId, ref: 'Comment' }],
  ispublic: { type: Boolean, required: true },
  edited_timestamp: { type: Date },
});

module.exports = mongoose.model('Post', postSchema);
