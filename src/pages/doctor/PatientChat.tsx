import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChatProvider } from '../../context/ChatContext';
import { useChat } from '../../context/ChatContext';
import { ChatContainer } from '../../components/chat/ChatContainer';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { ArrowLeft } from 'lucide-react';

interface PatientChatProps {
  patientId?: string;
}

const PatientChatContent: React.FC<PatientChatProps> = ({ patientId }) => {
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
        const targetPatientId = patientId || id;
        
        if (!targetPatientId) {
          setError('No patient specified');
          setLoading(false);
          return;
        }
        
        // Verify the patient exists
        const { data: patientData, error: patientError } = await supabase
          .from('users')
          .select('*')
          .eq('id', targetPatientId)
          .eq('role', 'patient')
          .single();
        
        if (patientError || !patientData) {
          setError('Patient not found');
          setLoading(false);
          return;
        }
        
        // Create or get existing conversation
        const conversationId = await createConversation(user.id, targetPatientId);
        setActiveConversation(conversationId);
        
      } catch (err: any) {
        console.error('Error initializing chat:', err);
        setError(err.message || 'Failed to initialize chat');
      } finally {
        setLoading(false);
      }
    };
    
    initializeChat();
  }, [user, patientId, id]);
  
  if (loading) {
    return <LoadingSpinner />;
  }
  
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <p className="text-red-500 mb-4">{error}</p>
        <button
          onClick={() => navigate('/doctor/patients')}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Patients</span>
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

export const PatientChat: React.FC<PatientChatProps> = (props) => {
  return (
    <ChatProvider>
      <PatientChatContent {...props} />
    </ChatProvider>
  );
};