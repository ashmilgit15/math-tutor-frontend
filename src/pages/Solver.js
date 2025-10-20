import React, { useState } from 'react';
import MathSolverInterface from '../components/MathSolverInterface';
import GraphPanel from '../components/GraphPanel';
import AIAssistant from '../components/AIAssistant';
import ExportPanel from '../components/ExportPanel';
import { solveMathProblem, processOCR, generateGraph, sendChatMessage, generateSessionId, handleApiError } from '../utils/api';

const Solver = () => {
  const [solution, setSolution] = useState(null);
  const [graphData, setGraphData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [chatHistory, setChatHistory] = useState([]);
  const [activeTab, setActiveTab] = useState('solver');
  const [sessionId, setSessionId] = useState(() => generateSessionId());
  const [currentProblemId, setCurrentProblemId] = useState(null);

  const handleSolve = async (problem, imageFile, problemType = 'other') => {
    setIsLoading(true);
    setError(null);
    
    try {
      let problemText = problem;
      
      // If image file is provided, process OCR first
      if (imageFile) {
        const ocrResult = await processOCR(imageFile, sessionId);
        if (ocrResult.success) {
          problemText = ocrResult.extracted_text;
        } else {
          throw new Error(ocrResult.message || 'Failed to extract text from image');
        }
      }
      
      // Solve the math problem
      const solveResult = await solveMathProblem(problemText, problemType, sessionId);
      
      if (solveResult.success) {
        const solutionData = solveResult.solution;
        setSolution({
          problem: problemText,
          steps: solutionData.solution_steps || [],
          finalAnswer: solutionData.final_answer || '',
          problemType: solutionData.problem_type || 'Unknown',
          difficulty: solutionData.difficulty || 'Unknown',
          id: solveResult.problem_id
        });
        
        setCurrentProblemId(solveResult.problem_id);
        
        // Generate graph if the solution has graph data
        if (solutionData.graph_data && Object.keys(solutionData.graph_data).length > 0) {
          setGraphData(solutionData.graph_data);
        } else if (problemText.includes('x') || problemText.includes('y')) {
          // Try to generate a graph for equations with variables
          try {
            const graphResult = await generateGraph(problemText, '2D');
            if (graphResult.success) {
              setGraphData(graphResult.graph_data);
            }
          } catch (graphError) {
            console.warn('Could not generate graph:', graphError);
            // Don't throw error, just continue without graph
          }
        }
        
        // Clear chat history for new problem
        setChatHistory([]);
      } else {
        throw new Error(solveResult.message || 'Failed to solve the problem');
      }
      
    } catch (err) {
      console.error('Error solving problem:', err);
      setError(handleApiError(err));
    } finally {
      setIsLoading(false);
    }
  };

  const handleChatMessage = async (message) => {
    // Add user message immediately
    const userMessage = {
      id: Date.now(),
      type: 'user',
      message: message,
      timestamp: new Date()
    };
    
    setChatHistory(prev => [...prev, userMessage]);
    
    try {
      // Send message to AI assistant
      const chatResult = await sendChatMessage(message, sessionId, currentProblemId);
      
      if (chatResult.success) {
        const aiMessage = {
          id: Date.now() + 1,
          type: 'ai',
          message: chatResult.message.content,
          timestamp: new Date(chatResult.message.timestamp)
        };
        
        setChatHistory(prev => [...prev, aiMessage]);
      } else {
        throw new Error(chatResult.message || 'Failed to get AI response');
      }
    } catch (err) {
      console.error('Error in chat:', err);
      
      // Add error message
      const errorMessage = {
        id: Date.now() + 1,
        type: 'ai',
        message: `Sorry, I encountered an error: ${handleApiError(err)}. Please try again.`,
        timestamp: new Date()
      };
      
      setChatHistory(prev => [...prev, errorMessage]);
    }
  };

  const tabs = [
    { id: 'solver', name: 'Math Solver', icon: '🧮' },
    { id: 'graph', name: 'Graphs', icon: '📊' },
    { id: 'assistant', name: 'AI Assistant', icon: '🤖' },
    { id: 'export', name: 'Export', icon: '📤' }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
              Math Problem Solver
            </h1>
            <p className="text-lg text-gray-600">
              Get step-by-step solutions for any math problem with AI-powered assistance
            </p>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.name}</span>
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Panel - Input/Solver */}
          <div className="lg:col-span-2 space-y-6">
            {activeTab === 'solver' && (
              <MathSolverInterface
                onSolve={handleSolve}
                isLoading={isLoading}
                error={error}
                solution={solution}
                sessionId={sessionId}
              />
            )}
            
            {activeTab === 'graph' && (
              <GraphPanel
                graphData={graphData}
                solution={solution}
              />
            )}
            
            {activeTab === 'assistant' && (
              <AIAssistant
                chatHistory={chatHistory}
                onSendMessage={handleChatMessage}
                solution={solution}
              />
            )}
            
            {activeTab === 'export' && (
              <ExportPanel
                solution={solution}
                graphData={graphData}
                problemId={currentProblemId}
                sessionId={sessionId}
              />
            )}
          </div>

          {/* Right Panel - Solution Steps */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg p-6 sticky top-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Solution Steps
              </h3>
              
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <span className="ml-3 text-gray-600">Solving...</span>
                </div>
              ) : error ? (
                <div className="text-center py-8">
                  <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <p className="text-red-600 font-medium">{error}</p>
                </div>
              ) : solution ? (
                <div className="space-y-4">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-blue-900 mb-2">Problem</h4>
                    <p className="text-blue-800">{solution.problem}</p>
                  </div>
                  
                  <div className="space-y-3">
                    {solution.steps.map((step, index) => (
                      <div key={index} className="border-l-4 border-blue-500 pl-4">
                        <div className="flex items-center mb-2">
                          <span className="bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded-full">
                            Step {step.step}
                          </span>
                        </div>
                        <h5 className="font-medium text-gray-900 mb-1">
                          {step.description}
                        </h5>
                        {step.equation && (
                          <p className="text-gray-700 font-mono text-sm mb-2">
                            {step.equation}
                          </p>
                        )}
                        <p className="text-gray-600 text-sm">
                          {step.explanation}
                        </p>
                      </div>
                    ))}
                  </div>
                  
                  <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                    <h4 className="font-semibold text-green-900 mb-2">Final Answer</h4>
                    <p className="text-green-800 font-mono text-lg">{solution.finalAnswer}</p>
                  </div>
                  
                  <div className="flex justify-between text-sm text-gray-500">
                    <span>Type: {solution.problemType}</span>
                    <span>Level: {solution.difficulty}</span>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <p className="text-gray-500">
                    Enter a math problem to see the solution steps here
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Solver;
