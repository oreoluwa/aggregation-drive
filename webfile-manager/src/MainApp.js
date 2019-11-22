import React, { Fragment } from 'react';
import { Router } from "@reach/router";

import AggregateDriveManager from './AggregateDriveManager';

const App = () => {
  return (
    <Router>
      <Fragment path="/">
        <AggregateDriveManager path="*" />
        <AggregateDriveManager path="/:fileId" />
      </Fragment>
    </Router>
  );
};


export default App;
