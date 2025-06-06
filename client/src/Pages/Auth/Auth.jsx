import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';

import './Auth.css';
import icon from '../../assets/icon.png';
import { signup, login } from '../../actions/auth';


const Auth = () => {
    const [isSignup, setIsSignup] = useState(false);
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [username, setUsername] = useState("");
    const [referralCode, setReferralCode] = useState("");

    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const refCode = params.get('ref');
        if (refCode) {
            setReferralCode(refCode);
            setIsSignup(true);
        }
    }, [location.search]);

    const handleSwitch = () => {
        setIsSignup(!isSignup);
        setName('');
        setEmail('');
        setPassword('');
        setUsername('');
        setReferralCode('');
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!email && !password) {
            alert('Enter email and password');
            return;
        }
        if (isSignup) {
            if (!name) {
                alert("Enter a name to continue");
                return;
            }
            if (!username || username.trim() === '') {
                alert("Enter a username to continue");
                return;
            }
            dispatch(signup({ name, email, password, username, referralCode }, navigate));
        } else {
            dispatch(login({ email, password }, navigate));
        }
    };

    return (
        <section className='auth-section'>
            <div className='auth-container-2'>
                <img src={icon} alt='Unmodd Logo' width="100" height="120" className='login-logo' />
                <form onSubmit={handleSubmit}>
                    {isSignup && (
                        <label htmlFor='name'>
                            <h4>Display Name</h4>
                            <input
                                type="text"
                                id='name'
                                name='name'
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                            />
                        </label>
                    )}
                    {isSignup && (
                        <label htmlFor='username'>
                            <h4>Username</h4>
                            <input
                                type="text"
                                id='username'
                                name='username'
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                            />
                        </label>
                    )}
                    <label htmlFor="email">
                        <h4>Email</h4>
                        <input
                            type="email"
                            name='email'
                            id='email'
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </label>
                    <label htmlFor="password">
                        <div className="password-header"> {}
                            <h4>Password</h4>
                        </div>
                        <input
                            type="password"
                            name='password'
                            id='password'
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                        {isSignup && (
                            <p className="input-hint"> {}
                                Password must contain at least eight<br />characters, including at least 1 letter and 1<br /> number.
                            </p>
                        )}
                    </label>

                    {isSignup && (
                        <label htmlFor='referralCode'>
                            <h4>Referral Code (Optional)</h4>
                            <input
                                type="text"
                                id='referralCode'
                                name='referralCode'
                                value={referralCode}
                                onChange={(e) => setReferralCode(e.target.value)}
                                placeholder="Enter referrer's code"
                            />
                        </label>
                    )}

                    {isSignup && (
                        <label htmlFor='check' className="mid"> {}
                            <input type="checkbox" id='check' />
                            <span className="checkbox-text"> {}
                                Opt-in to receive occasional,<br />website updates, trending projects,<br />latest announcements.
                            </span>
                        </label>
                    )}

                    <button type='submit' className='auth-btn'>
                        {isSignup ? 'Sign Up' : 'Log in'}
                    </button>

                    {isSignup && (
                        <p className="terms-privacy-text"> {}
                            By clicking "Sign up", you agree to our
                            <span className="inline-link"> Terms of<br /> service</span>,
                            <span className="inline-link"> Privacy policy</span> and
                            <span className="inline-link"> Cookie policy</span>
                        </p>
                    )}
                </form>
                <p className="switch-prompt"> {}
                    {isSignup ? 'Already have an account?' : "Don't have an account?"}
                    <button type='button' className='handle-switch-btn' onClick={handleSwitch}>
                        {isSignup ? 'Log in' : 'Sign up'}
                    </button>
                </p>
            </div>
        </section>
    );
};

export default Auth;