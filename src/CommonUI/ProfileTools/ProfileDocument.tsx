import React from 'react';
import {Profile} from '../../Types/api';

interface ProfileDocumentProps {
  profile?: Profile;
}

const ProfileDocument = ({profile}: ProfileDocumentProps) => {
  if (!profile) {
    return <>Sin documento</>;
  }
  return (
    <>
      <span style={{textTransform: 'uppercase'}}>{profile?.doc_type || 'DNI'}: </span>
      {profile?.doc_number}
    </>
  );
};

export default ProfileDocument;
