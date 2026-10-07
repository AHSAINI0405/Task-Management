import { useForm }       from 'react-hook-form';
import { zodResolver }   from '@hookform/resolvers/zod';
import { z }             from 'zod';
import Input, { Textarea, SelectField } from '../ui/Input.jsx';
import Button            from '../ui/Button.jsx';
import { JOB_STATUSES }  from '../../utils/constants.js';
import { toInputDate }   from '../../utils/dates.js';

const schema = z.object({
  company:            z.string().min(1, 'Company is required').max(200),
  role:               z.string().min(1, 'Role is required').max(200),
  jobUrl:             z.string().url('Must be a valid URL').or(z.literal('')).optional().default(''),
  location:           z.string().max(200).optional().default(''),
  status:             z.enum(JOB_STATUSES).default('Wishlist'),
  dateApplied:        z.string().optional(),
  followUpDate:       z.string().optional(),
  scheduledApplyDate: z.string().optional(),
  salary:             z.string().max(100).optional().default(''),
  notes:              z.string().max(5000).optional().default(''),
});

export default function JobForm({ defaultValues, onSubmit, loading, onCancel }) {
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      company:            defaultValues?.company            ?? '',
      role:               defaultValues?.role               ?? '',
      jobUrl:             defaultValues?.jobUrl             ?? '',
      location:           defaultValues?.location           ?? '',
      status:             defaultValues?.status             ?? 'Wishlist',
      dateApplied:        defaultValues?.dateApplied        ? toInputDate(defaultValues.dateApplied)        : '',
      followUpDate:       defaultValues?.followUpDate       ? toInputDate(defaultValues.followUpDate)       : '',
      scheduledApplyDate: defaultValues?.scheduledApplyDate ? toInputDate(defaultValues.scheduledApplyDate) : '',
      salary:             defaultValues?.salary             ?? '',
      notes:              defaultValues?.notes              ?? '',
    },
  });

  const submit = (data) => {
    const parse = (d) => d ? new Date(d).toISOString() : null;
    onSubmit({
      ...data,
      dateApplied:        parse(data.dateApplied),
      followUpDate:       parse(data.followUpDate),
      scheduledApplyDate: parse(data.scheduledApplyDate),
    });
  };

  return (
    <form onSubmit={handleSubmit(submit)} className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <Input label="Company" required error={errors.company?.message} {...register('company')} />
        <Input label="Role" required error={errors.role?.message}    {...register('role')} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Input label="Job URL" type="url" placeholder="https://..." error={errors.jobUrl?.message} {...register('jobUrl')} />
        <Input label="Location" placeholder="Remote, NYC..." error={errors.location?.message} {...register('location')} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <SelectField label="Status" {...register('status')}>
          {JOB_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
        </SelectField>
        <Input label="Salary range" placeholder="80k–100k USD" {...register('salary')} />
      </div>
      <div className="grid grid-cols-3 gap-3">
        <Input label="Date applied"       type="date" {...register('dateApplied')} />
        <Input label="Follow-up date"     type="date" {...register('followUpDate')} />
        <Input label="Scheduled apply on" type="date" {...register('scheduledApplyDate')} />
      </div>
      <Textarea label="Notes" placeholder="Interview notes, contacts..." {...register('notes')} />

      <div className="flex gap-3 pt-2">
        <Button type="submit" loading={loading} className="flex-1">
          {defaultValues ? 'Save changes' : 'Add application'}
        </Button>
        {onCancel && <Button type="button" variant="secondary" onClick={onCancel}>Cancel</Button>}
      </div>
    </form>
  );
}
