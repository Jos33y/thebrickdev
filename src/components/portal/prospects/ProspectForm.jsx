/**
 * ProspectForm - Create/Edit prospect form
 * 
 * Optimized for quick entry from Craigslist, Google Maps, etc.
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  Button,
  Input,
  TextArea,
  Select,
} from '../common';
import { useCreateProspect, useUpdateProspect } from '../../../hooks/useProspects';

// Source options
const SOURCE_OPTIONS = [
  { value: 'craigslist', label: 'Craigslist' },
  { value: 'google_maps', label: 'Google Maps' },
  { value: 'instagram', label: 'Instagram' },
  { value: 'linkedin', label: 'LinkedIn' },
  { value: 'upwork', label: 'Upwork' },
  { value: 'fiverr', label: 'Fiverr' },
  { value: 'referral', label: 'Referral' },
  { value: 'website', label: 'Website Inquiry' },
  { value: 'cold_outreach', label: 'Cold Outreach' },
  { value: 'other', label: 'Other' },
];

// Stage options
const STAGE_OPTIONS = [
  { value: 'identified', label: 'Identified' },
  { value: 'contacted', label: 'Contacted' },
  { value: 'replied', label: 'Replied' },
  { value: 'call_scheduled', label: 'Call Scheduled' },
  { value: 'proposal_sent', label: 'Proposal Sent' },
  { value: 'negotiating', label: 'Negotiating' },
];

// Currency options
const CURRENCY_OPTIONS = [
  { value: 'USD', label: 'USD ($)' },
  { value: 'EUR', label: 'EUR (€)' },
  { value: 'GBP', label: 'GBP (£)' },
  { value: 'NGN', label: 'NGN (₦)' },
];

// Project type options
const PROJECT_TYPE_OPTIONS = [
  { value: '', label: 'Select type...' },
  { value: 'website', label: 'Website' },
  { value: 'website_redesign', label: 'Website Redesign' },
  { value: 'ecommerce', label: 'E-commerce Store' },
  { value: 'web_app', label: 'Web Application' },
  { value: 'mobile_app', label: 'Mobile App' },
  { value: 'landing_page', label: 'Landing Page' },
  { value: 'maintenance', label: 'Maintenance/Updates' },
  { value: 'consulting', label: 'Consulting' },
  { value: 'other', label: 'Other' },
];

const ProspectForm = ({ prospect = null, onSuccess }) => {
  const navigate = useNavigate();
  const createProspect = useCreateProspect();
  const updateProspect = useUpdateProspect();
  
  const isEdit = !!prospect;
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    company: '',
    email: '',
    phone: '',
    website: '',
    location: '',
    source: 'craigslist',
    source_url: '',
    source_notes: '',
    stage: 'identified',
    estimated_value: '',
    currency: 'USD',
    project_type: '',
    next_follow_up: '',
    notes: '',
  });
  
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load prospect data for edit
  useEffect(() => {
    if (prospect) {
      setFormData({
        name: prospect.name || '',
        company: prospect.company || '',
        email: prospect.email || '',
        phone: prospect.phone || '',
        website: prospect.website || '',
        location: prospect.location || '',
        source: prospect.source || 'other',
        source_url: prospect.source_url || '',
        source_notes: prospect.source_notes || '',
        stage: prospect.stage || 'identified',
        estimated_value: prospect.estimated_value || '',
        currency: prospect.currency || 'USD',
        project_type: prospect.project_type || '',
        next_follow_up: prospect.next_follow_up || '',
        notes: prospect.notes || '',
      });
    }
  }, [prospect]);

  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error on change
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  // Validate form
  const validate = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }
    
    if (formData.website && !formData.website.startsWith('http')) {
      newErrors.website = 'Website must start with http:// or https://';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validate()) return;
    
    setIsSubmitting(true);
    
    try {
      const submitData = {
        ...formData,
        estimated_value: formData.estimated_value ? parseFloat(formData.estimated_value) : null,
        next_follow_up: formData.next_follow_up || null,
      };
      
      if (isEdit) {
        await updateProspect.mutateAsync({ id: prospect.id, ...submitData });
      } else {
        await createProspect.mutateAsync(submitData);
      }
      
      if (onSuccess) {
        onSuccess();
      } else {
        navigate('/portal/prospects');
      }
    } catch (err) {
      console.error('Submit failed:', err);
      setErrors({ submit: err.message || 'Failed to save prospect' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="prospect-form">
      {errors.submit && (
        <div className="form-error-banner">{errors.submit}</div>
      )}
      
      {/* Basic Info */}
      <Card title="Basic Information" subtitle="Contact details">
        <div className="form-grid form-grid--2">
          <Input
            label="Name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            error={errors.name}
            placeholder="John Smith"
            required
          />
          <Input
            label="Company"
            name="company"
            value={formData.company}
            onChange={handleChange}
            placeholder="Acme Corp"
          />
        </div>
        
        <div className="form-grid form-grid--2">
          <Input
            label="Email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            error={errors.email}
            placeholder="john@example.com"
          />
          <Input
            label="Phone"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            placeholder="+1 555 123 4567"
          />
        </div>
        
        <div className="form-grid form-grid--2">
          <Input
            label="Website"
            name="website"
            value={formData.website}
            onChange={handleChange}
            error={errors.website}
            placeholder="https://example.com"
          />
          <Input
            label="Location"
            name="location"
            value={formData.location}
            onChange={handleChange}
            placeholder="New York, USA"
          />
        </div>
      </Card>
      
      {/* Source Info */}
      <Card title="Source" subtitle="Where did you find this prospect?">
        <div className="form-grid form-grid--2">
          <Select
            label="Source"
            name="source"
            value={formData.source}
            onChange={handleChange}
            options={SOURCE_OPTIONS}
          />
          <Input
            label="Source URL"
            name="source_url"
            value={formData.source_url}
            onChange={handleChange}
            placeholder="https://craigslist.org/..."
            hint="Link to original post or profile"
          />
        </div>
        
        <TextArea
          label="Source Notes"
          name="source_notes"
          value={formData.source_notes}
          onChange={handleChange}
          placeholder="Notes about where/how you found them..."
          rows={2}
        />
      </Card>
      
      {/* Deal Info */}
      <Card title="Deal Information" subtitle="Pipeline and value">
        <div className="form-grid form-grid--2">
          <Select
            label="Stage"
            name="stage"
            value={formData.stage}
            onChange={handleChange}
            options={STAGE_OPTIONS}
          />
          <Select
            label="Project Type"
            name="project_type"
            value={formData.project_type}
            onChange={handleChange}
            options={PROJECT_TYPE_OPTIONS}
          />
        </div>
        
        <div className="form-grid form-grid--3">
          <Input
            label="Estimated Value"
            name="estimated_value"
            type="number"
            value={formData.estimated_value}
            onChange={handleChange}
            placeholder="5000"
          />
          <Select
            label="Currency"
            name="currency"
            value={formData.currency}
            onChange={handleChange}
            options={CURRENCY_OPTIONS}
          />
          <Input
            label="Next Follow-up"
            name="next_follow_up"
            type="date"
            value={formData.next_follow_up}
            onChange={handleChange}
          />
        </div>
      </Card>
      
      {/* Notes */}
      <Card title="Notes" subtitle="Additional information">
        <TextArea
          name="notes"
          value={formData.notes}
          onChange={handleChange}
          placeholder="Any additional notes about this prospect..."
          rows={4}
        />
      </Card>
      
      {/* Actions */}
      <div className="form-actions">
        <Button
          type="button"
          variant="secondary"
          onClick={() => navigate('/portal/prospects')}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          variant="primary"
          loading={isSubmitting}
        >
          {isEdit ? 'Save Changes' : 'Add Prospect'}
        </Button>
      </div>
    </form>
  );
};

export default ProspectForm;