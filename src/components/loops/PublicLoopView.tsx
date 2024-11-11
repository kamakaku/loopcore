import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useFirestore } from '../../hooks/useFirestore';
import { Loop, Spot } from '../../types';
import LoadingScreen from '../common/LoadingScreen';
import SpotMarker from '../spots/SpotMarker';
import SpotList from './SpotList';
import CommentList from './CommentList';
import PDFViewer from './PDFViewer';
import FigmaEmbed from '../figma/FigmaEmbed';
import { extractFigmaKeyFromUrl } from '../../lib/figma';

export default function PublicLoopView() {
  const { id } = useParams<{ id: string }>();
  const [selectedSpot, setSelectedSpot] = useState<Spot | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [activeTab, setActiveTab] = useState<'spots' | 'comments'>('spots');

  const { data: loops = [], loading } = useFirestore<Loop>('loops', {
    where: [
      ['publicId', '==', id],
      ['status', '==', 'active']
    ],
    limitTo: 1
  });

  const { data: spots = [], loading: spotsLoading } = useFirestore<Spot>('spots', id ? {
    where: [
      ['loopId', '==', id],
      ['pageNumber', '==', currentPage]
    ],
    orderBy: [['number', 'asc']]
  } : undefined);

  const loop = loops[0];

  if (loading) {
    return <LoadingScreen />;
  }

  if (!loop) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Loop not found</h2>
          <p className="text-gray-500">This loop may have been removed or is no longer public.</p>
        </div>
      </div>
    );
  }

  const renderContent = () => {
    switch (loop.type) {
      case 'url':
        return (
          <div className="relative">
            <img
              src={loop.screenshot}
              alt={loop.title}
              className="w-full h-auto"
            />
            {spots.map(spot => (
              <SpotMarker
                key={spot.id}
                spot={spot}
                isSelected={selectedSpot?.id === spot.id}
                onClick={() => setSelectedSpot(spot)}
                onMouseEnter={() => {}}
                onMouseLeave={() => {}}
                containerRef={{ current: null }}
              />
            ))}
          </div>
        );
      case 'image':
        return (
          <div className="relative">
            <img
              src={loop.content}
              alt={loop.title}
              className="w-full h-auto"
            />
            {spots.map(spot => (
              <SpotMarker
                key={spot.id}
                spot={spot}
                isSelected={selectedSpot?.id === spot.id}
                onClick={() => setSelectedSpot(spot)}
                onMouseEnter={() => {}}
                onMouseLeave={() => {}}
                containerRef={{ current: null }}
              />
            ))}
          </div>
        );
      case 'pdf':
        return (
          <div className="relative">
            <PDFViewer
              pages={loop.pdfPages}
              currentPage={currentPage}
              onPageChange={setCurrentPage}
              renderOverlay={() => (
                <>
                  {spots.map(spot => (
                    <SpotMarker
                      key={spot.id}
                      spot={spot}
                      isSelected={selectedSpot?.id === spot.id}
                      onClick={() => setSelectedSpot(spot)}
                      onMouseEnter={() => {}}
                      onMouseLeave={() => {}}
                      containerRef={{ current: null }}
                    />
                  ))}
                </>
              )}
            />
          </div>
        );
      case 'figma':
        const figmaKey = extractFigmaKeyFromUrl(loop.content);
        return figmaKey ? (
          <div className="relative">
            <FigmaEmbed
              fileKey={figmaKey}
              accessToken={import.meta.env.VITE_FIGMA_ACCESS_TOKEN || ''}
              onError={(error) => console.error('Figma embed error:', error)}
            />
            {spots.map(spot => (
              <SpotMarker
                key={spot.id}
                spot={spot}
                isSelected={selectedSpot?.id === spot.id}
                onClick={() => setSelectedSpot(spot)}
                onMouseEnter={() => {}}
                onMouseLeave={() => {}}
                containerRef={{ current: null }}
              />
            ))}
          </div>
        ) : null;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-white border-b border-gray-200 mb-6 rounded-t-lg">
          <div className="px-6 py-4">
            <h1 className="text-xl font-bold text-gray-900">{loop.title}</h1>
            {loop.description && (
              <p className="mt-1 text-gray-500">{loop.description}</p>
            )}
          </div>
        </div>

        <div className="flex gap-8">
          <div className="flex-1">
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              {renderContent()}
            </div>
          </div>

          <div className="w-96 flex-shrink-0">
            <div className="bg-white rounded-lg shadow-sm h-full flex flex-col">
              <div className="border-b border-gray-200">
                <div className="flex">
                  <button
                    onClick={() => setActiveTab('spots')}
                    className={`flex-1 px-4 py-3 text-sm font-medium ${
                      activeTab === 'spots'
                        ? 'text-blue-600 border-b-2 border-blue-600'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    Spots ({spots.length})
                  </button>
                  <button
                    onClick={() => setActiveTab('comments')}
                    className={`flex-1 px-4 py-3 text-sm font-medium ${
                      activeTab === 'comments'
                        ? 'text-blue-600 border-b-2 border-blue-600'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    Comments
                  </button>
                </div>
              </div>

              {activeTab === 'spots' ? (
                <SpotList
                  loop={loop}
                  spots={spots}
                  selectedSpot={selectedSpot}
                  onSpotSelect={setSelectedSpot}
                  hoveredSpot={null}
                  onSpotHover={() => {}}
                  currentPage={currentPage}
                  onPageChange={setCurrentPage}
                  userRole="viewer"
                />
              ) : (
                <CommentList
                  loop={loop}
                  selectedSpot={selectedSpot}
                  userRole="viewer"
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}