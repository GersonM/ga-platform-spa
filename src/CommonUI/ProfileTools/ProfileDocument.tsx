
import type {Profile} from '../../Types/api';

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
      <code>
        {profile?.doc_number || 'Sin documento'}
      </code>
    </>
  );
};

export default ProfileDocument;
