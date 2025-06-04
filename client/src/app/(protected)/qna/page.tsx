'use client'

import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { AlertCircle, Eye, RefreshCw, MessageCircle, FileText, Loader2 } from 'lucide-react';
import AIQueryModal from '@/components/custom/AIQueryModal';

interface FileReference {
  filename: string;
  relevantLines: string;
  codeSnippet: string;
  explanation: string;
  language: string;
}

interface QueryResponse {
  id: string;
  question: string;
  answer: string;
  fileReferences: FileReference[];
  summary?: string;
  confidence?: string;
  additionalNotes?: string;
}

interface ApiResponse {
  data: QueryResponse[];
  message?: string;
}

const QnA: React.FC = () => {
  const [questions, setQuestions] = useState<QueryResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedQuestionId, setSelectedQuestionId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const selectedQuestion = questions.find(q => q.id === selectedQuestionId);

  const handleModalClose = useCallback(() => {
    setIsModalOpen(false);
    setSelectedQuestionId(null);
  }, []);

  const handleViewQuestion = useCallback((id: string) => {
    setSelectedQuestionId(id);
    setIsModalOpen(true);
  }, []);

  const fetchQuestions = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      
      const response = await axios.get<ApiResponse>(`${process.env.NEXT_PUBLIC_URL}/api/repo/questions`, {
        withCredentials: true,
        timeout: 10000, // 10 second timeout
      });

      if (response.data?.data) {
        setQuestions(response.data.data);
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error) {
      console.error('Error fetching questions:', error);
      
      if (axios.isAxiosError(error)) {
        setError('An unexpected error occurred : ' + error);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const handleRetry = useCallback(() => {
    fetchQuestions();
  }, [fetchQuestions]);

  useEffect(() => {
    fetchQuestions();
  }, [fetchQuestions]);

  // Loading State
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <div className="text-center">
          <h2 className="text-lg font-semibold text-gray-900">Loading Questions</h2>
          <p className="text-sm text-gray-500 mt-1">Please wait while we fetch your questions...</p>
        </div>
      </div>
    );
  }

  // Error State
  if (error && !loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <div className="text-center space-y-3">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto" />
          <h2 className="text-lg font-semibold text-gray-900">Something went wrong</h2>
          <p className="text-sm text-red-600 max-w-md">{error}</p>
          <button
            onClick={handleRetry}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            <RefreshCw className="h-4 w-4" />
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Empty State
  if (questions.length === 0 && !loading && !error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <div className="text-center space-y-3">
          <MessageCircle className="h-12 w-12 text-gray-400 mx-auto" />
          <h2 className="text-lg font-semibold text-gray-900">No Questions Found</h2>
          <p className="text-sm text-gray-500 max-w-md">
            There are no questions available at the moment. Check back later or contact support if this seems incorrect.
          </p>
          <button
            onClick={handleRetry}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Questions & Answers</h1>
          <p className="text-sm text-gray-600 mt-1">
            {questions.length} question{questions.length !== 1 ? 's' : ''} available
          </p>
        </div>

      </div>

      {/* Questions List */}
      <div className="grid gap-4">
        {questions.map((item) => (
          <div
            key={item.id}
            className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden"
          >
            <div className="p-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <MessageCircle className="h-5 w-5 text-blue-600 flex-shrink-0" />
                    <span className="text-xs font-medium text-blue-600 uppercase tracking-wide">
                      Question
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 leading-tight">
                    {item.question}
                  </h3>
                  
                  {/* Metadata */}
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    {item.fileReferences?.length > 0 && (
                      <div className="flex items-center gap-1">
                        <FileText className="h-4 w-4" />
                        <span>{item.fileReferences.length} file reference{item.fileReferences.length !== 1 ? 's' : ''}</span>
                      </div>
                    )}
                    {item.confidence && (
                      <div className="flex items-center gap-1">
                        <div className="h-2 w-2 rounded-full bg-green-500"></div>
                        <span>Confidence: {item.confidence}</span>
                      </div>
                    )}
                  </div>
                </div>
                
                <button
                  onClick={() => handleViewQuestion(item.id)}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors flex-shrink-0"
                >
                  <Eye className="h-4 w-4" />
                  View Details
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {selectedQuestion && (
        <AIQueryModal
          isOpen={isModalOpen}
          onClose={handleModalClose}
          data={selectedQuestion}
          isViewMode={true}
        />
      )}
    </div>
  );
};

export default QnA;