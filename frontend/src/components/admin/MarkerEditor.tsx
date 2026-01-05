/**
 * Marker Editor - Form for editing marker details
 * Includes all fields for camps, projects, partners, etc.
 */
import { useState, useEffect } from 'react';
import { useMapMarkersStore, type MapMarker } from '../../store/useMapMarkersStore';

interface MarkerEditorProps {
  markerId: string;
}

const markerTypes: { value: MapMarker['type']; label: string; icon: string }[] = [
  { value: 'camp', label: 'Cultural Camp', icon: '⛺' },
  { value: 'project', label: 'Project Site', icon: '🏗️' },
  { value: 'partner', label: 'Partner', icon: '🤝' },
  { value: 'cultural-site', label: 'Cultural Site', icon: '🪶' },
  { value: 'event', label: 'Event', icon: '📅' },
];

const campTypes = [
  'Food Sovereignty',
  'Land Stewardship',
  'Cultural Preservation',
  'Healing & Wellness',
  'Youth Mentorship',
];

const seasons = [
  'Spring',
  'Summer',
  'Fall',
  'Winter',
  'Year-round',
  'Spring & Fall',
  'Spring & Summer',
];

export function MarkerEditor({ markerId }: MarkerEditorProps) {
  const { getMarkerById, updateMarker, deleteMarker, selectMarker } = useMapMarkersStore();
  const marker = getMarkerById(markerId);

  const [formData, setFormData] = useState<Partial<MapMarker>>({});
  const [activityInput, setActivityInput] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Load marker data
  useEffect(() => {
    if (marker) {
      setFormData({
        title: marker.title,
        description: marker.description,
        type: marker.type,
        link: marker.link,
        isPublic: marker.isPublic,
        season: marker.season,
        duration: marker.duration,
        campType: marker.campType,
        activities: marker.activities || [],
      });
    }
  }, [marker]);

  if (!marker) {
    return (
      <div className="text-center py-8 text-shs-text-muted">
        <p>Marker not found</p>
      </div>
    );
  }

  const handleChange = (field: keyof MapMarker, value: unknown) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    updateMarker(markerId, { [field]: value });
  };

  const handleAddActivity = () => {
    if (!activityInput.trim()) return;
    const activities = [...(formData.activities || []), activityInput.trim()];
    handleChange('activities', activities);
    setActivityInput('');
  };

  const handleRemoveActivity = (index: number) => {
    const activities = (formData.activities || []).filter((_, i) => i !== index);
    handleChange('activities', activities);
  };

  const handleDelete = () => {
    deleteMarker(markerId);
    selectMarker(null);
    setShowDeleteConfirm(false);
  };

  const isCamp = formData.type === 'camp';

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-shs-forest-800">Edit Marker</h3>
        <button
          onClick={() => selectMarker(null)}
          className="p-1.5 text-shs-text-muted hover:text-shs-forest-600 hover:bg-shs-sand rounded-lg transition-colors"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Visibility Toggle */}
      <div className="flex items-center justify-between p-3 rounded-lg bg-shs-sand">
        <div>
          <span className="font-medium text-shs-forest-800">Visibility</span>
          <p className="text-xs text-shs-text-muted">
            {formData.isPublic ? 'Visible on public map' : 'Hidden from public'}
          </p>
        </div>
        <button
          onClick={() => handleChange('isPublic', !formData.isPublic)}
          className={`relative w-12 h-6 rounded-full transition-colors ${
            formData.isPublic ? 'bg-emerald-500' : 'bg-gray-300'
          }`}
        >
          <span
            className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
              formData.isPublic ? 'translate-x-6' : ''
            }`}
          />
        </button>
      </div>

      {/* Title */}
      <div>
        <label className="block text-sm font-medium text-shs-forest-700 mb-1.5">
          Title *
        </label>
        <input
          type="text"
          value={formData.title || ''}
          onChange={(e) => handleChange('title', e.target.value)}
          className="w-full px-3 py-2 border border-shs-stone rounded-lg focus:ring-2 focus:ring-shs-forest-500 focus:border-shs-forest-500"
          placeholder="Enter marker title"
        />
      </div>

      {/* Type */}
      <div>
        <label className="block text-sm font-medium text-shs-forest-700 mb-1.5">
          Type
        </label>
        <select
          value={formData.type || 'camp'}
          onChange={(e) => handleChange('type', e.target.value)}
          className="w-full px-3 py-2 border border-shs-stone rounded-lg focus:ring-2 focus:ring-shs-forest-500"
        >
          {markerTypes.map((type) => (
            <option key={type.value} value={type.value}>
              {type.icon} {type.label}
            </option>
          ))}
        </select>
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-shs-forest-700 mb-1.5">
          Description
        </label>
        <textarea
          value={formData.description || ''}
          onChange={(e) => handleChange('description', e.target.value)}
          rows={3}
          className="w-full px-3 py-2 border border-shs-stone rounded-lg focus:ring-2 focus:ring-shs-forest-500"
          placeholder="Describe this location..."
        />
      </div>

      {/* Link */}
      <div>
        <label className="block text-sm font-medium text-shs-forest-700 mb-1.5">
          Link URL
        </label>
        <input
          type="text"
          value={formData.link || ''}
          onChange={(e) => handleChange('link', e.target.value)}
          className="w-full px-3 py-2 border border-shs-stone rounded-lg focus:ring-2 focus:ring-shs-forest-500"
          placeholder="/cultural-camps#food-sovereignty"
        />
      </div>

      {/* Camp-specific fields */}
      {isCamp && (
        <>
          <div className="border-t border-shs-stone pt-4">
            <h4 className="text-sm font-semibold text-shs-forest-700 mb-3">
              Camp Details
            </h4>
          </div>

          {/* Camp Type */}
          <div>
            <label className="block text-sm font-medium text-shs-forest-700 mb-1.5">
              Camp Type
            </label>
            <select
              value={formData.campType || ''}
              onChange={(e) => handleChange('campType', e.target.value)}
              className="w-full px-3 py-2 border border-shs-stone rounded-lg focus:ring-2 focus:ring-shs-forest-500"
            >
              <option value="">Select type...</option>
              {campTypes.map((type) => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          {/* Season */}
          <div>
            <label className="block text-sm font-medium text-shs-forest-700 mb-1.5">
              Season
            </label>
            <select
              value={formData.season || ''}
              onChange={(e) => handleChange('season', e.target.value)}
              className="w-full px-3 py-2 border border-shs-stone rounded-lg focus:ring-2 focus:ring-shs-forest-500"
            >
              <option value="">Select season...</option>
              {seasons.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          {/* Duration */}
          <div>
            <label className="block text-sm font-medium text-shs-forest-700 mb-1.5">
              Duration
            </label>
            <input
              type="text"
              value={formData.duration || ''}
              onChange={(e) => handleChange('duration', e.target.value)}
              className="w-full px-3 py-2 border border-shs-stone rounded-lg focus:ring-2 focus:ring-shs-forest-500"
              placeholder="e.g., 3-5 days"
            />
          </div>

          {/* Activities */}
          <div>
            <label className="block text-sm font-medium text-shs-forest-700 mb-1.5">
              Activities
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={activityInput}
                onChange={(e) => setActivityInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddActivity())}
                className="flex-1 px-3 py-2 border border-shs-stone rounded-lg focus:ring-2 focus:ring-shs-forest-500"
                placeholder="Add activity..."
              />
              <button
                type="button"
                onClick={handleAddActivity}
                className="px-3 py-2 bg-shs-forest-600 text-white rounded-lg hover:bg-shs-forest-700"
              >
                +
              </button>
            </div>
            {formData.activities && formData.activities.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {formData.activities.map((activity, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-1 px-2 py-1 bg-shs-sand text-shs-forest-700 text-xs rounded-md"
                  >
                    {activity}
                    <button
                      type="button"
                      onClick={() => handleRemoveActivity(i)}
                      className="hover:text-red-500"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {/* Coordinates (read-only) */}
      <div className="border-t border-shs-stone pt-4">
        <label className="block text-sm font-medium text-shs-forest-700 mb-1.5">
          Coordinates
        </label>
        <div className="text-sm text-shs-text-muted bg-shs-sand px-3 py-2 rounded-lg">
          {marker.lat.toFixed(6)}, {marker.lng.toFixed(6)}
          <span className="block text-xs mt-1">Drag marker on map to change</span>
        </div>
      </div>

      {/* Delete Button */}
      <div className="border-t border-shs-stone pt-4">
        {showDeleteConfirm ? (
          <div className="flex items-center gap-2">
            <span className="text-sm text-red-600">Delete this marker?</span>
            <button
              onClick={handleDelete}
              className="px-3 py-1.5 bg-red-500 text-white text-sm rounded-lg hover:bg-red-600"
            >
              Yes, Delete
            </button>
            <button
              onClick={() => setShowDeleteConfirm(false)}
              className="px-3 py-1.5 bg-gray-200 text-gray-700 text-sm rounded-lg hover:bg-gray-300"
            >
              Cancel
            </button>
          </div>
        ) : (
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="w-full py-2 text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
          >
            Delete Marker
          </button>
        )}
      </div>
    </div>
  );
}
