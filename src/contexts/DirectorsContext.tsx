import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRecords } from './RecordContext';
import { useDashboard } from './DashboardContext';

interface DirectorsContextType {
  preReviewCount: number;
  doubleBlindCount: number;
  publishedCount: number;
  rejectedCount: number;
  uploadCount: number;
  pendingCount: number;
  reviewersCount: number;
  editorsCount: number;
  updateStats: () => void;
}

const DirectorsContext = createContext<DirectorsContextType>({
  preReviewCount: 0,
  doubleBlindCount: 0,
  publishedCount: 0,
  rejectedCount: 0,
  uploadCount: 0,
  pendingCount: 0,
  reviewersCount: 0,
  editorsCount: 0,
  updateStats: () => {},
});

export const useDirectors = () => useContext(DirectorsContext);

export const DirectorsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { manuscriptRecords } = useRecords();
  const dashboard = useDashboard();
  const [stats, setStats] = useState({
    preReviewCount: 0,
    doubleBlindCount: 0,
    publishedCount: 0,
    rejectedCount: 0,
    uploadCount: 0,
    pendingCount: 0,
    reviewersCount: 0,
    editorsCount: 0,
  });

  useEffect(() => {
    const pendingCount = manuscriptRecords.filter(record => !record.status || record.status === 'pending').length;
    
    setStats({
      preReviewCount: dashboard.preReviewCount,
      doubleBlindCount: dashboard.doubleBlindCount,
      publishedCount: dashboard.publishedCount,
      rejectedCount: dashboard.rejectedCount,
      uploadCount: dashboard.uploadCount,
      pendingCount,
      reviewersCount: dashboard.reviewersCount,
      editorsCount: dashboard.editorsCount,
    });
  }, [
    dashboard.preReviewCount,
    dashboard.doubleBlindCount,
    dashboard.publishedCount,
    dashboard.rejectedCount,
    dashboard.uploadCount,
    dashboard.reviewersCount,
    dashboard.editorsCount,
    manuscriptRecords
  ]);

  const updateStats = () => {
    const pendingCount = manuscriptRecords.filter(record => !record.status || record.status === 'pending').length;
    
    setStats({
      preReviewCount: dashboard.preReviewCount,
      doubleBlindCount: dashboard.doubleBlindCount,
      publishedCount: dashboard.publishedCount,
      rejectedCount: dashboard.rejectedCount,
      uploadCount: dashboard.uploadCount,
      pendingCount,
      reviewersCount: dashboard.reviewersCount,
      editorsCount: dashboard.editorsCount,
    });
  };

  return (
    <DirectorsContext.Provider value={{ ...stats, updateStats }}>
      {children}
    </DirectorsContext.Provider>
  );
};