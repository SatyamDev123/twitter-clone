import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import './style.scss';

class Header extends Component {
	
	logout() {
		localStorage.removeItem('oauthToken');
		localStorage.removeItem('oauthTokenSecret');
		localStorage.removeItem('username');
		localStorage.removeItem('userId');
		this.props.history.push('/');
	}

	render() {
		let userAction, homeUrl = '/';
		const username = localStorage.getItem('username');
		
		if (username) {
			homeUrl = '/home';
			userAction = <div className="user-actions">
				<span style={{marginRight: '15px'}}>@{username}</span>
				<a onClick={this.logout.bind(this)} href="javascript:void(0)">
					Logout
				</a>
			</div>
		}


		return(
			<header className="twitter-clone-header">
				<Link to={homeUrl}>Twitter clone</Link>
				{userAction}
			</header>
		)
	}
}

export default Header;