const LoginScreen = ({ onLogin }) => {
  const handleSubmit = (e) => {
    e.preventDefault();
    const username = e.target.username.value.trim();
    const password = e.target.password.value;
    
    if (password !== 'skibidi69420') {
      alert('Incorrect password!');
      return;
    }

    if (username) {
      onLogin(username);
    }
  };

  return (
    <div className="login-screen">
      <form onSubmit={handleSubmit}>
        <h2>Welcome to Chat</h2>
        <input
          type="text"
          name="username"
          placeholder="Enter your username"
          required
        />
        <input
          type="password"
          name="password"
          placeholder="Enter password"
          required
        />
        <button type="submit">Join Chat</button>
      </form>
    </div>
  );
};

export default LoginScreen; 