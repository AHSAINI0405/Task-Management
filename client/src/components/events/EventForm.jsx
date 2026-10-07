import { useForm }     from 'react-hook-form';
import { zodResolver }  from '@hookform/resolvers/zod';
import { z }            from 'zod';
import Input, { Textarea, SelectField } from '../ui/Input.jsx';
import Button           from '../ui/Button.jsx';
import { toInputDate }  from '../../utils/dates.js';

const schema = z.object({
  title:        z.string().min(1, 'Title is required').max(200),
  type:         z.enum(['birthday', 'anniversary', 'holiday', 'custom']).default('birthday'),
  person:       z.string().max(200).optional().default(''),
  relationship: z.string().max(100).optional().default(''),
  note:         z.string().max(1000).optional().default(''),
  date:         z.string().min(1, 'Date is required'),
  repeatsYearly:z.boolean().default(true),
});

export default function EventForm({ defaultValues, onSubmit, loading, onCancel }) {
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      title:         defaultValues?.title        ?? '',
      type:          defaultValues?.type         ?? 'birthday',
      person:        defaultValues?.person       ?? '',
      relationship:  defaultValues?.relationship ?? '',
      note:          defaultValues?.note         ?? '',
      date:          defaultValues?.date ? toInputDate(defaultValues.date) : '',
      repeatsYearly: defaultValues?.repeatsYearly ?? true,
    },
  });

  const submit = (data) => {
    onSubmit({
      ...data,
      date: new Date(data.date).toISOString(),
    });
  };

  return (
    <form onSubmit={handleSubmit(submit)} className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <Input label="Title" required placeholder="Sarah's Birthday" error={errors.title?.message} {...register('title')} />
        <SelectField label="Type" {...register('type')}>
          <option value="birthday">🎂 Birthday</option>
          <option value="anniversary">💑 Anniversary</option>
          <option value="holiday">🎉 Holiday</option>
          <option value="custom">📌 Custom</option>
        </SelectField>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Input label="Person" placeholder="Name" {...register('person')} />
        <Input label="Relationship" placeholder="Friend, Family..." {...register('relationship')} />
      </div>
      <Input label="Date" type="date" required error={errors.date?.message} {...register('date')} />
      <Textarea label="Note" placeholder="Gift ideas, message..." {...register('note')} />

      <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 cursor-pointer">
        <input type="checkbox" className="rounded" {...register('repeatsYearly')} />
        Repeats every year (auto-remind 7 days, 1 day before &amp; on the day)
      </label>

      <div className="flex gap-3 pt-2">
        <Button type="submit" loading={loading} className="flex-1">
          {defaultValues ? 'Save changes' : 'Add event'}
        </Button>
        {onCancel && <Button type="button" variant="secondary" onClick={onCancel}>Cancel</Button>}
      </div>
    </form>
  );
}
