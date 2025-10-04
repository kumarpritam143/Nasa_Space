import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { AlertTriangle, Zap, Target, Users, Flame, Calculator } from 'lucide-react';

const ResultsPanel = ({ simulationResults, asteroidInfo, impactLocation }) => {
  if (!simulationResults || !asteroidInfo || !impactLocation) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-50 rounded-lg">
        <div className="text-center text-gray-500">
          <Target className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="text-lg font-medium mb-1">No Simulation Data</p>
          <p className="text-sm">Select parameters and impact location to see results</p>
        </div>
      </div>
    );
  }

  const formatNumber = (num) => {
    if (num >= 1e12) return `${(num / 1e12).toFixed(2)} T`;
    if (num >= 1e9) return `${(num / 1e9).toFixed(2)} B`;
    if (num >= 1e6) return `${(num / 1e6).toFixed(2)} M`;
    if (num >= 1e3) return `${(num / 1e3).toFixed(2)} K`;
    return num.toFixed(0);
  };

  const formatEnergy = (joules) => {
    if (joules >= 1e18) return `${(joules / 1e18).toFixed(2)} EJ`;
    if (joules >= 1e15) return `${(joules / 1e15).toFixed(2)} PJ`;
    if (joules >= 1e12) return `${(joules / 1e12).toFixed(2)} TJ`;
    if (joules >= 1e9) return `${(joules / 1e9).toFixed(2)} GJ`;
    return `${(joules / 1e6).toFixed(2)} MJ`;
  };

  const getSeverityLevel = (tntEquivalent) => {
    if (tntEquivalent > 1e9) return { level: 'Extinction', color: 'bg-purple-600', severity: 100 };
    if (tntEquivalent > 1e7) return { level: 'Global Catastrophe', color: 'bg-red-600', severity: 90 };
    if (tntEquivalent > 1e5) return { level: 'Regional Disaster', color: 'bg-orange-600', severity: 75 };
    if (tntEquivalent > 1e3) return { level: 'Major Impact', color: 'bg-yellow-600', severity: 50 };
    return { level: 'Local Event', color: 'bg-green-600', severity: 25 };
  };

  const severity = getSeverityLevel(simulationResults.tntEquivalent);

  return (
    <div className="h-full overflow-y-auto space-y-4 bg-gray-50 p-4">
      {/* Header Card */}
      <Card className="border-0 shadow-xl bg-gradient-to-r from-red-50 to-orange-50">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-red-100 rounded-lg">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <CardTitle className="text-xl font-bold text-gray-900">Impact Analysis</CardTitle>
                <p className="text-gray-600 text-sm">{asteroidInfo.name}</p>
              </div>
            </div>
            <Badge className={`${severity.color} text-white px-3 py-1 font-semibold`}>
              {severity.level}
            </Badge>
          </div>
        </CardHeader>
      </Card>

      {/* Severity Indicator */}
      <Card className="border-0 shadow-lg">
        <CardContent className="pt-6">
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-700">Impact Severity</span>
              <span className="text-sm font-bold text-gray-900">{severity.level}</span>
            </div>
            <Progress value={severity.severity} className="h-3" />
            <div className="flex justify-between text-xs text-gray-500">
              <span>Local</span>
              <span>Global</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 gap-4">
        {/* Energy Card */}
        <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Zap className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Impact Energy</h3>
                <p className="text-xs text-gray-600">Total kinetic energy released</p>
              </div>
            </div>
            <div className="space-y-2">
              <div className="text-2xl font-bold text-gray-900">
                {formatEnergy(simulationResults.impactEnergy)}
              </div>
              <div className="text-sm text-gray-600">
                ≈ {formatNumber(simulationResults.tntEquivalent)} kilotons TNT
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Crater Card */}
        <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <Target className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Crater Size</h3>
                <p className="text-xs text-gray-600">Estimated crater diameter</p>
              </div>
            </div>
            <div className="space-y-2">
              <div className="text-2xl font-bold text-gray-900">
                {simulationResults.craterDiameter.toFixed(2)} km
              </div>
              <div className="text-sm text-gray-600">
                Affected radius: {simulationResults.affectedRadius.toFixed(1)} km
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Population Card */}
        <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Population at Risk</h3>
                <p className="text-xs text-gray-600">Estimated affected population</p>
              </div>
            </div>
            <div className="space-y-2">
              <div className="text-2xl font-bold text-gray-900">
                {formatNumber(simulationResults.populationAffected)}
              </div>
              <div className="text-sm text-gray-600">
                Within {simulationResults.affectedRadius.toFixed(1)} km radius
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Technical Details */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Calculator className="w-5 h-5" />
            Technical Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Asteroid Mass:</span>
              <div className="font-semibold">{formatNumber(simulationResults.mass)} kg</div>
            </div>
            <div>
              <span className="text-gray-600">Impact Velocity:</span>
              <div className="font-semibold">{asteroidInfo.velocity} km/s</div>
            </div>
            <div>
              <span className="text-gray-600">Diameter:</span>
              <div className="font-semibold">{asteroidInfo.diameter} m</div>
            </div>
            <div>
              <span className="text-gray-600">Impact Angle:</span>
              <div className="font-semibold">{asteroidInfo.angle}°</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Disclaimer */}
      <Card className="border-0 shadow-lg bg-amber-50 border-amber-200">
        <CardContent className="pt-4">
          <div className="flex items-start gap-3">
            <Flame className="w-5 h-5 text-amber-600 mt-0.5" />
            <div>
              <p className="text-xs text-amber-800">
                <strong>Disclaimer:</strong> This simulation uses simplified physics models and estimates. 
                Actual impact effects depend on many additional factors including geology, atmosphere, 
                and impact composition.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ResultsPanel;