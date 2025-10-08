import {Outlet} from 'react-router-dom';
import {useAuth} from '../../../../context/AuthContext.js';
import { useNavigate } from 'react-router-dom';

const AdminLayout = () => {
  const {user} = useAuth();
  const navigate = useNavigate();
  
  if (!user || user.role !== 'admin') {
    alert('접근 권한이 없습니다.');
    return navigate('/service');
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


