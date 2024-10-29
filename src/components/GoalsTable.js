// GoalsTable.js
import React from 'react';
import '../style/GoalsTable.css';


const GoalsTable = ({ playerGoals }) => {
    const sortedPlayerGoals = [...playerGoals].sort((a, b) => b.goals - a.goals);

  return (
    <div className="player-goals-table">
        <table>
            <thead>
                <tr>
                    <th>שחקן</th>
                    <th>שערים</th>
                </tr>
            </thead>
            <tbody>
                {sortedPlayerGoals.map((player, index) => (
                    <tr key={index}>
                        <td>{player.name}</td>
                        <td>{player.goals}</td>
                    </tr>
                ))}
            </tbody>
        </table>
    </div>
  );
};

export default GoalsTable;
