import { useNavigate } from 'react-router-dom';
import ChatbotBuilderForm from '../components/ChatbotBuilderForm';

export default function AssistDashboard() {
  const navigate = useNavigate();
  return (
    <ChatbotBuilderForm
      mode="create"
      onSaved={(id) => navigate(`/dashboard/assist/bots/${id}`)}
    />
  );
}
