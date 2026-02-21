import { Train, Station, Track, Platform, TrainRoute, DisruptionEvent, TrainType } from '@/types'

let trainCache: Train[] | null = null
export function resetTrainCache() { trainCache = null }

// Simplified platforms for stations - properly typed
const createPlatform = (id: string, stationId: string, number: number, length: number, trackIds: string[],
  canHandle: TrainType[], status: Platform['status'] = 'AVAILABLE', currentTrain?: string): Platform => ({
    id,
    stationId,
    number,
    length,
    trackIds,
    canHandle,
    isElectrified: true,
    status,
    currentTrain,
    maxTrainLength: length,
    passengerFacilities: ['Waiting Room', 'Restroom'],
    signalSystems: ['ATP', 'Block']
  })

// Station data for Western Railway network
export const STATIONS: Station[] = [
  {
    id: 'ST001',
    name: 'Mumbai Central',
    code: 'BCT',
    platforms: [
      createPlatform('P001', 'ST001', 1, 650, ['TK001', 'TK002'], [TrainType.EXPRESS, TrainType.PASSENGER, TrainType.MAIL]),
      createPlatform('P002', 'ST001', 2, 650, ['TK003', 'TK004'], [TrainType.EXPRESS, TrainType.PASSENGER, TrainType.MAIL]),
      createPlatform('P003', 'ST001', 3, 400, ['TK005'], [TrainType.LOCAL, TrainType.PASSENGER]),
      createPlatform('P004', 'ST001', 4, 400, ['TK006'], [TrainType.LOCAL, TrainType.PASSENGER], 'MAINTENANCE')
    ],
    trackIds: ['TK001', 'TK002', 'TK003', 'TK004'],
    coordinates: { lat: 18.9690, lng: 72.8205 },
    facilities: ['Waiting Room', 'Food Court', 'ATM', 'Parking'],
    status: 'OPERATIONAL',
    capacity: 8,
    currentOccupancy: 3,
    processingTimes: { express: 2, passenger: 3, freight: 5, local: 2 },
    operationalHours: { open: '04:00', close: '01:00' },
    maxSimultaneousOperations: 4,
    congestionLevel: 'HIGH'
  },
  {
    id: 'ST002',
    name: 'Borivali',
    code: 'BVI',
    platforms: [
      createPlatform('P005', 'ST002', 1, 400, ['TK001', 'TK002'], [TrainType.EXPRESS, TrainType.PASSENGER, TrainType.LOCAL]),
      createPlatform('P006', 'ST002', 2, 400, ['TK005'], [TrainType.LOCAL, TrainType.PASSENGER], 'OCCUPIED', 'T005'),
      createPlatform('P007', 'ST002', 3, 300, ['TK006'], [TrainType.LOCAL])
    ],
    trackIds: ['TK001', 'TK002', 'TK005'],
    coordinates: { lat: 19.2307, lng: 72.8567 },
    facilities: ['Waiting Room', 'Canteen', 'ATM'],
    status: 'OPERATIONAL',
    capacity: 6,
    currentOccupancy: 2,
    processingTimes: { express: 1, passenger: 2, freight: 4, local: 1 },
    operationalHours: { open: '04:30', close: '00:30' },
    maxSimultaneousOperations: 3,
    congestionLevel: 'MEDIUM'
  },
  {
    id: 'ST003',
    name: 'Surat',
    code: 'ST',
    platforms: [
      createPlatform('P008', 'ST003', 1, 700, ['TK001', 'TK002'], [TrainType.EXPRESS, TrainType.PASSENGER, TrainType.MAIL]),
      createPlatform('P009', 'ST003', 2, 700, ['TK003', 'TK004'], [TrainType.EXPRESS, TrainType.PASSENGER, TrainType.MAIL]),
      createPlatform('P010', 'ST003', 3, 500, ['TK005'], [TrainType.LOCAL, TrainType.PASSENGER])
    ],
    trackIds: ['TK001', 'TK002', 'TK003'],
    coordinates: { lat: 21.1702, lng: 72.8311 },
    facilities: ['Waiting Room', 'Food Court', 'ATM', 'Parking', 'Hotel'],
    status: 'OPERATIONAL',
    capacity: 6,
    currentOccupancy: 2,
    processingTimes: { express: 3, passenger: 4, freight: 6, local: 3 },
    operationalHours: { open: '04:00', close: '01:00' },
    maxSimultaneousOperations: 3,
    congestionLevel: 'MEDIUM'
  },
  {
    id: 'ST004',
    name: 'Vadodara Junction',
    code: 'BRC',
    platforms: [
      createPlatform('P011', 'ST004', 1, 750, ['TK001', 'TK002'], [TrainType.EXPRESS, TrainType.PASSENGER, TrainType.MAIL]),
      createPlatform('P012', 'ST004', 2, 750, ['TK003', 'TK004'], [TrainType.EXPRESS, TrainType.PASSENGER, TrainType.MAIL], 'OCCUPIED', 'T012'),
      createPlatform('P013', 'ST004', 3, 600, ['TK005'], [TrainType.LOCAL, TrainType.PASSENGER]),
      createPlatform('P014', 'ST004', 4, 600, ['TK006'], [TrainType.FREIGHT, TrainType.MAIL])
    ],
    trackIds: ['TK001', 'TK002', 'TK003', 'TK004'],
    coordinates: { lat: 22.3072, lng: 73.1812 },
    facilities: ['Waiting Room', 'Food Court', 'ATM', 'Parking', 'Medical'],
    status: 'OPERATIONAL',
    capacity: 8,
    currentOccupancy: 4,
    processingTimes: { express: 2, passenger: 3, freight: 8, local: 2 },
    operationalHours: { open: '24/7', close: '24/7' },
    maxSimultaneousOperations: 4,
    congestionLevel: 'HIGH'
  },
  {
    id: 'ST005',
    name: 'Ratlam Junction',
    code: 'RTM',
    platforms: [
      createPlatform('P015', 'ST005', 1, 800, ['TK001'], [TrainType.EXPRESS, TrainType.PASSENGER, TrainType.MAIL]),
      createPlatform('P016', 'ST005', 2, 800, ['TK002'], [TrainType.EXPRESS, TrainType.PASSENGER, TrainType.MAIL]),
      createPlatform('P017', 'ST005', 3, 650, ['TK003'], [TrainType.LOCAL, TrainType.PASSENGER], 'MAINTENANCE'),
      createPlatform('P018', 'ST005', 4, 650, ['TK004'], [TrainType.FREIGHT, TrainType.MAIL]),
      createPlatform('P019', 'ST005', 5, 500, ['TK005'], [TrainType.LOCAL])
    ],
    trackIds: ['TK001', 'TK002', 'TK003'],
    coordinates: { lat: 23.3315, lng: 75.0367 },
    facilities: ['Waiting Room', 'Food Court', 'ATM', 'Parking'],
    status: 'OPERATIONAL',
    capacity: 10,
    currentOccupancy: 3,
    processingTimes: { express: 5, passenger: 6, freight: 10, local: 4 },
    operationalHours: { open: '24/7', close: '24/7' },
    maxSimultaneousOperations: 5,
    congestionLevel: 'MEDIUM'
  },
  {
    id: 'ST006',
    name: 'Kota Junction',
    code: 'KOTA',
    platforms: [
      createPlatform('P020', 'ST006', 1, 600, ['TK001', 'TK002'], [TrainType.EXPRESS, TrainType.PASSENGER, TrainType.MAIL]),
      createPlatform('P021', 'ST006', 2, 600, ['TK003', 'TK004'], [TrainType.EXPRESS, TrainType.PASSENGER, TrainType.MAIL])
    ],
    trackIds: ['TK001', 'TK002'],
    coordinates: { lat: 25.2138, lng: 75.8648 },
    facilities: ['Waiting Room', 'Canteen', 'ATM'],
    status: 'OPERATIONAL',
    capacity: 4,
    currentOccupancy: 1,
    processingTimes: { express: 3, passenger: 4, freight: 7, local: 3 },
    operationalHours: { open: '04:00', close: '01:00' },
    maxSimultaneousOperations: 2,
    congestionLevel: 'LOW'
  },
  {
    id: 'ST007',
    name: 'Sawai Madhopur',
    code: 'SWM',
    platforms: [
      createPlatform('P023', 'ST007', 1, 500, ['TK001'], [TrainType.EXPRESS, TrainType.PASSENGER]),
      createPlatform('P024', 'ST007', 2, 500, ['TK002'], [TrainType.LOCAL, TrainType.PASSENGER])
    ],
    trackIds: ['TK001', 'TK002'],
    coordinates: { lat: 26.0173, lng: 76.3440 },
    facilities: ['Waiting Room', 'Canteen'],
    status: 'OPERATIONAL',
    capacity: 4,
    currentOccupancy: 1,
    processingTimes: { express: 2, passenger: 3, freight: 5, local: 2 },
    operationalHours: { open: '05:00', close: '23:00' },
    maxSimultaneousOperations: 2,
    congestionLevel: 'LOW'
  },
  {
    id: 'ST008',
    name: 'Bharatpur Junction',
    code: 'BTE',
    platforms: [
      createPlatform('P025', 'ST008', 1, 650, ['TK001'], [TrainType.EXPRESS, TrainType.PASSENGER, TrainType.MAIL]),
      createPlatform('P026', 'ST008', 2, 650, ['TK002'], [TrainType.EXPRESS, TrainType.PASSENGER, TrainType.MAIL]),
      createPlatform('P027', 'ST008', 3, 450, ['TK003'], [TrainType.LOCAL, TrainType.PASSENGER])
    ],
    trackIds: ['TK001', 'TK002', 'TK003'],
    coordinates: { lat: 27.2152, lng: 77.4897 },
    facilities: ['Waiting Room', 'Food Court', 'ATM'],
    status: 'OPERATIONAL',
    capacity: 6,
    currentOccupancy: 2,
    processingTimes: { express: 3, passenger: 4, freight: 6, local: 3 },
    operationalHours: { open: '04:30', close: '00:30' },
    maxSimultaneousOperations: 3,
    congestionLevel: 'MEDIUM'
  },
  {
    id: 'ST009',
    name: 'Mathura Junction',
    code: 'MTJ',
    platforms: [
      createPlatform('P028', 'ST009', 1, 750, ['TK001'], [TrainType.EXPRESS, TrainType.PASSENGER, TrainType.MAIL]),
      createPlatform('P029', 'ST009', 2, 750, ['TK002'], [TrainType.EXPRESS, TrainType.PASSENGER, TrainType.MAIL]),
      createPlatform('P030', 'ST009', 3, 600, ['TK003'], [TrainType.LOCAL, TrainType.PASSENGER]),
      createPlatform('P031', 'ST009', 4, 600, ['TK004'], [TrainType.FREIGHT, TrainType.MAIL])
    ],
    trackIds: ['TK001', 'TK002', 'TK003', 'TK004'],
    coordinates: { lat: 27.4924, lng: 77.6737 },
    facilities: ['Waiting Room', 'Food Court', 'ATM', 'Parking', 'Medical'],
    status: 'OPERATIONAL',
    capacity: 8,
    currentOccupancy: 3,
    processingTimes: { express: 4, passenger: 5, freight: 8, local: 3 },
    operationalHours: { open: '24/7', close: '24/7' },
    maxSimultaneousOperations: 4,
    congestionLevel: 'HIGH'
  },
  {
    id: 'ST010',
    name: 'Delhi Sarai Rohilla',
    code: 'DEE',
    platforms: [
      createPlatform('P032', 'ST010', 1, 800, ['TK001'], [TrainType.EXPRESS, TrainType.PASSENGER, TrainType.MAIL]),
      createPlatform('P033', 'ST010', 2, 800, ['TK002'], [TrainType.EXPRESS, TrainType.PASSENGER, TrainType.MAIL]),
      createPlatform('P034', 'ST010', 3, 650, ['TK003'], [TrainType.LOCAL, TrainType.PASSENGER]),
      createPlatform('P035', 'ST010', 4, 650, ['TK004'], [TrainType.FREIGHT, TrainType.MAIL]),
      createPlatform('P036', 'ST010', 5, 500, ['TK005'], [TrainType.LOCAL]),
      createPlatform('P037', 'ST010', 6, 750, ['TK006'], [TrainType.SPECIAL, TrainType.EXPRESS])
    ],
    trackIds: ['TK001', 'TK002', 'TK003', 'TK004', 'TK005', 'TK006'],
    coordinates: { lat: 28.6139, lng: 77.2090 },
    facilities: ['Waiting Room', 'Food Court', 'ATM', 'Parking', 'Medical', 'Hotel', 'WiFi'],
    status: 'OPERATIONAL',
    capacity: 12,
    currentOccupancy: 5,
    processingTimes: { express: 5, passenger: 6, freight: 10, local: 4 },
    operationalHours: { open: '24/7', close: '24/7' },
    maxSimultaneousOperations: 6,
    congestionLevel: 'CRITICAL'
  }
]

// Track data for the network (6 parallel tracks)
export const TRACKS: Track[] = [
  {
    id: 'TK001',
    name: 'Main Up Line',
    type: 'MAIN',
    direction: 'UP',
    status: 'AVAILABLE',
    maxSpeed: 130,
    length: 1384,
    capacity: 8,
    currentOccupancy: ['T001', 'T008', 'T015'],
    connectedStations: ['ST001', 'ST002', 'ST003', 'ST004', 'ST005', 'ST006', 'ST007', 'ST008', 'ST009', 'ST010'],
    signaling: 'ELECTRONIC',
    electrification: true,
    maintenanceWindows: []
  },
  {
    id: 'TK002',
    name: 'Main Down Line',
    type: 'MAIN',
    direction: 'DOWN',
    status: 'AVAILABLE',
    maxSpeed: 130,
    length: 1384,
    capacity: 8,
    currentOccupancy: ['T002', 'T009', 'T016'],
    connectedStations: ['ST010', 'ST009', 'ST008', 'ST007', 'ST006', 'ST005', 'ST004', 'ST003', 'ST002', 'ST001'],
    signaling: 'ELECTRONIC',
    electrification: true,
    maintenanceWindows: []
  },
  {
    id: 'TK003',
    name: 'Express Up Line',
    type: 'MAIN',
    direction: 'UP',
    status: 'AVAILABLE',
    maxSpeed: 160,
    length: 1384,
    capacity: 6,
    currentOccupancy: ['T003', 'T010'],
    connectedStations: ['ST001', 'ST003', 'ST004', 'ST005', 'ST008', 'ST009', 'ST010'],
    signaling: 'ELECTRONIC',
    electrification: true,
    maintenanceWindows: []
  },
  {
    id: 'TK004',
    name: 'Express Down Line',
    type: 'MAIN',
    direction: 'DOWN',
    status: 'AVAILABLE',
    maxSpeed: 160,
    length: 1384,
    capacity: 6,
    currentOccupancy: ['T004', 'T011'],
    connectedStations: ['ST010', 'ST009', 'ST008', 'ST005', 'ST004', 'ST003', 'ST001'],
    signaling: 'ELECTRONIC',
    electrification: true,
    maintenanceWindows: []
  },
  {
    id: 'TK005',
    name: 'Local/Suburban Line',
    type: 'LOOP',
    direction: 'BIDIRECTIONAL',
    status: 'MAINTENANCE',
    maxSpeed: 100,
    length: 245,
    capacity: 4,
    currentOccupancy: ['T005', 'T012'],
    connectedStations: ['ST001', 'ST002', 'ST003', 'ST005'],
    signaling: 'ELECTRONIC',
    electrification: true,
    maintenanceWindows: [{
      id: 'MW001',
      startTime: '02:00',
      endTime: '04:00',
      type: 'PREVENTIVE',
      affectedTracks: ['TK005'],
      affectedPlatforms: [],
      description: 'Routine track maintenance',
      priority: 'MEDIUM'
    }]
  },
  {
    id: 'TK006',
    name: 'Goods Line',
    type: 'SIDING',
    direction: 'BIDIRECTIONAL',
    status: 'AVAILABLE',
    maxSpeed: 80,
    length: 650,
    capacity: 4,
    currentOccupancy: ['T020', 'T027'],
    connectedStations: ['ST006', 'ST008', 'ST009', 'ST010'],
    signaling: 'MANUAL',
    electrification: false,
    maintenanceWindows: []
  }
]

// Generate 30 realistic trains
export function generateTrainData(): Train[] {
  if (trainCache) return trainCache
  const trains: Train[] = []
  const trainTypes = [TrainType.EXPRESS, TrainType.PASSENGER, TrainType.FREIGHT, TrainType.LOCAL, TrainType.MAIL] as const
  const priorities = ['HIGH', 'MEDIUM', 'LOW'] as const
  const statuses = ['ON_TIME', 'DELAYED', 'CRITICAL', 'REROUTED'] as const

  for (let i = 0; i < 30; i++) {
    const trainId = `T${String(i + 1).padStart(3, '0')}`
    const trainNumber = `${12000 + i}`
    const type = trainTypes[Math.floor(Math.random() * trainTypes.length)]
    const priority = priorities[Math.floor(Math.random() * priorities.length)]

    // Select random origin and destination stations
    const routeStations = STATIONS.slice(Math.floor(Math.random() * 3), Math.floor(Math.random() * 4) + 6)

    // Generate route with times
    const route: TrainRoute[] = routeStations.map((station, index) => {
      const isOrigin = index === 0
      const isDestination = index === routeStations.length - 1
      const arrivalTime = new Date(Date.now() + index * 60 * 60 * 1000) // 1 hour intervals
      const departureTime = new Date(arrivalTime.getTime() + (isDestination ? 0 : 10 * 60 * 1000)) // 10 min stop

      return {
        stationId: station.id,
        stationName: station.name,
        platformId: station.platforms[Math.floor(Math.random() * station.platforms.length)]?.id,
        trackId: station.trackIds[Math.floor(Math.random() * station.trackIds.length)],
        scheduledArrival: isOrigin ? '' : arrivalTime.toISOString(),
        estimatedArrival: isOrigin ? '' : new Date(arrivalTime.getTime() + Math.random() * 15 * 60 * 1000).toISOString(),
        scheduledDeparture: isDestination ? '' : departureTime.toISOString(),
        estimatedDeparture: isDestination ? '' : new Date(departureTime.getTime() + Math.random() * 10 * 60 * 1000).toISOString(),
        dwellTime: isOrigin || isDestination ? 10 : station.processingTimes[type.toLowerCase() as keyof typeof station.processingTimes],
        distance: index === 0 ? 0 : Math.floor(Math.random() * 150) + 50,
        travelTime: index === 0 ? 0 : Math.floor(Math.random() * 60) + 30,
        isOrigin,
        isDestination
      }
    })

    const currentStationIndex = Math.floor(Math.random() * routeStations.length)
    const nextStationIndex = Math.min(currentStationIndex + 1, routeStations.length - 1)

    const delay = Math.floor(Math.random() * 30) // 0-30 minutes delay
    const status = delay > 15 ? 'DELAYED' : delay > 25 ? 'CRITICAL' : statuses[Math.floor(Math.random() * statuses.length)]

    trains.push({
      id: trainId,
      number: trainNumber,
      name: `${type} ${trainNumber}`,
      type,
      priority,
      status,
      currentStation: routeStations[currentStationIndex].id,
      nextStation: routeStations[nextStationIndex].id,
      scheduledArrival: route[nextStationIndex]?.scheduledArrival || '',
      estimatedArrival: route[nextStationIndex]?.estimatedArrival || '',
      scheduledDeparture: route[currentStationIndex]?.scheduledDeparture || '',
      estimatedDeparture: route[currentStationIndex]?.estimatedDeparture || '',
      delay,
      platform: route[currentStationIndex]?.platformId,
      assignedTrack: route[currentStationIndex]?.trackId,
      position: {
        lat: routeStations[currentStationIndex].coordinates.lat + (Math.random() - 0.5) * 0.01,
        lng: routeStations[currentStationIndex].coordinates.lng + (Math.random() - 0.5) * 0.01,
        sectionId: `SEC_${routeStations[currentStationIndex].id}_${routeStations[nextStationIndex].id}`,
        trackId: route[currentStationIndex]?.trackId || 'TK001',
        progress: Math.floor(Math.random() * 100)
      },
      passengers: type === TrainType.FREIGHT ? 0 : Math.floor(Math.random() * 800) + 200,
      capacity: type === TrainType.FREIGHT ? 2000 : type === TrainType.EXPRESS ? 1200 : 800,
      route,
      constraints: [
        {
          type: 'SPEED_LIMIT',
          description: 'Maximum allowed speed for train type',
          value: type === TrainType.EXPRESS ? 160 : type === TrainType.FREIGHT ? 80 : 130,
          unit: 'km/h'
        },
        {
          type: 'PLATFORM_AVAILABILITY',
          description: 'Platform length requirement',
          value: type === TrainType.EXPRESS ? 650 : 400,
          unit: 'meters'
        }
      ],
      operationalCost: type === TrainType.FREIGHT ? 15 : type === TrainType.EXPRESS ? 25 : 12, // per minute
      fuelConsumption: type === TrainType.FREIGHT ? 3.2 : type === TrainType.EXPRESS ? 2.8 : 2.1 // per km
    })
  }

  trainCache = trains
  return trains
}

// Additional mock data for API compatibility
export const mockAlerts = [
  {
    id: 'A001',
    type: 'DELAY',
    severity: 'WARNING',
    title: 'Train Delay Alert',
    message: 'Train 12424 is delayed by 15 minutes',
    affectedTrains: ['T001'],
    affectedSections: ['SEC_ST001_ST002'],
    timestamp: new Date().toISOString(),
    acknowledged: false
  },
  {
    id: 'A002',
    type: 'WEATHER',
    severity: 'CRITICAL',
    title: 'Heavy Fog Alert',
    message: 'Visibility reduced to less than 50m between Surat and Vadodara',
    affectedTrains: ['T003', 'T010'],
    affectedSections: ['SEC_ST003_ST004'],
    timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    acknowledged: true,
    acknowledgedBy: 'controller_01'
  }
]

export const mockRecommendations = [
  {
    id: 'R001',
    type: 'PRECEDENCE',
    trainId: 'T001',
    title: 'Priority Override Recommended',
    description: 'Give precedence to T001 due to passenger load',
    impact: 'Reduces overall delay by 8 minutes',
    confidence: 85,
    urgency: 'HIGH',
    createdAt: new Date().toISOString(),
    status: 'PENDING'
  },
  {
    id: 'R002',
    type: 'ROUTE',
    trainId: 'T003',
    title: 'Alternative Route Suggested',
    description: 'Route via Track 2 to avoid congestion',
    impact: 'Saves 12 minutes, reduces fuel consumption by 5%',
    confidence: 92,
    urgency: 'MEDIUM',
    createdAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    status: 'APPROVED',
    controllerAction: {
      action: 'APPROVE',
      timestamp: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
      reason: 'Optimal route selection',
      userId: 'controller_01'
    }
  }
]

export const mockSystemStatus = {
  overall: 'OPERATIONAL',
  services: [
    { name: 'Signaling System', status: 'OPERATIONAL', uptime: 99.8 },
    { name: 'Communication Network', status: 'OPERATIONAL', uptime: 99.9 },
    { name: 'Power Grid', status: 'MAINTENANCE', uptime: 95.2 },
    { name: 'Track Monitoring', status: 'OPERATIONAL', uptime: 99.5 },
    { name: 'Weather Monitoring', status: 'OPERATIONAL', uptime: 98.7 }
  ],
  lastUpdated: new Date().toISOString()
}

// Sample disruption events for testing
export const SAMPLE_DISRUPTIONS: DisruptionEvent[] = [
  {
    id: 'D001',
    type: 'BLOCK_SECTION',
    severity: 'HIGH',
    title: 'Track Blockage at Ratlam Junction',
    description: 'Signal failure at Ratlam Junction - Track 3 blocked',
    startTime: new Date().toISOString(),
    duration: 120, // 2 hours
    stationId: 'ST005',
    sectionId: 'SEC_ST005_TK003'
  },
  {
    id: 'D002',
    type: 'WEATHER_DELAY',
    severity: 'MEDIUM',
    title: 'Heavy Fog Alert',
    description: 'Heavy fog between Surat and Vadodara - visibility < 50m',
    startTime: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30 minutes ago
    duration: 90,
    sectionId: 'SEC_ST003_ST004',
    delayMinutes: 15
  },
  {
    id: 'D003',
    type: 'PLATFORM_UNAVAILABLE',
    severity: 'CRITICAL',
    title: 'Platform System Failure',
    description: 'Platform 1 at Delhi Sarai Rohilla - electrical system failure',
    startTime: new Date(Date.now() + 15 * 60 * 1000).toISOString(), // 15 minutes from now
    duration: 180,
    stationId: 'ST010',
    platformId: 'P032'
  }
]