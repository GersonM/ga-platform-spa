import {useContext} from 'react';
import Helmet from 'react-helmet';
import AuthContext from '../../Context/AuthContext';

interface MetaTitleProps {
  title?: string;
  description?: string;
  favicon?: string;
}

const MetaTitle = ({title = 'Plataforma'}: MetaTitleProps) => {
  const {config} = useContext(AuthContext);
  return <Helmet title={`${title} :. ${config?.config.name || 'Geek Advice'}`} />;
};

export default MetaTitle;
