/**
 * ClientForm - Form for creating/editing clients
 * 
 * Uses React Hook Form + Zod for validation.
 */

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button, Input, Select, TextArea } from '../common';
import { CLIENT_STATUS_LABELS } from '../../../lib/constants';

// Validation schema
const clientSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name is too long'),
  company: z.string().max(100, 'Company name is too long').optional().or(z.literal('')),
  email: z.string().email('Invalid email address').optional().or(z.literal('')),
  phone: z.string().max(30, 'Phone number is too long').optional().or(z.literal('')),
  location: z.string().max(100, 'Location is too long').optional().or(z.literal('')),
  status: z.enum(['prospect', 'active', 'past', 'lost']),
  notes: z.string().max(1000, 'Notes are too long').optional().or(z.literal('')),
});

// Status options for select
const statusOptions = Object.entries(CLIENT_STATUS_LABELS).map(([value, label]) => ({
  value,
  label,
}));

const ClientForm = ({
  initialData = null,
  onSubmit,
  onCancel,
  isSubmitting = false,
}) => {
  const isEditing = !!initialData;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(clientSchema),
    defaultValues: {
      name: '',
      company: '',
      email: '',
      phone: '',
      location: '',
      status: 'prospect',
      notes: '',
    },
  });

  // Reset form when initialData changes (for editing)
  useEffect(() => {
    if (initialData) {
      reset({
        name: initialData.name || '',
        company: initialData.company || '',
        email: initialData.email || '',
        phone: initialData.phone || '',
        location: initialData.location || '',
        status: initialData.status || 'prospect',
        notes: initialData.notes || '',
      });
    }
  }, [initialData, reset]);

  const handleFormSubmit = (data) => {
    // Clean up empty strings to null for database
    const cleanedData = {
      ...data,
      company: data.company || null,
      email: data.email || null,
      phone: data.phone || null,
      location: data.location || null,
      notes: data.notes || null,
    };

    onSubmit(cleanedData);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="client-form">
      <div className="client-form__grid">
        {/* Name - Required */}
        <Input
          label="Name"
          placeholder="John Doe"
          error={errors.name?.message}
          required
          {...register('name')}
        />

        {/* Company */}
        <Input
          label="Company"
          placeholder="Acme Inc."
          error={errors.company?.message}
          {...register('company')}
        />

        {/* Email */}
        <Input
          label="Email"
          type="email"
          placeholder="john@example.com"
          error={errors.email?.message}
          {...register('email')}
        />

        {/* Phone */}
        <Input
          label="Phone"
          type="tel"
          placeholder="+1 234 567 8900"
          error={errors.phone?.message}
          {...register('phone')}
        />

        {/* Location */}
        <Input
          label="Location"
          placeholder="New York, USA"
          error={errors.location?.message}
          {...register('location')}
        />

        {/* Status */}
        <Select
          label="Status"
          options={statusOptions}
          error={errors.status?.message}
          {...register('status')}
        />
      </div>

      {/* Notes - Full width */}
      <div className="client-form__notes">
        <TextArea
          label="Notes"
          placeholder="Any additional notes about this client..."
          rows={4}
          error={errors.notes?.message}
          {...register('notes')}
        />
      </div>

      {/* Actions */}
      <div className="client-form__actions">
        {onCancel && (
          <Button
            type="button"
            variant="secondary"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
        )}
        <Button
          type="submit"
          variant="primary"
          loading={isSubmitting}
        >
          {isEditing ? 'Update Client' : 'Create Client'}
        </Button>
      </div>
    </form>
  );
};

export default ClientForm;