import React, { useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Alert, AlertDescription } from './ui/alert';
import { MapPin, AlertTriangle, Info } from 'lucide-react';

const MapPanel = ({ impactLocation, onLocationSelect, simulationResults }) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const [isMapReady, setIsMapReady] = useState(false);
  const markersRef = useRef([]);

  useEffect(() => {
    // Load Leaflet dynamically
    if (!window.L) {
      const leafletCSS = document.createElement('link');
      leafletCSS.rel = 'stylesheet';
      leafletCSS.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(leafletCSS);

      const leafletJS = document.createElement('script');
      leafletJS.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      leafletJS.onload = initializeMap;
      document.head.appendChild(leafletJS);
    } else {
      initializeMap();
    }

    // Cleanup function
    return () => {
      if (mapInstanceRef.current) {
        try {
          markersRef.current.forEach(marker => {
            if (marker && mapInstanceRef.current) {
              mapInstanceRef.current.removeLayer(marker);
            }
          });
          markersRef.current = [];
        } catch (error) {
          console.error('Error during cleanup:', error);
        }
      }
    };
  }, []);

  const initializeMap = () => {
    if (mapInstanceRef.current || !mapRef.current) return;

    const map = window.L.map(mapRef.current, {
      center: [20, 0],
      zoom: 2,
      zoomControl: true,
      scrollWheelZoom: true
    });

    // Add tile layer
    window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 18
    }).addTo(map);

    // Handle map clicks
    map.on('click', (e) => {
      const { lat, lng } = e.latlng;
      onLocationSelect({ lat, lng });
    });

    mapInstanceRef.current = map;
    setIsMapReady(true);
  };

  useEffect(() => {
    if (!mapInstanceRef.current || !isMapReady || !window.L) return;

    try {
      // Clear existing markers
      markersRef.current.forEach(marker => {
        if (mapInstanceRef.current && marker) {
          mapInstanceRef.current.removeLayer(marker);
        }
      });
      markersRef.current = [];

      if (impactLocation) {
        // Impact marker
        const impactMarker = window.L.marker([impactLocation.lat, impactLocation.lng], {
          icon: window.L.divIcon({
            html: '<div style="background: #dc2626; width: 20px; height: 20px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.3);"></div>',
            className: 'custom-impact-marker',
            iconSize: [20, 20],
            iconAnchor: [10, 10]
          })
        }).addTo(mapInstanceRef.current);
        
        markersRef.current.push(impactMarker);

        // Add simulation visualization if available
        if (simulationResults) {
          // Crater circle (red)
          const craterCircle = window.L.circle([impactLocation.lat, impactLocation.lng], {
            radius: Math.max(simulationResults.craterDiameter * 500, 100), // Convert to meters for visualization
            color: '#dc2626',
            fillColor: '#dc2626',
            fillOpacity: 0.6,
            weight: 2
          }).addTo(mapInstanceRef.current);
          
          // Affected area circle (yellow)
          const affectedCircle = window.L.circle([impactLocation.lat, impactLocation.lng], {
            radius: Math.max(simulationResults.affectedRadius * 1000, 500), // Convert to meters
            color: '#eab308',
            fillColor: '#eab308',
            fillOpacity: 0.2,
            weight: 2
          }).addTo(mapInstanceRef.current);
          
          markersRef.current.push(craterCircle, affectedCircle);
          
          // Fit map to show the affected area
          try {
            const bounds = window.L.latLngBounds([
              [impactLocation.lat, impactLocation.lng]
            ]).extend(affectedCircle.getBounds());
            
            mapInstanceRef.current.fitBounds(bounds, { padding: [50, 50] });
          } catch (boundsError) {
            // Fallback to simple setView
            mapInstanceRef.current.setView([impactLocation.lat, impactLocation.lng], 8);
          }
        } else {
          // Just center on impact location
          mapInstanceRef.current.setView([impactLocation.lat, impactLocation.lng], 8);
        }
      }
    } catch (error) {
      console.error('Error updating map markers:', error);
    }
  }, [impactLocation, simulationResults, isMapReady]);

  return (
    <div className="h-full flex flex-col">
      {/* Map Container */}
      <div className="flex-1 relative">
        <div 
          ref={mapRef} 
          className="w-full h-full rounded-lg shadow-lg"
          style={{ minHeight: '400px' }}
        />
        
        {!isMapReady && (
          <div className="absolute inset-0 bg-slate-100 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
              <p className="text-gray-600">Loading map...</p>
            </div>
          </div>
        )}
        
        {isMapReady && !impactLocation && (
          <div className="absolute top-4 left-4 right-4">
            <Alert className="bg-blue-50 border-blue-200">
              <Info className="h-4 w-4" />
              <AlertDescription className="text-blue-800">
                Click anywhere on the map to select an impact location
              </AlertDescription>
            </Alert>
          </div>
        )}
      </div>

      {/* Location Info */}
      {impactLocation && (
        <Card className="mt-4 border-0 shadow-lg bg-white">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <MapPin className="w-5 h-5 text-red-600" />
              Impact Location
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Latitude:</span>
                <span className="font-mono ml-2">{impactLocation.lat.toFixed(4)}°</span>
              </div>
              <div>
                <span className="text-gray-600">Longitude:</span>
                <span className="font-mono ml-2">{impactLocation.lng.toFixed(4)}°</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default MapPanel;