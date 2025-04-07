# COVID-19 Interactive Data Visualization Dashboard

![Dashboard Preview](https://via.placeholder.com/800x400?text=COVID-19+Dashboard+Preview)

## 📊 Overview

The COVID-19 Interactive Data Visualization Dashboard is a comprehensive web application that provides real-time visualizations of COVID-19 statistics across the globe. Built with React and D3.js, this dashboard fetches data from reliable public APIs and presents it through interactive charts, maps, and customizable filters.

**Live Demo:** [https://covid19-viz-dashboard.netlify.app](https://covid19-viz-dashboard.netlify.app)

## ✨ Features

- **Global & Country Statistics** - Real-time key metrics including cases, deaths, recoveries, and vaccination data
- **Interactive World Map** - Color-coded choropleth map showing global case distribution
- **Time Series Analysis** - Dynamic charts for tracking metrics over customizable time periods
- **Country Comparison** - Tools to compare statistics between multiple countries/regions
- **Advanced Filtering** - Filter data by date range, region, and specific metrics
- **Responsive Design** - Optimized viewing experience across desktop and mobile devices
- **Real-time Updates** - Automatic data refresh from multiple trusted sources
- **Performance Optimized** - Fast loading and smooth interactions even with large datasets

## 🚀 Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm (v7 or higher) or yarn

### Installation

1. Clone the repository

   ```bash
   git clone https://github.com/yourusername/covid-dashboard.git
   cd covid-dashboard
   ```

2. Install dependencies

   ```bash
   npm install
   # or
   yarn install
   ```

3. Create a `.env` file in the root directory with the following content:

   ```
   REACT_APP_COVID_API_URL=https://disease.sh/v3
   REACT_APP_VACCINATION_API_URL=https://raw.githubusercontent.com/owid/covid-19-data/master/public/data
   ```

4. Start the development server

   ```bash
   npm start
   # or
   yarn start
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## 🔧 Available Scripts

- `npm start` - Runs the app in development mode
- `npm test` - Launches the test runner
- `npm run build` - Builds the app for production
- `npm run eject` - Ejects from Create React App (one-way operation)
- `npm run lint` - Lints all project files
- `npm run format` - Formats code with Prettier

## 📂 Project Structure

```
covid-dashboard/
├── public/
│   ├── index.html
│   ├── favicon.ico
│   ├── robots.txt
│   └── assets/
│       └── world.geojson
├── src/
│   ├── api/               # API integration and services
│   ├── components/        # Reusable UI components
│   ├── constants/         # Application constants
│   ├── hooks/             # Custom React hooks
│   ├── redux/             # Redux state management
│   ├── utils/             # Helper functions and utilities
│   ├── styles/            # Global and component styles
│   ├── App.js             # Main application component
│   └── index.js           # Application entry point
└── [Configuration files]
```

## 🌐 API Sources

This dashboard uses the following public APIs:

- [Disease.sh](https://disease.sh/) - Open Disease Data API
- [Our World in Data](https://github.com/owid/covid-19-data) - COVID-19 vaccination data
- [JHU CSSE](https://github.com/CSSEGISandData/COVID-19) - Time series data

## 📚 Tech Stack

- **Frontend Framework**: React.js
- **State Management**: Redux + Redux Toolkit
- **Data Visualization**: D3.js
- **Styling**: CSS Modules + CSS Variables
- **HTTP Client**: Axios
- **Maps**: D3-geo + TopoJSON
- **Performance**: React virtualization + memoization
- **Build Tool**: Create React App (customized configuration)

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgements

- [Create React App](https://create-react-app.dev/)
- [D3.js](https://d3js.org/)
- [Disease.sh API](https://disease.sh/) for providing open API
- [Our World in Data](https://ourworldindata.org/coronavirus)
- [React Redux](https://react-redux.js.org/)
- [Johns Hopkins University](https://coronavirus.jhu.edu/map.html) for COVID-19 data
- [World Health Organization](https://www.who.int/) for health information and guidelines
- [Geo Countries](https://github.com/datasets/geo-countries/tree/main)
