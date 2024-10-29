import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import axios from '../api/axios';
import "../style/TournamentDetailsPage.css";
import Loding from './Loding';
import NotFound from './NotFound';
import { useAuth } from '../hooks/useAuth';
import useLocalStorage from 'use-local-storage';
import { Logo } from '../components/Logo';
import { Footer } from '../components/Footer';
import UsersListComponents from '../components/UsersListComponents';
import { LuMedal, LuTrophy } from "react-icons/lu";
import { PiSoccerBallDuotone } from "react-icons/pi";
import { useToast } from '../context/ToastContext';
import TournamentBracket from '../components/TournamentBracket';
import GoalsTable from '../components/GoalsTable';
import Slider from "react-slick"; // ייבוא של קרוסלה

const TournamentDetailsPage = () => {
    const preference = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const [isDark, setIsDark] = useLocalStorage("darkMode", preference);
    const { auth } = useAuth(); // וודא ש-auth מחזיר את המידע על המשתמש
    const { addToast } = useToast();
    const { leagueSlug, tournamentSlug } = useParams();
    const [tournament, setTournament] = useState(null);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchTournament = async () => {
            const token = localStorage.getItem('token');
            try {
                const response = await axios.get(`/leagues/${leagueSlug}/tournaments/${tournamentSlug}`, {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `${token}`,
                    }
                });
                setTournament(response.data.tournament);
                setIsLoading(false);
            } catch (err) {
                addToast({ id: Date.now(), message: `${err}`, type: 'error' });
                setError('שגיאה בטעינת נתוני המשחק');
                setIsLoading(false);
            }
        };
        fetchTournament();
    }, [leagueSlug, tournamentSlug, addToast]);

    if (isLoading) {
        return <Loding />;
    }

    if (error) {
        return <NotFound />;
    }

    const stageNames = ['שמינית גמר', 'רבע גמר', 'חצי גמר', 'גמר'];
    // קביעת האינדקס של השלב הראשון שמלא
    const currentStageIndex = tournament.tournamentData.findIndex(stage => stage.length > 0);
    // אם לא נמצא שלב שמלא, קבע את האינדקס האחרון
    const knockoutIndex = currentStageIndex >= 0 ? currentStageIndex : stageNames.length - 1;
    // קביעת ה-availableStages
    const availableStages = stageNames.slice(knockoutIndex);

    const sliderSettings = {
        dots: true,
        infinite: true,
        speed: 500,
        slidesToShow: 1,
        slidesToScroll: 1,
        autoplay: true,
        autoplaySpeed: 3000,
    };


    return (
        <div className='tournament-details-page' data-theme={isDark ? "dark" : "light"}>
            <Logo 
                isChecked={isDark}
                handleChange={() => setIsDark(!isDark)}   
                auth={auth}
            />
            <div className="tournament-details-body">
                {tournament ? (
                    <>
                        <div className="tournament-details-container">
                            <h2>{tournament.title}</h2>
                            <p>תאריך: {new Date(tournament.createdAt).toLocaleDateString()}</p>

                            {tournament.images && tournament.images.length > 0 && (
                                <div className='tournament-images'>
                                    <h3>תמונות מהטורניר:</h3>
                                    <Slider {...sliderSettings}>
                                        {tournament.images.map((image, index) => (
                                            <div key={index}>
                                                <img src={image} alt={`${tournament.title} ${index + 1}`} className='tournament-image' />
                                            </div>
                                        ))}
                                    </Slider>
                                </div>
                            )}
                            <div className='details-container'>
                                {/* בדיקת המשתמש הנוכחי */}
                                <p><LuTrophy className='icon first-place' /> מקום ראשון <LuTrophy className='icon first-place' /></p>
                                {auth.id === tournament.firstPlace._id ? (
                                    <Link to="/profile" key={ tournament.KOG._id + ' firstPlace'}>
                                        {tournament.firstPlace.firstName} {tournament.firstPlace.lastName}
                                    </Link>
                                ) : (
                                    <Link to={`/users/${tournament.firstPlace._id}`} key={ tournament.KOG._id + ' firstPlace'}>
                                        {tournament.firstPlace.firstName} {tournament.firstPlace.lastName}
                                    </Link>
                                )}

                                <p><LuMedal className='icon second-place'/> מקום שני <LuMedal className='icon second-place'/></p>
                                {auth.id === tournament.secondPlace._id ? (
                                    <Link to="/profile" key={ tournament.KOG._id + ' secondPlace'}>
                                        {tournament.secondPlace.firstName} {tournament.secondPlace.lastName}
                                    </Link>
                                ) : (
                                    <Link to={`/users/${tournament.secondPlace._id}`} key={ tournament.KOG._id + ' secondPlace'}>
                                        {tournament.secondPlace.firstName} {tournament.secondPlace.lastName}
                                    </Link>
                                )}

                                <p><PiSoccerBallDuotone className='icon kog'/> מלך השערים <PiSoccerBallDuotone className='icon kog'/></p>
                                {auth.id === tournament.KOG._id ? (
                                    <Link to="/profile"  key={ tournament.KOG._id + ' KOG'}>
                                        {tournament.KOG.firstName} {tournament.KOG.lastName}
                                    </Link>
                                ) : (
                                    <Link to={`/users/${tournament.KOG._id}`} key={tournament.KOG._id + ' KOG'}>
                                        {tournament.KOG.firstName} {tournament.KOG.lastName}
                                    </Link>
                                )}
                            </div>


                            {/* רשימת המשתתפים */}
                            <div className='dif-background'>
                                <UsersListComponents 
                                    users={tournament.usersId} 
                                    postsPerPageNumber={3} 
                                    totalUsers={tournament.usersId.length} 
                                    />
                            </div>
                                    {
                                        tournament && tournament.playerGoals && tournament.playerGoals.length > 0 ? (
                                            <>
                                                <h3>טבלת שערים:</h3>
                                                <GoalsTable playerGoals={tournament.playerGoals} />
                                            </>
                                        ) : (
                                            <p>אין נתונים על שערים של שחקנים.</p>
                                        )
                                    }
                        </div>
                        {
                            tournament && tournament.tournamentData && tournament.tournamentData.length > 0 ? (
                                <div className='tournament-container'>
                                    <h3>מפת טורניר:</h3>
                                    {/* כאשר מביאים TournamentBracket צריך לשים לב שיש לו tournament-container*/}
                                    <TournamentBracket 
                                        availableStages={availableStages} 
                                        tournamentData={tournament.tournamentData} 
                                        knockoutIndex={knockoutIndex} // תעדכן את האינדקס לפי הצורך
                                    />
                                </div>

                            ) : (
                                <></>
                            )
                        }
                    </>
                ) : (
                    <p>הטורניר לא נמצא</p>
                )}
            </div>
            <Footer />
        </div>
    );
};

export default TournamentDetailsPage;
