
import React, { useEffect, useState } from 'react';
import './UserDock.css';

const UserDock = ({ currentUserId, onSelectUser }) => {
  const [users, setUsers] = useState([]);

  useEffect(() => {

    const fetchUsers = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/users');
        const data = await response.json();

        const filteredUsers = data.filter(user => user._id !== currentUserId);
        setUsers(filteredUsers);
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };

    fetchUsers();
  }, [currentUserId]);

  return (
    <div className="user-dock">
      {users.map(user => (
        <div
          key={user._id}
          className="user-item"
          onClick={() => onSelectUser(user)}
        >
          <img src={user.avatar || '/default-avatar.png'} alt={user.name} />
          <span>{user.name}</span>
        </div>
      ))}
    </div>
    
  );
};

export default UserDock;
