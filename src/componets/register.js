import React, { useState} from "react";
import axios from "axios";
import { useNavigate } from 'react-router-dom';

const Register = () => {
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [login, setLogin] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [gender, setGender] = useState('');
    const [admin, setAdmin] = useState(false);

    const [fnError, setFnError] = useState('');
    const [lnError, setLnError] = useState('');
    const [loginError, setLoginError] = useState('');
    const [pwdError, setPwdError] = useState('');
    const [conPwdError, setConPwdError] = useState('');
    const [genderError, setGenderError] = useState('The gender is required and cannot be empty');
    const [adminError, setAdminError] = useState('');

    const [error, setError] = useState('');
    const handleChangeFirstName = (e) => {
        const value = e.target.value;
        const capitalizedData = value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
        setFirstName(capitalizedData);
        const reg = /^[A-Z][a-zA-Z]*$/;
        if (!capitalizedData) {
            setFnError('The first name is required and cannot be empty');
        }else if (!reg.test(capitalizedData)) {
            setFnError('The first name must to be written in English');
        }else{
            setFnError('');
        }
    };

    const handleChangeLastName = (e) => {
        const value = e.target.value.toUpperCase();
        setLastName(value);
        const reg = /^[A-Z]+$/;
            if (!value) {
                setLnError('The last name is required and cannot be empty');
            }else if (!reg.test(value)) {
                setLnError('The last name must to be written in English');
            }else{
                setLnError('');
            }
    };
    const handleChangeLogin = (e) => {
        const value = e.target.value;
        setLogin(value);
        const reg = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
        if (!value) {
            setLoginError('The email address is required and cannot be empty');
        }else if (!reg.test(value)) {
            setLoginError('The email address is in the wrong format');
        }else{
            setLoginError('');
        }
    };

    const handleChangePwd = (e) => {
        const value = e.target.value;
        setPassword(value);
        const reg = /^(?:(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])|(?=.*[A-Z])(?=.*[a-z])(?=.*[^A-Za-z0-9])|(?=.*[A-Z])(?=.*[0-9])(?=.*[^A-Za-z0-9])|(?=.*[a-z])(?=.*[0-9])(?=.*[^A-Za-z0-9])).{6,30}$/;
        if (!value) {
            setPwdError('The password is required and cannot be empty');
        }else if (!reg.test(value)) {
            setPwdError('The password should be 6 to 30 digits in length and should contain numbers, lowercase letters, uppercase letters, and symbols (at least three)');
        }else{
            setPwdError('');
        }
    };
    const handleChangeConPwd = (e) => {
        const value = e.target.value;
        setConfirmPassword(value);
        if (!value) {
            setConPwdError('The password is required and cannot be empty');
        }else if (value !== password) {
            setConPwdError('The password does not match twice');
        }else{
            setConPwdError('');
        }
    };

    const handleChangeGender = (e) => {
        const value = e.target.value;
        setGender(value);
        if (!value) {
            setGenderError('The gender is required and cannot be empty');
        }else{
            setGenderError('');
        }
    };

    const handleChangeAdmin = (e) => {
        const value = e.target.value;
        setAdmin(value);
        if (!value) {
            setAdminError('The admin is required and cannot be empty');
        }else{
            setAdminError('');
        }
    };


    const navigate = useNavigate();
    const handleSubmit = async (event) => {
        event.preventDefault();
        if (isValid()) {
            try {
                const userFormData = new FormData();
                userFormData.append('lastName', lastName);
                userFormData.append('firstName', firstName);
                userFormData.append('login', login);
                userFormData.append('admin', admin);
                userFormData.append('gender', gender);
                userFormData.append('password', password);
                const response = await axios.post("http://localhost:8080/register", userFormData);
                console.log(response);
                if (response.status === 200) {
                    navigate('/login');
                } else if (response.status === 404) {
                    setError('Registration failed');
                    navigate('/register');
                }
            } catch (error) {
                console.log(error);
            }
        }else{
            setError('Invalid form')
        }
    };

    const isValid = () =>{
        let valid = false;
        if (!fnError && !lnError && !pwdError && !conPwdError && !loginError && !genderError && !adminError){
            valid = true;
        }
        return valid
    }

    const errorStyle = {
        color: 'red',
        fontSize: '14px',
        marginTop: '5px'
    };

    return (
        <div className="container">
            <h3>Register</h3>
            {error && <span style={errorStyle}>{error}</span>}
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label htmlFor="firstName">First Name:</label>
                    <input
                        type="text"
                        className="form-control"
                        id="firstName"
                        name="firstName"
                        value={firstName}
                        onChange={(e)=>handleChangeFirstName(e)}
                        required
                    />
                    {fnError && <span style={errorStyle}>{fnError}</span>}
                </div>

                <div className="form-group">
                    <label htmlFor="lastName">Last Name:</label>
                    <input
                        type="text"
                        className="form-control"
                        id="lastName"
                        name="lastName"
                        value={lastName}
                        onChange={(e)=>handleChangeLastName(e)}
                        required
                    />
                    {lnError && <span style={errorStyle}>{lnError}</span>}
                </div>

                <div className="form-group">
                    <label htmlFor="login">E-mail:</label>
                    <input
                        type="text"
                        className="form-control"
                        id="login"
                        name="login"
                        value={login}
                        onChange={(e)=>handleChangeLogin(e)}
                        required
                    />
                    {loginError && <span style={errorStyle}>{loginError}</span>}
                </div>

                <div className="form-group">
                    <label htmlFor="password">Password:</label>
                    <input
                        type="password"
                        className="form-control"
                        id="password"
                        name="password"
                        value={password}
                        onChange={(e)=>handleChangePwd(e)}
                        required
                    />
                    {pwdError && <span style={errorStyle}>{pwdError}</span>}
                </div>

                <div className="form-group">
                    <label htmlFor="confirmPassword">Confirm your password:</label>
                    <input
                        type="Password"
                        className="form-control"
                        id="confirmPassword"
                        name="confirmPassword"
                        value={confirmPassword}
                        onChange={(e)=>handleChangeConPwd(e)}
                        required
                    />
                    {conPwdError&& <span style={errorStyle}>{conPwdError}</span>}
                </div>

                <div className="form-group">
                    <label htmlFor="gender">Gender:</label>
                    <select
                        className="form-control"
                        id="gender"
                        name="gender"
                        value={gender}
                        onChange={(e)=>handleChangeGender(e)}
                        required
                    >
                        <option value="">Choose...</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                    </select>
                    {genderError && <span style={errorStyle}>{genderError}</span>}
                </div>

                <div className="form-group">
                    <label htmlFor="admin">Admin:</label>
                    <select
                        className="form-control"
                        id="admin"
                        name="admin"
                        value={admin}
                        onChange={(e)=>handleChangeAdmin(e)}
                        required
                    >
                        <option value="">Choose...</option>
                        <option value="1">Yes</option>
                        <option value="0">No</option>
                    </select>
                    {adminError && <span style={errorStyle}>{adminError}</span>}
                </div>
                <button type="submit" className="btn btn-primary">
                    Register
                </button>
            </form>
        </div>
    );
};

export default Register;
