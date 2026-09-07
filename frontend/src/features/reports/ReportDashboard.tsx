import MapComponent from '../maps/MapComponent';

const ReportDashboard = () => {
  
  // Mock data for presentation
  const mockCenter: [number, number] = [18.5204, 73.8567]; // Pune
  const mockCompetitors = [
    { id: 1, lat: 18.5210, lng: 73.8550, name: 'Local Grocer A', category: 'Retail' },
    { id: 2, lat: 18.5190, lng: 73.8580, name: 'Supermarket B', category: 'Retail' }
  ];

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6 mt-10">
      <div className="flex justify-between items-center border-b pb-4">
        <h1 className="text-3xl font-bold text-primary">Feasibility Report</h1>
        <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full font-medium text-sm border border-green-200">
          Highly Feasible (Score: 8.5/10)
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: Map & Metrics */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <h2 className="text-lg font-semibold mb-4">Market Reach & Competitor Map</h2>
            <MapComponent center={mockCenter} competitors={mockCompetitors} radiusKm={5} />
            
            <div className="mt-4 grid grid-cols-3 gap-4 text-center">
              <div className="bg-gray-50 p-3 rounded border">
                <div className="text-2xl font-bold text-primary">2</div>
                <div className="text-xs text-gray-500 uppercase">Known Competitors</div>
              </div>
              <div className="bg-gray-50 p-3 rounded border">
                <div className="text-2xl font-bold text-primary">5 km</div>
                <div className="text-xs text-gray-500 uppercase">Market Radius</div>
              </div>
              <div className="bg-gray-50 p-3 rounded border">
                <div className="text-2xl font-bold text-primary">~15k</div>
                <div className="text-xs text-gray-500 uppercase">Est. Footfall Reach</div>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <h2 className="text-lg font-semibold mb-2">AI Pricing Analysis</h2>
            <p className="text-sm text-gray-700">
              <span className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded border border-purple-200 mr-2">AI_GENERATED_RECOMMENDATION</span>
              Based on local competitors, the suggested pricing is <strong>₹150 - ₹200</strong>. This sits slightly below the premium offerings of Supermarket B, capturing the underserved middle segment.
            </p>
          </div>
        </div>

        {/* Right Column: SWOT & Risks */}
        <div className="space-y-6">
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <h2 className="text-lg font-semibold mb-4 border-b pb-2">SWOT Analysis</h2>
            
            <div className="space-y-3">
              <div>
                <h3 className="text-sm font-bold text-green-700 uppercase">Strengths</h3>
                <ul className="list-disc pl-5 text-sm text-gray-600 mt-1 space-y-1">
                  <li>Low initial setup cost via Micro Finance</li>
                  <li>Proximity to main transport hub</li>
                </ul>
              </div>
              <div>
                <h3 className="text-sm font-bold text-orange-700 uppercase">Weaknesses</h3>
                <ul className="list-disc pl-5 text-sm text-gray-600 mt-1 space-y-1">
                  <li>Limited inventory capacity initially</li>
                </ul>
              </div>
              <div>
                <h3 className="text-sm font-bold text-blue-700 uppercase">Opportunities</h3>
                <ul className="list-disc pl-5 text-sm text-gray-600 mt-1 space-y-1">
                  <li>Growing local demand for organic retail</li>
                </ul>
              </div>
              <div>
                <h3 className="text-sm font-bold text-red-700 uppercase">Threats</h3>
                <ul className="list-disc pl-5 text-sm text-gray-600 mt-1 space-y-1">
                  <li>Aggressive pricing from Supermarket B</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <h2 className="text-lg font-semibold mb-3 text-red-600 border-b pb-2">Top Risk</h2>
            <p className="text-sm font-medium mb-1">Supply Chain Delay</p>
            <p className="text-xs text-gray-600">
              <strong>Mitigation:</strong> Establish ties with at least two distinct distributors within a 20km radius.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportDashboard;
