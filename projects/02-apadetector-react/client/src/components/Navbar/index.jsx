import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
    AppBar,
    Toolbar,
    Typography,
    Button,
    IconButton,
    Drawer,
    List,
    ListItem,
    ListItemText,
    useMediaQuery,
    useTheme
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import DescriptionIcon from '@mui/icons-material/Description';
import CloseIcon from '@mui/icons-material/Close';
import Box from '@mui/material/Box';

import './Navbar.css';

const Navbar = () => {
    const [mobileOpen, setMobileOpen] = React.useState(false);
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));

    const handleDrawerToggle = () => {
        setMobileOpen(!mobileOpen);
    };

    const menuItems = [
        { text: 'Inicio', path: '/' },
        { text: 'Analizar', path: '/analyze' },
        { text: 'Acerca de', path: '/about' },
        { text: 'Contacto', path: '/contact' },
    ];

    const drawer = (
        <div>
            <List>
                {menuItems.map((item) => (
                    <ListItem
                        button
                        key={item.text}
                        component={Link}
                        to={item.path}
                        onClick={handleDrawerToggle}
                    >
                        <ListItemText primary={item.text} />
                    </ListItem>
                ))}
            </List>
        </div>
    );

    return (
        <AppBar position="sticky" elevation={1} color="default">
            <Toolbar>
                <DescriptionIcon sx={{ mr: 1, color: 'primary.main' }} />
                <Typography
                    variant="h6"
                    component={Link}
                    to="/"
                    sx={{
                        flexGrow: 1,
                        textDecoration: 'none',
                        color: 'inherit',
                        fontWeight: 700,
                        '&:hover': {
                            color: 'primary.main'
                        }
                    }}
                >
                    APADetector
                </Typography>

                {isMobile ? (
                    <IconButton
                        color="inherit"
                        aria-label="open drawer"
                        edge="start"
                        onClick={handleDrawerToggle}
                    >
                        <MenuIcon />
                    </IconButton>
                ) : (
                    <Box>
                        {menuItems.map((item) => (
                            <Button
                                key={item.text}
                                color="inherit"
                                component={Link}
                                to={item.path}
                                sx={{
                                    mx: 1,
                                    '&:hover': {
                                        color: 'primary.main',
                                        backgroundColor: 'rgba(25, 118, 210, 0.04)'
                                    }
                                }}
                            >
                                {item.text}
                            </Button>
                        ))}
                    </Box>
                )}
            </Toolbar>

            <Drawer
                variant="temporary"
                anchor="right"
                open={mobileOpen}
                onClose={handleDrawerToggle}
                ModalProps={{
                    keepMounted: true, // Better open performance on mobile.
                }}
                sx={{
                    '& .MuiDrawer-paper': {
                        boxSizing: 'border-box',
                        width: 240,
                    },
                }}
            >
                {drawer}
            </Drawer>
        </AppBar>
    );
};


export default Navbar;