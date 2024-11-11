import React, { useState, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Plus, Users, X, Share2, Globe } from 'lucide-react';
import { useFirestore } from '../../hooks/useFirestore';
import { Loop, Spot, Team, Project, User } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import Layout from '../layout/Layout';
import LoadingScreen from '../common/LoadingScreen';
import SpotList from './SpotList';
import CommentList from './CommentList';
import SpotMarker from '../spots/SpotMarker';
import SpotCreator from '../spots/SpotCreator';
import LoopActions from './LoopActions';
import LoopHeader from './LoopHeader';
import PDFViewer from './PDFViewer';
import FigmaEmbed from '../figma/FigmaEmbed';
import UserManager from './UserManager';
import { useUserRole, canEdit, canAddSpots } from '../../hooks/useUserRole';
import { extractFigmaKeyFromUrl } from '../../lib/figma';
import { toggleLoopPublicAccess } from '../../lib/loops';
import { useTranslation } from 'react-i18next';

export default function LoopView() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t } = useTranslation();
  const [isAddingSpot, setIsAddingSpot] = useState(false);
  const [selectedSpot, setSelectedSpot] = useState<Spot | null>(null);
  const [hoveredSpot, setHoveredSpot] = useState<Spot | null>(null);
  const [newSpotPosition, setNewSpotPosition] = useState<{ x: number; y: number } | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [activeTab, setActiveTab] = useState<'spots' | 'comments'>('spots');
  const [showUserManager, setShowUserManager] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  const { data: loops = [], loading: loopLoading } = useFirestore<Loop>('loops', id ? {
    where: [['__name__', '==', id]]
  } : undefined);

  const loop = loops[0];

  const { data: teams = [], loading: teamLoading } = useFirestore<Team>('teams', 
    loop?.teamId ? {
      where: [['__name__', '==', loop.teamId]]
    } : undefined
  );

  const { data: projects = [], loading: projectLoading } = useFirestore<Project>('projects',
    loop?.projectId ? {
      where: [['__name__', '==', loop.projectId]]
    } : undefined
  );

  const { data: members = [], loading: membersLoading } = useFirestore<User>('users',
    loop?.members && loop.members.length > 0 ? {
      where: [['__name__', 'in', loop.members.map(m => m.id)]]
    } : undefined
  );

  const { data: spots = [], loading: spotsLoading } = useFirestore<Spot>('spots', id ? {
    where: [
      ['loopId', '==', id],
      ['pageNumber', '==', currentPage]
    ],
    orderBy: [['number', 'asc']]
  } : undefined);

  const team = teams[0];
  const project = projects[0];
  const userRole = useUserRole(loop);

  const handleSpotSelect = useCallback((spot: Spot | null) => {
    setSelectedSpot(spot);
    setActiveTab('spots');

    if (spot) {
      const spotElement = document.getElementById(`spot-${spot.id}`);
      if (spotElement) {
        spotElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, []);

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  const handleClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!isAddingSpot || !canAddSpots(userRole)) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    setNewSpotPosition({ x, y });
  }, [isAddingSpot, userRole]);

  const handleTogglePublicAccess = async () => {
    if (!loop) return;
    try {
      await toggleLoopPublicAccess(loop.id);
    } catch (error) {
      console.error('Error toggling public access:', error);
    }
  };

  const handleShareLink = () => {
    if (!loop?.publicId) return;
    const shareUrl = `${window.location.origin}/public/loops/${loop.publicId}`;
    navigator.clipboard.writeText(shareUrl);
  };

  const renderSpots = useCallback(() => {
    return spots.map((spot) => (
      <SpotMarker
        key={spot.id}
        spot={spot}
        isSelected={selectedSpot?.id === spot.id}
        isHovered={hoveredSpot?.id === spot.id}
        onClick={() => handleSpotSelect(spot)}
        onMouseEnter={() => setHoveredSpot(spot)}
        onMouseLeave={() => setHoveredSpot(null)}
        containerRef={contentRef}
      />
    ));
  }, [spots, selectedSpot, hoveredSpot, handleSpotSelect]);

  const renderContent = useCallback(() => {
    if (!loop) return null;

    switch (loop.type) {
      case 'url':
        return (
          <div className="relative spot-container" onClick={handleClick} ref={contentRef}>
            <img
              src={loop.screenshot}
              alt={loop.title}
              className="w-full h-auto"
            />
            {renderSpots()}
          </div>
        );
      case 'image':
        return (
          <div className="relative spot-container" onClick={handleClick} ref={contentRef}>
            <img
              src={loop.content}
              alt={loop.title}
              className="w-full h-auto"
            />
            {renderSpots()}
          </div>
        );
      case 'pdf':
        return (
          <div className="relative spot-container" onClick={handleClick} ref={contentRef}>
            <PDFViewer
              pages={loop.pdfPages}
              currentPage={currentPage}
              onPageChange={handlePageChange}
              renderOverlay={() => renderSpots()}
            />
          </div>
        );
      case 'figma':
        const figmaKey = extractFigmaKeyFromUrl(loop.content);
        return figmaKey ? (
          <div className="relative spot-container" onClick={handleClick} ref={contentRef}>
            <FigmaEmbed
              fileKey={figmaKey}
              accessToken={import.meta.env.VITE_FIGMA_ACCESS_TOKEN || ''}
              onError={(error) => console.error('Figma embed error:', error)}
            />
            {renderSpots()}
          </div>
        ) : null;
      default:
        return null;
    }
  }, [loop, handleClick, renderSpots, currentPage, handlePageChange]);

  if (!user) {
    return (
      <Layout>
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold mb-4">{t('auth.signInRequired')}</h2>
          <button
            onClick={() => navigate('/auth')}
            className="text-blue-600 hover:text-blue-700"
          >
            {t('auth.signIn')}
          </button>
        </div>
      </Layout>
    );
  }

  if (loopLoading || spotsLoading || teamLoading || projectLoading || membersLoading) {
    return <LoadingScreen />;
  }

  if (!loop) {
    return (
      <Layout>
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold mb-4">{t('loops.notFound')}</h2>
          <button
            onClick={() => navigate('/loops')}
            className="text-blue-600 hover:text-blue-700"
          >
            {t('common.goBack')}
          </button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <LoopHeader
        loop={loop}
        team={team}
        project={project}
        members={members}
        onBack={() => navigate('/loops')}
        onManageMembers={() => setShowUserManager(true)}
      />

      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center justify-end space-x-2 mb-4">
          {canEdit(userRole) && (
            <>
              <button
                onClick={handleTogglePublicAccess}
                className="inline-flex items-center px-3 py-1 text-sm bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-lg"
              >
                <Globe className="w-4 h-4 mr-1" />
                {loop.publicId ? t('loops.makePrivate') : t('loops.makePublic')}
              </button>

              {loop.publicId && (
                <button
                  onClick={handleShareLink}
                  className="inline-flex items-center px-3 py-1 text-sm bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-lg"
                >
                  <Share2 className="w-4 h-4 mr-1" />
                  {t('loops.copyLink')}
                </button>
              )}
            </>
          )}

          {canAddSpots(userRole) && (
            <>
              {isAddingSpot ? (
                <div className="flex items-center space-x-2 relative z-50">
                  <button
                    onClick={() => setIsAddingSpot(false)}
                    className="inline-flex items-center px-3 py-1 text-sm bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-lg"
                  >
                    {t('common.cancel')}
                  </button>
                  <button
                    onClick={() => setIsAddingSpot(false)}
                    className="p-1 hover:bg-gray-100 rounded-lg"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setIsAddingSpot(true)}
                  className="inline-flex items-center px-2 py-1 text-sm bg-blue-600 text-white hover:bg-blue-700 rounded-lg"
                >
                  <Plus className="w-3 h-3 mr-1" />
                  <span>{t('loops.addSpot')}</span>
                </button>
              )}
            </>
          )}

          {userRole === 'owner' && (
            <button
              onClick={() => setShowUserManager(true)}
              className="inline-flex items-center px-2 py-1 text-sm text-gray-700 hover:bg-gray-100 rounded"
            >
              <Users className="w-3 h-3 mr-1" />
              <span>{t('common.members')}</span>
            </button>
          )}

          <LoopActions loop={loop} userRole={userRole} onUpdate={() => {}} />
        </div>

        <div className="flex gap-8">
          <div className={`loop-content ${isAddingSpot ? 'adding-spot' : 'not-adding-spot'}`}>
            <div className={`bg-white rounded-lg shadow-sm overflow-hidden ${
              isAddingSpot ? 'spot-container adding-spot' : 'spot-container'
            }`}>
              {renderContent()}
            </div>
          </div>

          <div className={`w-96 flex-shrink-0 transition-all duration-300 ease-in-out transform ${
            isAddingSpot ? 'opacity-0 w-0 scale-95' : 'opacity-100 scale-100'
          }`}>
            <div className="bg-white rounded-lg shadow-sm h-[calc(100vh-12rem)] flex flex-col sticky top-24">
              <div className="border-b border-gray-200 bg-white sticky top-0 z-10">
                <div className="flex">
                  <button
                    onClick={() => setActiveTab('spots')}
                    className={`flex-1 px-4 py-3 text-sm font-medium ${
                      activeTab === 'spots'
                        ? 'text-blue-600 border-b-2 border-blue-600'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    {t('loops.spots')} ({spots.length})
                  </button>
                  <button
                    onClick={() => setActiveTab('comments')}
                    className={`flex-1 px-4 py-3 text-sm font-medium ${
                      activeTab === 'comments'
                        ? 'text-blue-600 border-b-2 border-blue-600'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    {t('loops.comments')}
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto">
                {activeTab === 'spots' ? (
                  <SpotList
                    loop={loop}
                    spots={spots}
                    selectedSpot={selectedSpot}
                    onSpotSelect={handleSpotSelect}
                    hoveredSpot={hoveredSpot}
                    onSpotHover={setHoveredSpot}
                    currentPage={currentPage}
                    onPageChange={handlePageChange}
                    userRole={userRole || 'viewer'}
                  />
                ) : (
                  <CommentList
                    loop={loop}
                    selectedSpot={selectedSpot}
                    userRole={userRole || 'viewer'}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {newSpotPosition && (
        <SpotCreator
          loop={loop}
          position={newSpotPosition}
          currentPage={currentPage}
          onClose={() => {
            setNewSpotPosition(null);
            setIsAddingSpot(false);
          }}
          onSpotCreated={() => {
            setNewSpotPosition(null);
            setIsAddingSpot(false);
          }}
        />
      )}

      {showUserManager && (
        <UserManager
          loop={loop}
          onClose={() => setShowUserManager(false)}
          onUpdated={() => setShowUserManager(false)}
        />
      )}
    </Layout>
  );
}