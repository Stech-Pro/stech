import {Outlet} from 'react-router-dom';

const AdminLayout = () => {
  return(
    <div>
      <div>
        <Outlet/>
      </div>
    </div>
  )
}

export default AdminLayout;


