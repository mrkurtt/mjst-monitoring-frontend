import useLocalStorage from './useLocalStorage';

interface MonthlySubmission {
  name: string;
  value: number;
}

interface YearData {
  firstHalf: MonthlySubmission[];
  secondHalf: MonthlySubmission[];
}

interface YearlySubmissions {
  [key: number]: YearData;
}

const createEmptyYearData = (): YearData => ({
  firstHalf: Array(6).fill(0).map((_, i) => ({ 
    name: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'][i],
    value: 0 
  })),
  secondHalf: Array(6).fill(0).map((_, i) => ({ 
    name: ['Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][i],
    value: 0 
  }))
});

export const useSubmissionStorage = () => {
  const [submissions, setSubmissions] = useLocalStorage<YearlySubmissions>('submissions_data', {});

  const updateMonthlySubmission = (year: number, month: number, value: number) => {
    setSubmissions((prev: YearlySubmissions) => {
      const yearData = prev[year] || createEmptyYearData();
      const isFirstHalf = month < 6;
      const monthIndex = isFirstHalf ? month : month - 6;
      const period = isFirstHalf ? 'firstHalf' : 'secondHalf';

      const updatedPeriod = [...yearData[period]];
      updatedPeriod[monthIndex] = {
        name: yearData[period][monthIndex].name,
        value: value
      };

      const newYearData = {
        ...yearData,
        [period]: updatedPeriod
      };

      return {
        ...prev,
        [year]: newYearData
      };
    });
  };

  const getYearSubmissions = (year: number): YearData => {
    return submissions[year] || createEmptyYearData();
  };

  return {
    submissions,
    updateMonthlySubmission,
    getYearSubmissions
  };
}; 