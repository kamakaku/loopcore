import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Search, FileText, Plus, Image as ImageIcon, Check } from 'lucide-react';
import { createLoop } from '../../lib/loops';
import { useAuth } from '../../contexts/AuthContext';
import { useFirestore } from '../../hooks/useFirestore';
import { Team, Project } from '../../types';
import { isFigmaUrl, extractFigmaKeyFromUrl, createFigmaLoop } from '../../lib/figma';

interface LoopCreatorProps {
  onClose: () => void;
  onCreated: () => void;
}

export default function LoopCreator({ onClose, onCreated }: LoopCreatorProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [title, setTitle] = useState('');
  const [type, setType] = useState<'url' | 'image' | 'pdf' | 'figma'>('url');
  const [content, setContent] = useState<string | File>('');
  const [preview, setPreview] = useState<string | null>(null);
  const [teamId, setTeamId] = useState<string>('');
  const [projectId, setProjectId] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { data: teams = [] } = useFirestore<Team>('teams', {
    where: [['members', 'array-contains', user?.uid]],
    orderBy: [['name', 'asc']]
  });

  const { data: projects = [] } = useFirestore<Project>('projects', {
    where: teamId ? [['teamId', '==', teamId]] : undefined,
    orderBy: [['name', 'asc']]
  });

  const validateUrl = (url: string): boolean => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('File size must be less than 5MB');
      return;
    }

    // Validate file type
    if (type === 'image' && !file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }
    if (type === 'pdf' && file.type !== 'application/pdf') {
      setError('Please select a PDF file');
      return;
    }

    setContent(file);
    setError('');

    // Create preview for images
    if (type === 'image') {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setPreview(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content || !title.trim() || loading) return;

    setLoading(true);
    setError('');

    try {
      let loop;

      if (type === 'figma') {
        if (!isFigmaUrl(content as string)) {
          throw new Error('Invalid Figma URL. Please enter a valid Figma file URL.');
        }

        const figmaKey = extractFigmaKeyFromUrl(content as string);
        if (!figmaKey) {
          throw new Error('Could not extract Figma file key from URL.');
        }

        loop = await createFigmaLoop(
          figmaKey,
          import.meta.env.VITE_FIGMA_ACCESS_TOKEN
        );
      } else {
        if (type === 'url' && !validateUrl(content as string)) {
          throw new Error('Please enter a valid URL (e.g., https://example.com)');
        }

        loop = await createLoop({
          title: title.trim(),
          type,
          content,
          teamId: teamId || undefined,
          projectId: projectId || undefined
        });
      }

      onCreated();
      onClose();
      navigate(`/loops/${loop.id}`);
    } catch (err) {
      console.error('Error creating loop:', err);
      setError(err instanceof Error ? err.message : 'Failed to create loop');
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">Create New Loop</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
              Title
            </label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
              required
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Type
            </label>
            <div className="grid grid-cols-4 gap-2">
              <button
                type="button"
                onClick={() => {
                  setType('url');
                  setContent('');
                  setPreview(null);
                }}
                className={`flex items-center justify-center px-3 py-2 border rounded-lg ${
                  type === 'url'
                    ? 'border-blue-600 bg-blue-50 text-blue-600'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <FileText className="w-4 h-4 mr-2" />
                URL
              </button>
              <button
                type="button"
                onClick={() => {
                  setType('image');
                  setContent('');
                  setPreview(null);
                }}
                className={`flex items-center justify-center px-3 py-2 border rounded-lg ${
                  type === 'image'
                    ? 'border-blue-600 bg-blue-50 text-blue-600'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <ImageIcon className="w-4 h-4 mr-2" />
                Image
              </button>
              <button
                type="button"
                onClick={() => {
                  setType('pdf');
                  setContent('');
                  setPreview(null);
                }}
                className={`flex items-center justify-center px-3 py-2 border rounded-lg ${
                  type === 'pdf'
                    ? 'border-blue-600 bg-blue-50 text-blue-600'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <FileText className="w-4 h-4 mr-2" />
                PDF
              </button>
              <button
                type="button"
                onClick={() => {
                  setType('figma');
                  setContent('');
                  setPreview(null);
                }}
                className={`flex items-center justify-center px-3 py-2 border rounded-lg ${
                  type === 'figma'
                    ? 'border-blue-600 bg-blue-50 text-blue-600'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <svg className="w-4 h-4 mr-2" viewBox="0 0 38 57" fill="currentColor">
                  <path d="M19 28.5C19 25.9804 20.0009 23.5641 21.7825 21.7825C23.5641 20.0009 25.9804 19 28.5 19C31.0196 19 33.4359 20.0009 35.2175 21.7825C36.9991 23.5641 38 25.9804 38 28.5C38 31.0196 36.9991 33.4359 35.2175 35.2175C33.4359 36.9991 31.0196 38 28.5 38C25.9804 38 23.5641 36.9991 21.7825 35.2175C20.0009 33.4359 19 31.0196 19 28.5Z"/>
                  <path d="M0 47.5C0 44.9804 1.00089 42.5641 2.78249 40.7825C4.56408 39.0009 6.98044 38 9.5 38H19V47.5C19 50.0196 17.9991 52.4359 16.2175 54.2175C14.4359 55.9991 12.0196 57 9.5 57C6.98044 57 4.56408 55.9991 2.78249 54.2175C1.00089 52.4359 0 50.0196 0 47.5Z"/>
                  <path d="M19 0V19H28.5C31.0196 19 33.4359 17.9991 35.2175 16.2175C36.9991 14.4359 38 12.0196 38 9.5C38 6.98044 36.9991 4.56408 35.2175 2.78249C33.4359 1.00089 31.0196 0 28.5 0H19Z"/>
                  <path d="M0 9.5C0 12.0196 1.00089 14.4359 2.78249 16.2175C4.56408 17.9991 6.98044 19 9.5 19H19V0H9.5C6.98044 0 4.56408 1.00089 2.78249 2.78249C1.00089 4.56408 0 6.98044 0 9.5Z"/>
                </svg>
                Figma
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {type === 'url' || type === 'figma' ? `${type.toUpperCase()} URL` : `Upload ${type.toUpperCase()}`}
            </label>
            {(type === 'url' || type === 'figma') ? (
              <div className="flex items-center space-x-2">
                <FileText className="w-5 h-5 text-gray-400" />
                <input
                  type="url"
                  value={content as string}
                  onChange={(e) => setContent(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                  placeholder={type === 'figma' ? "https://www.figma.com/file/..." : "https://"}
                  required
                  disabled={loading}
                />
              </div>
            ) : (
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer hover:border-gray-400"
              >
                <div className="space-y-1 text-center">
                  <input
                    ref={fileInputRef}
                    type="file"
                    className="hidden"
                    onChange={handleFileChange}
                    accept={type === 'image' ? 'image/*' : '.pdf'}
                    disabled={loading}
                  />
                  {preview ? (
                    <div className="relative">
                      <img 
                        src={preview} 
                        alt="Preview" 
                        className="mx-auto h-32 object-contain"
                      />
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setContent('');
                          setPreview(null);
                        }}
                        className="absolute top-0 right-0 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : content instanceof File ? (
                    <div className="relative">
                      <FileText className="mx-auto h-12 w-12 text-gray-400" />
                      <p className="text-sm text-gray-500">{content.name}</p>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setContent('');
                        }}
                        className="absolute top-0 right-0 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <>
                      <Plus className="mx-auto h-12 w-12 text-gray-400" />
                      <div className="flex text-sm text-gray-600">
                        <span className="relative cursor-pointer rounded-md font-medium text-blue-600 hover:text-blue-500">
                          Upload a file
                        </span>
                        <p className="pl-1">or drag and drop</p>
                      </div>
                      <p className="text-xs text-gray-500">
                        {type === 'image' ? 'PNG, JPG, GIF up to 5MB' : 'PDF up to 5MB'}
                      </p>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Team (Optional)
            </label>
            <select
              value={teamId}
              onChange={(e) => {
                setTeamId(e.target.value);
                setProjectId('');
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
              disabled={loading}
            >
              <option value="">No team</option>
              {teams.map((team) => (
                <option key={team.id} value={team.id}>
                  {team.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Project (Optional)
            </label>
            <select
              value={projectId}
              onChange={(e) => setProjectId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
              disabled={loading || !teamId}
            >
              <option value="">No project</option>
              {projects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 hover:text-gray-900"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !title.trim() || !content}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {loading && (
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
              )}
              <span>{loading ? 'Creating...' : 'Create Loop'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}