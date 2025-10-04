import React, { useState } from 'react';
import './App.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import InputPanel from './components/InputPanel';
import MapPanel from './components/MapPanel';
import ResultsPanel from './components/ResultsPanel';
import ErrorBoundary from './components/ErrorBoundary';
import { calculateImpactPhysics, getPopulationEstimate } from './mock';
import { AlertTriangle, Github, ExternalLink } from 'lucide-react';
import { Button } from './components/ui/button';

const AsteroidSimulator = () => {
  const [impactLocation, setImpactLocation] = useState(null);
  const [simulationResults, setSimulationResults] = useState(null);
  const [asteroidInfo, setAsteroidInfo] = useState(null);
  const [isSimulating, setIsSimulating] = useState(false);

  const handleLocationSelect = (location) => {
    setImpactLocation(location);
    // Clear previous results when location changes
    if (simulationResults) {
      setSimulationResults(null);
    }
  };

  const handleSimulate = async (asteroidData) => {
    if (!impactLocation) {
      alert('Please select an impact location on the map first!');
      return;
    }

    setIsSimulating(true);
    setAsteroidInfo(asteroidData);

    try {
      // Simulate calculation delay for realism
      await new Promise(resolve => setTimeout(resolve, 1500));

      const physics = calculateImpactPhysics(
        asteroidData.diameter,
        asteroidData.velocity,
        asteroidData.angle || 45
      );

      const populationAffected = getPopulationEstimate(
        impactLocation.lat,
        impactLocation.lng,
        physics.affectedRadius
      );

      setSimulationResults({
        ...physics,
        populationAffected
      });
    } catch (error) {
      console.error('Simulation error:', error);
      alert('Simulation failed. Please try again.');
      setSimulationResults(null);
    } finally {
      setIsSimulating(false);
    }
  };

  return (
    <div className="h-screen flex flex-col bg-gray-900">
      {/* Header */}
      <header className="bg-slate-800 border-b border-slate-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-600 rounded-lg">
              <AlertTriangle className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Asteroid Impact Simulator</h1>
              <p className="text-slate-400 text-sm">Explore the devastating effects of asteroid impacts on Earth</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel - Input */}
        <div className="w-80 flex-shrink-0 border-r border-slate-700">
          <ErrorBoundary>
            <InputPanel 
              onSimulate={handleSimulate} 
              isSimulating={isSimulating}
            />
          </ErrorBoundary>
        </div>

        {/* Center Panel - Map */}
        <div className="flex-1 flex flex-col">
          <div className="flex-1 p-4">
            <ErrorBoundary>
              <MapPanel 
                impactLocation={impactLocation}
                onLocationSelect={handleLocationSelect}
                simulationResults={simulationResults}
              />
            </ErrorBoundary>
          </div>
        </div>

        {/* Right Panel - Results */}
        <div className="w-96 flex-shrink-0 border-l border-slate-700">
          <ErrorBoundary>
            <ResultsPanel 
              simulationResults={simulationResults}
              asteroidInfo={asteroidInfo}
              impactLocation={impactLocation}
            />
          </ErrorBoundary>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-slate-800 border-t border-slate-700 px-6 py-3">
        <div className="flex items-center justify-between text-sm">
          <div className="text-slate-400">
            Built and Develop by Pritam and Team
          </div>
          <div className="text-slate-500">
            Physics computations are streamlined for clarity and learning
          </div>
        </div>
      </footer>
    </div>
  );
};

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<AsteroidSimulator />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
