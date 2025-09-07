import { Outlet } from 'react-router-dom';
import {ProfileHeader} from './ProfileHeader.js';

const ProfileLayout = () => {
    return (
        <div>
          <ProfileHeader/>
            <Outlet />
        </div>
    );
}

export default ProfileLayout;