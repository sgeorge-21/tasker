import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { services } from '@/data/services';

interface Request {
  id: string;
  service_type: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  service_date: string;
  location: string;
  description: string;
  status: string;
  created_at: string;
}

export const AdminDashboard: React.FC<{ onLogout: () => void }> = ({ onLogout }) => {
  const [requests, setRequests] = useState<Request[]>([]);
  const [filter, setFilter] = useState('all');
  const [providers, setProviders] = useState<any[]>([]);
  const [tab, setTab] = useState<'requests' | 'providers' | 'quotations'>('requests');
  const [quotations, setQuotations] = useState<any[]>([]);
  const [searchName, setSearchName] = useState('');
  const [searchServiceType, setSearchServiceType] = useState('');

  useEffect(() => {
    fetchRequests();
    fetchProviders();
    fetchQuotations();
  }, []);

  const fetchRequests = async () => {
    const { data } = await supabase.from('service_requests').select('*').order('created_at', { ascending: false });
    if (data) setRequests(data);
  };

  const updateStatus = async (id: string, status: string) => {
    await supabase.from('service_requests').update({ status }).eq('id', id);
    fetchRequests();
  };

  const fetchProviders = async () => {
    const { data } = await supabase.from('profiles').select('*').eq('role', 'provider').order('created_at', { ascending: false });
    if (data) setProviders(data as any[]);
  };

  const fetchQuotations = async () => {
    const { data } = await supabase.from('quotations').select('*').order('created_at', { ascending: false });
    if (data) setQuotations(data as any[]);
  };

  const filtered = filter === 'all' ? requests : requests.filter(r => r.status === filter);
  
  // Apply name and service type filters
  const searchFiltered = filtered.filter(r => {
    const nameMatch = r.customer_name.toLowerCase().includes(searchName.toLowerCase());
    const serviceMatch = r.service_type.toLowerCase().includes(searchServiceType.toLowerCase());
    return nameMatch && serviceMatch;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800">Admin Dashboard</h1>
          <Button onClick={onLogout} variant="outline">Logout</Button>
        </div>
      </div>
      <div className="max-w-7xl mx-auto p-4">
        <div className="flex gap-2 mb-6">
          <Button onClick={() => setTab('requests')} variant={tab === 'requests' ? 'default' : 'outline'} size="sm">Requests</Button>
          <Button onClick={() => setTab('quotations')} variant={tab === 'quotations' ? 'default' : 'outline'} size="sm">Quotations</Button>
          <Button onClick={() => setTab('providers')} variant={tab === 'providers' ? 'default' : 'outline'} size="sm">Providers</Button>
        </div>

        {tab === 'requests' && (
          <>
            <div className="flex gap-2 mb-6">
              {['all', 'pending', 'confirmed', 'completed'].map(f => (
                <Button key={f} onClick={() => setFilter(f)} variant={filter === f ? 'default' : 'outline'} size="sm">{f.charAt(0).toUpperCase() + f.slice(1)}</Button>
              ))}
            </div>
            
            <div className="bg-white rounded-lg shadow p-4 mb-6">
              <h3 className="font-semibold mb-4 text-gray-800">Search & Filter</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-2">Search by Customer Name</label>
                  <Input 
                    type="text" 
                    placeholder="e.g., John Doe" 
                    value={searchName} 
                    onChange={(e) => setSearchName(e.target.value)}
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-2">Filter by Service Type</label>
                  <select 
                    value={searchServiceType} 
                    onChange={(e) => setSearchServiceType(e.target.value)}
                    className="w-full border rounded-md px-3 py-2 text-sm"
                  >
                    <option value="">All Services</option>
                    {services.map(s => (
                      <option key={s.id} value={s.name}>{s.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              {(searchName || searchServiceType) && (
                <Button 
                  onClick={() => { setSearchName(''); setSearchServiceType(''); }} 
                  variant="ghost" 
                  size="sm"
                  className="mt-3"
                >
                  Clear Filters
                </Button>
              )}
            </div>
            
            <div className="space-y-4">
              {searchFiltered.map(req => (
                <div key={req.id} className="bg-white rounded-lg shadow p-6 border">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-bold text-lg text-gray-800">{req.service_type}</h3>
                      <p className="text-sm text-gray-500">{new Date(req.created_at).toLocaleDateString()}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${req.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : req.status === 'confirmed' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}`}>{req.status}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                    <div><span className="font-medium">Customer:</span> {req.customer_name}</div>
                    <div><span className="font-medium">Email:</span> {req.customer_email}</div>
                    <div><span className="font-medium">Phone:</span> {req.customer_phone}</div>
                    <div><span className="font-medium">Date:</span> {new Date(req.service_date).toLocaleString()}</div>
                    <div className="col-span-2"><span className="font-medium">Location:</span> {req.location}</div>
                    {req.description && <div className="col-span-2"><span className="font-medium">Details:</span> {req.description}</div>}
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => updateStatus(req.id, 'confirmed')} disabled={req.status === 'confirmed'}>Confirm</Button>
                    <Button size="sm" onClick={() => updateStatus(req.id, 'completed')} disabled={req.status === 'completed'}>Complete</Button>
                    <select className="border rounded px-2 py-1" defaultValue={(req as any).selected_provider_id || ''} onChange={async (e) => {
                      const providerId = e.target.value || null;
                      await supabase.from('service_requests').update({ selected_provider_id: providerId }).eq('id', req.id);
                      fetchRequests();
                    }}>
                      <option value="">Assign provider</option>
                      {providers.filter(p => p.status === 'approved').map(p => (
                        <option key={p.id} value={p.id}>{p.email || p.id}</option>
                      ))}
                    </select>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {tab === 'quotations' && (
          <div>
            <h3 className="font-semibold mb-4 text-gray-800">Quotation Requests</h3>
            <div className="space-y-4">
              {quotations.length === 0 && <div className="text-sm text-gray-500">No quotations found.</div>}
              {quotations.map(q => (
                <div key={q.id} className="bg-white rounded-lg shadow p-6 border">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-bold text-lg text-gray-800">{q.service_name}</h3>
                      <p className="text-sm text-gray-500">{new Date(q.created_at).toLocaleString()}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${q.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : q.status === 'reviewed' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}`}>{q.status || 'pending'}</span>
                  </div>
                  <div className="grid grid-cols-1 gap-2 mb-4 text-sm">
                    <div><span className="font-medium">User ID:</span> {q.user_id}</div>
                    {q.description && <div><span className="font-medium">Details:</span> {q.description}</div>}
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" onClick={async () => { await supabase.from('quotations').update({ status: 'reviewed' }).eq('id', q.id); fetchQuotations(); }}>Mark Reviewed</Button>
                    <Button size="sm" onClick={async () => { await supabase.from('quotations').update({ status: 'completed' }).eq('id', q.id); fetchQuotations(); }}>Mark Complete</Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === 'providers' && (
          <div className="space-y-4">
            {providers.map(p => (
              <div key={p.id} className="bg-white rounded-lg shadow p-6 border">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-bold text-lg text-gray-800">{p.email}</h3>
                    <p className="text-sm text-gray-500">Status: {p.status}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  {p.status === 'pending' && <Button size="sm" onClick={async () => { await supabase.from('profiles').update({ status: 'approved' }).eq('id', p.id); fetchProviders(); }}>Approve</Button>}
                  <Button size="sm" variant="outline" onClick={async () => { await supabase.from('profiles').delete().eq('id', p.id); fetchProviders(); }}>Delete</Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
