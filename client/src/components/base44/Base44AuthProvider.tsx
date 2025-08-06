import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { base44Client, Base44User } from '@/lib/base44';
import { useToast } from '@/hooks/use-toast';

interface Base44AuthContextType {
  user: Base44User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (userData: {
    email: string;
    password: string;
    firstName?: string;
    lastName?: string;
    organizationId?: string;
  }) => Promise<boolean>;
  logout: () => Promise<void>;
  updateProfile: (updates: Partial<Base44User>) => Promise<boolean>;
  refreshUser: () => Promise<void>;
}

const Base44AuthContext = createContext<Base44AuthContextType | undefined>(undefined);

interface Base44AuthProviderProps {
  children: ReactNode;
}

export const Base44AuthProvider: React.FC<Base44AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<Base44User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  // Initialize authentication state
  useEffect(() => {
    initializeAuth();
  }, []);

  const initializeAuth = async () => {
    try {
      if (base44Client.isAuthenticated()) {
        const result = await base44Client.getCurrentUser();
        if (result.success && result.user) {
          setUser(result.user);
        } else {
          // Token might be expired, try to refresh
          const refreshResult = await base44Client.refreshAuthentication();
          if (refreshResult.success && refreshResult.user) {
            setUser(refreshResult.user);
          } else {
            // Clear invalid tokens
            await base44Client.logout();
          }
        }
      }
    } catch (error) {
      console.error('[Base44 Auth Provider] Initialization error:', error);
      await base44Client.logout();
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      
      const result = await base44Client.login(email, password);
      
      if (result.success && result.user) {
        setUser(result.user);
        toast({
          title: "Login Successful",
          description: `Welcome back, ${result.user.firstName || result.user.email}!`,
        });
        return true;
      } else {
        toast({
          title: "Login Failed",
          description: result.error || "Invalid credentials",
          variant: "destructive",
        });
        return false;
      }
    } catch (error) {
      console.error('[Base44 Auth Provider] Login error:', error);
      toast({
        title: "Login Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: {
    email: string;
    password: string;
    firstName?: string;
    lastName?: string;
    organizationId?: string;
  }): Promise<boolean> => {
    try {
      setIsLoading(true);
      
      const result = await base44Client.register(userData);
      
      if (result.success && result.user) {
        setUser(result.user);
        toast({
          title: "Registration Successful",
          description: `Welcome to Auth247, ${result.user.firstName || result.user.email}!`,
        });
        return true;
      } else {
        toast({
          title: "Registration Failed",
          description: result.error || "Unable to create account",
          variant: "destructive",
        });
        return false;
      }
    } catch (error) {
      console.error('[Base44 Auth Provider] Registration error:', error);
      toast({
        title: "Registration Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await base44Client.logout();
      setUser(null);
      toast({
        title: "Logged Out",
        description: "You have been successfully logged out",
      });
    } catch (error) {
      console.error('[Base44 Auth Provider] Logout error:', error);
    }
  };

  const updateProfile = async (updates: Partial<Base44User>): Promise<boolean> => {
    try {
      setIsLoading(true);
      
      const result = await base44Client.updateProfile(updates);
      
      if (result.success && result.user) {
        setUser(result.user);
        toast({
          title: "Profile Updated",
          description: "Your profile has been successfully updated",
        });
        return true;
      } else {
        toast({
          title: "Update Failed",
          description: result.error || "Unable to update profile",
          variant: "destructive",
        });
        return false;
      }
    } catch (error) {
      console.error('[Base44 Auth Provider] Profile update error:', error);
      toast({
        title: "Update Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const refreshUser = async (): Promise<void> => {
    try {
      if (base44Client.isAuthenticated()) {
        const result = await base44Client.getCurrentUser();
        if (result.success && result.user) {
          setUser(result.user);
        }
      }
    } catch (error) {
      console.error('[Base44 Auth Provider] Refresh user error:', error);
    }
  };

  const contextValue: Base44AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user && base44Client.isAuthenticated(),
    login,
    register,
    logout,
    updateProfile,
    refreshUser
  };

  return (
    <Base44AuthContext.Provider value={contextValue}>
      {children}
    </Base44AuthContext.Provider>
  );
};

export const useBase44Auth = (): Base44AuthContextType => {
  const context = useContext(Base44AuthContext);
  if (context === undefined) {
    throw new Error('useBase44Auth must be used within a Base44AuthProvider');
  }
  return context;
};

export default Base44AuthProvider;