import React from 'react';
import { Link } from 'react-router-dom';
import "../style/ProfilePage.css";
import { useAuth } from '../hooks/useAuth';
import { Logo } from '../components/Logo';
import { Footer } from '../components/Footer';
import useLocalStorage from 'use-local-storage';
import { LuMedal, LuTrophy } from 'react-icons/lu';
import { PiSoccerBallDuotone } from 'react-icons/pi';

const ProfilePage = () => {
    const { auth } = useAuth();
    const preference = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const [isDark, setIsDark] = useLocalStorage("darkMode", preference);

    // פונקציה לחישוב הגיל מתוך תאריך הלידה
    const calculateAge = (dateOfBirth) => {
        const birthDate = new Date(dateOfBirth);
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDifference = today.getMonth() - birthDate.getMonth();
        if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        return age;
    };

    return (
        <div className="profile-page" data-theme={isDark ? "dark" : "light"}>
            <Logo 
                isChecked={isDark}
                handleChange={() => setIsDark(!isDark)}
                auth={auth}
            />
            <div className='profile-body'>
                {auth ? (
                    <div className="profile-container">
                        <div className="profile-header">
                            <img src={auth.avatar || "https://ionicframework.com/docs/img/demos/avatar.svg"} alt="Profile Avatar" className="profile-avatar" />
                            <h2>{auth.firstName} {auth.lastName}</h2>
                        </div>
                        <div className="profile-info">
                            <p><strong>אימייל:</strong> {auth.email}</p>
                            {auth.dateOfBirth && (
                                <>
                                    <p><strong>גיל:</strong> {calculateAge(auth.dateOfBirth)}</p>
                                    <p><strong>תאריך לידה:</strong> {new Date(auth.dateOfBirth).toLocaleDateString()}</p>
                                </>
                            )}
                            {auth.gender && (
                                <p><strong>מין: </strong> 
                                    {auth.gender === 'זכר' ? 'זכר' : auth.gender === 'נקבה' ? 'נקבה' : auth.gender === 'אחר' ? 'אחר' : "לא ידוע"}
                                </p>
                            )}
                            {/* הוספת מידע על המיקומים */}
                            <div className="profile-stats">
                                <LuTrophy className='icon first-place' /><p><strong>מקומות ראשונים:</strong> {auth.firstPlaces.length}</p>
                                <LuMedal className='icon second-place'/><p><strong>מקומות שניים:</strong> {auth.secondPlaces.length}</p>
                                <PiSoccerBallDuotone className='icon kog'/><p><strong>מלך השערים:</strong> {auth.KOG.length}</p>
                            </div>
                        </div>
                        <div className="profile-actions">
                            <Link to={`/profile/edit`} className="edit-profile-button">
                                ערוך פרופיל
                            </Link>
                        </div>
                    </div>
                ) : (
                    <p>משתמש לא נמצא</p>
                )}
            </div>
            <Footer />
        </div>
    );
};

export default ProfilePage;