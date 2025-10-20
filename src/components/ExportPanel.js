import React, { useState } from 'react';
import { exportSolution, copyToClipboard, downloadFile } from '../utils/api';

const ExportPanel = ({ solution, graphData, problemId, sessionId }) => {
  const [isExporting, setIsExporting] = useState(false);
  const [exportFormat, setExportFormat] = useState('pdf');

  const exportFormats = [
    { id: 'pdf', name: 'PDF Document', icon: '📄', description: 'Complete solution with graphs' },
    { id: 'text', name: 'Text File', icon: '📝', description: 'Plain text solution' },
    { id: 'image', name: 'Graph Image', icon: '🖼️', description: 'Download graph as image' },
    { id: 'latex', name: 'LaTeX', icon: '📐', description: 'LaTeX formatted solution' }
  ];

  const handleExport = async (format) => {
    if (!problemId) {
      alert('No problem to export. Please solve a problem first.');
      return;
    }

    setIsExporting(true);
    setExportFormat(format);

    try {
      const result = await exportSolution(problemId, format, sessionId);
      
      if (result.success) {
        switch (format) {
          case 'pdf':
            handlePDFDownload(result.export_data);
            break;
          case 'text':
            handleTextDownload(result.export_data);
            break;
          case 'image':
            handleImageDownload(result.export_data);
            break;
          case 'latex':
            handleLaTeXDownload(result.export_data);
            break;
          default:
            break;
        }
      } else {
        throw new Error(result.message || 'Export failed');
      }
    } catch (error) {
      console.error('Export failed:', error);
      alert(`Export failed: ${error.message}`);
    } finally {
      setIsExporting(false);
    }
  };

  const handlePDFDownload = (exportData) => {
    if (exportData.content) {
      const blob = new Blob([exportData.content], { type: exportData.mime_type || 'application/pdf' });
      downloadFile(blob, exportData.filename || `math-solution-${Date.now()}.pdf`);
    }
  };

  const handleTextDownload = (exportData) => {
    if (exportData.content) {
      const blob = new Blob([exportData.content], { type: exportData.mime_type || 'text/plain' });
      downloadFile(blob, exportData.filename || `math-solution-${Date.now()}.txt`);
    }
  };

  const handleImageDownload = (exportData) => {
    if (exportData.content) {
      const blob = new Blob([exportData.content], { type: exportData.mime_type || 'image/png' });
      downloadFile(blob, exportData.filename || `math-graph-${Date.now()}.png`);
    }
  };

  const handleLaTeXDownload = (exportData) => {
    if (exportData.content) {
      const blob = new Blob([exportData.content], { type: exportData.mime_type || 'text/plain' });
      downloadFile(blob, exportData.filename || `math-solution-${Date.now()}.tex`);
    }
  };

  // const generatePDFContent = (solution, graphData) => {
  //   // Mock PDF content - in real implementation, use jsPDF or similar
  //   return `Math Tutor Solution Report
  // Generated on: ${new Date().toLocaleString()}

  // Problem: ${solution.problem}
  // Type: ${solution.problemType}
  // Difficulty: ${solution.difficulty}

  // Solution Steps:
  // ${solution.steps.map((step, index) => 
  //   `Step ${step.step}: ${step.description}
  //   ${step.equation ? `Equation: ${step.equation}` : ''}
  //   ${step.explanation}

  // `).join('')}

  // Final Answer: ${solution.finalAnswer}

  // ${graphData ? 'Graph included in this solution.' : ''}

  // ---
  // Math Tutor - AI-Powered Math Learning Platform
  // `;
  // };

  const generateTextContent = (solution) => {
    return `Math Tutor Solution
==================

Problem: ${solution.problem}
Type: ${solution.problemType}
Difficulty: ${solution.difficulty}

Solution Steps:
${solution.steps.map((step, index) => 
  `${index + 1}. ${step.description}
   ${step.equation ? `   ${step.equation}` : ''}
   ${step.explanation}
   
`).join('')}

Final Answer: ${solution.finalAnswer}

Generated on: ${new Date().toLocaleString()}
`;
  };

  // const generateLaTeXContent = (solution) => {
  //   return `\\documentclass{article}
  // \\usepackage{amsmath}
  // \\usepackage{amsfonts}
  // \\usepackage{amssymb}

  // \\title{Math Solution}
  // \\author{Math Tutor AI}
  // \\date{${new Date().toLocaleDateString()}}

  // \\begin{document}
  // \\maketitle

  // \\section{Problem}
  // ${solution.problem}

  // \\section{Solution}
  // \\begin{align}
  // ${solution.steps.map((step, index) => 
  //   step.equation ? `& ${step.equation.replace(/=/g, '&=')} \\\\` : ''
  // ).join('\n')}
  // \\end{align}

  // \\section{Answer}
  // ${solution.finalAnswer}

  // \\end{document}
  // `;
  // };

  const handleCopyToClipboard = async () => {
    if (!solution) return;

    const textContent = generateTextContent(solution);
    const success = await copyToClipboard(textContent);
    
    if (success) {
      // Show success message
      const button = document.getElementById('copy-btn');
      const originalText = button.textContent;
      button.textContent = 'Copied!';
      setTimeout(() => {
        button.textContent = originalText;
      }, 2000);
    } else {
      alert('Failed to copy to clipboard');
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Export Solutions
        </h2>
        <p className="text-gray-600">
          Download your solutions in various formats for offline reference and sharing.
        </p>
      </div>

      {!solution && !graphData ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No Content to Export
          </h3>
          <p className="text-gray-600">
            Solve a math problem first to export the solution and graphs.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Export Options */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Choose Export Format
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {exportFormats.map((format) => (
                <button
                  key={format.id}
                  onClick={() => handleExport(format.id)}
                  disabled={isExporting}
                  className={`p-4 border-2 rounded-lg text-left transition-all duration-200 ${
                    isExporting && exportFormat === format.id
                      ? 'border-blue-500 bg-blue-50 cursor-not-allowed'
                      : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">{format.icon}</span>
                    <div>
                      <h4 className="font-semibold text-gray-900">{format.name}</h4>
                      <p className="text-sm text-gray-600">{format.description}</p>
                    </div>
                  </div>
                  {isExporting && exportFormat === format.id && (
                    <div className="mt-3 flex items-center text-blue-600">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span className="text-sm">Exporting...</span>
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Quick Actions
            </h3>
            <div className="flex flex-wrap gap-3">
              <button
                id="copy-btn"
                onClick={handleCopyToClipboard}
                className="flex items-center space-x-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                <span>Copy Text</span>
              </button>
              
              <button
                onClick={() => window.print()}
                className="flex items-center space-x-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                </svg>
                <span>Print</span>
              </button>
            </div>
          </div>

          {/* Export Preview */}
          {solution && (
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Export Preview
              </h3>
              <div className="bg-gray-50 p-4 rounded-lg max-h-64 overflow-y-auto">
                <pre className="text-sm text-gray-700 whitespace-pre-wrap">
                  {generateTextContent(solution)}
                </pre>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ExportPanel;
