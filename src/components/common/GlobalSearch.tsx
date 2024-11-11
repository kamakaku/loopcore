import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X } from 'lucide-react';
import { useFirestore } from '../../hooks/useFirestore';
import { Loop, Team, Project } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import { debounce } from 'lodash';

export default function GlobalSearch() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  const { data: loops = [] } = useFirestore<Loop>('loops', {
    where: [['createdBy', '==', user?.uid]],
    orderBy: [['createdAt', 'desc']]
  });

  const { data: teams = [] } = useFirestore<Team>('teams', {
    where: [['members', 'array-contains', user?.uid]],
    orderBy: [['name', 'asc']]
  });

  const { data: projects = [] } = useFirestore<Project>('projects', {
    where: [['members', 'array-contains', user?.uid]],
    orderBy: [['name', 'asc']]
  });

  const filteredResults = query.trim() ? {
    loops: loops.filter(loop => 
      loop.title.toLowerCase().includes(query.toLowerCase())
    ).slice(0, 3),
    teams: teams.filter(team => 
      team.name.toLowerCase().includes(query.toLowerCase())
    ).slice(0, 3),
    projects: projects.filter(project => 
      project.name.toLowerCase().includes(query.toLowerCase())
    ).slice(0, 3)
  } : { loops: [], teams: [], projects: [] };

  const handleSearchChange = debounce((value: string) => {
    setQuery(value);
  }, 300);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleResultClick = (type: string, id: string) => {
    setShowResults(false);
    setQuery('');
    navigate(`/${type}/${id}`);
  };

  return (
    <div ref={searchRef} className="relative w-full">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Search everything..."
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent bg-white"
          onChange={(e) => {
            handleSearchChange(e.target.value);
            setShowResults(true);
          }}
          onFocus={() => setShowResults(true)}
        />
        {query && (
          <button
            onClick={() => {
              setQuery('');
              setShowResults(false);
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2"
          >
            <X className="w-4 h-4 text-gray-400" />
          </button>
        )}
      </div>

      {showResults && query.trim() && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-lg border border-gray-200 max-h-[80vh] overflow-y-auto z-50">
          {Object.entries(filteredResults).map(([type, items]) => (
            items.length > 0 && (
              <div key={type} className="p-2">
                <h3 className="text-xs font-medium text-gray-500 uppercase px-3 py-2">
                  {type}
                </h3>
                <div className="space-y-1">
                  {items.map((item: any) => (
                    <button
                      key={item.id}
                      onClick={() => handleResultClick(type, item.id)}
                      className="w-full text-left px-3 py-2 hover:bg-gray-50 rounded-lg"
                    >
                      <div className="text-sm font-medium text-gray-900">
                        {item.title || item.name}
                      </div>
                      {item.description && (
                        <div className="text-xs text-gray-500">
                          {item.description}
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )
          ))}

          {Object.values(filteredResults).every(items => items.length === 0) && (
            <div className="p-4 text-center text-gray-500">
              No results found
            </div>
          )}
        </div>
      )}
    </div>
  );
}