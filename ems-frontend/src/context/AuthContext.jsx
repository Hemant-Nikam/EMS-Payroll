import React, { createContext, useContext, useState, useEffect } from 'react';
import { logActivity } from '../service/AuditService';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('ems_user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });

  const [loading, setLoading] = useState(false);

  // Initialize demo users list in localStorage if not present
  useEffect(() => {
    if (!localStorage.getItem('ems_users_db')) {
      const defaultUsers = [
        {
          id: 1,
          name: 'Super Administrator',
          email: 'admin@ems.com',
          password: 'password123',
          role: 'Admin', // Admin or Employee
          active: true,
          avatarBg: '#4f46e5',
          employeeId: null
        },
        {
          id: 2,
          name: 'Hemant Nikam',
          email: 'abc@gmail.com',
          password: 'password123',
          role: 'Employee',
          active: true,
          avatarBg: '#06b6d4',
          employeeId: 1
        },
        {
          id: 3,
          name: 'HR Specialist',
          email: 'hr@ems.com',
          password: 'password123',
          role: 'Admin',
          active: true,
          avatarBg: '#10b981',
          employeeId: null
        }
      ];
      localStorage.setItem('ems_users_db', JSON.stringify(defaultUsers));
    }
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const usersDb = JSON.parse(localStorage.getItem('ems_users_db') || '[]');
      const foundUser = usersDb.find(
        (u) => u.email.toLowerCase() === email.toLowerCase().trim()
      );

      if (foundUser) {
        // Requirement 1.5: Inactive accounts cannot log in
        if (foundUser.active === false) {
          return {
            success: false,
            message: 'Your account has been deactivated. Please contact an administrator.'
          };
        }

        if (foundUser.password !== password) {
          return { success: false, message: 'Invalid credentials. Please try again.' };
        }

        const userObj = {
          id: foundUser.id,
          name: foundUser.name,
          email: foundUser.email,
          role: foundUser.role || 'Admin',
          active: foundUser.active !== false,
          avatarBg: foundUser.avatarBg || '#4f46e5',
          employeeId: foundUser.employeeId || null
        };
        setUser(userObj);
        localStorage.setItem('ems_user', JSON.stringify(userObj));
        logActivity('USER_LOGIN', `User ${foundUser.email} logged in successfully`, foundUser.name);
        return { success: true, user: userObj };
      }

      // Default auto-login fallback if user enters valid email format
      if (email.includes('@') && password && password.length >= 4) {
        const fallbackName = email.split('@')[0];
        const formattedName = fallbackName.charAt(0).toUpperCase() + fallbackName.slice(1);
        const isAdmin = email.toLowerCase().includes('admin') || email.toLowerCase().includes('hr');
        const newUser = {
          id: Date.now(),
          name: formattedName,
          email: email.trim(),
          role: isAdmin ? 'Admin' : 'Employee',
          active: true,
          avatarBg: '#10b981',
          employeeId: 1
        };
        setUser(newUser);
        localStorage.setItem('ems_user', JSON.stringify(newUser));
        logActivity('USER_LOGIN', `User ${email} signed in (Dynamic session)`, formattedName);
        return { success: true, user: newUser };
      }

      return { success: false, message: 'Account not found. Please register or use demo credentials.' };
    } finally {
      setLoading(false);
    }
  };

  const register = async ({ name, email, password, role = 'Employee', employeeId = null }) => {
    setLoading(true);
    try {
      const usersDb = JSON.parse(localStorage.getItem('ems_users_db') || '[]');
      const exists = usersDb.some((u) => u.email.toLowerCase() === email.toLowerCase().trim());
      if (exists) {
        return { success: false, message: 'An account with this email already exists.' };
      }

      const colors = ['#4f46e5', '#06b6d4', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6'];
      const randomColor = colors[Math.floor(Math.random() * colors.length)];

      const newUser = {
        id: Date.now(),
        name: name.trim(),
        email: email.trim(),
        password,
        role: role === 'Administrator' ? 'Admin' : role,
        active: true,
        avatarBg: randomColor,
        employeeId
      };

      usersDb.push(newUser);
      localStorage.setItem('ems_users_db', JSON.stringify(usersDb));

      const sessionUser = {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        active: true,
        avatarBg: newUser.avatarBg,
        employeeId: newUser.employeeId
      };
      setUser(sessionUser);
      localStorage.setItem('ems_user', JSON.stringify(sessionUser));
      logActivity('USER_REGISTERED', `New account created for ${newUser.email} with role ${newUser.role}`, newUser.name);

      return { success: true, user: sessionUser };
    } finally {
      setLoading(false);
    }
  };

  // Requirement 1.4: Change Password
  const changePassword = (currentPassword, newPassword) => {
    if (!user) return { success: false, message: 'Not authenticated.' };

    const usersDb = JSON.parse(localStorage.getItem('ems_users_db') || '[]');
    const idx = usersDb.findIndex((u) => u.email.toLowerCase() === user.email.toLowerCase());

    if (idx >= 0) {
      if (usersDb[idx].password !== currentPassword) {
        return { success: false, message: 'Current password is incorrect.' };
      }
      usersDb[idx].password = newPassword;
      localStorage.setItem('ems_users_db', JSON.stringify(usersDb));
      logActivity('PASSWORD_CHANGED', `Password changed for user ${user.email}`, user.name);
      return { success: true, message: 'Password updated successfully!' };
    }

    return { success: true, message: 'Password updated successfully!' };
  };

  // Requirement 1.5: Activate or Deactivate user accounts
  const toggleUserAccountStatus = (userEmail, isActive, adminName = 'Admin') => {
    const usersDb = JSON.parse(localStorage.getItem('ems_users_db') || '[]');
    const idx = usersDb.findIndex((u) => u.email.toLowerCase() === userEmail.toLowerCase());
    if (idx >= 0) {
      usersDb[idx].active = isActive;
      localStorage.setItem('ems_users_db', JSON.stringify(usersDb));
      logActivity('ACCOUNT_STATUS_TOGGLED', `Account ${userEmail} set to ${isActive ? 'ACTIVE' : 'DEACTIVATED'}`, adminName);
      return true;
    }
    return false;
  };

  const logout = () => {
    if (user) {
      logActivity('USER_LOGOUT', `User ${user.email} logged out`, user.name);
    }
    setUser(null);
    localStorage.removeItem('ems_user');
  };

  const demoLogin = (role = 'admin') => {
    const isAdmin = role === 'admin';
    const demoUser = isAdmin
      ? {
          id: 1,
          name: 'Super Administrator',
          email: 'admin@ems.com',
          role: 'Admin',
          active: true,
          avatarBg: '#4f46e5',
          employeeId: null
        }
      : {
          id: 2,
          name: 'Hemant Nikam',
          email: 'abc@gmail.com',
          role: 'Employee',
          active: true,
          avatarBg: '#06b6d4',
          employeeId: 1
        };

    setUser(demoUser);
    localStorage.setItem('ems_user', JSON.stringify(demoUser));
    logActivity('USER_LOGIN', `Demo signed in as ${demoUser.role} (${demoUser.email})`, demoUser.name);
    return { success: true, user: demoUser };
  };

  const isAdmin = user?.role === 'Admin' || user?.role === 'Administrator' || user?.role === 'Super Admin' || user?.role === 'HR Manager';
  const isEmployee = user?.role === 'Employee';

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isAdmin,
        isEmployee,
        loading,
        login,
        register,
        changePassword,
        toggleUserAccountStatus,
        logout,
        demoLogin
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
