import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChatProvider } from '../../context/ChatContext';
import { useChat } from '../../context/ChatContext';
import { ChatContainer } from '../../components/chat/ChatContainer';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { ArrowLeft } from 'lucide-react';

interface ChatWithDoctorProps {
  doctorId?: string;
}

const ChatWithDoctorContent: React.FC<ChatWithDoctorProps> = ({ doctorId }) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { createConversation, setActiveConversation, activeConversationId } = useChat();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const initializeChat = async () => {
      if (!user) return;
      
      try {
        const targetDoctorId = doctorId || id;
        
        if (!targetDoctorId) {
          setError('No doctor specified');
          setLoading(false);
          return;
        }
        
        // Verify the doctor exists
        const { data: doctorData, error: doctorError } = await supabase
          .from('users')
          .select('*')
          .eq('id', targetDoctorId)
          .eq('role', 'doctor')
          .single();
        
        if (doctorError || !doctorData) {
          setError('Doctor not found');
          setLoading(false);
          return;
        }
        
        // Create or get existing conversation
        const conversationId = await createConversation(targetDoctorId, user.id);
        setActiveConversation(conversationId);
        
      } catch (err: any) {
        console.error('Error initializing chat:', err);
        setError(err.message || 'Failed to initialize chat');
      } finally {
        setLoading(false);
      }
    };
    
    initializeChat();
  }, [user, doctorId, id]);
  
  if (loading) {
    return <LoadingSpinner />;
  }
  
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <p className="text-red-500 mb-4">{error}</p>
        <button
          onClick={() => navigate('/patient/doctors')}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Doctors</span>
        </button>
      </div>
    );
  }
  
  return (
    <div className="h-full">
      <ChatContainer conversationId={activeConversationId || ''} />
    </div>
  );
};

export const ChatWithDoctor: React.FC<ChatWithDoctorProps> = (props) => {
  return (
    <ChatProvider>
      <ChatWithDoctorContent {...props} />
    </ChatProvider>
  );
};