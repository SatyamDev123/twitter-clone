import React from 'react';
import { Switch, Route, Redirect } from 'react-router-dom';
import TwitterCallback from '../TwitterCallback';
import Home from '../Home';
import TweetHome from '../TweetHome';

import './style.scss';

const App = () => (
  <main>
    <Switch>
      <Route exact path="/" component={Home} />
      <Route path="/home" component={TweetHome} />
      <Route path="/auth/twitter/callback" component={TwitterCallback} />
      <Redirect to="/" />
    </Switch>
  </main>
);

export default App;
