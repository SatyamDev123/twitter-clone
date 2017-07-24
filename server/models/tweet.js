var mongoose = require('mongoose');
var Schema = mongoose.Schema;


// create Tweet Schema
var Tweet = new Schema({
	tweetId: Number,
	upvotes : [{ type: Schema.Types.ObjectId, ref: 'User' }],
	downvotes: [{ type: Schema.Types.ObjectId, ref: 'User' }],
	totalViews: { type: Number, default: 0 }
});


module.exports = mongoose.model('Tweets', Tweet);
