import React, { Component } from 'react';
import Loading from '../../components/Loading';
import Tweet from '../../components/Tweet/Tweet';
import makeAPICall from '../../helper/api';
import ModalView from '../../components/ModalView'

import './style.scss';

class TweetDetails extends Component {
	
	constructor(props) {
		super(props);

		this.state = {
			isLoading: true,
			tweet: {},
			errorText: '',
			custom_tweet: {} // custom_tweet is for maintaining total view and up/down votes
		}

		this.getTweet = this.getTweet.bind(this);
		this.incrementTweetViews = this.incrementTweetViews.bind(this);
		this.votesTweet = this.votesTweet.bind(this);
		this.closeModal = this.closeModal.bind(this);
	}

	getTweet() {
		const tweetId = this.props.match.params.tweet_id;
		const oauthToken = localStorage.getItem('oauthToken');
    const oauthTokenSecret = localStorage.getItem('oauthTokenSecret');
		makeAPICall.get(`/tweet/${tweetId}/${oauthToken}/${oauthTokenSecret}`).then(data => {
			const errors = data.errors;
			if (errors) {
				const error = errors[0] || {};
				this.setState({
					isLoading: false,
					errorText: error.message
				})
			} else {
				this.setState({
					tweet: data,
					isLoading: false
				});
				this.incrementTweetViews();
			}
    });
	}

	incrementTweetViews() {
		const tweetId = this.props.match.params.tweet_id;
		makeAPICall.post('/tweet/views', { tweetId }).then(data => this.setState({custom_tweet: data}));
	}

	componentDidMount() {
		this.getTweet();
	}
	
	votesTweet(voteType) {
		const username = localStorage.getItem('username');
		const tweetId = this.props.match.params.tweet_id;
		makeAPICall.post('/tweet/votes', { username, tweetId, voteType }).then(data => {
			this.setState({custom_tweet: data});
		});	
	}

	closeModal() {
		this.props.history.push('/home');
	}
	
	render() {
		const { isLoading, tweet, errorText, custom_tweet } = this.state;
		const { totalViews, upvotes, downvotes } = custom_tweet;
		
		let modalContent;

		if (errorText) {
			modalContent = <div className="tweet-details">
				<p>{errorText}</p>
			</div>
		}

		if (isLoading) {
			modalContent =  <div className="tweet-details">
				<Loading />
			</div>
		}

		if (!isLoading && !errorText) {
			modalContent = <div className="tweet-details">
				<div className="tweet-details-header">
					<div className="flex-r-center">
						<span>{totalViews || 0}</span>
						<svg className="svg-icon" viewBox="0 0 20 20">
							<path d="M10,6.978c-1.666,0-3.022,1.356-3.022,3.022S8.334,13.022,10,13.022s3.022-1.356,3.022-3.022S11.666,6.978,10,6.978M10,12.267c-1.25,0-2.267-1.017-2.267-2.267c0-1.25,1.016-2.267,2.267-2.267c1.251,0,2.267,1.016,2.267,2.267C12.267,11.25,11.251,12.267,10,12.267 M18.391,9.733l-1.624-1.639C14.966,6.279,12.563,5.278,10,5.278S5.034,6.279,3.234,8.094L1.609,9.733c-0.146,0.147-0.146,0.386,0,0.533l1.625,1.639c1.8,1.815,4.203,2.816,6.766,2.816s4.966-1.001,6.767-2.816l1.624-1.639C18.536,10.119,18.536,9.881,18.391,9.733 M16.229,11.373c-1.656,1.672-3.868,2.594-6.229,2.594s-4.573-0.922-6.23-2.594L2.41,10l1.36-1.374C5.427,6.955,7.639,6.033,10,6.033s4.573,0.922,6.229,2.593L17.59,10L16.229,11.373z"></path>
						</svg>
					</div>
					<svg onClick={this.closeModal} className="svg-icon" viewBox="0 0 20 20">
						<path d="M10.185,1.417c-4.741,0-8.583,3.842-8.583,8.583c0,4.74,3.842,8.582,8.583,8.582S18.768,14.74,18.768,10C18.768,5.259,14.926,1.417,10.185,1.417 M10.185,17.68c-4.235,0-7.679-3.445-7.679-7.68c0-4.235,3.444-7.679,7.679-7.679S17.864,5.765,17.864,10C17.864,14.234,14.42,17.68,10.185,17.68 M10.824,10l2.842-2.844c0.178-0.176,0.178-0.46,0-0.637c-0.177-0.178-0.461-0.178-0.637,0l-2.844,2.841L7.341,6.52c-0.176-0.178-0.46-0.178-0.637,0c-0.178,0.176-0.178,0.461,0,0.637L9.546,10l-2.841,2.844c-0.178,0.176-0.178,0.461,0,0.637c0.178,0.178,0.459,0.178,0.637,0l2.844-2.841l2.844,2.841c0.178,0.178,0.459,0.178,0.637,0c0.178-0.176,0.178-0.461,0-0.637L10.824,10z"></path>
					</svg>
				</div>
				<div className="tweet-details-content">
					<div className="tweet-details-content-left">
						<section>
							<div className="flex-r-center">
								<span>{upvotes && upvotes.length}</span>
								<svg className="svg-icon" viewBox="0 0 20 20" onClick={() => this.votesTweet('up')}>
									<path d="M13.889,11.611c-0.17,0.17-0.443,0.17-0.612,0l-3.189-3.187l-3.363,3.36c-0.171,0.171-0.441,0.171-0.612,0c-0.172-0.169-0.172-0.443,0-0.611l3.667-3.669c0.17-0.17,0.445-0.172,0.614,0l3.496,3.493C14.058,11.167,14.061,11.443,13.889,11.611 M18.25,10c0,4.558-3.693,8.25-8.25,8.25c-4.557,0-8.25-3.692-8.25-8.25c0-4.557,3.693-8.25,8.25-8.25C14.557,1.75,18.25,5.443,18.25,10 M17.383,10c0-4.07-3.312-7.382-7.383-7.382S2.618,5.93,2.618,10S5.93,17.381,10,17.381S17.383,14.07,17.383,10"></path>
								</svg>
							</div>
							<div className="flex-r-center">
								<span>{downvotes && downvotes.length}</span>
								<svg className="svg-icon" viewBox="0 0 20 20" onClick={() => this.votesTweet('down')}>
									<path d="M13.889,11.611c-0.17,0.17-0.443,0.17-0.612,0l-3.189-3.187l-3.363,3.36c-0.171,0.171-0.441,0.171-0.612,0c-0.172-0.169-0.172-0.443,0-0.611l3.667-3.669c0.17-0.17,0.445-0.172,0.614,0l3.496,3.493C14.058,11.167,14.061,11.443,13.889,11.611 M18.25,10c0,4.558-3.693,8.25-8.25,8.25c-4.557,0-8.25-3.692-8.25-8.25c0-4.557,3.693-8.25,8.25-8.25C14.557,1.75,18.25,5.443,18.25,10 M17.383,10c0-4.07-3.312-7.382-7.383-7.382S2.618,5.93,2.618,10S5.93,17.381,10,17.381S17.383,14.07,17.383,10"></path>
								</svg>
							</div>
						</section>
					</div>
					<div className="tweet-details-content-right">
						<Tweet data={tweet} />
					</div>
				</div>
			</div>
		}

		return (
			<ModalView closeModal={this.closeModal}>
				{modalContent}
			</ModalView>
		);
	}
}

export default TweetDetails;