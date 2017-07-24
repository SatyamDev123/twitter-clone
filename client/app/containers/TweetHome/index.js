import React, { Component } from 'react';
import Tweets from '../../components/Tweets';
import { Route } from 'react-router-dom';
import TweetDetails from '../TweetDetails';
import Header from '../../components/Header';

class Home extends Component {

	constructor(props) {
		super(props);

		this.state = {
			isLoggedIn: localStorage.oauthToken ? true : false
		};
	}

	componentDidMount() {
		const { isLoggedIn } = this.state;
		if (!isLoggedIn) {
			this.props.history.push('/');
		}
	}

	render() {
		const { match, history } = this.props;
		return (
			<div className="twitter-clone-home">
				<Header history={history} />
				<Tweets history={history} />
				<Route path={`${match.url}/:username/tweet/:tweet_id`} component={TweetDetails} />
			</div>
		);
	}
}

export default Home;