import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from 'react-router-dom';

const ResetPwd = () => {
    const [login, setLogin] = useState('');
    const [oldPassword, setOldPassword] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loginError, setLoginError] = useState('');
    const [oldPwdError, setOldPwdError] = useState('');
    const [pwdError, setPwdError] = useState('');
    const [conPwdError, setConPwdError] = useState('');
    const [error, setError] = useState('');

    const handleChangeLogin = (e) => {
        const value = e.target.value;
        setLogin(value);
        if (!value) {
            setLoginError('The login is required and cannot be empty');
        }else {
            setLoginError('');
        }
    };
    const handleChangeOldPwd = (e) => {
        const value = e.target.value;
        setOldPassword(value);
        if (!value) {
            setOldPwdError('The old password is required and cannot be empty');
        }else {
            setOldPwdError('');
        }
    };
    const handleChangePwd = (e) => {
        const value = e.target.value;
        setPassword(value);
        const reg = /^(?:(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])|(?=.*[A-Z])(?=.*[a-z])(?=.*[^A-Za-z0-9])|(?=.*[A-Z])(?=.*[0-9])(?=.*[^A-Za-z0-9])|(?=.*[a-z])(?=.*[0-9])(?=.*[^A-Za-z0-9])).{6,30}$/;
        if (!value) {
            setPwdError('The password is required and cannot be empty');
        } else if (!reg.test(value)) {
            setPwdError('The password should be 6 to 30 digits in length and should contain numbers, lowercase letters, uppercase letters, and symbols (at least three)');
        } else {
            setPwdError('');
        }
    };

    const handleChangeConPwd = (e) => {
        const value = e.target.value;
        setConfirmPassword(value);
        if (!value) {
            setConPwdError('The password is required and cannot be empty');
        } else if (value !== password) {
            setConPwdError('The password does not match');
        } else {
            setConPwdError('');
        }
    };

    const navigate = useNavigate();
    const handleSubmit = async (event) => {
        event.preventDefault();
        if (isValid()) {
            try {
                const userFormData = new FormData();
                userFormData.append('login', login);
                userFormData.append('oldPassword', oldPassword);
                userFormData.append('newPassword', password);
                const response = await axios.put("http://localhost:8080/resetPwd", userFormData);
                console.log(response);
                if (response.status === 200) {
                    navigate('/login');
                }
            } catch (error) {
                if (error.response && error.response.status === 404) {
                    setError('Invalid user or old password');
                } else {
                    console.log(error);
                }
            }
        } else {
            setError('Invalid form');
        }
    };

    const isValid = () => {
        return !pwdError && !conPwdError;
    };

    const errorStyle = {
        color: 'red',
        fontSize: '14px',
        marginTop: '5px'
    };

    return (
        <div className="container">
            <h3>Reset Password</h3>
            {error && <span style={errorStyle}>{error}</span>}
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label htmlFor="login">E-mail:</label>
                    <input
                        type="text"
                        className="form-control"
                        id="login"
                        name="login"
                        value={login}
                        onChange={handleChangeLogin}
                        required
                    />
                    {loginError && <span style={errorStyle}>{loginError}</span>}
                </div>
                <div className="form-group">
                    <label htmlFor="oldPassword">Old Password:</label>
                    <input
                        type="password"
                        className="form-control"
                        id="oldPassword"
                        name="oldPassword"
                        value={oldPassword}
                        onChange={handleChangeOldPwd}
                        required
                    />
                    {oldPwdError && <span style={errorStyle}>{oldPwdError}</span>}
                </div>
                <div className="form-group">
                    <label htmlFor="password">New Password:</label>
                    <input
                        type="password"
                        className="form-control"
                        id="password"
                        name="password"
                        value={password}
                        onChange={handleChangePwd}
                        required
                    />
                    {pwdError && <span style={errorStyle}>{pwdError}</span>}
                </div>

                <div className="form-group">
                    <label htmlFor="confirmPassword">Confirm New Password:</label>
                    <input
                        type="password"
                        className="form-control"
                        id="confirmPassword"
                        name="confirmPassword"
                        value={confirmPassword}
                        onChange={handleChangeConPwd}
                        required
                    />
                    {conPwdError && <span style={errorStyle}>{conPwdError}</span>}
                </div>

                <button type="submit" className="btn btn-primary">
                    Reset Password
                </button>
            </form>
        </div>
    );
};

export default ResetPwd;
