import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { eventsApi } from '../api/api.js';
import { QK } from '../utils/constants.js';
import EventCard from '../components/events/EventCard.jsx';
import EventForm from '../components/events/EventForm.jsx';
import Modal from '../components/ui/Modal.jsx';
import Button from '../components/ui/Button.jsx';
import Spinner from '../components/ui/Spinner.jsx';

export default function EventsPage() {
  const queryClient = useQueryClient();
  const [filterType, setFilterType] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);

  const { data, isLoading } = useQuery({
    queryKey: ['events', filterType],
    queryFn: async () => {
      const res = await eventsApi.getAll({ type: filterType || undefined });
      return res.data.data.events;
    },
  });

  const invalidateEvents = () => {
    queryClient.invalidateQueries({ queryKey: ['events'] });
    queryClient.invalidateQueries({ queryKey: QK.dashboard() });
  };

  const createMutation = useMutation({
    mutationFn: (payload) => eventsApi.create(payload),
    onSuccess: () => {
      toast.success('Event scheduled');
      setIsModalOpen(false);
      invalidateEvents();
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to add event'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }) => eventsApi.update(id, payload),
    onSuccess: () => {
      toast.success('Event updated');
      setIsModalOpen(false);
      setEditingEvent(null);
      invalidateEvents();
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to update event'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => eventsApi.delete(id),
    onSuccess: () => {
      toast.success('Event deleted');
      invalidateEvents();
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to delete event'),
  });

  const handleEdit = (event) => {
    setEditingEvent(event);
    setIsModalOpen(true);
  };

  const handleFormSubmit = (payload) => {
    if (editingEvent) {
      updateMutation.mutate({ id: editingEvent._id, payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const events = data || [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Category filter */}
        <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-xl text-xs font-medium overflow-x-auto">
          {['', 'birthday', 'anniversary', 'holiday', 'custom'].map((type) => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`capitalize px-3 py-1.5 rounded-lg whitespace-nowrap transition ${
                filterType === type
                  ? 'bg-white dark:bg-gray-700 shadow-sm text-brand-600 dark:text-brand-400'
                  : 'text-gray-500'
              }`}
            >
              {type === '' ? 'All Events' : type}
            </button>
          ))}
        </div>

        <Button
          onClick={() => {
            setEditingEvent(null);
            setIsModalOpen(true);
          }}
        >
          + Add Event / Birthday
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16">
          <Spinner size="lg" />
        </div>
      ) : events.length === 0 ? (
        <div className="card p-12 text-center text-gray-400">
          <p className="text-3xl mb-2">🎂</p>
          <p className="text-sm font-medium">No events recorded</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {events.map((event) => (
            <EventCard
              key={event._id}
              event={event}
              onEdit={handleEdit}
              onDelete={(id) => deleteMutation.mutate(id)}
            />
          ))}
        </div>
      )}

      {/* Modal */}
      <Modal
        open={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingEvent(null);
        }}
        title={editingEvent ? 'Edit Event' : 'Add New Event'}
      >
        <EventForm
          defaultValues={editingEvent}
          loading={createMutation.isPending || updateMutation.isPending}
          onSubmit={handleFormSubmit}
          onCancel={() => {
            setIsModalOpen(false);
            setEditingEvent(null);
          }}
        />
      </Modal>
    </div>
  );
}
