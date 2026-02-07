import React, { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';

interface QuotationFormProps {
  serviceName: string;
  onClose: () => void;
  onSuccess: () => void;
}

export const QuotationForm: React.FC<QuotationFormProps> = ({ serviceName, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    location: '',
    projectDescription: '',
    budget: '',
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

      // Insert quotation request
      const { data, error } = await supabase.from('quotations').insert([
        {
          user_id: user.id,
          service_name: serviceName,
          description: formData.projectDescription,
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
          title: `Quotation Request for ${serviceName}`,
          message: `Quotation requested for ${serviceName}. Budget: ${formData.budget || 'Not specified'}`,
          type: 'quotation',
          related_id: data?.[0]?.id,
        },
      ]);

      toast({ title: 'Success', description: 'Quotation request submitted successfully!' });
      onSuccess();
    } catch (err) {
      console.error('Error submitting form:', err);
      toast({ title: 'Error', description: 'Failed to submit quotation request', variant: 'destructive' });
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4">
        <p className="text-sm text-amber-800">
          <span className="font-semibold">Quotation Fee: $2.00</span> - You'll receive a detailed quote for your project.
        </p>
      </div>
      
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
        <Label>Project Description *</Label>
        <Textarea 
          required 
          value={formData.projectDescription} 
          onChange={(e) => setFormData({ ...formData, projectDescription: e.target.value })}
          placeholder="Describe the project details..."
          rows={4}
        />
      </div>
      
      <div>
        <Label>Budget (Optional)</Label>
        <Input 
          type="text" 
          value={formData.budget} 
          onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
          placeholder="e.g., $500 - $1000 or 'Open to negotiation'"
        />
      </div>
      
      <div className="flex gap-3 pt-2">
        <Button type="button" variant="outline" onClick={onClose} className="flex-1">
          Cancel
        </Button>
        <Button type="submit" disabled={loading} className="flex-1 bg-amber-500 hover:bg-amber-600">
          {loading ? 'Submitting...' : 'Request Quotation ($2)'}
        </Button>
      </div>
    </form>
  );
};
