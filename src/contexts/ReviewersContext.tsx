import React, { createContext, useContext, useState } from 'react';

interface Reviewer {
  id: number;
  firstName: string;
  middleName: string;
  lastName: string;
  address: string;
  email: string;
  fieldOfReview: string;
  publicationsLink: string;
}

interface ReviewersContextType {
  reviewers: Reviewer[];
  addReviewer: (reviewer: Reviewer) => void;
  removeReviewer: (id: number) => void;
  updateReviewer: (id: number, reviewer: Reviewer) => void;
}

const ReviewersContext = createContext<ReviewersContextType>({
  reviewers: [],
  addReviewer: () => {},
  removeReviewer: () => {},
  updateReviewer: () => {},
});

export const useReviewers = () => useContext(ReviewersContext);

export const ReviewersProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [reviewers, setReviewers] = useState<Reviewer[]>([]);

  const addReviewer = (reviewer: Reviewer) => {
    setReviewers(prev => [...prev, reviewer]);
  };

  const removeReviewer = (id: number) => {
    setReviewers(prev => prev.filter(reviewer => reviewer.id !== id));
  };

  const updateReviewer = (id: number, updatedReviewer: Reviewer) => {
    setReviewers(prev => prev.map(reviewer => 
      reviewer.id === id ? updatedReviewer : reviewer
    ));
  };

  return (
    <ReviewersContext.Provider value={{ reviewers, addReviewer, removeReviewer, updateReviewer }}>
      {children}
    </ReviewersContext.Provider>
  );
};