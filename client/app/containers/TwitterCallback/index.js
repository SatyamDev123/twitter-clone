import React, { Component } from 'react';
import Loading from '../../components/Loading';
const queryString = require('query-string');
import makeAPICall from '../../helper/api';

class TwitterCallback extends Component {

  componentDidMount() {
		const params = queryString.parse(this.props.location.search);
	  const { oauth_token, oauth_verifier } = params;
		if (oauth_token && oauth_verifier) {
			makeAPICall.get(`/access_token/${oauth_token}/${oauth_verifier}`).then(data => {
				const { oauth_token, oauth_token_secret, username, userId } = data
				oauth_token && localStorage.setItem('oauthToken', oauth_token);
				oauth_token_secret && localStorage.setItem('oauthTokenSecret', oauth_token_secret);
				username && localStorage.setItem('username', username);
				userId && localStorage.setItem('userId', userId);
				this.props.history.push('/');
	    });
		}
  }

  render() {
    return (
      <div>
				<p className="text-center">Please wait setting your twitter clone</p>
        <Loading />
      </div>
    );
  }
}

export default TwitterCallback;