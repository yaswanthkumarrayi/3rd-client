import React, { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { FaTimesCircle, FaHome, FaCreditCard, FaPhone } from 'react-icons/fa';

const PaymentFailure = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const txnid = searchParams.get('txnid') || searchParams.get('order_id');
  const status = searchParams.get('status');
  const error = searchParams.get('error');
  const gateway = searchParams.get('gateway') || 'Razorpay';
  const message = searchParams.get('message');

  useEffect(() => {
    // You can add analytics tracking here
    console.log('Payment Failed:', { txnid, status, error, gateway, message });
  }, [txnid, status, error, gateway, message]);

  const commonFailureReasons = [
    'Insufficient funds in your account',
    'Card expired or invalid card details',
    'Transaction limit exceeded',
    'Bank server temporarily down',
    'Network connectivity issues'
  ];

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a52 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div style={{
        background: 'white',
        borderRadius: '20px',
        padding: '40px',
        maxWidth: '500px',
        width: '100%',
        textAlign: 'center',
        boxShadow: '0 20px 40px rgba(0,0,0,0.1)'
      }}>
        <div style={{
          fontSize: '80px',
          color: '#dc3545',
          marginBottom: '20px'
        }}>
          <FaTimesCircle />
        </div>

        <h1 style={{
          color: '#333',
          marginBottom: '10px',
          fontSize: '28px'
        }}>
          Payment Failed
        </h1>

        <p style={{
          color: '#666',
          marginBottom: '30px',
          fontSize: '16px'
        }}>
          We're sorry, but your payment could not be processed. Please try again.
        </p>

        {txnid && (
          <div style={{
            background: '#f8f9fa',
            border: '1px solid #e9ecef',
            borderRadius: '10px',
            padding: '20px',
            marginBottom: '30px'
          }}>
            <h3 style={{ color: '#333', marginBottom: '15px' }}>Transaction Details</h3>
            
            <div style={{ marginBottom: '10px' }}>
              <strong>Transaction ID:</strong>
              <div style={{
                background: '#e9ecef',
                padding: '8px 12px',
                borderRadius: '5px',
                fontFamily: 'monospace',
                fontSize: '14px',
                marginTop: '5px'
              }}>
                {txnid}
              </div>
            </div>

            <div style={{ marginBottom: '10px' }}>
              <strong>Status:</strong> {status || 'Failed'}
            </div>

            <div>
              <strong>Payment Gateway:</strong> {gateway}
            </div>

            {error && (
              <div style={{ marginTop: '10px' }}>
                <strong>Error:</strong> {error}
              </div>
            )}
          </div>
        )}

        <div style={{
          background: '#fff3cd',
          border: '1px solid #ffeaa7',
          borderRadius: '10px',
          padding: '20px',
          marginBottom: '30px',
          textAlign: 'left'
        }}>
          <h4 style={{ color: '#856404', marginBottom: '10px' }}>Common reasons for payment failure:</h4>
          <ul style={{ color: '#856404', paddingLeft: '20px' }}>
            {commonFailureReasons.map((reason, index) => (
              <li key={index} style={{ marginBottom: '5px' }}>{reason}</li>
            ))}
          </ul>
        </div>

        <div style={{
          display: 'flex',
          gap: '15px',
          justifyContent: 'center',
          flexWrap: 'wrap',
          marginBottom: '20px'
        }}>
          <button
            onClick={() => navigate('/payment')}
            style={{
              background: '#007bff',
              color: 'white',
              border: 'none',
              padding: '12px 24px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <FaCreditCard /> Try Again
          </button>

          <button
            onClick={() => navigate('/')}
            style={{
              background: '#6c757d',
              color: 'white',
              border: 'none',
              padding: '12px 24px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <FaHome /> Go to Home
          </button>
        </div>

        <div style={{
          padding: '15px',
          background: '#d1ecf1',
          border: '1px solid #bee5eb',
          borderRadius: '8px',
          color: '#0c5460'
        }}>
          <strong>Need Help?</strong>
          <p style={{ margin: '10px 0' }}>
            If you continue to face issues, please contact our support team.
          </p>
          <button
            onClick={() => window.open('https://wa.me/9704447158', '_blank')}
            style={{
              background: '#25D366',
              color: 'white',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              margin: '0 auto'
            }}
          >
            <FaPhone /> Contact Support
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentFailure;