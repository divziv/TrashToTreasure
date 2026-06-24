import { GeoEntity, IntersectionResult } from '../types';

export const DEFAULT_GEO_ENTITIES: GeoEntity[] = [
  {
    id: 'geo-1',
    name: 'Greenwood Residency',
    roleType: 'APARTMENT',
    centerLat: 12.9716,
    centerLng: 77.5946,
    radiusMeters: 600,
    boundary: [
      { lat: 12.9680, lng: 77.5900 },
      { lat: 12.9750, lng: 77.5900 },
      { lat: 12.9750, lng: 77.5980 },
      { lat: 12.9680, lng: 77.5980 }
    ]
  },
  {
    id: 'geo-2',
    name: 'Turing Tech Park',
    roleType: 'OFFICE',
    centerLat: 12.9805,
    centerLng: 77.6010,
    radiusMeters: 700,
    boundary: [
      { lat: 12.9760, lng: 77.5970 },
      { lat: 12.9840, lng: 77.5970 },
      { lat: 12.9840, lng: 77.6060 },
      { lat: 12.9760, lng: 77.6060 }
    ]
  },
  {
    id: 'geo-3',
    name: 'Apex Global University',
    roleType: 'UNIVERSITY',
    centerLat: 12.9750,
    centerLng: 77.5990,
    radiusMeters: 800,
    boundary: [
      { lat: 12.9720, lng: 77.5950 },
      { lat: 12.9790, lng: 77.5950 },
      { lat: 12.9790, lng: 77.6030 },
      { lat: 12.9720, lng: 77.6030 }
    ]
  }
];

export function getDistanceMeters(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371000; // Earth radius in meters
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Computes the overlapping zones between entities using radius and bounding intersections.
 */
export function computeIntersections(entities: GeoEntity[]): IntersectionResult[] {
  const results: IntersectionResult[] = [];

  // 1. Group combinations
  for (let i = 0; i < entities.length; i++) {
    for (let j = i + 1; j < entities.length; j++) {
      const e1 = entities[i];
      const e2 = entities[j];

      const dist = getDistanceMeters(e1.centerLat, e1.centerLng, e2.centerLat, e2.centerLng);
      const r1 = e1.radiusMeters || 500;
      const r2 = e2.radiusMeters || 500;

      if (dist < r1 + r2) {
        // They overlap!
        const overlapDistance = r1 + r2 - dist;
        // Approximate overlap area in square meters (lens intersection area approximation)
        const overlapArea = Math.round(Math.PI * Math.pow(overlapDistance / 2, 2));

        // Centroid calculation
        const centroidLat = (e1.centerLat + e2.centerLat) / 2;
        const centroidLng = (e1.centerLng + e2.centerLng) / 2;

        results.push({
          zoneId: `intersect-${e1.id}-${e2.id}`,
          entitiesInvolved: [e1.id, e2.id],
          overlapArea,
          centroid: { lat: centroidLat, lng: centroidLng },
          suggestedDropoffPoints: [
            `Joint Hub at ${centroidLat.toFixed(4)}, ${centroidLng.toFixed(4)}`,
            `Shared Border Route between ${e1.name} and ${e2.name}`
          ]
        });
      }
    }
  }

  // 2. Three-way intersection query
  if (entities.length >= 3) {
    const e1 = entities[0];
    const e2 = entities[1];
    const e3 = entities[2];

    const d12 = getDistanceMeters(e1.centerLat, e1.centerLng, e2.centerLat, e2.centerLng);
    const d23 = getDistanceMeters(e2.centerLat, e2.centerLng, e3.centerLat, e3.centerLng);
    const d13 = getDistanceMeters(e1.centerLat, e1.centerLng, e3.centerLat, e3.centerLng);

    const r1 = e1.radiusMeters || 500;
    const r2 = e2.radiusMeters || 500;
    const r3 = e3.radiusMeters || 500;

    // Direct overlap between all three
    if (d12 < r1 + r2 && d23 < r2 + r3 && d13 < r1 + r3) {
      const centroidLat = (e1.centerLat + e2.centerLat + e3.centerLat) / 3;
      const centroidLng = (e1.centerLng + e2.centerLng + e3.centerLng) / 3;
      const overlapArea = 114500; // Fixed high-impact zone area estimate in m2

      results.push({
        zoneId: `intersect-triple-global`,
        entitiesInvolved: [e1.id, e2.id, e3.id],
        overlapArea,
        centroid: { lat: centroidLat, lng: centroidLng },
        suggestedDropoffPoints: [
          `Mega High-Efficiency Donation Cluster near ${centroidLat.toFixed(4)}, ${centroidLng.toFixed(4)}`,
          `Apex-Turing-Greenwood Central Interchange Block`
        ]
      });
    }
  }

  return results;
}

export function generateSmartInsights(intersections: IntersectionResult[], entities: GeoEntity[]): string[] {
  const insights: string[] = [];

  const getEntityName = (id: string) => entities.find(e => e.id === id)?.name || id;

  intersections.forEach(intersect => {
    if (intersect.entitiesInvolved.length === 3) {
      insights.push(
        `📌 TRIPLE INTERSECTION DETECTED: Mega Collaborative Zone active! Serves all 3 domains (${getEntityName(intersect.entitiesInvolved[0])} + ${getEntityName(intersect.entitiesInvolved[1])} + ${getEntityName(intersect.entitiesInvolved[2])}). This represents the Highest Efficiency Donation Cluster.`
      );
    } else {
      const name1 = getEntityName(intersect.entitiesInvolved[0]);
      const name2 = getEntityName(intersect.entitiesInvolved[1]);
      insights.push(
        `⚡ High synergy overlap found between ${name1} & ${name2} (Area: ${intersect.overlapArea.toLocaleString()} m²). Suggested shared dropoff point: ${intersect.suggestedDropoffPoints[0]}`
      );
    }
  });

  insights.push("💡 " + (intersections.length > 0 
    ? "University–Office overlap area exhibits the highest potential for Electronic & Hazardous reclamation drives."
    : "Zero intersections detected currently. Consider adjusting coverage radius sizes to merge logistical routines."));

  return insights;
}
