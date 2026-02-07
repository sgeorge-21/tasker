import React, { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';

interface BookingFormProps {
  serviceName: string;
  onClose: () => void;
  onSuccess: () => void;
}

export const BookingForm: React.FC<BookingFormProps> = ({ serviceName, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    serviceDate: '',
    serviceTime: '',
    location: '',
    description: '',
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        toast({ title: 'Error', description: 'Please log in first', variant: 'destructive' });
        setLoading(false);
        return;
      }

      // Insert service request
      const { data, error } = await supabase.from('service_requests').insert([
        {
          user_id: user.id,
          service_name: serviceName,
          description: formData.description,
          location: formData.location,
          preferred_date: formData.serviceDate,
          preferred_time: formData.serviceTime,
          status: 'pending',
        },
      ]).select();

      if (error) {
        toast({ title: 'Error', description: error.message, variant: 'destructive' });
        setLoading(false);
        return;
      }

      // Create notification for admin
      await supabase.from('notifications').insert([
        {
          user_id: user.id,
          title: `New ${serviceName} Request`,
          message: `Service request submitted for ${serviceName} on ${formData.serviceDate}`,
          type: 'order',
          related_id: data?.[0]?.id,
        },
      ]);

      toast({ title: 'Success', description: 'Service request submitted successfully!' });
      onSuccess();
    } catch (err) {
      console.error('Error submitting form:', err);
      toast({ title: 'Error', description: 'Failed to submit request', variant: 'destructive' });
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label>Service</Label>
        <Input value={serviceName} disabled className="bg-gray-50" />
      </div>
      <div>
        <Label>Full Name *</Label>
        <Input 
          required 
          value={formData.customerName} 
          onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
          placeholder="Your name"
        />
      </div>
      <div>
        <Label>Email *</Label>
        <Input 
          type="email" 
          required 
          value={formData.customerEmail} 
          onChange={(e) => setFormData({ ...formData, customerEmail: e.target.value })}
          placeholder="your@email.com"
        />
      </div>
      <div>
        <Label>Phone *</Label>
        <Input 
          type="tel" 
          required 
          value={formData.customerPhone} 
          onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
          placeholder="+1 (555) 000-0000"
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Preferred Date *</Label>
          <Input 
            type="date" 
            required 
            value={formData.serviceDate} 
            onChange={(e) => setFormData({ ...formData, serviceDate: e.target.value })}
          />
        </div>
        <div>
          <Label>Preferred Time *</Label>
          <Input 
            type="time" 
            required 
            value={formData.serviceTime} 
            onChange={(e) => setFormData({ ...formData, serviceTime: e.target.value })}
          />
        </div>
      </div>
      <div>
        <Label>Location *</Label>
        <Input 
          required 
          value={formData.location} 
          onChange={(e) => setFormData({ ...formData, location: e.target.value })}
          placeholder="Enter your address"
        />
      </div>
      <div>
        <Label>Additional Details</Label>
        <Textarea 
          value={formData.description} 
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Describe what you need..."
          rows={4}
        />
      </div>
      <div className="flex gap-3 pt-2">
        <Button type="button" variant="outline" onClick={onClose} className="flex-1">Cancel</Button>
        <Button type="submit" disabled={loading} className="flex-1 bg-blue-600 hover:bg-blue-700">
          {loading ? 'Submitting...' : 'Submit Request'}
        </Button>
      </div>
    </form>
  );
};
