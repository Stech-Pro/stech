import { useNavigate } from 'react-router-dom';
import VideoSettingModal from '../../../../../components/VideoSettingModal';

export default function VideoSettingsPage() {
  const navigate = useNavigate();
  return <VideoSettingModal isVisible={true} onClose={() => navigate(-1)} />;
}
