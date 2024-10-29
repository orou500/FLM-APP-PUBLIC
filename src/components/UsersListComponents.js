import React, { useState } from 'react';
import "../style/UsersListComponents.css";
import Pagination from './Pagination';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const UsersListComponents = ({ users, postsPerPageNumber, totalUsers }) => {
  const { auth } = useAuth(); // לוקח את פרטי המשתמש
  const [currentPage, setCurrentPage] = useState(1);
  
  const lastPostIndex = currentPage * postsPerPageNumber;
  const firstPostIndex = lastPostIndex - postsPerPageNumber;
  const currentUsers = users.slice(firstPostIndex, lastPostIndex);

  return (
    <div className='league-users'>
      <h2>משתתפים:</h2>
      <ul className="users-list">
        {currentUsers.map((user) => (
          user._id !== auth.id ?
          <Link to={`/users/${user._id}`} key={user._id} className="user-card">
            <div className="user-info">
              <span className="user-name">{`${user.firstName} ${user.lastName}`}</span>
            </div>
            <div className="user-info">
              <span className="user-email">{user.email}</span>
            </div>
          </Link> : 
          <Link to={`/profile`} key={user._id} className="user-card">
          <div className="user-info">
            <span className="user-name">{`${user.firstName} ${user.lastName}`}</span>
          </div>
          <div className="user-info">
            <span className="user-email">{user.email}</span>
          </div>
        </Link>
        ))}
      </ul>
      {totalUsers > postsPerPageNumber && (
        <Pagination
          totalPosts={totalUsers}
          postsPerPage={postsPerPageNumber}
          setCurrentPage={setCurrentPage}
          currentPage={currentPage}
        />
      )}
    </div>
  );
};

export default UsersListComponents;
