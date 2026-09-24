import { useParams } from 'react-router-dom';
import ChatbotBuilderForm from '../components/ChatbotBuilderForm';

export default function ChatbotDetailsPage() {
  const { chatbotId } = useParams();
  return (
    <ChatbotBuilderForm
      mode="edit"
      chatbotId={chatbotId}
      onSaved={() => {}}
    />
  );
}
