import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';

function Register() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [password2, setPassword2] = useState('');
  const [error, setError] = useState('');
  const [formErrors, setFormErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isPassword2Visible, setIsPassword2Visible] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setFormErrors({});
    setLoading(true);

    if (password !== password2) {
      setError('Registration Failed.');
      setFormErrors({ password2: 'Passwords do not match.' });
      return;
    }

    const result = await register(username, email, password, password2);

    if (result.success) {
      navigate('/home');
    } else {
      setError(result.error || 'Registration failed.');
      setFormErrors(result.errors);
    }

    setLoading(false);
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>Register</h1>
        <form onSubmit={handleSubmit} style={styles.form}>
          {error && <div style={styles.error}>{error}</div>}

          <div style={styles.inputGroup}>
            <label htmlFor='username' style={styles.label}>
              Username
            </label>
            <input
              id='username'
              type='text'
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              style={styles.input}
              placeholder='Enter your username'
            />
            {formErrors.username && <p style={styles.error}>{formErrors.username}</p>}
          </div>

          <div style={styles.inputGroup}>
            <label htmlFor='email' style={styles.label}>
              Email
            </label>
            <input
              id='email'
              type='email'
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={styles.input}
              placeholder='Enter your email'
            />
            {formErrors.email && <p style={styles.error}>{formErrors.email}</p>}
          </div>

          <div style={styles.inputGroup}>
            <label htmlFor='password' style={styles.label}>
              Password
            </label>
            <div style={styles.showInput}>
              <input
                id='password'
                type={isPasswordVisible ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={styles.input}
                placeholder='Enter your password'
              />
              <button
                type='button'
                style={styles.showButton}
                onClick={(e) => {
                  e.preventDefault();
                  setIsPasswordVisible((prev) => !prev);
                }}
              >
                {isPasswordVisible ? 'hide' : 'show'}
              </button>
            </div>
            {formErrors.password && <p style={styles.error}>{formErrors.password}</p>}
          </div>

          <div style={styles.inputGroup}>
            <label htmlFor='password2' style={styles.label}>
              Verify Password
            </label>
            <div style={styles.showInput}>
              <input
                id='password2'
                type={isPassword2Visible ? 'text' : 'password'}
                value={password2}
                onChange={(e) => setPassword2(e.target.value)}
                required
                style={styles.input}
                placeholder='Verify Password'
              />
              <button
                type='button'
                style={styles.showButton}
                onClick={(e) => {
                  e.preventDefault();
                  setIsPassword2Visible((prev) => !prev);
                }}
              >
                {isPassword2Visible ? 'hide' : 'show'}
              </button>
            </div>
            {formErrors.password2 && <p style={styles.error}>{formErrors.password2}</p>}
          </div>

          <button type='submit' disabled={loading} style={styles.button}>
            {loading ? 'Registering...' : 'Register'}
          </button>
        </form>
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    backgroundColor: '#f5f5f5',
  },
  card: {
    backgroundColor: 'white',
    padding: '2rem',
    borderRadius: '8px',
    boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
    width: '100%',
    maxWidth: '400px',
  },
  title: {
    marginBottom: '1.5rem',
    fontSize: '2rem',
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  label: {
    fontSize: '0.9rem',
    fontWeight: '500',
    color: '#555',
  },
  showButton: {
    position: 'absolute',
    right: '0.75rem',
    top: '50%',
    transform: 'translateY(-50%)',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    fontWeight: '500',
    color: '#007bff',
    padding: 0,
  },
  showInput: {
    position: 'relative', // make the container relative
    width: '100%',
  },
  input: {
    width: '100%',
    boxSizing: 'border-box',
    padding: '0.75rem 3rem 0.75rem 0.75rem', // 👈 KEY FIX
    fontSize: '1rem',
    border: '1px solid #ddd',
    borderRadius: '4px',
    outline: 'none',
    transition: 'border-color 0.2s',
  },
  inputFocus: {
    borderColor: '#007bff',
  },
  button: {
    padding: '0.75rem',
    fontSize: '1rem',
    fontWeight: '600',
    color: 'white',
    backgroundColor: '#007bff',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    marginTop: '0.5rem',
    transition: 'background-color 0.2s',
  },
  buttonHover: {
    backgroundColor: '#0056b3',
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
    cursor: 'not-allowed',
  },
  error: {
    padding: '0.75rem',
    backgroundColor: '#fee',
    color: '#c33',
    borderRadius: '4px',
    fontSize: '0.9rem',
  },
};

export default Register;
