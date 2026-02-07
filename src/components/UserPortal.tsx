import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Bell, LogOut, User, ArrowLeft } from 'lucide-react';

interface ServiceRequest {
  id: string;
  service_name: string;
  description: string;
  location: string;
  preferred_date: string;
  preferred_time: string;
  status: string;
  created_at: string;
  updated_at: string;
}

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  read: boolean;
  created_at: string;
}

interface UserData {
  full_name: string;
  email: string;
  phone: string;
}

export const UserPortal: React.FC<{ userId: string; onLogout: () => void; onBack: () => void }> = ({ userId, onLogout, onBack }) => {
  const [activeTab, setActiveTab] = useState('orders');
  const [serviceRequests, setServiceRequests] = useState<ServiceRequest[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    loadData();
    // Set up real-time subscription for notifications
    const channel = supabase
      .channel(`user_${userId}_notifications`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'notifications', filter: `user_id=eq.${userId}` },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setNotifications(prev => [payload.new as Notification, ...prev]);
          }
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [userId]);

  const loadData = async () => {
    setLoading(true);
    try {
      // Load user data
      const { data: user, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (!userError && user) {
        setUserData(user);
      }

      // Load service requests
      const { data: requests, error: requestsError } = await supabase
        .from('service_requests')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (!requestsError && requests) {
        setServiceRequests(requests);
      }

      // Load notifications
      const { data: notifs, error: notifsError } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (!notifsError && notifs) {
        setNotifications(notifs);
        setUnreadCount(notifs.filter(n => !n.read).length);
      }
    } catch (err) {
      console.error('Error loading user data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', notificationId);

      setNotifications(prev => 
        prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'accepted':
        return 'bg-blue-100 text-blue-800';
      case 'in_progress':
        return 'bg-purple-100 text-purple-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading your portal...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white">
        <div className="max-w-screen-xl mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <Button onClick={onBack} variant="ghost" className="text-white hover:bg-blue-700" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" /> Back to Services
              </Button>
              <div>
                <h1 className="text-3xl font-bold mb-2">My Portal</h1>
                <p className="text-blue-100">Welcome, {userData?.full_name || 'User'}</p>
              </div>
            </div>
            <Button onClick={onLogout} variant="outline" className="text-blue-600 border-white">
              <LogOut className="w-4 h-4 mr-2" /> Logout
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-screen-xl mx-auto px-4 py-8">
        {/* User Info Card */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" /> Profile Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-gray-600">Full Name</p>
                <p className="font-semibold">{userData?.full_name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Email</p>
                <p className="font-semibold">{userData?.email}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Phone</p>
                <p className="font-semibold">{userData?.phone || 'Not provided'}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="orders">My Orders</TabsTrigger>
            <TabsTrigger value="notifications">
              Notifications
              {unreadCount > 0 && <Badge className="ml-2" variant="destructive">{unreadCount}</Badge>}
            </TabsTrigger>
            <TabsTrigger value="history">Request History</TabsTrigger>
          </TabsList>

          {/* My Orders Tab */}
          <TabsContent value="orders" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Active Service Requests</CardTitle>
                <CardDescription>Your current service orders and their status</CardDescription>
              </CardHeader>
              <CardContent>
                {serviceRequests.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">No service requests yet. Browse services to get started!</p>
                ) : (
                  <div className="space-y-4">
                    {serviceRequests.map(request => (
                      <div key={request.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h3 className="font-semibold text-lg">{request.service_name}</h3>
                            <p className="text-sm text-gray-600">{request.description}</p>
                          </div>
                          <Badge className={getStatusColor(request.status)}>
                            {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm text-gray-600 mt-3 pt-3 border-t">
                          <div>
                            <p className="text-xs text-gray-500">Location</p>
                            <p className="font-medium">{request.location}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Date</p>
                            <p className="font-medium">{new Date(request.preferred_date).toLocaleDateString()}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Time</p>
                            <p className="font-medium">{request.preferred_time}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Created</p>
                            <p className="font-medium">{new Date(request.created_at).toLocaleDateString()}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="w-5 h-5" /> Notifications
                </CardTitle>
                <CardDescription>Updates about your service requests</CardDescription>
              </CardHeader>
              <CardContent>
                {notifications.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">No notifications yet</p>
                ) : (
                  <div className="space-y-3">
                    {notifications.map(notif => (
                      <div
                        key={notif.id}
                        className={`p-4 rounded-lg border cursor-pointer transition-all ${
                          notif.read
                            ? 'bg-white border-gray-200'
                            : 'bg-blue-50 border-blue-200'
                        }`}
                        onClick={() => !notif.read && handleMarkAsRead(notif.id)}
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h4 className="font-semibold">{notif.title}</h4>
                            <p className="text-sm text-gray-600">{notif.message}</p>
                            <p className="text-xs text-gray-500 mt-2">
                              {new Date(notif.created_at).toLocaleString()}
                            </p>
                          </div>
                          {!notif.read && <Badge>New</Badge>}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Request History Tab */}
          <TabsContent value="history" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Request History</CardTitle>
                <CardDescription>All your past and current service requests</CardDescription>
              </CardHeader>
              <CardContent>
                {serviceRequests.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">No request history</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-2 px-2">Service</th>
                          <th className="text-left py-2 px-2">Status</th>
                          <th className="text-left py-2 px-2">Date</th>
                          <th className="text-left py-2 px-2">Location</th>
                        </tr>
                      </thead>
                      <tbody>
                        {serviceRequests.map(request => (
                          <tr key={request.id} className="border-b hover:bg-gray-50">
                            <td className="py-2 px-2">{request.service_name}</td>
                            <td className="py-2 px-2">
                              <Badge className={getStatusColor(request.status)}>
                                {request.status}
                              </Badge>
                            </td>
                            <td className="py-2 px-2">{new Date(request.preferred_date).toLocaleDateString()}</td>
                            <td className="py-2 px-2">{request.location}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};
