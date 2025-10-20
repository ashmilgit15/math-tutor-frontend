import React, { useState, useEffect, useCallback } from 'react';
import Plot from 'react-plotly.js';
import { generateGraph } from '../utils/api';

const GraphPanel = ({ graphData, solution }) => {
  const [graphType, setGraphType] = useState('2D');
  const [selectedFunction, setSelectedFunction] = useState('');
  const [isGeneratingGraph, setIsGeneratingGraph] = useState(false);
  const [graphError, setGraphError] = useState(null);

  // Mock 3D graph data for demonstration
  const mock3DData = {
    type: '3D',
    data: [
      {
        x: [-3, -2, -1, 0, 1, 2, 3],
        y: [-3, -2, -1, 0, 1, 2, 3],
        z: [[9, 4, 1, 0, 1, 4, 9],
            [4, 1, 0, 1, 4, 9, 16],
            [1, 0, 1, 4, 9, 16, 25],
            [0, 1, 4, 9, 16, 25, 36],
            [1, 4, 9, 16, 25, 36, 49],
            [4, 9, 16, 25, 36, 49, 64],
            [9, 16, 25, 36, 49, 64, 81]],
        type: 'surface',
        colorscale: 'Viridis'
      }
    ],
    layout: {
      title: '3D Surface Plot: z = x² + y²',
      scene: {
        xaxis: { title: 'x' },
        yaxis: { title: 'y' },
        zaxis: { title: 'z' }
      }
    }
  };

  const sampleFunctions = [
    { name: 'Linear: y = 2x + 3', equation: '2x + 3', color: '#1f77b4' },
    { name: 'Quadratic: y = x² - 4', equation: 'x² - 4', color: '#ff7f0e' },
    { name: 'Exponential: y = 2ˣ', equation: '2ˣ', color: '#2ca02c' },
    { name: 'Trigonometric: y = sin(x)', equation: 'sin(x)', color: '#d62728' },
    { name: 'Logarithmic: y = ln(x)', equation: 'ln(x)', color: '#9467bd' },
    { name: 'Rational: y = 1/x', equation: '1/x', color: '#8c564b' }
  ];

  const generateSampleGraph = useCallback(async (equation) => {
  setIsGeneratingGraph(true);
  setGraphError(null);
  
  try {
    const result = await generateGraph(equation, graphType);
    if (result.success) {
      return result.graph_data;
    } else {
      throw new Error(result.message || 'Failed to generate graph');
    }
  } catch (error) {
    console.error('Error generating graph:', error);
    setGraphError(error.message);
    
    // Fallback to local generation for demo
    return generateLocalGraph(equation);
  } finally {
    setIsGeneratingGraph(false);
  }
}, [graphType]);

  const generateLocalGraph = (equation) => {
    const x = [];
    const y = [];
    
    // Generate data points based on equation type
    if (equation.includes('x²')) {
      // Quadratic
      for (let i = -5; i <= 5; i += 0.1) {
        x.push(i);
        y.push(i * i - 4);
      }
    } else if (equation.includes('2ˣ')) {
      // Exponential
      for (let i = -3; i <= 3; i += 0.1) {
        x.push(i);
        y.push(Math.pow(2, i));
      }
    } else if (equation.includes('sin')) {
      // Trigonometric
      for (let i = -2 * Math.PI; i <= 2 * Math.PI; i += 0.1) {
        x.push(i);
        y.push(Math.sin(i));
      }
    } else if (equation.includes('ln')) {
      // Logarithmic
      for (let i = 0.1; i <= 5; i += 0.1) {
        x.push(i);
        y.push(Math.log(i));
      }
    } else if (equation.includes('1/x')) {
      // Rational
      for (let i = -5; i <= 5; i += 0.1) {
        if (i !== 0) {
          x.push(i);
          y.push(1 / i);
        }
      }
    } else {
      // Linear
      for (let i = -5; i <= 5; i += 0.1) {
        x.push(i);
        y.push(2 * i + 3);
      }
    }

    return {
      type: '2D',
      data: [{
        x: x,
        y: y,
        type: 'scatter',
        mode: 'lines',
        line: { color: sampleFunctions.find(f => f.equation === equation)?.color || '#1f77b4' },
        name: equation
      }],
      layout: {
        title: `Graph of ${equation}`,
        xaxis: { title: 'x' },
        yaxis: { title: 'y' },
        showlegend: true
      }
    };
  };

  const [currentGraphData, setCurrentGraphData] = useState(null);

  // Update current graph data when selected function changes
  useEffect(() => {
    if (selectedFunction && !graphData) {
      generateSampleGraph(selectedFunction).then(result => {
        setCurrentGraphData(result);
      });
    } else {
      setCurrentGraphData(graphData);
    }
  }, [selectedFunction, graphData, graphType, generateSampleGraph]);

  const displayData = graphType === '3D' && !graphData && !currentGraphData ? mock3DData : currentGraphData;

  const downloadGraph = () => {
    if (displayData) {
      // In a real implementation, this would trigger the plot download
      console.log('Downloading graph...');
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-900">
            Interactive Graphs
          </h2>
          <div className="flex space-x-2">
            <button
              onClick={() => setGraphType('2D')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                graphType === '2D'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              2D Graphs
            </button>
            <button
              onClick={() => setGraphType('3D')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                graphType === '3D'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              3D Graphs
            </button>
          </div>
        </div>
        <p className="text-gray-600">
          Visualize mathematical functions and relationships with interactive 2D and 3D graphs.
        </p>
      </div>

      {/* Graph Type Selection */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">
          Sample Functions
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {sampleFunctions.map((func, index) => (
            <button
              key={index}
              onClick={() => setSelectedFunction(func.equation)}
              className={`p-3 rounded-lg border transition-colors text-sm ${
                selectedFunction === func.equation
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }`}
            >
              <div className="font-medium">{func.name}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Graph Display */}
      <div className="mb-6">
        {isGeneratingGraph ? (
          <div className="bg-gray-50 rounded-lg p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Generating graph...</p>
          </div>
        ) : graphError ? (
          <div className="bg-red-50 rounded-lg p-4">
            <div className="flex items-center mb-2">
              <svg className="w-5 h-5 text-red-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h4 className="text-lg font-semibold text-red-900">Graph Error</h4>
            </div>
            <p className="text-red-800">{graphError}</p>
            <button
              onClick={() => {
                setGraphError(null);
                if (selectedFunction) {
                  generateSampleGraph(selectedFunction);
                }
              }}
              className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        ) : displayData ? (
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-lg font-semibold text-gray-900">
                {displayData.layout.title}
              </h4>
              <button
                onClick={downloadGraph}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span>Download</span>
              </button>
            </div>
            
            <div className="h-96">
              <Plot
                data={displayData.data}
                layout={{
                  ...displayData.layout,
                  autosize: true,
                  margin: { l: 50, r: 50, t: 50, b: 50 },
                  paper_bgcolor: 'transparent',
                  plot_bgcolor: 'transparent'
                }}
                config={{
                  responsive: true,
                  displayModeBar: true,
                  modeBarButtonsToRemove: ['pan2d', 'lasso2d', 'select2d'],
                  displaylogo: false
                }}
                style={{ width: '100%', height: '100%' }}
              />
            </div>
          </div>
        ) : (
          <div className="bg-gray-50 rounded-lg p-12 text-center">
            <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No Graph Data
            </h3>
            <p className="text-gray-600 mb-4">
              Solve a math problem or select a sample function to see the graph visualization.
            </p>
            <button
              onClick={() => setSelectedFunction('x² - 4')}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Try Sample Function
            </button>
          </div>
        )}
      </div>

      {/* Graph Features */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-blue-50 p-4 rounded-lg">
          <h4 className="font-semibold text-blue-900 mb-2">2D Graphs</h4>
          <ul className="text-blue-800 text-sm space-y-1">
            <li>• Linear and polynomial functions</li>
            <li>• Trigonometric functions</li>
            <li>• Exponential and logarithmic</li>
            <li>• Rational functions</li>
            <li>• Interactive zoom and pan</li>
          </ul>
        </div>
        
        <div className="bg-purple-50 p-4 rounded-lg">
          <h4 className="font-semibold text-purple-900 mb-2">3D Graphs</h4>
          <ul className="text-purple-800 text-sm space-y-1">
            <li>• Surface plots</li>
            <li>• Contour plots</li>
            <li>• Parametric curves</li>
            <li>• 3D rotation and scaling</li>
            <li>• Multiple color schemes</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default GraphPanel;
