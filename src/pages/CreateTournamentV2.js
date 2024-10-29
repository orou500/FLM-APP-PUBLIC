import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import "../style/CreateTournamentV2.css";
import useLocalStorage from 'use-local-storage';
import { Logo } from '../components/Logo';
import { useAuth } from '../hooks/useAuth';
import { Footer } from '../components/Footer';
import { UsersList } from '../components/UsersList';
import { SearchBar } from '../components/SearchBar';
import { SearchResultsList } from '../components/SearchResultsList';
import axios from '../api/axios';
import confetti from 'canvas-confetti';
import { useToast } from '../context/ToastContext';
import OddKnockoutBracket from '../components/OddKnockoutBracket';

const CreateTournamentV2 = () => {
    const preference = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const [isDark, setIsDark] = useLocalStorage("darkMode", preference);
    const { LeaguesSlug } = useParams(); 
    const { auth } = useAuth();
    const { addToast } = useToast();
    const navigate = useNavigate();

    const [isLoading, setIsLoading] = useState(false);
    const [tournamentDate, setTournamentDate] = useState(''); 
    const [title, setTitle] = useState('');
    const [results, setResults] = useState([]);
    const [users, setUsers] = useState([]);
    const [firstPlace, setFirstPlace] = useState('');
    const [secondPlace, setSecondPlace] = useState('');
    const [KOG, setKOG] = useState('');
    const [allPlayerGoals, setAllPlayerGoals] = useState();
    const [KOGMaxGoals, setKOGMaxGoals] = useState('');
    const [error, setError] = useState('');
    const [tournamentType, setTournamentType] = useState('חצי גמר');
    const [dummyPlayers, setDummyPlayers] = useState([]);
    const [tournamentData, setTournamentData] = useState([[], [], [], []]);
    const [images, setImages] = useState(['']); // מערך לאחסון ה-URLs של התמונות

        // הוספת שדה URL חדש לתמונות
        const addImageInput = () => {
            setImages([...images, '']);
        };
    
        // עדכון מערך ה-URLs של התמונות
        const handleImageChange = (index, value) => {
            const newImages = [...images];
            newImages[index] = value;
            setImages(newImages);
        };

        const isValidUrl = (url) => {
            try {
                new URL(url);
                return true;
            } catch (_) {
                return false;
            }
        };
    const checkForDuplicatePlayers = (tournamentData) => {
        const seenPlayers = new Set(); // סט לאחסון שחקנים שנראו כבר
        let hasDuplicates = false;
    
        tournamentData.forEach(stage => {
            const stageSeenPlayers = new Set(); // סט חדש לכל שלב
    
            stage.forEach(match => {
                const { team1, team2 } = match;
    
                // בדוק אם הקבוצות נוספו כבר לסט של השלב הנוכחי
                if (stageSeenPlayers.has(team1)) {
                    hasDuplicates = true; // אם נמצאה כפילות
                } else {
                    stageSeenPlayers.add(team1); // הוסף את הקבוצה לסט של השלב הנוכחי
                }
    
                if (stageSeenPlayers.has(team2)) {
                    hasDuplicates = true; // אם נמצאה כפילות
                } else {
                    stageSeenPlayers.add(team2); // הוסף את הקבוצה לסט של השלב הנוכחי
                }
    
                // אם כבר ראינו קבוצה זו בכל השלבים, הוסף אותה לסט הגלובלי
                seenPlayers.add(team1);
                seenPlayers.add(team2);
            });
        });
    
        return hasDuplicates;
    };
    

    useEffect(() => {
        if (tournamentData.length === 0) return;

        const duplicatesExist = checkForDuplicatePlayers(tournamentData);
        if (duplicatesExist) {
            addToast({ id: Date.now(), message: 'יש שחקן המופיע יותר מפעם אחת בטורניר!', type: 'error' });
        }
    
        // שלב אחרון
        const lastStageMatches = tournamentData[tournamentData.length - 1];
        
        if (lastStageMatches.length > 0) {
            const lastMatch = lastStageMatches[0];
            const { team1, team2, score1, score2 } = lastMatch;
    
            // בדוק מי מקום ראשון ומי מקום שני
            let MatchesfirstPlace = '';
            let MatchessecondPlace = '';
    
            if (score1 > score2) {
                MatchesfirstPlace = team1;
                MatchessecondPlace = team2;
            } else if (score2 > score1) {
                MatchesfirstPlace = team2;
                MatchessecondPlace = team1;
            } else {
                // במקרה של תיקו
                MatchesfirstPlace = team1; // נניח שteam1 זוכה במקרה של תיקו
                MatchessecondPlace = team2;
            }
    
            // מצא את המשתמשים לפי שם הקבוצה
            const firstPlaceUser = users.find(user => `${user.firstName} ${user.lastName}` === MatchesfirstPlace);
            const secondPlaceUser = users.find(user => `${user.firstName} ${user.lastName}` === MatchessecondPlace);
    
            // עדכון המקום הראשון והשני אם הם לא "שחקנים מדומים"
            if (firstPlaceUser && !MatchesfirstPlace.includes('שחקן מדומה')) {
                setFirstPlace(firstPlaceUser);
            } else {
                setFirstPlace('');
            }
    
            if (secondPlaceUser && !MatchessecondPlace.includes('שחקן מדומה')) {
                setSecondPlace(secondPlaceUser);
            } else {
                setSecondPlace('');
            }
        }
    // ספירת שערים ומציאת הקבוצה עם הכי הרבה שערים
    const goalCounts = {};
    const playerGoals = []; // שמירת השחקנים עם כמות השערים

    tournamentData.forEach(stage => {
        stage.forEach(match => {
            const { team1, team2, score1, score2 } = match;

            // עדכון שערים לקבוצה 1
            if (goalCounts[team1]) {
                goalCounts[team1] += score1;
            } else {
                goalCounts[team1] = score1;
            }

            // עדכון שערים לקבוצה 2
            if (goalCounts[team2]) {
                goalCounts[team2] += score2;
            } else {
                goalCounts[team2] = score2;
            }
        });
    });

    // מצא את הקבוצה עם הכי הרבה שערים
    let maxGoals = 0;
    let topScoringTeam = '';

    for (const team in goalCounts) {
        if (goalCounts[team] > maxGoals) {
            maxGoals = goalCounts[team];
            topScoringTeam = team;
        }

        // שמור את השחקן וכמות השערים במערך
        const user = users.find(user => `${user.firstName} ${user.lastName}` === team);
        if (user) {
            playerGoals.push({
                name: `${user.firstName} ${user.lastName}`,
                goals: goalCounts[team]
            });
        }
    }

    // מציאת המשתמש עם הכי הרבה שערים
    const topScoringUser = users.find(user => `${user.firstName} ${user.lastName}` === topScoringTeam);

    // הצג בלוג רק אם הקבוצה אינה "שחקן מדומה"
    if (topScoringUser && !topScoringTeam.includes('שחקן מדומה')) {
        setKOGMaxGoals(maxGoals);
        setKOG(topScoringUser);
    } else {
        setKOGMaxGoals('');
        setKOG('');
    }

    // הצגת רשימת השחקנים עם מספר השערים
    setAllPlayerGoals(playerGoals)
}, [tournamentData, users, addToast]);
    
    
    
    const updateDummyPlayers = useCallback(() => {
        const requiredPlayers = getRequiredPlayers(tournamentType);
        if (users.length < requiredPlayers) {
            const missingPlayers = requiredPlayers - users.length;
            const newDummyPlayers = createDummyPlayers(missingPlayers);
            setDummyPlayers(newDummyPlayers);
        } else {
            setDummyPlayers([]);
        }
    }, [tournamentType, users]);

    useEffect(() => {
        updateDummyPlayers();
    }, [tournamentType, users, tournamentData, updateDummyPlayers]);

    const getRequiredPlayers = (type) => {
        switch (type) {
            case 'רבע גמר': return 8;
            case 'חצי גמר': return 4;
            case 'שמינית גמר': return 16;
            default: return 0;
        }
    };

    const createDummyPlayers = (count) => {
        return Array.from({ length: count }, (_, index) => ({
            _id: `dummy-${index}`,
            firstName: `שחקן`,
            lastName: `מדומה ${index + 1}`,
            email: `dummy${index + 1}@fake.com`
        }));
    };

    const allPlayers = [...users, ...dummyPlayers];

    const getCurrentDate = () => {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        const duplicatesExist = checkForDuplicatePlayers(tournamentData);
        if (duplicatesExist) {
            addToast({ id: Date.now(), message: 'יש שחקן המופיע יותר מפעם אחת בטורניר!', type: 'error' });
            return;
        }

        if (!title || !firstPlace || !secondPlace || !KOG || !tournamentDate) {
            addToast({ id: Date.now(), message: 'יש למלא את כל השדות', type: 'error' });
            setError('יש למלא את כל השדות');
            setIsLoading(false);
            return;
        }

        const invalidImage = images.some(image => image && !isValidUrl(image));
        if (invalidImage) {
            addToast({ id: Date.now(), message: 'אחד או יותר מה-URLs של התמונות אינו תקין', type: 'error' });
            setError('אחד או יותר מה-URLs של התמונות אינו תקין');
            setIsLoading(false);
            return;
        }

        try {
            const token = localStorage.getItem('token');
            const response = await axios.post(`/leagues/${LeaguesSlug}`, {
                tournamentData,
                title,
                firstPlace: firstPlace._id,
                secondPlace: secondPlace._id,
                KOG: KOG._id,
                playerGoals: allPlayerGoals,
                images,
                users,
                createdAt: tournamentDate,
            }, {
                headers: { Authorization: `${token}` }
            });

            if (response.status === 201) {
                confetti({
                    particleCount: 100,
                    spread: 70,
                    origin: { y: 0.6 }
                });
                addToast({ id: Date.now(), message: 'טורניר נוצר בהצלחה', type: 'success' });
                navigate(`/leagues/${LeaguesSlug}`);
            }
        } catch (err) {
            addToast({ id: Date.now(), message: `${err}`, type: 'error' });
            setError('שגיאה ביצירת המשחק');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className='create-tournament-page' data-theme={isDark ? "dark" : "light"}>
            <Logo 
                isChecked={isDark}
                handleChange={() => setIsDark(!isDark)}
                auth={auth}
            />
            <div className='create-tournament-body'>
                <div className="create-tournament-container">
                    <h2>צור טורניר חדש</h2>
                    {error && <p className="error-message">{error}</p>}
                    <form onSubmit={handleSubmit}>
                        <label>סוג טורניר:</label>
                        <select
                            className='input-create-tournament'
                            value={tournamentType}
                            onChange={(e) => setTournamentType(e.target.value)}
                        >
                            <option value='שמינית גמר'>שמינית גמר</option>
                            <option value='רבע גמר'>רבע גמר</option>
                            <option defaultValue value='חצי גמר'>חצי גמר</option>
                        </select>
                        <label>כותרת הטורניר:</label>
                        <input
                            className='input-create-tournament'
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="כותרת הטורניר"
                        />

                        <label>תאריך הטורניר:</label>
                        <input
                            className='input-create-tournament'
                            type="date"
                            max={getCurrentDate()} 
                            value={tournamentDate}
                            onChange={(e) => setTournamentDate(e.target.value)}
                        />
                        <label>תמונות הטורניר:</label>
                        {images.map((image, index) => (
                            <input
                                key={index}
                                type="text"
                                className="input-create-tournament"
                                value={image}
                                placeholder="הכנס URL של תמונה"
                                onChange={(e) => handleImageChange(index, e.target.value)}
                            />
                        ))}
                        <button type="button" className="btn-add-image" onClick={addImageInput}>
                            הוסף תמונה
                        </button>
                        <label>מי השתתף בטורניר:</label>
                        <div className='create-tournament-users-list'>
                            <UsersList users={users} setUsers={setUsers} />
                        </div>
                        <div className="search-bar-container">
                            <SearchBar setResults={setResults} auth={auth} setIsLoading={setIsLoading} searchInLeague={true}/>
                            {isLoading ? (
                            <div className="loading">טוען נתונים...</div>
                            ) : (
                            results.length > 0 && <SearchResultsList results={results} users={users} setUsers={setUsers} />
                            )}
                        </div>

                        <label>מקום ראשון:</label>
                        {firstPlace ? (
                            <p className="tournament-winner">
                                {firstPlace.firstName} {firstPlace.lastName}
                            </p>
                        ) : (
                            <p className="tournament-winner">טרם נקבע</p>
                        )}

                        <label>מקום שני:</label>
                        {secondPlace ? (
                            <p className="tournament-runner-up">
                                {secondPlace.firstName} {secondPlace.lastName}
                            </p>
                        ) : (
                            <p className="tournament-runner-up">טרם נקבע</p>
                        )}
                        <label>מלך השערים:</label>
                        {KOG && KOGMaxGoals ? (
                            <p className="tournament-runner-up">
                                {KOG.firstName} {KOG.lastName} - {KOGMaxGoals} שערים
                            </p>
                        ) : (
                            <p className="tournament-runner-up">טרם נקבע</p>
                        )}

                        <button type="submit" className="btn-create-tournament">צור משחק</button>
                    </form>
                </div>
                <div className='tournament-bracket'>
                    <OddKnockoutBracket users={allPlayers} KnockoutType={tournamentType} tournamentData={tournamentData} setTournamentData={setTournamentData}/>
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default CreateTournamentV2;
