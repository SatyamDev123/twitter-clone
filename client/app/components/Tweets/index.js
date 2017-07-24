import React, { Component } from 'react';
import Tweet from '../Tweet/Tweet';
import Loading from '../Loading';
import makeAPICall from '../../helper/api';
import { Link } from 'react-router-dom';

import './style.scss';

class Tweets extends Component {

	constructor(props) {
		super(props);

		this.state = {
			tweets: [],
			isLoading: true,
			noOfTweets: 5,
			isLodeMoreLoading: false
		}

		this.loadMoreTweets = this.loadMoreTweets.bind(this);
		this.getTweets = this.getTweets.bind(this);
		this.handleNoOfTweetChange = this.handleNoOfTweetChange.bind(this);
	}

	getTweets(maxTweetId) {
		const { noOfTweets, tweets } = this.state;
		console.log('noOfTweets', noOfTweets);
    const oauthToken = localStorage.getItem('oauthToken');
    const oauthTokenSecret = localStorage.getItem('oauthTokenSecret');
		makeAPICall.get(`/tweets/${oauthToken}/${oauthTokenSecret}?count=${noOfTweets}&max_id=${maxTweetId}`).then(data => {
			this.setState({
				tweets: tweets.concat(data),
				isLoading: false,
				isLodeMoreLoading: false
			});
    });
	}

	loadMoreTweets() {
		const { tweets } = this.state;
		const getLastTweet = tweets[tweets.length - 1];
		this.setState({
			isLodeMoreLoading: true
		});
		this.getTweets(getLastTweet.id);
	}

  componentDidMount() {
		this.getTweets();
  }

	handleNoOfTweetChange(evernt) {
		const value = event.target.value;
		this.setState({
			noOfTweets: value
		});
	}

  render() {
		const { isLoading, tweets, isLodeMoreLoading, noOfTweets } = this.state;
		if (isLoading) {
			return <Loading />
		}

		if (!tweets.length && !isLoading) {
			return <p className="text-center">No tweets found!</p>
		}

    return (
      <div className="tweets">
        <div className="tweets-header">
				 <span>Load tweet count</span>
					<select value={noOfTweets} onChange={this.handleNoOfTweetChange}>
						<option value="5">5</option>
						<option value="10">10</option>
						<option value="15">15</option>
						<option value="20">20</option>
					</select>
        </div>
				<section className="tweets-content">
					{
						tweets.map(tweetData =>
							<Link className="tweet-link" key={tweetData.id} to={`/home/${tweetData.user.screen_name}/tweet/${tweetData.id_str}`}>
								<Tweet data={tweetData} diseableFooterLink={true} />
							</Link>
						)	
					}
				</section>
				<div className="tweets-footer">
					<button className="twit-btn" onClick={!isLodeMoreLoading && this.loadMoreTweets}>{ isLodeMoreLoading ? 'Loading...' : 'Load More' }</button>
				</div>
      </div>
    );
  }
}

export default Tweets;
