import React, { Component } from 'react';
import Tweets from '../../components/Tweets';
import { Route } from 'react-router-dom';
import TweetDetails from '../TweetDetails';
import Header from '../../components/Header';
import './style.scss';

class Home extends Component {

	constructor(props) {
		super(props);

		this.state = {
			isLoggedIn: localStorage.oauthToken ? true : false
		};
	}

	componentDidMount() {
		const { isLoggedIn } = this.state;
		if (isLoggedIn) {
			this.props.history.push('/home');
		}
	}

	render() {

		return (
			<div className="twitter-clone-home">
				<Header history={history} />
				<div className="login-container">
					<a className="twit-btn login-btn" href="/auth/twitter">Login with twitter</a>
				</div>
			</div>
		);
	}
}

export default Home;