import React from 'react';
import { FileManager, FileNavigator } from '@opuscapita/react-filemanager';
import connectorNodeV1 from '@opuscapita/react-filemanager-connector-node-v1';
import connectorOverrides from './overrides/connectors'

const apiOptions = {
  ...connectorNodeV1.apiOptions,
  apiRoot: process.env.REACT_APP_API_ROOT,
  authTokenEndpoint: process.env.REACT_APP_AUTH_TOKEN_URL,
}

const FSManager = (props) => {
  const path = props.location.pathname;

  return (
   <div style={{ height: '480px' }}>
      <FileManager>
        <FileNavigator
          id="filemanager-1"
          api={connectorOverrides.api}
          apiOptions={apiOptions}
          capabilities={connectorNodeV1.capabilities}
          listViewLayout={connectorOverrides.listViewLayout}
          viewLayoutOptions={connectorNodeV1.viewLayoutOptions}
          initialResourceId={path}
          onResourceChange={
            resource => {
              const pathRegex = new RegExp(path);
              const resourcePath = '/' + resource.path;
              if (!pathRegex.test(resourcePath)) return props.navigate(resourcePath);
            }
          }
          signInRenderer={() => (
            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
              <strong
                style={{
                  marginBottom: '12px',
                  textShadow: 'rgba(0, 0, 0, 0.25) 0px 2px 16px, rgba(0, 0, 0, 0.15) 0px 1px 4px'
                }}
              >
                Aggregate Drive</strong>
              <button
                className="btn btn-primary"
                type="button"
                onClick={window.googleDriveSignIn}
                style={{
                  marginBottom: '8px',
                  border: 'none',
                  borderRadius: '2px',
                  boxShadow: '0 2px 16px rgba(0, 0, 0, 0.25), 0px 1px 4px rgba(0, 0, 0, 0.15)'
                }}
              >
                Sign in
              </button>
            </div>
          )}
        />
      </FileManager>
    </div>
  )
};

export default FSManager;
