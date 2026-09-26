import React, { useEffect, useState } from 'react';
import { Spin } from 'antd';
import MainLayout from '../../components/layout';
import ApiService from '../../utils/apiService';
import { setSessionUserAndToken } from '../../utils/authentication';

function GoogleSuccess() {
  const [message, setMessage] = useState('Completing Google sign in...');

  useEffect(() => {
    const exchangeCode = async () => {
      try {
        const params = new URLSearchParams(window.location.search);
        const code = params.get('code');

        if (!code) {
          setMessage('Google sign in failed. Authorization code is missing.');
          return;
        }

        const response = await ApiService.post(
          '/api/v1/auth/google/exchange',
          { code }
        );

        if (response?.result_code === 0) {
          setSessionUserAndToken(
            response?.result?.data,
            response?.access_token,
            response?.refresh_token
          );

          window.location.href = '/profile?tab=my-profile';
          return;
        }

        setMessage(
          response?.result?.error?.message ||
          'Google sign in failed.'
        );
      } catch (error) {
        setMessage(
          error?.response?.data?.result?.error?.message ||
          'Unable to complete Google sign in.'
        );
      }
    };

    exchangeCode();
  }, []);

  return (
    <MainLayout title='Beach Resort ― Google Sign In'>
      <div
        style={{
          width: '400px',
          height: 'calc(100vh - 205px)',
          margin: '0 auto',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center'
        }}
      >
        <Spin size='large' />
        <p style={{ marginTop: '20px' }}>{message}</p>
      </div>
    </MainLayout>
  );
}

export default GoogleSuccess;