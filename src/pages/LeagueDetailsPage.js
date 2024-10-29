import React, { useEffect, useState } from 'react';
import '../style/LeagueDetailsPage.css';
import { Link, useParams } from 'react-router-dom';
import axios from '../api/axios';
import { useAuth } from '../hooks/useAuth';
import { Logo } from '../components/Logo';
import useLocalStorage from 'use-local-storage';
import { Footer } from '../components/Footer';
import Loding from './Loding';
import NotFound from './NotFound';
import UsersListComponents from '../components/UsersListComponents';
import LeagueTournamentsList from '../components/LeagueTournamentsList';
import LeagueLeaderboard from '../components/LeagueLeaderboard';

const LeagueDetailsPage = () => {
  const preference = window.matchMedia("(prefers-color-scheme: dark)").matches;
  const [isDark, setIsDark] = useLocalStorage("darkMode", preference);

  const { slug } = useParams();
  const { auth } = useAuth();
  const [league, setLeague] = useState(null);
  const [loading, setLoading] = useState(true);
  const [usersLength, setUsersLength] = useState(0)
  const [error, setError] = useState(null);
  const [isLeagueAdmin, setIsLeagueAdmin] = useState(false); // משתנה לבדוק אם המשתמש הוא מנהל הליגה
  const [tournamentType, setTournamentType] = useState('tournament1'); // state לבחירת סוג הטורניר

  useEffect(() => {
    const fetchLeagueDetails = async () => {
      const token = localStorage.getItem('token');
      try {
        const response = await axios.get(`/leagues/${slug}`, {
          id: slug,
          user: auth,
          headers: {
              'Content-Type': 'application/json',
              'Authorization': `${token}`,
          }
      });
      if(response.data){
        const token = response.data.token;
        localStorage.setItem('token', token);
        setLeague(response.data.league);
      }
      } catch (err) {
        setError('שגיאה באחזור פרטי הליגה');
      } finally {
        setLoading(false);
      }
    };

    fetchLeagueDetails();
  }, [slug, auth]);

   useEffect(() => {
    if(league){
      setUsersLength(league.users.length)
      if (auth.admin || league.adminsId.includes(auth.id)) {
        setIsLeagueAdmin(true); // המשתמש הוא מנהל כללי או מנהל הליגה
      }
    }
  }, [league, auth]);


  if (loading) return <Loding />;
  if (error) return <NotFound />

  if (!league) return <div>ליגה לא נמצאה</div>;

  return (
    <div className='league-details-page' data-theme={isDark ? "dark" : "light"}>
      <Logo 
        isChecked={isDark}
        handleChange={() => setIsDark(!isDark)}
        auth={auth}
      />
      <div className='league-details-body'>
        <div className="league-details">
          <div className='league-header '>
            <h1>{league.title}</h1>
            <p>תיאור: {league.description || 'אין תיאור זמין'}</p>
            {isLeagueAdmin && (
              <div className='btn-box'>
                <Link to={`/edit/leagues/${slug}`}>
                  <button className='btn btn-cancel'>עריכה</button>
                </Link>

                <Link to={`/${slug}/${tournamentType === 'tournament1' ? 'createtournament' : 'createknockoutbracket'}`}>
                  <button className='btn btn-submit'>{tournamentType === 'tournament1' ? 'הוסף טורניר' : 'הוסף טורניר נוקאאוט'}</button>
                </Link>

                <select
                  value={tournamentType}
                  onChange={(e) => setTournamentType(e.target.value)}
                  className="tournament-select"
                >
                  <option value="tournament1">הוסף טורניר</option>
                  <option value="tournament2">הוסף טורניר נוקאאוט</option>
                </select>
              </div>
            )}
          </div>
          <div  className="league-stats">
            <div className="stat-box">
              <span className="stat-number">{league.tournamentsCount}</span>
              <span className="stat-label">משחקים</span>
            </div>
            <div className="stat-box">
              <span className="stat-number">{league.usersCount}</span>
              <span className="stat-label">שחקנים</span>
            </div>
            <div className="stat-box">
              <span className="stat-number">{new Date(league.createdAt).toLocaleDateString()}</span>
              <span className="stat-label">תאריך יצירה</span>
            </div>
          </div>
          <LeagueLeaderboard users={league.users} postsPerPageNumber={3} totalUsers={usersLength}/>
          <UsersListComponents users={league.users} postsPerPageNumber={3} totalUsers={usersLength} />
          <LeagueTournamentsList tournaments={league.tournaments} postsPerPageNumber={3} totalTournaments={league.tournaments.length} leagueSlug={slug} league={league} setLeague={setLeague} />
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default LeagueDetailsPage;
