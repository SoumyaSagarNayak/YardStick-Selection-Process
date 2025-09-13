'use client';

interface Note {
  id: string;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
}

interface NotesListProps {
  notes: Note[];
  onDelete: (noteId: string) => void;
}

export function NotesList({ notes, onDelete }: NotesListProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleDelete = (noteId: string, title: string) => {
    if (confirm(`Are you sure you want to delete "${title}"?`)) {
      onDelete(noteId);
    }
  };

  if (notes.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-500 text-lg">No notes yet</div>
        <div className="text-gray-400 text-sm mt-2">
          Create your first note to get started
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {notes.map((note) => (
        <div
          key={note.id}
          className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
        >
          <div className="flex justify-between items-start mb-3">
            <h3 className="text-lg font-semibold text-gray-900 truncate">
              {note.title}
            </h3>
            <button
              onClick={() => handleDelete(note.id, note.title)}
              className="text-red-500 hover:text-red-700 text-sm font-medium ml-2"
            >
              Delete
            </button>
          </div>
          
          {note.content && (
            <p className="text-gray-600 text-sm mb-4 line-clamp-3">
              {note.content}
            </p>
          )}
          
          <div className="text-xs text-gray-400">
            <div>Created: {formatDate(note.created_at)}</div>
            {note.updated_at !== note.created_at && (
              <div>Updated: {formatDate(note.updated_at)}</div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}