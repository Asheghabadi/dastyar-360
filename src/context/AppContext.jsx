import React, { createContext, useState, useContext, useEffect } from 'react';
import { login as apiLogin, getCurrentUser } from '../api';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
    const [currentEnterpriseId, setCurrentEnterpriseId] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('dastyar_token'));
    const [user, setUser] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        const verifyToken = async () => {
            if (token) {
                try {
                    const currentUser = await getCurrentUser(token);
                    setUser(currentUser);
                    setIsAuthenticated(true);
                    if(currentUser.enterprise_id) {
                        setCurrentEnterpriseId(currentUser.enterprise_id);
                    }
                } catch (error) {
                    console.error("Session expired or token is invalid.", error);
                    // Token is invalid, so clear it
                    localStorage.removeItem('dastyar_token');
                    setToken(null);
                    setUser(null);
                    setIsAuthenticated(false);
                }
            } else {
                setIsAuthenticated(false);
            }
        };

        verifyToken();
    }, [token]);

    const login = async (email, password) => {
        const response = await apiLogin(email, password);
        const new_token = response.access_token;
        localStorage.setItem('dastyar_token', new_token);
        setToken(new_token);
    };

    const logout = () => {
        localStorage.removeItem('dastyar_token');
        setToken(null);
        setUser(null);
        setIsAuthenticated(false);
        setCurrentEnterpriseId(null);
    };

    const value = {
        currentEnterpriseId,
        setCurrentEnterpriseId,
        token,
        user,
        isAuthenticated,
        login,
        logout
    };

    return (
        <AppContext.Provider value={value}>
            {children}
        </AppContext.Provider>
    );
};

export const useAppContext = () => useContext(AppContext);
