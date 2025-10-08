import {Outlet} from 'react-router-dom';
import {useAuth} from '../../../../context/AuthContext.js';

const AdminLayout = () => {
  const {user} = useAuth();
  
  if (!user || user.role !== 'admin') {
    return <div>접근 권한이 없습니다.</div>;
  }
  
  return(
    <div>
      <div>
        <Outlet/>
      </div>
    </div>
  )
}

export default AdminLayout;


