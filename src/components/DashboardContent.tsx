import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import DashboardCards from './DashboardCards';
import DashboardCharts from './DashboardCharts';
import DetailedRecordsModal from './DetailedRecordsModal';
import { useDashboard } from '../contexts/DashboardContext';

const DashboardContent: React.FC = () => {
  const [selectedCard, setSelectedCard] = useState<string | null>(null);
  const [selectedYear, setSelectedYear] = useState<number>(2025);
  const [showSummary, setShowSummary] = useState(false);
  const location = useLocation();
  const isDirectorDashboard = location.pathname.includes('/director');

  const {
    uploadCount,
    preReviewCount,
    doubleBlindCount,
    acceptedCount,
    publishedCount,
    rejectedCount,
    reviewersCount,
    editorsCount,
    firstHalfSubmissions,
    secondHalfSubmissions,
    internalSubmissions,
    externalSubmissions,
    updateStats
  } = useDashboard();

  // Interface for year-based records
  interface YearlyRecord {
    preReviewCount: number;
    doubleBlindCount: number;
    acceptedCount: number;
    uploadCount: number;
    publishedCount: number;
    rejectedCount: number;
    reviewersCount: number;
    editorsCount: number;
    firstHalf: number[];
    secondHalf: number[];
  }

  const [yearlyRecords, setYearlyRecords] = useState<Record<number, YearlyRecord>>({
    [selectedYear]: {
      preReviewCount: 0,
      doubleBlindCount: 0,
      acceptedCount: 0,
      uploadCount: 0,
      publishedCount: 0,
      rejectedCount: 0,
      reviewersCount: 0,
      editorsCount: 0,
      firstHalf: Array(6).fill(0),
      secondHalf: Array(6).fill(0)
    }
  });

  // Yearly stats management
  const [yearlyStats, setYearlyStats] = useState({
    preReviewCount: 0,
    doubleBlindCount: 0,
    acceptedCount: 0,
    uploadCount: 0,
    publishedCount: 0,
    rejectedCount: 0,
    reviewersCount,
    editorsCount,
  });

  // Yearly submissions data
  const [yearlySubmissions, setYearlySubmissions] = useState({
    firstHalf: Array(6).fill(0),  // January to June
    secondHalf: Array(6).fill(0)  // July to December
  });

  // Store yearly data separately for each year
  const [yearlyData, setYearlyData] = useState<Record<number, {
    stats: {
      preReviewCount: number;
      doubleBlindCount: number;
      acceptedCount: number;
      uploadCount: number;
      publishedCount: number;
      rejectedCount: number;
      reviewersCount: number;
      editorsCount: number;
    };
    submissions: {
      firstHalf: number[];
      secondHalf: number[];
    };
  }>>({});

  // Store persistent data (editors and reviewers) separately
  const [persistentData, setPersistentData] = useState({
    reviewersCount: 0,
    editorsCount: 0,
  });

  useEffect(() => {
    // Update persistent data
    setPersistentData({
      reviewersCount,
      editorsCount,
    });
  }, [reviewersCount, editorsCount]);

  // Function to check if data should be reset
  const shouldResetData = (year: number) => {
    return year > 2025;
  };

  // Get data for the selected year
  const getYearData = (year: number) => {
    // For year 2025, show actual data
    if (year === 2025) {
      return {
        stats: {
          preReviewCount,
          doubleBlindCount,
          acceptedCount,
          uploadCount,
          publishedCount,
          rejectedCount,
          reviewersCount,
          editorsCount,
        },
        submissions: {
          firstHalf: [
            { name: 'Jan', value: firstHalfSubmissions[0]?.value || 0 },
            { name: 'Feb', value: firstHalfSubmissions[1]?.value || 0 },
            { name: 'Mar', value: firstHalfSubmissions[2]?.value || 0 },
            { name: 'Apr', value: firstHalfSubmissions[3]?.value || 0 },
            { name: 'May', value: firstHalfSubmissions[4]?.value || 0 },
            { name: 'Jun', value: firstHalfSubmissions[5]?.value || 0 }
          ],
          secondHalf: [
            { name: 'Jul', value: secondHalfSubmissions[0]?.value || 0 },
            { name: 'Aug', value: secondHalfSubmissions[1]?.value || 0 },
            { name: 'Sep', value: secondHalfSubmissions[2]?.value || 0 },
            { name: 'Oct', value: secondHalfSubmissions[3]?.value || 0 },
            { name: 'Nov', value: secondHalfSubmissions[4]?.value || 0 },
            { name: 'Dec', value: secondHalfSubmissions[5]?.value || 0 }
          ]
        }
      };
    }
    
    // For years after 2025, reset data except reviewers/editors
    if (shouldResetData(year)) {
      return {
        stats: {
          preReviewCount: 0,
          doubleBlindCount: 0,
          acceptedCount: 0,
          uploadCount: 0,
          publishedCount: 0,
          rejectedCount: 0,
          reviewersCount, // Keep reviewers count
          editorsCount,   // Keep editors count
        },
        submissions: {
          firstHalf: [
            { name: 'Jan', value: 0 },
            { name: 'Feb', value: 0 },
            { name: 'Mar', value: 0 },
            { name: 'Apr', value: 0 },
            { name: 'May', value: 0 },
            { name: 'Jun', value: 0 }
          ],
          secondHalf: [
            { name: 'Jul', value: 0 },
            { name: 'Aug', value: 0 },
            { name: 'Sep', value: 0 },
            { name: 'Oct', value: 0 },
            { name: 'Nov', value: 0 },
            { name: 'Dec', value: 0 }
          ]
        }
      };
    }
  };

  // Add year navigation functions
  const handleYearChange = (increment: boolean) => {
    setSelectedYear(prev => {
      const newYear = increment ? prev + 1 : prev - 1;
      // Don't allow going below 2025
      return newYear < 2025 ? 2025 : newYear;
    });
  };

  // Update yearly data when counts change
  useEffect(() => {
    setYearlyData(prev => ({
      ...prev,
      [selectedYear]: {
        stats: {
          preReviewCount,
          doubleBlindCount,
          acceptedCount,
          uploadCount,
          publishedCount,
          rejectedCount,
          reviewersCount,
          editorsCount,
        },
        submissions: {
          firstHalf: firstHalfSubmissions,
          secondHalf: secondHalfSubmissions
        }
      }
    }));
  }, [
    selectedYear,
    preReviewCount,
    doubleBlindCount,
    acceptedCount,
    uploadCount,
    publishedCount,
    rejectedCount,
    reviewersCount,
    editorsCount,
    firstHalfSubmissions,
    secondHalfSubmissions
  ]);

  // Update summary data when year changes
  useEffect(() => {
    const yearData = getYearData(selectedYear);
    
    // Update yearly stats
    setYearlyStats(yearData.stats);

    // Update yearly submissions
    setYearlySubmissions(yearData.submissions);

    // Update yearly records
    setYearlyRecords(prev => ({
      ...prev,
      [selectedYear]: {
        ...yearData.stats,
        firstHalf: yearData.submissions.firstHalf,
        secondHalf: yearData.submissions.secondHalf
      }
    }));
  }, [selectedYear, yearlyData, persistentData]);

  // Function to get summary data
  const getSummaryData = (year: number) => {
    const yearData = getYearData(year);
    const { stats } = yearData;

    // Calculate totals for percentages
    const reviewTotal = stats.preReviewCount + stats.doubleBlindCount + stats.acceptedCount;
    const submissionTotal = stats.uploadCount + stats.publishedCount + stats.rejectedCount;

    return {
      reviewStatus: [
        { 
          name: 'Pre-Review', 
          value: stats.preReviewCount, 
          color: '#F97316', // orange-500 (matching Pre-Review card)
          percentage: reviewTotal ? Math.round((stats.preReviewCount / reviewTotal) * 100) : 0
        },
        { 
          name: 'Double-Blind', 
          value: stats.doubleBlindCount, 
          color: '#B45309', // amber-700 (matching Double-Blind card)
          percentage: reviewTotal ? Math.round((stats.doubleBlindCount / reviewTotal) * 100) : 0
        },
        { 
          name: 'Accepted', 
          value: stats.acceptedCount, 
          color: '#22C55E', // green-500 (matching Accepted card)
          percentage: reviewTotal ? Math.round((stats.acceptedCount / reviewTotal) * 100) : 0
        }
      ].filter(item => item.value > 0),
      submissionStatus: [
        { 
          name: 'Uploads', 
          value: stats.uploadCount, 
          color: '#6B7280', // gray-500
          percentage: submissionTotal ? Math.round((stats.uploadCount / submissionTotal) * 100) : 0
        },
        { 
          name: 'Published', 
          value: stats.publishedCount, 
          color: '#6366F1', // indigo-500 (matching Published card)
          percentage: submissionTotal ? Math.round((stats.publishedCount / submissionTotal) * 100) : 0
        },
        { 
          name: 'Rejected', 
          value: stats.rejectedCount, 
          color: '#EF4444', // red-500 (matching Rejected card)
          percentage: submissionTotal ? Math.round((stats.rejectedCount / submissionTotal) * 100) : 0
        }
      ].filter(item => item.value > 0)
    };
  };

  // Function to get chart data
  const getChartData = () => {
    const yearData = getYearData(selectedYear);
    const { stats } = yearData;

    // Calculate totals for percentages
    const reviewTotal = stats.preReviewCount + stats.doubleBlindCount + stats.acceptedCount;
    const submissionTotal = stats.uploadCount + stats.publishedCount + stats.rejectedCount;

    const reviewStatusData = [
      { 
        name: 'Pre-Review', 
        value: stats.preReviewCount,
        color: '#F97316', // orange-500 (matching Pre-Review card)
        percentage: reviewTotal ? Math.round((stats.preReviewCount / reviewTotal) * 100) : 0
      },
      { 
        name: 'Double-Blind', 
        value: stats.doubleBlindCount,
        color: '#B45309', // amber-700 (matching Double-Blind card)
        percentage: reviewTotal ? Math.round((stats.doubleBlindCount / reviewTotal) * 100) : 0
      },
      ...(isDirectorDashboard ? [] : [{
        name: 'Accepted', 
        value: stats.acceptedCount,
        color: '#22C55E', // green-500 (matching Accepted card)
        percentage: reviewTotal ? Math.round((stats.acceptedCount / reviewTotal) * 100) : 0
      }])
    ].filter(item => item.value > 0);

    const submissionTypeData = [
      { 
        name: 'Upload', 
        value: stats.uploadCount, 
        color: '#6B7280', // gray-500
        percentage: submissionTotal ? Math.round((stats.uploadCount / submissionTotal) * 100) : 0
      },
      { 
        name: 'Rejected', 
        value: stats.rejectedCount, 
        color: '#EF4444', // red-500 (matching Rejected card)
        percentage: submissionTotal ? Math.round((stats.rejectedCount / submissionTotal) * 100) : 0
      },
      { 
        name: 'Published', 
        value: stats.publishedCount, 
        color: '#6366F1', // indigo-500 (matching Published card)
        percentage: submissionTotal ? Math.round((stats.publishedCount / submissionTotal) * 100) : 0
      }
    ].filter(item => item.value > 0);

    if (reviewStatusData.length === 0) {
      reviewStatusData.push({ 
        name: 'No Data', 
        value: 1, 
        color: '#E5E7EB',
        percentage: 100 
      });
    }
    if (submissionTypeData.length === 0) {
      submissionTypeData.push({ 
        name: 'No Data', 
        value: 1, 
        color: '#E5E7EB',
        percentage: 100 
      });
    }

    return { reviewStatusData, submissionTypeData };
  };

  // Function to get monthly data for the selected year
  const getMonthlyData = () => {
    const yearData = getYearData(selectedYear);
    return {
      firstHalf: yearData.submissions.firstHalf.map((value, index) => ({
        name: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'][index],
        value
      })),
      secondHalf: yearData.submissions.secondHalf.map((value, index) => ({
        name: ['Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][index],
        value
      }))
    };
  };

  // Function to get card title
  const getCardTitle = (cardId: string) => {
    const titles: { [key: string]: string } = {
      'pre-review': 'Pre-Review',
      'double-blind': 'Double-Blind',
      'accepted': 'Accepted',
      'published': 'Published',
      'rejected': 'Rejected',
      'reviewers': 'Reviewers',
      'editors': 'Editors'
    };
    return titles[cardId] || cardId;
  };

  // Function to handle card expand
  const handleCardExpand = (cardId: string) => {
    setSelectedCard(cardId);
  };

  const { reviewStatusData, submissionTypeData } = getChartData();

  const cardData = {
    preReviewCount,
    doubleBlindCount,
    acceptedCount: isDirectorDashboard ? undefined : acceptedCount,
    publishedCount,
    rejectedCount,
    uploadCount,
    reviewersCount,
    editorsCount,
  };

  return (
    <div className="p-6">
      {/* Cards Section */}
      <div className="mb-8">
        <DashboardCards 
          cardData={cardData} 
          onCardExpand={handleCardExpand} 
          isDirector={isDirectorDashboard}
        />
      </div>

      {/* Yearly Distribution Charts */}
      <div className="grid grid-cols-2 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h4 className="text-lg font-semibold mb-4">Review Status Distribution</h4>
          <div className="h-[300px]">
            <DashboardCharts.PieChart 
              data={reviewStatusData} 
              chartType="RSD"
              showPercentage={true}
            />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h4 className="text-lg font-semibold mb-4">Submission Type Distribution</h4>
          <div className="h-[300px]">
            <DashboardCharts.PieChart 
              data={submissionTypeData} 
              chartType="STD"
              showPercentage={true}
            />
          </div>
        </div>
      </div>

      {/* Monthly Submissions Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h4 className="text-lg font-semibold mb-4">Monthly Submissions (January - June)</h4>
          <div className="h-[400px]">
            <DashboardCharts.BarChart data={yearlySubmissions.firstHalf.map((value, index) => ({
              name: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'][index],
              value
            }))} />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h4 className="text-lg font-semibold mb-4">Monthly Submissions (July - December)</h4>
          <div className="h-[400px]">
            <DashboardCharts.BarChart data={yearlySubmissions.secondHalf.map((value, index) => ({
              name: ['Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][index],
              value
            }))} />
          </div>
        </div>
      </div>

      {/* Overall Summary Button */}
      <div className="flex justify-center mb-6">
        <button
          onClick={() => setShowSummary(!showSummary)}
          className="bg-[#000765] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#000543] transition-colors duration-200 flex items-center space-x-2"
        >
          <span>{showSummary ? 'Hide' : 'Show'} Overall Summary Report</span>
        </button>
      </div>

      {/* Overall Summary Section - Keep only the yearly data table */}
      {showSummary && (
        <div className="mt-8">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold">Overall Summary</h3>
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => handleYearChange(false)}
                  disabled={selectedYear <= 2025}
                  className={`p-2 rounded-full transition-colors ${
                    selectedYear <= 2025 
                      ? 'text-gray-400 cursor-not-allowed' 
                      : 'hover:bg-gray-200 text-gray-700'
                  }`}
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <div className="flex items-center space-x-2">
                  <span className="text-xl font-semibold">{selectedYear}</span>
                </div>
                <button
                  onClick={() => handleYearChange(true)}
                  className="p-2 hover:bg-gray-200 rounded-full transition-colors text-gray-700"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </div>
            </div>
            
            <div className="grid grid-cols-4 gap-4 mb-6">
              {Object.entries(getYearData(selectedYear).stats).map(([key, value]) => (
                <div key={key} className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="text-sm text-gray-600 mb-1">
                    {key.replace(/Count$/, '').split(/(?=[A-Z])/).join(' ')}
                  </h4>
                  <p className="text-2xl font-bold">{value}</p>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-6 mb-8">
              <div>
                <h4 className="text-lg font-semibold mb-4">Yearly Review Distribution</h4>
                <div className="h-[200px]">
                  <DashboardCharts.PieChart 
                    data={getSummaryData(selectedYear).reviewStatus}
                    chartType="RSD" 
                  />
                </div>
              </div>
              <div>
                <h4 className="text-lg font-semibold mb-4">Yearly Submission Status</h4>
                <div className="h-[200px]">
                  <DashboardCharts.PieChart 
                    data={getSummaryData(selectedYear).submissionStatus}
                    chartType="STD" 
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h5 className="text-md font-medium mb-4">First Half (January - June)</h5>
                <div className="h-[400px]">
                  <DashboardCharts.BarChart 
                    data={getYearData(selectedYear).submissions.firstHalf.map((value, index) => ({
                      name: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'][index],
                      value
                    }))}
                    period="firstHalf"
                  />
                </div>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <h5 className="text-md font-medium mb-4">Second Half (July - December)</h5>
                <div className="h-[400px]">
                  <DashboardCharts.BarChart 
                    data={getYearData(selectedYear).submissions.secondHalf.map((value, index) => ({
                      name: ['Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][index],
                      value
                    }))}
                    period="secondHalf"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Records Modal */}
      {selectedCard && (
        <DetailedRecordsModal
          cardId={selectedCard}
          cardTitle={getCardTitle(selectedCard)}
          onClose={() => setSelectedCard(null)}
          isDirector={isDirectorDashboard}
        />
      )}
    </div>
  );
};

export default DashboardContent;