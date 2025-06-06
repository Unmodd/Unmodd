import React, { useState } from 'react';

const getUserLevel = (shares) => {
  if (shares >= 20) return 'Gold';
  if (shares >= 10) return 'Silver';
  return 'Bronze';
};

const LeaderboardComponent = ({ users }) => {
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [showAll, setShowAll] = useState(false);


  const sortedUsers = [...users].sort((a, b) => b.reputation - a.reputation);


  const displayedUsers = showAll ? sortedUsers : sortedUsers.slice(0, 5);


  const podiumUsers = sortedUsers.slice(0, 3);

  return (
    <div className="leaderboard-container">
      <button
        className="view-leaderboard-btn"
        onClick={() => setShowLeaderboard(!showLeaderboard)}
      >
        {showLeaderboard ? 'Hide' : 'Top Alphas'}
      </button>

      {showLeaderboard && (
        <>
          {}
          <div className="podium">
            {podiumUsers.map((user, idx) => {
              let medalClass = '';
              if (idx === 0) medalClass = 'gold';
              else if (idx === 1) medalClass = 'silver';
              else if (idx === 2) medalClass = 'bronze';

              return (
                <div key={user.id} className={`podium-user ${medalClass}`}>
                  <div className="medal">{idx + 1}</div>
                  <img src={user.avatar} alt={user.name} className="podium-avatar" />
                  <div className="podium-name">{user.name}</div>
                  <div className="podium-reputation">Rep: {user.reputation}</div>
                  <div className="podium-level">Alpha: {getUserLevel(user.shares)}</div>
                </div>
              );
            })}
          </div>

          {}
          <div className={`leaderboard-table-wrapper ${showAll ? 'expanded' : ''}`}>
            <table className="leaderboard-table">
              <thead>
                <tr>
                  <th>Rank</th>
                  <th>Name</th>
                  <th>Hit Rate</th>
                  <th>Average ROI</th>
                  <th>Last Shared Token</th>
                  <th>Reputation</th>
                  <th>Alpha Level</th>
                </tr>
              </thead>
              <tbody>
                {displayedUsers.map((user, idx) => (
                  <tr key={user.id}>
                    <td>{idx + 1}</td>
                    <td className="user-cell">
                      <img src={user.avatar} alt={user.name} className="avatar-small" />
                      {user.name}
                    </td>
                    <td>{user.hitRate || '-'}</td>
                    <td>{user.avgROI || '-'}</td>
                    <td>{user.lastToken || '-'}</td>
                    <td>{user.reputation}</td>
                    <td>{getUserLevel(user.shares)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!showAll && <div className="fade-bottom"></div>}
          </div>

          <button className="expand-btn" onClick={() => setShowAll(!showAll)}>
            {showAll ? 'Show Less' : 'Show All'}
          </button>
        </>
      )}
    </div>
  );
};

export default LeaderboardComponent;
