import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Input, { Textarea, SelectField } from '../ui/Input.jsx';
import Button from '../ui/Button.jsx';
import { toInputDateTime } from '../../utils/dates.js';

const schema = z.object({
  title:       z.string().min(1, 'Title is required').max(200),
  description: z.string().max(2000).optional().default(''),
  dueDate:     z.string().optional(),
  priority:    z.enum(['low', 'medium', 'high']).default('medium'),
  status:      z.enum(['pending', 'in-progress', 'done']).default('pending'),
  category:    z.string().max(100).optional().default(''),
  tags:        z.string().optional().default(''),  // comma-separated
});

export default function TaskForm({ defaultValues, onSubmit, loading, onCancel }) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      title:       defaultValues?.title       ?? '',
      description: defaultValues?.description ?? '',
      dueDate:     defaultValues?.dueDate ? toInputDateTime(defaultValues.dueDate) : '',
      priority:    defaultValues?.priority    ?? 'medium',
      status:      defaultValues?.status      ?? 'pending',
      category:    defaultValues?.category    ?? '',
      tags:        defaultValues?.tags?.join(', ') ?? '',
    },
  });

  const submit = (data) => {
    const payload = {
      ...data,
      dueDate: data.dueDate ? new Date(data.dueDate).toISOString() : null,
      tags:    data.tags ? data.tags.split(',').map((t) => t.trim()).filter(Boolean) : [],
    };
    onSubmit(payload);
  };

  return (
    <form onSubmit={handleSubmit(submit)} className="space-y-4">
      <Input
        label="Title"
        placeholder="What needs to be done?"
        error={errors.title?.message}
        required
        {...register('title')}
      />
      <Textarea
        label="Description"
        placeholder="Add details..."
        error={errors.description?.message}
        {...register('description')}
      />
      <div className="grid grid-cols-2 gap-3">
        <Input
          label="Due date & time"
          type="datetime-local"
          error={errors.dueDate?.message}
          {...register('dueDate')}
        />
        <SelectField label="Priority" error={errors.priority?.message} {...register('priority')}>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </SelectField>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <SelectField label="Status" error={errors.status?.message} {...register('status')}>
          <option value="pending">Pending</option>
          <option value="in-progress">In Progress</option>
          <option value="done">Done</option>
        </SelectField>
        <Input
          label="Category"
          placeholder="Work, Personal..."
          error={errors.category?.message}
          {...register('category')}
        />
      </div>
      <Input
        label="Tags (comma-separated)"
        placeholder="urgent, frontend, bug"
        error={errors.tags?.message}
        {...register('tags')}
      />

      <div className="flex gap-3 pt-2">
        <Button type="submit" loading={loading} className="flex-1">
          {defaultValues ? 'Save changes' : 'Create task'}
        </Button>
        {onCancel && (
          <Button type="button" variant="secondary" onClick={onCancel}>
            Cancel
          </Button>
        )}
      </div>
    </form>
  );
}
