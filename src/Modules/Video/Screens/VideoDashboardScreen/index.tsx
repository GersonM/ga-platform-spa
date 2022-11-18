import React, {useEffect, useState} from 'react';
import ModuleSidebar from '../../../../CommonUI/ModuleSidebar';
import ModuleContent from '../../../../CommonUI/ModuleContent';
import NavList, {NavListItem} from '../../../../CommonUI/NavList';
import axios from 'axios';
import Config from '../../../../Config';
import ErrorHandler from '../../../../Utils/ErrorHandler';

const API_CLIENT_ID = '95735119-9850-4c2a-b18c-78cecb022800';
const API_SECRET =
  'SI8a5YKc9vfpHhxp1hc0yu8mfmysKWDd4R6lSDdkd-S6_iwi_5xa5eS4A2PXVb3k2K8e8cJIm0c3eto9vAQQCw';

const VideoDashboardScreen = () => {
  const [videoCode, setVideoCode] = useState<string>();
  const [videoInfo, setVideoInfo] = useState();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const cancelTokenSource = axios.CancelToken.source();
    const config = {
      cancelToken: cancelTokenSource.token,
      params: {
        grant_type: 'client_credentials',
      },
      headers: {
        Accept: '*/*',
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: 'Basic ' + btoa(API_CLIENT_ID) + ':' + btoa(API_SECRET),
        'Access-Control-Allow-Credentials': 'TRUE',
        'Access-Control-Allow-Headers':
          'Content-Type,Authorization,Origin,Accept,Content-Length,X-Requested-With,Cache-Control',
        'Access-Control-Allow-Methods':
          'GET,HEAD,PUT,POST,DELETE,PATCH,OPTIONS',
        'Access-Control-Allow-Origin': '*',
      },
    };
    setLoading(true);
    axios
      .post(`https://oauth.brightcove.com/v4/access_token`, {}, config)
      .then(response => {
        setLoading(false);
        if (response) {
          console.log(response);
        }
      })
      .catch(e => {
        setLoading(false);
        ErrorHandler.showNotification(e);
      });

    return cancelTokenSource.cancel;
  }, []);

  useEffect(() => {
    if (videoCode) {
      const cancelTokenSource = axios.CancelToken.source();
      const config = {
        cancelToken: cancelTokenSource.token,
        params: {},
        headers: {
          Accept: 'application/json;pk=' + Config.policyKey,
        },
      };
      setLoading(true);
      axios.defaults.baseURL = '';
      axios.defaults.headers.common.Authorization =
        'Bearer ' + Config.policyKey;
      axios
        .get(
          'https://edge.api.brightcove.com/playback/v1/accounts/' +
            Config.accountId +
            '/videos/' +
            videoCode,
          config,
        )
        .then(response => {
          setLoading(false);
          if (response) {
            console.log(response.data);
            setVideoInfo(response.data);
          }
        })
        .catch(error => {
          console.log({error});
          setLoading(false);
        });
      return cancelTokenSource.cancel;
    }
  }, [videoCode]);

  return (
    <>
      <ModuleSidebar title={'Videos disponibles'}>
        <NavList>
          <NavListItem
            name={'Video 1'}
            path={'/video/655ef74ea48554e99c95182eb5bec775'}
            onClick={() => setVideoCode('655ef74ea48554e99c95182eb5bec775')}
          />
          <NavListItem
            name={'Video 2'}
            path={'/video/96d47230e8dffdb434de0668249d2db9'}
            onClick={() => setVideoCode('96d47230e8dffdb434de0668249d2db9')}
          />
        </NavList>
      </ModuleSidebar>
      <ModuleContent>
        <h3>Información de video</h3>
      </ModuleContent>
    </>
  );
};

export default VideoDashboardScreen;
