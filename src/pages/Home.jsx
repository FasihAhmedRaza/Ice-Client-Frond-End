import React from 'react';
import ChatInterface from '../components/ChatInterface';

const Home = () => {
    return (
        <div style={{ width: '100%', height: '100%', minHeight: 0, display: 'flex', flexDirection: 'column' }}>
            <ChatInterface />
        </div>
    );
};

export default Home;
