import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/components/ui/use-toast';

export const AuthModal: React.FC<{ open: boolean; onOpenChange: (open: boolean) => void; onSignedIn: (user: any) => void }> = ({ open, onOpenChange, onSignedIn }) => {
  const navigate = useNavigate();
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSignup = async () => {
    if (!email || !password || !fullName) {
      toast({ title: 'Error', description: 'Please fill in all fields', variant: 'destructive' });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({ email, password });
      if (error) {
        toast({ title: 'Sign up error', description: error.message, variant: 'destructive' });
        setLoading(false);
        return;
      }

      const user = data.user;
      if (user) {
        // Create user profile
        await supabase.from('users').upsert({
          id: user.id,
          email: user.email,
          full_name: fullName,
          phone: phone,
          role: 'client',
        });

        toast({ title: 'Success', description: 'Account created successfully!' });
        onSignedIn(user);
        onOpenChange(false);
      }
    } catch (err) {
      console.error('Sign up error', err);
      toast({ title: 'Error', description: 'Failed to create account', variant: 'destructive' });
    }
    setLoading(false);
  };

  const handleLogin = async () => {
    if (!email || !password) {
      toast({ title: 'Error', description: 'Please enter email and password', variant: 'destructive' });
      return;
    }

    // Check for admin credentials
    if (email === 'admin@taskpro.com' && password === 'admin123') {
      // Store flag in sessionStorage to bypass admin login form
      sessionStorage.setItem('adminAuthenticated', 'true');
      onOpenChange(false);
      navigate('/admin');
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        toast({ title: 'Login error', description: error.message, variant: 'destructive' });
        setLoading(false);
        return;
      }

      const user = data.user;
      if (user) {
        toast({ title: 'Success', description: 'Logged in successfully!' });
        onSignedIn(user);
        onOpenChange(false);
      }
    } catch (err) {
      console.error('Login error', err);
      toast({ title: 'Error', description: 'Failed to login', variant: 'destructive' });
    }
    setLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{mode === 'login' ? 'Login' : 'Create Account'}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {mode === 'signup' && (
            <>
              <div>
                <Label>Full Name</Label>
                <Input 
                  value={fullName} 
                  onChange={(e) => setFullName(e.target.value)} 
                  placeholder="Your full name"
                />
              </div>
              <div>
                <Label>Phone</Label>
                <Input 
                  value={phone} 
                  onChange={(e) => setPhone(e.target.value)} 
                  placeholder="Your phone number"
                />
              </div>
            </>
          )}
          
          <div>
            <Label>Email</Label>
            <Input 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              type="email"
              placeholder="your@email.com"
            />
          </div>
          
          <div>
            <Label>Password</Label>
            <Input 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              type="password"
              placeholder="••••••••"
            />
          </div>

          <div className="flex gap-2 pt-2">
            <Button 
              variant="outline" 
              onClick={() => {
                setMode(mode === 'login' ? 'signup' : 'login');
                setEmail('');
                setPassword('');
                setFullName('');
                setPhone('');
              }}
              className="flex-1"
            >
              {mode === 'login' ? 'Sign Up' : 'Login'}
            </Button>
            <Button 
              onClick={mode === 'login' ? handleLogin : handleSignup} 
              disabled={loading}
              className="flex-1"
            >
              {loading ? (mode === 'login' ? 'Signing in...' : 'Creating...') : (mode === 'login' ? 'Login' : 'Sign Up')}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
