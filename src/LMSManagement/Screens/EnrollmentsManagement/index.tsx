import React, {useEffect, useState} from 'react';
import ModuleContent from '../../../CommonUI/ModuleContent';
import ContentHeader from '../../../CommonUI/ModuleContent/ContentHeader';
import axios from 'axios';

const EnrollmentsManagement = () => {
  const [enrollments, setEnrollments] = useState<any[]>();
  const [reload, setReload] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    axios
      .get('lms/enrollments')
      .then(response => {
        setLoading(false);
        setEnrollments(response.data);
      })
      .catch(error => {
        setLoading(false);
        console.log(error);
      });
  }, [reload]);

  console.log({enrollments});

  return (
    <ModuleContent>
      <ContentHeader
        loading={loading}
        onRefresh={() => {
          console.log('refresh');
          setReload(!reload);
        }}
        title={'Lista de estudiantes'}
        description={'Esta es la lista de estudiantes matriculados'}
      />
      {enrollments?.map(enrollment => {
        return <div>{enrollment.uuid}</div>;
      })}
    </ModuleContent>
  );
};

export default EnrollmentsManagement;
