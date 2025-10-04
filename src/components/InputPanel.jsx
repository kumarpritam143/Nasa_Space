import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Rocket, Target, Zap } from 'lucide-react';
import { calculateImpactPhysics } from '../mock';

const InputPanel = ({ onSimulate, isSimulating }) => {
  const [inputMode, setInputMode] = useState('asteroid');
  const [selectedAsteroid, setSelectedAsteroid] = useState('');
  const [customParams, setCustomParams] = useState({ name: '', diameter: 100, velocity: 15, angle: 45 });
  const [neoAsteroids, setNeoAsteroids] = useState([]);

  // Fetch NASA NEO data (live)
  useEffect(() => {
    const fetchNeoAsteroids = async () => {
      try {
        const today = new Date().toISOString().split('T')[0];
        const apiKey = '1g8EgTht6M3OZXy7wU3coOJAZIV8K8WEcHe1ZGhc'; // Replace with your NASA API key
        const res = await fetch(
          `https://api.nasa.gov/neo/rest/v1/feed?start_date=${today}&end_date=${today}&api_key=${apiKey}`
        );
        const data = await res.json();
        const asteroids = [];
        Object.values(data.near_earth_objects).forEach(arr => {
          arr.forEach(a => {
            const approach = a.close_approach_data[0];
            const diameterMeters = (a.estimated_diameter.meters.estimated_diameter_min +
                                    a.estimated_diameter.meters.estimated_diameter_max) / 2;
            asteroids.push({
              id: a.id,
              name: a.name,
              diameter: Math.round(diameterMeters),
              velocity: parseFloat(approach.relative_velocity.kilometers_per_second),
              description: a.is_potentially_hazardous_asteroid
                ? 'Potentially hazardous asteroid'
                : 'Near-Earth asteroid',
              nasa_jpl_url: a.nasa_jpl_url,
              close_approach_date: approach.close_approach_date,
              miss_distance_km: parseFloat(approach.miss_distance.kilometers),
              is_potentially_hazardous: a.is_potentially_hazardous_asteroid
            });
          });
        });
        setNeoAsteroids(asteroids);
      } catch (err) {
        console.error('Error fetching NEO data:', err);
      }
    };
    fetchNeoAsteroids();
  }, []);

  const handleSimulate = () => {
    if (inputMode === 'asteroid' && selectedAsteroid) {
      const asteroid = neoAsteroids.find(a => a.id === selectedAsteroid);
      if (asteroid) {
        onSimulate({ name: asteroid.name, diameter: asteroid.diameter, velocity: asteroid.velocity, angle: 45 });
      }
    } else if (inputMode === 'custom') {
      onSimulate({ name: customParams.name || 'Custom Asteroid', ...customParams });
    }
  };

  const updateCustomParam = (key, value) => {
    setCustomParams(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="h-full bg-gradient-to-br from-slate-50 to-slate-100 p-6 overflow-y-auto">
      <Card className="border-0 shadow-2xl bg-white/80 backdrop-blur-sm">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-red-100 rounded-lg"><Target className="w-6 h-6 text-red-600" /></div>
            <div>
              <CardTitle className="text-2xl font-bold text-gray-900">Impact Simulator</CardTitle>
              <CardDescription className="text-gray-600">Configure your asteroid impact scenario</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={inputMode} onValueChange={setInputMode} className="space-y-6">
            <TabsList className="grid w-full grid-cols-2 bg-slate-100">
              <TabsTrigger value="asteroid" className="flex items-center gap-2">
                <Rocket className="w-4 h-4" />NASA Asteroids
              </TabsTrigger>
              <TabsTrigger value="custom" className="flex items-center gap-2">
                <Zap className="w-4 h-4" />Custom Input
              </TabsTrigger>
            </TabsList>

            {/* NASA Asteroids Tab */}
            <TabsContent value="asteroid" className="space-y-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">Select Asteroid</Label>
                <Select value={selectedAsteroid} onValueChange={setSelectedAsteroid}>
                  <SelectTrigger className="w-full"><SelectValue placeholder="Choose an asteroid..." /></SelectTrigger>
                  <SelectContent>
                    {neoAsteroids.map(a => (
                      <SelectItem key={a.id} value={a.id}>
                        <div className="flex flex-col">
                          <span className="font-medium">{a.name}</span>
                          <span className="text-xs text-gray-500">{a.diameter}m • {a.velocity} km/s</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {selectedAsteroid && (
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200 space-y-1 text-sm text-blue-800">
                  {(() => {
                    const asteroid = neoAsteroids.find(a => a.id === selectedAsteroid);
                    if (!asteroid) return null;
                    return (
                      <>
                        <div><strong>Description:</strong> {asteroid.description}</div>
                        <div><strong>Diameter:</strong> {asteroid.diameter} m</div>
                        <div><strong>Velocity:</strong> {asteroid.velocity} km/s</div>
                        <div><strong>Miss Distance:</strong> {asteroid.miss_distance_km.toLocaleString()} km</div>
                        <div><strong>Close Approach Date:</strong> {asteroid.close_approach_date}</div>
                        <div><strong>NASA JPL URL:</strong> <a href={asteroid.nasa_jpl_url} target="_blank" rel="noreferrer" className="text-blue-600 underline ml-1">View</a></div>
                        <div><strong>Hazardous:</strong> {asteroid.is_potentially_hazardous ? 'Yes' : 'No'}</div>
                      </>
                    );
                  })()}
                </div>
              )}
            </TabsContent>

            {/* Custom Input Tab */}
            <TabsContent value="custom" className="space-y-4">
              <div>
                <Label>Asteroid Name (Optional)</Label>
                <Input
                  placeholder="Enter asteroid name..."
                  value={customParams.name}
                  onChange={e => updateCustomParam('name', e.target.value)}
                />
              </div>
              <div>
                <Label>Asteroid Diameter (meters) *</Label>
                <Input
                  type="number"
                  placeholder="e.g., 100"
                  value={customParams.diameter}
                  onChange={e => updateCustomParam('diameter', Number(e.target.value))}
                  min={1}
                />
                <p className="text-xs text-gray-500 mt-1">Diameter: Size of the asteroid. Larger objects cause more damage.</p>
              </div>
              <div>
                <Label>Impact Velocity (km/s) *</Label>
                <Input
                  type="number"
                  placeholder="e.g., 15.5"
                  value={customParams.velocity}
                  onChange={e => updateCustomParam('velocity', Number(e.target.value))}
                  min={1}
                />
                <p className="text-xs text-gray-500 mt-1">Velocity: Typical Earth impact velocities range from 11-70 km/s.</p>
              </div>
              <div>
                <Label>Impact Angle: {customParams.angle}° from horizontal</Label>
                <Select value={customParams.angle} onValueChange={value => updateCustomParam('angle', Number(value))}>
                  <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value={5}>5° (grazing)</SelectItem>
                    <SelectItem value={45}>45° (optimal)</SelectItem>
                    <SelectItem value={90}>90° (vertical)</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-gray-500 mt-1">Impact Angle: 45° produces maximum crater size. Shallow angles create elliptical craters.</p>
              </div>

              <div className="p-4 bg-green-50 rounded-lg border border-green-200 space-y-1 text-sm text-green-800">
                <h4 className="font-medium">Estimated Impact Physics:</h4>
                {(() => {
                  const physics = calculateImpactPhysics(customParams.diameter, customParams.velocity, customParams.angle);
                  return (
                    <>
                      <div>Impact Energy: {physics.impactEnergy.toLocaleString()} J</div>
                      <div>Crater Diameter: {physics.craterDiameter} km</div>
                      <div>Affected Radius: {physics.affectedRadius} km</div>
                      <div>TNT Equivalent: {physics.tntEquivalent} tons</div>
                    </>
                  );
                })()}
              </div>
            </TabsContent>
          </Tabs>

          <div className="pt-6 border-t">
            <Button
              onClick={handleSimulate}
              disabled={isSimulating || (inputMode === 'asteroid' && !selectedAsteroid)}
              className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 transition-all duration-200 transform hover:scale-105 disabled:transform-none"
            >
              {isSimulating ? 'Simulating Impact...' : 'Simulate Impact'}
            </Button>
            <p className="text-xs text-gray-500 text-center mt-2">Click on the map to select impact location</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default InputPanel;
