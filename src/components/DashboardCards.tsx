import React from "react";
import { FileText, Users, CheckCircle, XCircle, Upload, BookOpen, UserCog, Maximize2 } from "lucide-react";

interface DashboardCardsProps {
  cardData: {
    preReviewCount: number;
    doubleBlindCount: number;

    acceptedCount?: number;
    publishedCount: number;
    rejectedCount: number;
    uploadCount: number;
    reviewersCount: number;
    editorsCount: number;
  };
  onCardExpand: (cardId: string) => void;
  isDirector?: boolean;
}

const DashboardCards: React.FC<DashboardCardsProps> = ({ cardData, onCardExpand, isDirector = false }) => {
  const getCards = () => {
    const baseCards = [
      { id: "pre-review", title: "Pre-Review", icon: FileText, count: cardData.preReviewCount, color: "bg-orange-500" },
      {
        id: "double-blind",
        title: "Double-Blind",
        icon: Users,
        count: cardData.doubleBlindCount,
        color: "bg-amber-700",
      },
      { id: "published", title: "Published", icon: BookOpen, count: cardData.publishedCount, color: "bg-indigo-500" },
      { id: "rejected", title: "Rejected", icon: XCircle, count: cardData.rejectedCount, color: "bg-red-500" },
      { id: "upload", title: "Upload", icon: Upload, count: cardData.uploadCount, color: "bg-gray-500" },
      { id: "reviewers", title: "Reviewers", icon: Users, count: cardData.reviewersCount, color: "bg-yellow-500" },
      { id: "editors", title: "Editors", icon: UserCog, count: cardData.editorsCount, color: "bg-pink-500" },
    ];

    if (!isDirector) {
      return [
        ...baseCards.slice(0, 2),
        {
          id: "accepted",
          title: "Accepted",
          icon: CheckCircle,
          count: cardData.acceptedCount || 0,
          color: "bg-green-500",
        },
        ...baseCards.slice(2),
      ];
    }

    return baseCards;
  };

  const cards = getCards();

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
      {cards.map((card) => (
        <div key={card.id} className={`${card.color} rounded-lg shadow-md p-4 text-white relative`}>
          <div className="flex items-center justify-between mb-2">
            <card.icon size={24} />
            <span className="text-2xl font-bold">{card.count}</span>
          </div>
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium">{card.title}</h4>
            {/* {card.id !== 'upload' && (
              <button
                onClick={() => onCardExpand(card.id)}
                className="absolute bottom-2 right-2 text-white hover:text-gray-200 transition-colors p-1 rounded-full hover:bg-white/10"
                title="View Details"
              >
                <Maximize2 size={16} />
              </button>
            )} */}
          </div>
        </div>
      ))}
    </div>
  );
};

export default DashboardCards;
