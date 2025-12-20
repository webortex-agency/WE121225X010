export const mockAnalytics = {
  metrics: {
    totalRevenue: 2485000,
    totalCollections: 20,
    activeMovies: 10,
    activeExhibitors: 13,
    approvalRate: 75,
    avgCollectionValue: 124250
  },
  chartData: {
    revenueTrend: [
      { date: '2024-12-10', amount: 195000 },
      { date: '2024-12-11', amount: 256500 },
      { date: '2024-12-12', amount: 190000 },
      { date: '2024-12-13', amount: 266000 },
      { date: '2024-12-14', amount: 133000 },
      { date: '2024-12-15', amount: 218500 },
      { date: '2024-12-16', amount: 256500 },
      { date: '2024-12-17', amount: 342000 },
      { date: '2024-12-18', amount: 209000 },
      { date: '2024-12-19', amount: 565000 }
    ],
    topMovies: [
      { name: 'Pathaan', amount: 1042250, collections: 5 },
      { name: 'Jawan', amount: 437000, collections: 3 },
      { name: 'Dunki', amount: 441750, collections: 3 },
      { name: 'Tiger 3', amount: 275500, collections: 2 },
      { name: 'Gadar 2', amount: 180000, collections: 2 },
      { name: 'OMG 2', amount: 180500, collections: 2 },
      { name: 'Rocky Aur Rani Kii Prem Kahaani', amount: 90250, collections: 1 },
      { name: 'Mission: Impossible 7', amount: 71250, collections: 1 },
      { name: 'Oppenheimer', amount: 80750, collections: 1 },
      { name: 'Barbie', amount: 52250, collections: 1 }
    ],
    topExhibitors: [
      { name: 'PVR Cinemas', amount: 679250, collections: 3 },
      { name: 'INOX Leisure', amount: 228000, collections: 2 },
      { name: 'Cinepolis India', amount: 294500, collections: 2 },
      { name: 'Carnival Cinemas', amount: 218500, collections: 2 },
      { name: 'Miraj Cinemas', amount: 246750, collections: 2 },
      { name: 'Wave Cinemas', amount: 152000, collections: 2 },
      { name: 'Fun Republic', amount: 147250, collections: 1 },
      { name: 'Satyam Cineplexes', amount: 109250, collections: 1 },
      { name: 'Mukta A2 Cinemas', amount: 90250, collections: 1 },
      { name: 'Raj Mandir Cinema', amount: 128250, collections: 1 }
    ],
    statusDistribution: [
      { status: 'Approved', count: 12, percentage: 60, color: '#22c55e' },
      { status: 'Pending', count: 6, percentage: 30, color: '#eab308' },
      { status: 'Rejected', count: 2, percentage: 10, color: '#ef4444' }
    ],
    dailySummary: [
      {
        date: '2024-12-19',
        totalCollections: 565000,
        avgPerTheater: 188333,
        topMovie: 'Pathaan',
        pending: 1,
        approved: 2,
        rejected: 0
      },
      {
        date: '2024-12-18',
        totalCollections: 209000,
        avgPerTheater: 104500,
        topMovie: 'Pathaan',
        pending: 0,
        approved: 1,
        rejected: 1
      },
      {
        date: '2024-12-17',
        totalCollections: 342000,
        avgPerTheater: 171000,
        topMovie: 'Jawan',
        pending: 1,
        approved: 1,
        rejected: 0
      },
      {
        date: '2024-12-16',
        totalCollections: 256500,
        avgPerTheater: 128250,
        topMovie: 'Dunki',
        pending: 0,
        approved: 2,
        rejected: 0
      },
      {
        date: '2024-12-15',
        totalCollections: 218500,
        avgPerTheater: 109250,
        topMovie: 'Pathaan',
        pending: 1,
        approved: 1,
        rejected: 0
      }
    ],
    moviePerformanceByRegion: [
      { movie: 'Pathaan', mumbai: 507000, delhi: 0, bangalore: 0, pune: 118750, hyderabad: 0, others: 416500 },
      { movie: 'Jawan', mumbai: 261250, delhi: 175750, bangalore: 0, pune: 0, hyderabad: 0, others: 0 },
      { movie: 'Dunki', mumbai: 0, delhi: 0, bangalore: 156750, pune: 0, hyderabad: 0, others: 285000 },
      { movie: 'Tiger 3', mumbai: 0, delhi: 0, bangalore: 0, pune: 0, hyderabad: 90250, others: 185250 },
      { movie: 'Gadar 2', mumbai: 0, delhi: 0, bangalore: 0, pune: 99750, hyderabad: 0, others: 80250 }
    ]
  }
};
