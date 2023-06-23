import React, { useState,useRef,useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import TextField from '@mui/material/TextField';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import Link from '@mui/material/Link';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import { createTheme, ThemeProvider } from '@mui/material/styles';

function Login() {
    const [login, setLogin] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState();
    const navigate = useNavigate();
    const defaultTheme = createTheme();

    const handleLoginChange = (event) => {
        setLogin(event.target.value);
    };

    const handlePasswordChange = (event) => {
        setPassword(event.target.value);
    };

    const handleSubmit = (event) => {
        event.preventDefault();

        const formData = new FormData();
        formData.append('login', login);
        formData.append('password', password);

        axios.post('http://localhost:8080/login', formData)
            .then((response) => {
                if (response.status === 200) {
                //     response.data.chatRoomList.forEach((chat) => {
                //         const newChat = {
                //             id: chat.id,
                //             name: chat.name,
                //             icon: <Avatar />,
                //             messages: [],
                //         };
                //         const now = [...ref.current, newChat];
                //         ref.current = now;
                //         setChatRoomList(now);
                //     });
                //     console.log(ref.current);
                //     console.log(chatRoomList);
                    const state = {
                        login: login,
                        firstName:response.data.firstName,
                        lastName:response.data.lastName,
                        chatRoomList: response.data.chatRoomList,
                        userList:response.data.userList,
                        token: response.data.token,
                    };
                    console.log(state);
                    navigate("/chatRoom", {state});
                } else {
                    // Handle other error cases
                    setError('An error occurred during login. Please try again.');
                }
            })
            .catch((e) => {
                if (e.response.status === 404) {
                    setError(e.response.data.error);
                }else{
                    console.log("Error",e);
                    setError('Authentication failed')
                }
            });
    };
    function Copyright(props) {
        return (
            <Typography variant="body2" color="text.secondary" align="center" {...props}>
                {'Copyright © '}
                <Link color="inherit" href="https://mui.com/">
                    Chat Room
                </Link>{' '}
                {new Date().getFullYear()}
                {'.'}
            </Typography>
        );
    }
    return (
        <ThemeProvider theme={defaultTheme}>
            <Container component="main" maxWidth="xs">
                <CssBaseline />
                <Box
                    sx={{
                        marginTop: 8,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                    }}
                >
                    <Avatar sx={{ m: 1, bgcolor: 'secondary.main' }}>
                        <LockOutlinedIcon />
                    </Avatar>
                    <Typography component="h1" variant="h5">
                        Sign in
                    </Typography>
                    <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            id="login"
                            label="Email Address"
                            name="login"
                            autoComplete="email"
                            autoFocus
                            required
                            onChange={handleLoginChange}
                        />
                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            name="password"
                            label="Password"
                            type="password"
                            id="password"
                            autoComplete="current-password"
                            required
                            onChange={handlePasswordChange}
                        />
                        {/*<FormControlLabel*/}
                        {/*    control={<Checkbox value="remember" color="primary" />}*/}
                        {/*    label="Remember me"*/}
                        {/*/>*/}
                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            sx={{ mt: 3, mb: 2 }}
                        >
                            Sign In
                        </Button>
                        {error && (
                            <Typography component="p" variant="body2" color="error" align="center">
                                {error}
                            </Typography>
                        )}
                        <Grid container justifyContent="center">
                            <Grid item xs>
                                <Link href="/resetPwd" variant="body2">
                                    Forgot password?
                                </Link>
                            </Grid>
                            <Grid item>
                                <Link href="/register" variant="body2">
                                    Don't have an account? Sign Up
                                </Link>
                            </Grid>
                        </Grid>
                    </Box>
                </Box>
                <Copyright sx={{ mt: 8, mb: 4 }} />
            </Container>
        </ThemeProvider>
    );
}

export default Login;
