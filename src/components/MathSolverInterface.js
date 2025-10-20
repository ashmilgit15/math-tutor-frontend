import React, { useState, useRef, useEffect } from 'react';
import { getSampleProblems } from '../utils/api';

const MathSolverInterface = ({ onSolve, isLoading, error, solution, sessionId }) => {
  const [inputType, setInputType] = useState('text');
  const [problem, setProblem] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [selectedProblemType, setSelectedProblemType] = useState('other');
  const [sampleProblems, setSampleProblems] = useState([]);
  const [loadingSamples, setLoadingSamples] = useState(false);
  const fileInputRef = useRef(null);

  // Load sample problems on component mount
  useEffect(() => {
    const loadSampleProblems = async () => {
      setLoadingSamples(true);
      try {
        const result = await getSampleProblems();
        if (result.success) {
          setSampleProblems(result.problems);
        }
      } catch (error) {
        console.error('Failed to load sample problems:', error);
        // Fallback to hardcoded sample problems
        setSampleProblems([
          "Solve for x: 2x + 5 = 13",
          "Find the derivative of x² + 3x + 2",
          "Calculate the area of a circle with radius 5",
          "Simplify: (2x + 3)(x - 4)",
          "Solve: x² - 4x + 3 = 0",
          "Find the limit as x approaches 2 of (x² - 4)/(x - 2)",
          "Calculate the integral of 2x dx",
          "Find the slope of the line passing through (1,2) and (3,8)"
        ]);
      } finally {
        setLoadingSamples(false);
      }
    };

    loadSampleProblems();
  }, []);

  const problemTypes = [
    { id: 'other', name: 'Auto-detect', icon: '🔍' },
    { id: 'algebra', name: 'Algebra', icon: '📐' },
    { id: 'calculus', name: 'Calculus', icon: '∫' },
    { id: 'geometry', name: 'Geometry', icon: '📏' },
    { id: 'statistics', name: 'Statistics', icon: '📊' },
    { id: 'trigonometry', name: 'Trigonometry', icon: '📐' },
    { id: 'linear_algebra', name: 'Linear Algebra', icon: '🔢' },
    { id: 'differential_equations', name: 'Differential Equations', icon: '📈' },
    { id: 'probability', name: 'Probability', icon: '🎲' },
    { id: 'number_theory', name: 'Number Theory', icon: '🔢' }
  ];

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFile = (file) => {
    if (file.type.startsWith('image/')) {
      setSelectedImage(file);
      setInputType('image');
    } else {
      alert('Please select an image file (PNG, JPG, GIF, etc.)');
    }
  };

  const handleFileInput = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (inputType === 'text' && problem.trim()) {
      onSolve(problem.trim(), null, selectedProblemType);
    } else if (inputType === 'image' && selectedImage) {
      onSolve(null, selectedImage, selectedProblemType);
    } else {
      // Show error message for empty input
      alert('Please enter a math problem or upload an image before solving.');
    }
  };

  const handleSampleClick = (sampleProblem) => {
    setProblem(sampleProblem);
    setInputType('text');
    setSelectedImage(null);
  };

  const removeImage = () => {
    setSelectedImage(null);
    setInputType('text');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Enter Your Math Problem
        </h2>
        <p className="text-gray-600">
          Type your problem or upload a handwritten image for OCR recognition.
        </p>
      </div>

      {/* Input Type Toggle */}
      <div className="flex space-x-2 mb-6">
        <button
          type="button"
          onClick={() => setInputType('text')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
            inputType === 'text'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
          <span>Type</span>
        </button>
        <button
          type="button"
          onClick={() => setInputType('image')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
            inputType === 'image'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span>Upload Image</span>
        </button>
      </div>

      {/* Input Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {inputType === 'text' ? (
          <div>
            <label htmlFor="problem" className="block text-sm font-medium text-gray-700 mb-2">
              Math Problem
            </label>
            <textarea
              id="problem"
              value={problem}
              onChange={(e) => setProblem(e.target.value)}
              placeholder="Enter your math problem here... (e.g., Solve for x: 2x + 5 = 13)"
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none"
              required
            />
          </div>
        ) : (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Upload Image
            </label>
            <div
              className={`relative border-2 border-dashed rounded-lg p-6 transition-colors ${
                dragActive
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              {selectedImage ? (
                <div className="text-center">
                  <img
                    src={URL.createObjectURL(selectedImage)}
                    alt="Selected math problem"
                    className="max-h-48 mx-auto rounded-lg shadow-md mb-4"
                  />
                  <div className="flex justify-center space-x-4">
                    <button
                      type="button"
                      onClick={removeImage}
                      className="px-4 py-2 text-red-600 hover:text-red-700 font-medium"
                    >
                      Remove Image
                    </button>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-4 py-2 text-blue-600 hover:text-blue-700 font-medium"
                    >
                      Change Image
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center">
                  <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                    <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <div className="mt-4">
                    <label htmlFor="file-upload" className="cursor-pointer">
                      <span className="mt-2 block text-sm font-medium text-gray-900">
                        Upload an image of your math problem
                      </span>
                      <span className="mt-1 block text-sm text-gray-500">
                        PNG, JPG, GIF up to 10MB
                      </span>
                    </label>
                    <input
                      ref={fileInputRef}
                      id="file-upload"
                      name="file-upload"
                      type="file"
                      className="sr-only"
                      accept="image/*"
                      onChange={handleFileInput}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Problem Type Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Problem Type (Optional)
          </label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {problemTypes.map((type) => (
              <button
                key={type.id}
                type="button"
                onClick={() => setSelectedProblemType(type.id)}
                className={`flex items-center justify-center space-x-2 px-3 py-2 border rounded-lg transition-colors text-sm ${
                  selectedProblemType === type.id
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-300 hover:bg-gray-50 text-gray-700'
                }`}
              >
                <span>{type.icon}</span>
                <span>{type.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading || (inputType === 'text' && !problem.trim()) || (inputType === 'image' && !selectedImage)}
          className={`w-full py-4 px-6 rounded-lg font-semibold text-lg transition-all duration-200 ${
            isLoading || (inputType === 'text' && !problem.trim()) || (inputType === 'image' && !selectedImage)
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transform hover:-translate-y-1'
          }`}
        >
          {isLoading ? (
            <div className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Solving...
            </div>
          ) : (
            'Solve Problem'
          )}
        </button>
      </form>

      {/* Sample Problems */}
      <div className="mt-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Try These Sample Problems
        </h3>
        {loadingSamples ? (
          <div className="flex items-center justify-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            <span className="ml-2 text-gray-600">Loading sample problems...</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {sampleProblems.map((sampleProblem, index) => {
              const problemText = typeof sampleProblem === 'string' 
                ? sampleProblem 
                : sampleProblem.problem_text || sampleProblem.text;
              const problemType = typeof sampleProblem === 'object' 
                ? sampleProblem.problem_type || sampleProblem.type 
                : 'other';
              
              return (
                <button
                  key={index}
                  onClick={() => {
                    handleSampleClick(problemText);
                    setSelectedProblemType(problemType);
                  }}
                  className="text-left p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors text-sm"
                >
                  {problemText}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Error Display */}
      {error && (
        <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex">
            <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="ml-3">
              <p className="text-red-800 font-medium">{error}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MathSolverInterface;
