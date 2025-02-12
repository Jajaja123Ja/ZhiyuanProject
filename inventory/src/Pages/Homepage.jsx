import { useState, useEffect } from 'react';
import { Box, Typography, Container } from '@mui/material';
import HeroImage from "../assets/zhiyuan.jpg";
import Header from '../Components/Header';

const Homepage = () => {
    const [isTextLoaded, setIsTextLoaded] = useState(false);

    useEffect(() => {
        const textLoadTimeout = setTimeout(() => {
            setIsTextLoaded(true);
        }, 300);
        return () => clearTimeout(textLoadTimeout);
    }, []);

    return (
        <Box sx={{ width: '100%', height: '100vh', overflow: 'hidden', position: 'relative' }}>
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
                {/* Background Image */}
                <Box
                    sx={{
                        position: 'absolute',
                        width: '100%',
                        height: '100%',
                        backgroundImage: `url(${HeroImage})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        filter: 'brightness(0.7)',
                        zIndex: -1,
                    }}
                />

                {/* Gradient Overlay */}
                <Box
                    sx={{
                        position: 'absolute',
                        width: '100%',
                        height: '100%',
                        background: 'linear-gradient(to bottom, rgba(0,0,0,0.3), rgba(0,0,0,0.7))',
                        zIndex: -1,
                    }}
                />

                {/* Text Content */}
                <Container
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
                            mb: 2,
                            textShadow: '3px 3px 12px rgba(0, 0, 0, 0.6)',
                        }}
                    >
                        Explore Quality Products Across Sports and Beauty
                    </Typography>
                    <Typography
                        variant="h4"
                        component="h2"
                        sx={{
                            fontWeight: '300',
                            textShadow: '2px 2px 8px rgba(0, 0, 0, 0.5)',
                        }}
                    >
                        Your Trusted Source for Premium Imports
                    </Typography>
                </Container>
            </Box>
        </Box>
    );
};

export default Homepage;
