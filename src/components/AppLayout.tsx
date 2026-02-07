import React, { useState, useEffect } from 'react';
import { services } from '@/data/services';
import { ServiceCard } from '@/components/ServiceCard';
import { AuthModal } from '@/components/AuthModal';
import { Messages } from '@/components/Messages';
import { BookingForm } from '@/components/BookingForm';
import { QuotationForm } from '@/components/QuotationForm';
import { ServiceSelectionModal } from '@/components/ServiceSelectionModal';
import { AdminLogin } from '@/components/AdminLogin';
import { AdminDashboard } from '@/components/AdminDashboard';
import { UserPortal } from '@/components/UserPortal';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';
import { Bell } from 'lucide-react';

const AppLayout: React.FC = () => {
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const [showServiceSelection, setShowServiceSelection] = useState(false);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [showQuotationForm, setShowQuotationForm] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [view, setView] = useState<'home' | 'admin' | 'portal'>('home');
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [showMessages, setShowMessages] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [unreadNotifications, setUnreadNotifications] = useState(0);

  useEffect(() => {
    // Check if user is already logged in
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setCurrentUser(session.user);
      }
    };
    checkAuth();

    // Subscribe to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setCurrentUser(session.user);
      } else {
        setCurrentUser(null);
      }
    });

    return () => subscription?.unsubscribe();
  }, []);

  const handleServiceClick = (serviceName: string) => {
    if (!currentUser) {
      setShowAuth(true);
      return;
    }
    setSelectedService(serviceName);
    setShowServiceSelection(true);
  };

  const handleRequestQuotation = () => {
    setShowServiceSelection(false);
    setShowQuotationForm(true);
  };

  const handleRequestService = () => {
    setShowServiceSelection(false);
    setShowBookingForm(true);
  };

  const handleBookingSuccess = () => {
    setShowBookingForm(false);
    setSelectedService(null);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const handleQuotationSuccess = () => {
    setShowQuotationForm(false);
    setSelectedService(null);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setCurrentUser(null);
    setView('home');
  };

  if (view === 'admin') {
    if (!isAdminLoggedIn) {
      return <AdminLogin onLogin={() => setIsAdminLoggedIn(true)} />;
    }
    return <AdminDashboard onLogout={() => { setIsAdminLoggedIn(false); setView('home'); }} />;
  }

  if (view === 'portal' && currentUser) {
    return <UserPortal userId={currentUser.id} onLogout={() => { handleLogout(); setView('home'); }} onBack={() => setView('home')} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-coral-50">
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white">
        <div className="max-w-screen-xl mx-auto px-4 py-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-3">
            <h1 className="text-2xl sm:text-4xl font-bold">TASKER</h1>
            <div className="flex items-center gap-2 text-sm flex-wrap">
              {!currentUser ? (
                <>
                  <Button onClick={() => setShowAuth(true)} variant="default" size="sm" className="px-2">Login / Sign Up</Button>
                </>
              ) : (
                <>
                  <Button onClick={() => setView('portal')} variant="secondary" size="sm" className="px-2 flex items-center gap-1">
                    <span>My Portal</span>
                    {unreadNotifications > 0 && <span className="bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">{unreadNotifications}</span>}
                  </Button>
                  <Button onClick={handleLogout} variant="ghost" size="sm" className="px-2">Logout</Button>
                </>
              )}
              <Button onClick={() => setView('admin')} variant="secondary" size="sm" className="px-2">Admin</Button>
            </div>
          </div>
          <p className="text-base sm:text-xl text-blue-100">Find skilled professionals for any job</p>
        </div>
      </div>

      <div className="max-w-screen-xl mx-auto px-4 py-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Browse Services</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {services.map(service => (
            <ServiceCard key={service.id} name={service.name} icon={service.icon} onClick={() => handleServiceClick(service.name)} />
          ))}
        </div>
      </div>

      <Dialog open={showBookingForm} onOpenChange={() => setShowBookingForm(false)}>
        <DialogContent className="w-full sm:max-w-lg md:max-w-2xl max-h-[90vh] overflow-y-auto mx-4 sm:mx-auto">
          <DialogHeader>
            <DialogTitle>Book {selectedService}</DialogTitle>
          </DialogHeader>
          {selectedService && <BookingForm serviceName={selectedService} onClose={() => setShowBookingForm(false)} onSuccess={handleBookingSuccess} />}
        </DialogContent>
      </Dialog>

      <Dialog open={showQuotationForm} onOpenChange={() => setShowQuotationForm(false)}>
        <DialogContent className="w-full sm:max-w-lg md:max-w-2xl max-h-[90vh] overflow-y-auto mx-4 sm:mx-auto">
          <DialogHeader>
            <DialogTitle>Request Quotation for {selectedService}</DialogTitle>
          </DialogHeader>
          {selectedService && <QuotationForm serviceName={selectedService} onClose={() => setShowQuotationForm(false)} onSuccess={handleQuotationSuccess} />}
        </DialogContent>
      </Dialog>

      <ServiceSelectionModal
        open={showServiceSelection}
        serviceName={selectedService}
        onClose={() => setShowServiceSelection(false)}
        onRequestQuotation={handleRequestQuotation}
        onRequestService={handleRequestService}
      />

      <AuthModal open={showAuth} onOpenChange={(v) => setShowAuth(v)} onSignedIn={(user) => { setCurrentUser(user); setShowAuth(false); }} />

      {showSuccess && (
        <div className="fixed bottom-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg">Request submitted successfully!</div>
      )}
    </div>
  );
};

export default AppLayout;
