import {useEffect, useState} from 'react';
import dayjs from 'dayjs';
import {Divider, Empty, Image, Space, Tooltip} from 'antd';
import axios from 'axios';

import type {ApiFile} from '../../../Types/api';
import FileIcon from '../../../FileManagement/Components/FileIcon';
import ErrorHandler from '../../../Utils/ErrorHandler';
import EntityActivityIcon from '../../../CommonUI/EntityActivityManager/EntityActivityIcon';
import LoadingIndicator from "../../../CommonUI/LoadingIndicator";

interface ProfileActivityProps {
  profileUuid: string;
}

const ProfileActivity = ({profileUuid}: ProfileActivityProps) => {
  const [activity, setActivity] = useState<any[]>();
  const [loading, setLoading] = useState(false);
  const [reload, _setReload] = useState(false);

  useEffect(() => {
    const cancelTokenSource = axios.CancelToken.source();
    const config = {
      cancelToken: cancelTokenSource.token,
      params: {
        profile_uuid: profileUuid,
      },
    };
    setLoading(true);
    axios
      .get(`entity-activity`, config)
      .then(response => {
        setLoading(false);
        if (response) {
          setActivity(response.data.data);
        }
      })
      .catch(e => {
        setLoading(false);
        ErrorHandler.showNotification(e);
      });

    return cancelTokenSource.cancel;
  }, [reload, profileUuid]);

  return (
    <div>
      <LoadingIndicator visible={loading} message={'Cargando actividad'}/>
      {!activity?.length && (<Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={'No hay actividad registrada'}/>)}
      {activity?.map(a => {
        return (
          <div key={a.uuid} className={`activity-item ${a.type}`}>
            <Space>
              <div className={'author'}>
                <EntityActivityIcon type={a.type} size={25}/>
                <br/>
                {a.expired_at && <small>{dayjs(a.expired_at).format('DD/MM')}</small>}
              </div>
              <div className={'message'}>
                {a.comment}
                <small>
                  {dayjs(a.created_at).format('dddd DD MMMM YYYY hh:mm a')} por {a.profile.name}
                </small>
                <Image.PreviewGroup>
                  {a.attachments?.map((at: ApiFile) => (
                    <>
                      {at.type.includes('ima') ? (
                        <Image
                          key={at.uuid}
                          preview={{
                            destroyOnClose: true,
                            src: at.source,
                          }}
                          loading={'lazy'}
                          src={at.thumbnail}
                          width={30}
                        />
                      ) : (
                        <Tooltip title={at.name}>
                          <a href={at.source} target={'_blank'}>
                            <FileIcon file={at} size={25}/>
                          </a>
                        </Tooltip>
                      )}
                    </>
                  ))}
                </Image.PreviewGroup>
              </div>
            </Space>

            <Divider/>
          </div>
        );
      })}
    </div>
  );
};

export default ProfileActivity;
