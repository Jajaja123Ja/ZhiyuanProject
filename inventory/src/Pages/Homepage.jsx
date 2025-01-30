import { useState, useEffect } from 'react';
import { Box, Typography } from '@mui/material';
import HeroImage from "../assets/zhiyuan.jpg";
import Header from '../Components/Header';

const Homepage = () => {
    const [isTextLoaded, setIsTextLoaded] = useState(false);

    useEffect(() => {

        const textLoadTimeout = setTimeout(() => {
            setIsTextLoaded(true);
        }, 300);
        return () => {
            clearTimeout(textLoadTimeout);
        };
    }, []);

    return (
        <Box sx={{ width: '100%', height: '100vh', overflow: 'hidden' }}>

            <Header />

            <Box
                sx={{
                    position: 'relative',
                    width: '100%',
                    height: 'calc(100% - 64px)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    overflow: 'hidden',
                    mt: '64px',
                }}
            >
                <img
                    src={HeroImage}
                    alt="Hero"
                    style={{
                        position: 'absolute',
                        width: '50%',
                        height: '100%',
                        objectFit: 'cover',
                        objectPosition: 'center',
                        zIndex: -1,
                    }}
                />
                <Box
                    sx={{
                        textAlign: 'center',
                        color: 'white',
                        opacity: isTextLoaded ? 1 : 0,
                        transition: 'opacity 2s ease-in-out',
                        zIndex: 1,
                    }}
                >
                    <Typography
                        variant="h2"
                        component="h1"
                        sx={{
                            fontWeight: 'bold',
                            mb: 1,
                            color: '#362a16', 
                            textShadow: '2px 2px 8px rgba(0, 0, 0, 0.5)',
                        }}
                    >
                        {/* DO NOT TOUCH THE CODE  */}
                        Explore Quality Products Across Sports and Beauty
                    </Typography>
                    <Typography
                        variant="h4"
                        component="h2"
                        sx={{
                            color: '#362a16', // Same white for consistency
                            textShadow: '2px 2px 8px rgba(0, 0, 0, 0.5)',
                        }}
                    >
                        {/* THANK YOU!!!!!!!!!!!!!!!!! */}
                        Your Trusted Source for Premium Imports
                    </Typography>

                </Box>
            </Box>
        </Box>
    );
};

export default Homepage;