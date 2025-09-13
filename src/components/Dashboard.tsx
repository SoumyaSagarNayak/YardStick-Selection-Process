'use client';

import { useState, useEffect } from 'react';
import { NotesList } from './NotesList';
import { CreateNoteForm } from './CreateNoteForm';

interface User {
  id: string;
  email: string;
  role: 'admin' | 'member';
  tenant_slug: string;
}

interface Note {
  id: string;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
}

interface DashboardProps {
  user: User;
  token: string;
  onLogout: () => void;
}

export function Dashboard({ user, token, onLogout }: DashboardProps) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [upgrading, setUpgrading] = useState(false);

  const fetchNotes = async () => {
    try {
      const response = await fetch('/api/notes', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch notes');
      }

      const data = await response.json();
      setNotes(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch notes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotes();
  }, [token]);

  const handleCreateNote = async (title: string, content: string) => {
    try {
      const response = await fetch('/api/notes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ title, content }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create note');
      }

      setNotes([data, ...notes]);
      setShowCreateForm(false);
    } catch (err) {
      throw err; // Let the form handle the error
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    try {
      const response = await fetch(`/api/notes/${noteId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete note');
      }

      setNotes(notes.filter(note => note.id !== noteId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete note');
    }
  };

  const handleUpgrade = async () => {
    if (user.role !== 'admin') return;

    setUpgrading(true);
    try {
      const response = await fetch(`/api/tenants/${user.tenant_slug}/upgrade`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to upgrade');
      }

      alert('Successfully upgraded to Pro plan!');
      // Refresh the page to update the UI
      window.location.reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upgrade');
    } finally {
      setUpgrading(false);
    }
  };

  const isFreePlan = notes.length >= 3; // Assuming free plan if at limit
  const canCreateNote = !isFreePlan || user.role === 'admin';

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Notes Dashboard
              </h1>
              <p className="text-sm text-gray-600">
                {user.email} ({user.role}) - {user.tenant_slug.toUpperCase()}
              </p>
            </div>
            <div className="flex items-center space-x-4">
              {user.role === 'admin' && isFreePlan && (
                <button
                  onClick={handleUpgrade}
                  disabled={upgrading}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium disabled:opacity-50"
                >
                  {upgrading ? 'Upgrading...' : 'Upgrade to Pro'}
                </button>
              )}
              <button
                onClick={onLogout}
                className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md text-sm font-medium"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          {isFreePlan && (
            <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded mb-4">
              <p className="font-medium">Free Plan Limit Reached</p>
              <p className="text-sm">
                You've reached the 3-note limit for the free plan. 
                {user.role === 'admin' ? ' Upgrade to Pro for unlimited notes.' : ' Contact your admin to upgrade.'}
              </p>
            </div>
          )}

          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              Your Notes ({notes.length})
            </h2>
            {canCreateNote && (
              <button
                onClick={() => setShowCreateForm(true)}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium"
              >
                Create Note
              </button>
            )}
          </div>

          {showCreateForm && (
            <CreateNoteForm
              onSubmit={handleCreateNote}
              onCancel={() => setShowCreateForm(false)}
            />
          )}

          {loading ? (
            <div className="text-center py-8">
              <div className="text-gray-600">Loading notes...</div>
            </div>
          ) : (
            <NotesList notes={notes} onDelete={handleDeleteNote} />
          )}
        </div>
      </main>
    </div>
  );
}