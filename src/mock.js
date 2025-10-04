// mock.js

// Use environment variables for API
const NASA_API_KEY = process.env.REACT_APP_NASA_API_KEY;
const NASA_API_URL = process.env.REACT_APP_NASA_API_URL;

export const PHYSICS_CONSTANTS = {
  ASTEROID_DENSITY: 2600, // kg/m³
  CRATER_CONSTANT: 1.161,
  ENERGY_TO_TNT: 4.184e9,
  EARTH_GRAVITY: 9.81
};

// Impact physics calculations
export const calculateImpactPhysics = (diameter, velocity, angle = 45) => {
  try {
    const safeDiameter = Math.max(1, Number(diameter) || 1);
    const safeVelocity = Math.max(1, Number(velocity) || 1);
    const safeAngle = Math.max(15, Math.min(90, Number(angle) || 45));

    const radius = safeDiameter / 2;
    const volume = (4 / 3) * Math.PI * Math.pow(radius, 3);
    const mass = volume * PHYSICS_CONSTANTS.ASTEROID_DENSITY;
    const impactEnergy = 0.5 * mass * Math.pow(safeVelocity * 1000, 2);
    const craterDiameter = Math.pow(
      PHYSICS_CONSTANTS.CRATER_CONSTANT * Math.pow(mass, 0.333) * Math.pow(safeVelocity * 1000, 0.44),
      1
    ) / 1000; // km
    const affectedRadius = Math.max(0.1, craterDiameter * 5);
    const tntEquivalent = impactEnergy / PHYSICS_CONSTANTS.ENERGY_TO_TNT;

    return {
      impactEnergy: Number(impactEnergy) || 0,
      craterDiameter: Number(craterDiameter.toFixed(2)) || 0.1,
      affectedRadius: Number(affectedRadius.toFixed(2)) || 0.5,
      tntEquivalent: Number(tntEquivalent.toFixed(2)) || 0,
      mass: Number(mass.toFixed(2)) || 0
    };
  } catch (error) {
    console.error('Error calculating impact physics:', error);
    return { impactEnergy: 0, craterDiameter: 0.1, affectedRadius: 0.5, tntEquivalent: 0, mass: 0 };
  }
};

// Population estimate
export const getPopulationEstimate = (lat, lng, radius) => {
  const cityAreas = [
    { name: 'New York', lat: 40.7128, lng: -74.0060, population: 8400000, density: 10000 },
    { name: 'London', lat: 51.5074, lng: -0.1278, population: 9000000, density: 5600 },
    { name: 'Tokyo', lat: 35.6762, lng: 139.6503, population: 14000000, density: 6200 },
    { name: 'Mumbai', lat: 19.0760, lng: 72.8777, population: 12400000, density: 20700 },
    { name: 'São Paulo', lat: -23.5505, lng: -46.6333, population: 12300000, density: 7900 }
  ];

  let estimatedPopulation = 0;

  cityAreas.forEach(city => {
    const distance = Math.sqrt(Math.pow(lat - city.lat, 2) + Math.pow(lng - city.lng, 2)) * 111;
    if (distance < radius) {
      const overlapFactor = Math.max(0, 1 - (distance / radius));
      estimatedPopulation += city.population * overlapFactor * 0.3;
    }
  });

  if (estimatedPopulation < 10000) {
    const areaKm2 = Math.PI * Math.pow(radius, 2);
    estimatedPopulation = Math.max(estimatedPopulation, areaKm2 * 20);
  }

  return Math.round(estimatedPopulation);
};

// ---- LIVE NEO FETCH ----
let cachedAsteroids = null;
export const fetchNeoAsteroids = async () => {
  if (cachedAsteroids) return cachedAsteroids;

  try {
    const today = new Date();
    const startDate = today.toISOString().split('T')[0];
    const url = `${NASA_API_URL}?start_date=${startDate}&end_date=${startDate}&api_key=${NASA_API_KEY}`;

    const response = await fetch(url);
    const data = await response.json();

    const asteroids = [];
    Object.values(data.near_earth_objects).forEach(arr => {
      arr.forEach(a => {
        const approach = a.close_approach_data[0];
        const diameterMeters = (a.estimated_diameter.meters.estimated_diameter_min +
                                a.estimated_diameter.meters.estimated_diameter_max) / 2;

        // Automatically calculate physics and population
        const physics = calculateImpactPhysics(diameterMeters, parseFloat(approach.relative_velocity.kilometers_per_second));

        // Example: use some default lat/lng if exact impact location unknown
        const population = getPopulationEstimate(0, 0, physics.affectedRadius);

        asteroids.push({
          id: a.id,
          name: a.name,
          diameter: Math.round(diameterMeters),
          velocity: parseFloat(approach.relative_velocity.kilometers_per_second),
          description: a.is_potentially_hazardous_asteroid ? 'Potentially hazardous asteroid' : 'Near-Earth asteroid',
          nasa_jpl_url: a.nasa_jpl_url,
          close_approach_date: approach.close_approach_date,
          miss_distance_km: parseFloat(approach.miss_distance.kilometers),
          hazardous: a.is_potentially_hazardous_asteroid,
          physics,       // auto-calculated physics
          population      // auto-estimated population
        });
      });
    });

    cachedAsteroids = asteroids;
    return asteroids;
  } catch (error) {
    console.error('Error fetching NEO data:', error);
    return [];
  }
};
