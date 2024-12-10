import React from 'react';
import { ManuscriptDetails } from '../../contexts/RecordContext';

interface ScoresDisplayProps {
  manuscript: ManuscriptDetails;
}

const GRAMMAR_PASSING_SCORE = 85;
const PLAGIARISM_THRESHOLD = 15;

const ScoresDisplay: React.FC<ScoresDisplayProps> = ({ manuscript }) => {
  return (
    <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
      <div>
        <label className="font-semibold block">Grammar Score:</label>
        <div className="flex items-center mt-1">
          <div 
            className={`text-lg font-medium ${
              (manuscript.grammarScore ?? 0) >= GRAMMAR_PASSING_SCORE 
                ? 'text-green-600' 
                : 'text-red-600'
            }`}
          >
            {manuscript.grammarScore ?? 'N/A'}%
          </div>
          {manuscript.grammarScore && (
            <div className={`ml-2 text-sm ${
              manuscript.grammarScore >= GRAMMAR_PASSING_SCORE 
                ? 'text-green-600' 
                : 'text-red-600'
            }`}>
              ({manuscript.grammarScore >= GRAMMAR_PASSING_SCORE ? 'Passed' : 'Failed'})
            </div>
          )}
        </div>
        {manuscript.grammarScore && (
          <div className="text-xs text-gray-500 mt-1">
            Passing score: {GRAMMAR_PASSING_SCORE}%
          </div>
        )}
      </div>
      
      <div>
        <label className="font-semibold block">Plagiarism Score:</label>
        <div className="flex items-center mt-1">
          <div 
            className={`text-lg font-medium ${
              (manuscript.plagiarismScore ?? 100) <= PLAGIARISM_THRESHOLD 
                ? 'text-green-600' 
                : 'text-red-600'
            }`}
          >
            {manuscript.plagiarismScore ?? 'N/A'}%
          </div>
          {manuscript.plagiarismScore && (
            <div className={`ml-2 text-sm ${
              manuscript.plagiarismScore <= PLAGIARISM_THRESHOLD 
                ? 'text-green-600' 
                : 'text-red-600'
            }`}>
              ({manuscript.plagiarismScore <= PLAGIARISM_THRESHOLD ? 'Passed' : 'Failed'})
            </div>
          )}
        </div>
        {manuscript.plagiarismScore && (
          <div className="text-xs text-gray-500 mt-1">
            Threshold: {PLAGIARISM_THRESHOLD}%
          </div>
        )}
      </div>
    </div>
  );
};

export default ScoresDisplay; 