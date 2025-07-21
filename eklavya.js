import React, { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, onAuthStateChanged, signInWithCustomToken } from 'firebase/auth';
import { getFirestore, doc, getDoc, collection, getDocs, setDoc, query, where, setLogLevel } from 'firebase/firestore';

// --- Firebase Configuration ---
// This configuration is provided by the environment.
const firebaseConfig = typeof __firebase_config !== 'undefined' ? JSON.parse(__firebase_config) : {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_AUTH_DOMAIN",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_STORAGE_BUCKET",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID"
};

// --- Initialize Firebase ---
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Enable detailed logging for Firestore for easier debugging.
setLogLevel('debug');

// --- Helper Functions & Mock Data ---

// Function to add mock data to Firestore (run once to populate)
const addMockData = async () => {
    // The app ID is required to construct the correct Firestore path.
    const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
    console.log(`Adding mock data for appId: ${appId}`);

    // Mock Students with PINs for classes 6-10
    const students = [
        { name: "Aarav Gupta", pin: "112233", course: "Class 10" },
        { name: "Saanvi Patel", pin: "445566", course: "Class 8" },
        { name: "Vivaan Singh", pin: "778899", course: "Class 6" },
    ];
    // Construct the full path to the 'students' collection as required by the environment's security rules.
    const studentsCollectionPath = collection(db, 'artifacts', appId, 'public', 'data', 'students');
    for (const student of students) {
        // Use the student's PIN as the document ID for easy lookup.
        await setDoc(doc(studentsCollectionPath, student.pin), student);
    }

    // Mock Tests for classes 6-10
    const tests = [
        {
            testName: "Class 10 Science Mock Test",
            course: "Class 10",
            questions: [
                { q: "What is the chemical formula for water?", o: ["H2O", "CO2", "O2", "NaCl"], a: "H2O" },
                { q: "Which planet is known as the Red Planet?", o: ["Earth", "Mars", "Jupiter", "Saturn"], a: "Mars" },
                { q: "What is the powerhouse of the cell?", o: ["Nucleus", "Ribosome", "Mitochondrion", "Golgi Apparatus"], a: "Mitochondrion" },
            ]
        },
        {
            testName: "Class 8 Maths Mock Test",
            course: "Class 8",
            questions: [
                { q: "What is the value of Pi (to 2 decimal places)?", o: ["3.14", "3.15", "3.16", "3.12"], a: "3.14" },
                { q: "What is the square root of 64?", o: ["6", "7", "8", "9"], a: "8" },
                { q: "A triangle with all sides equal is called?", o: ["Scalene", "Isosceles", "Equilateral", "Right-angled"], a: "Equilateral" },
            ]
        },
        {
            testName: "Class 6 English Mock Test",
            course: "Class 6",
            questions: [
                { q: "What is the opposite of 'happy'?", o: ["Joyful", "Sad", "Angry", "Excited"], a: "Sad" },
                { q: "Which of these is a vowel?", o: ["B", "C", "D", "E"], a: "E" },
                { q: "What is the plural of 'child'?", o: ["Childs", "Children", "Childes", "Childer"], a: "Children" },
            ]
        }
    ];
    // Construct the full path to the 'tests' collection.
    const testsCollectionPath = collection(db, 'artifacts', appId, 'public', 'data', 'tests');
    for (const test of tests) {
        // Add each test as a new document with an auto-generated ID.
        await setDoc(doc(testsCollectionPath), test);
    }
    console.log("Mock data added successfully.");
};


// --- Components ---

const Header = ({ setPage }) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const handleNavClick = (page) => {
        setPage(page);
        setIsMenuOpen(false);
    };

    return (
        <header className="bg-white shadow-md sticky top-0 z-50">
            <div className="container mx-auto px-4 sm:px-6 py-4 flex justify-between items-center">
                <div className="text-lg md:text-2xl font-bold text-indigo-600 cursor-pointer" onClick={() => handleNavClick('home')}>
                    Eklavya Coaching Institute
                </div>
                
                {/* Desktop Navigation */}
                <nav className="hidden md:flex space-x-8 items-center">
                    <a href="#" className="text-gray-600 hover:text-indigo-600" onClick={(e) => { e.preventDefault(); handleNavClick('home'); }}>Home</a>
                    <a href="#" className="text-gray-600 hover:text-indigo-600" onClick={(e) => { e.preventDefault(); handleNavClick('courses'); }}>Courses</a>
                    <a href="#" className="text-gray-600 hover:text-indigo-600" onClick={(e) => { e.preventDefault(); handleNavClick('about'); }}>About</a>
                    <a href="#" className="text-gray-600 hover:text-indigo-600" onClick={(e) => { e.preventDefault(); handleNavClick('contact'); }}>Contact</a>
                    <button
                        onClick={() => handleNavClick('login')}
                        className="bg-indigo-600 text-white font-semibold px-4 py-2 rounded-lg hover:bg-indigo-700 transition duration-300"
                    >
                        Student Login
                    </button>
                </nav>

                {/* Mobile Menu Button */}
                <div className="md:hidden">
                    <button onClick={() => setIsMenuOpen(!isMenuOpen)}>
                        {isMenuOpen ? (
                            <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        ) : (
                            <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
                            </svg>
                        )}
                    </button>
                </div>
            </div>

            {/* Mobile Navigation Menu */}
            {isMenuOpen && (
                <div className="md:hidden bg-white border-t">
                    <nav className="flex flex-col items-center space-y-4 py-4">
                        <a href="#" className="text-gray-600 hover:text-indigo-600" onClick={(e) => { e.preventDefault(); handleNavClick('home'); }}>Home</a>
                        <a href="#" className="text-gray-600 hover:text-indigo-600" onClick={(e) => { e.preventDefault(); handleNavClick('courses'); }}>Courses</a>
                        <a href="#" className="text-gray-600 hover:text-indigo-600" onClick={(e) => { e.preventDefault(); handleNavClick('about'); }}>About</a>
                        <a href="#" className="text-gray-600 hover:text-indigo-600" onClick={(e) => { e.preventDefault(); handleNavClick('contact'); }}>Contact</a>
                        <button
                            onClick={() => handleNavClick('login')}
                            className="w-full mx-4 bg-indigo-600 text-white font-semibold px-4 py-2 rounded-lg hover:bg-indigo-700 transition duration-300"
                        >
                            Student Login
                        </button>
                    </nav>
                </div>
            )}
        </header>
    );
};

const Footer = () => (
    <footer className="bg-gray-800 text-white mt-auto">
        <div className="container mx-auto px-4 sm:px-6 py-4 text-center">
            <p>&copy; 2024 Eklavya Coaching Institute. All Rights Reserved.</p>
        </div>
    </footer>
);

const HomePage = ({ setPage }) => (
    <div className="flex-grow">
        <section className="bg-indigo-600 text-white">
            <div className="container mx-auto px-4 sm:px-6 py-20 text-center">
                <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-4">A Foundation for Success</h1>
                <p className="text-lg md:text-xl mb-8">Join Eklavya Coaching Institute for excellence in studies from Class 6 to 10.</p>
                <button onClick={() => setPage('login')} className="bg-white text-indigo-600 font-bold py-3 px-6 rounded-full hover:bg-gray-200 transition duration-300">
                    Take a Demo Test
                </button>
            </div>
        </section>
        <section className="py-12 md:py-16">
            <div className="container mx-auto px-4 sm:px-6">
                <h2 className="text-3xl font-bold text-center mb-12">Why Choose Us?</h2>
                <div className="grid md:grid-cols-3 gap-8 text-center">
                    <div className="p-6 bg-white rounded-lg shadow-lg">
                        <h3 className="text-xl font-semibold mb-2">Expert Faculty</h3>
                        <p className="text-gray-600">Learn from the best minds in the industry with years of teaching experience.</p>
                    </div>
                    <div className="p-6 bg-white rounded-lg shadow-lg">
                        <h3 className="text-xl font-semibold mb-2">Comprehensive Material</h3>
                        <p className="text-gray-600">Get access to well-researched and up-to-date study materials.</p>
                    </div>
                    <div className="p-6 bg-white rounded-lg shadow-lg">
                        <h3 className="text-xl font-semibold mb-2">Personalized Mentorship</h3>
                        <p className="text-gray-600">Receive one-on-one guidance to track your progress and clear doubts.</p>
                    </div>
                </div>
            </div>
        </section>
    </div>
);

const CoursesPage = () => (
     <div className="container mx-auto px-4 sm:px-6 py-12 md:py-16">
        <h2 className="text-3xl font-bold text-center mb-12">Our Programs</h2>
        <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                <img src="https://placehold.co/600x400/3498db/ffffff?text=Class+6-8" alt="Middle School" className="w-full h-48 object-cover"/>
                <div className="p-6">
                    <h3 className="text-xl font-semibold mb-2">Middle School (Class 6-8)</h3>
                    <p className="text-gray-600">Building strong foundations in core subjects like Maths, Science, and English.</p>
                </div>
            </div>
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                 <img src="https://placehold.co/600x400/2ecc71/ffffff?text=Class+9" alt="Class 9" className="w-full h-48 object-cover"/>
                <div className="p-6">
                    <h3 className="text-xl font-semibold mb-2">Class 9 Foundation</h3>
                    <p className="text-gray-600">A crucial year to prepare for board exams and competitive tests.</p>
                </div>
            </div>
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                 <img src="https://placehold.co/600x400/e74c3c/ffffff?text=Class+10" alt="Class 10" className="w-full h-48 object-cover"/>
                <div className="p-6">
                    <h3 className="text-xl font-semibold mb-2">Class 10 Boards</h3>
                    <p className="text-gray-600">Intensive program focused on achieving excellent results in board examinations.</p>
                </div>
            </div>
        </div>
    </div>
);

const AboutPage = () => (
    <div className="container mx-auto px-4 sm:px-6 py-12 md:py-16">
        <h2 className="text-3xl font-bold text-center mb-8">About Eklavya Coaching Institute</h2>
        <p className="text-lg text-gray-700 max-w-3xl mx-auto text-center">
            Founded with the vision to provide quality education and mentorship, Eklavya Coaching Institute has been a beacon of hope for thousands of students. Our mission is to empower students with the knowledge and skills to achieve their academic and career goals. We believe in a holistic approach to learning that goes beyond textbooks.
        </p>
    </div>
);

const ContactPage = () => (
     <div className="container mx-auto px-4 sm:px-6 py-12 md:py-16">
        <h2 className="text-3xl font-bold text-center mb-12">Get In Touch</h2>
        <div className="max-w-lg mx-auto bg-white p-8 rounded-lg shadow-lg">
            <form>
                <div className="mb-4">
                    <label className="block text-gray-700 font-semibold mb-2" htmlFor="name">Name</label>
                    <input className="w-full px-3 py-2 border rounded-lg" type="text" id="name" />
                </div>
                <div className="mb-4">
                    <label className="block text-gray-700 font-semibold mb-2" htmlFor="email">Email</label>
                    <input className="w-full px-3 py-2 border rounded-lg" type="email" id="email" />
                </div>
                <div className="mb-6">
                    <label className="block text-gray-700 font-semibold mb-2" htmlFor="message">Message</label>
                    <textarea className="w-full px-3 py-2 border rounded-lg" id="message" rows="4"></textarea>
                </div>
                <button className="w-full bg-indigo-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-indigo-700">
                    Send Message
                </button>
            </form>
        </div>
    </div>
);


const LoginPage = ({ setStudent, setPage, appId }) => {
    const [pin, setPin] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e) => {
        e.preventDefault();
        if (!pin) {
            setError('Please enter your PIN.');
            return;
        }
        setLoading(true);
        setError('');

        try {
            // Construct the full path to the specific student document.
            const studentDocRef = doc(db, "artifacts", appId, "public", "data", "students", pin);
            const studentDoc = await getDoc(studentDocRef);

            if (studentDoc.exists()) {
                const studentData = studentDoc.data();
                setStudent({ pin, ...studentData });
                setPage('test');
            } else {
                setError('Invalid PIN. Please check and try again.');
            }
        } catch (err) {
            console.error("Login Error:", err);
            setError('An error occurred. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex-grow flex items-center justify-center bg-gray-100 p-4">
            <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-xl shadow-lg m-4">
                <h2 className="text-2xl font-bold text-center text-gray-800">Student Test Login</h2>
                <form onSubmit={handleLogin} className="space-y-6">
                    <div>
                        <label htmlFor="pin" className="text-sm font-semibold text-gray-600">Enter Your PIN</label>
                        <input
                            id="pin"
                            type="password"
                            value={pin}
                            onChange={(e) => setPin(e.target.value)}
                            className="w-full px-4 py-2 mt-2 text-lg border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                            placeholder="******"
                        />
                    </div>
                    {error && <p className="text-sm text-red-500">{error}</p>}
                    <div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3 font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400"
                        >
                            {loading ? 'Verifying...' : 'Login to Test'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const TestPage = ({ student, setPage, setScore, appId }) => {
    const [test, setTest] = useState(null);
    const [loading, setLoading] = useState(true);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState({});
    const [timeLeft, setTimeLeft] = useState(300); // 5 minutes

    useEffect(() => {
        const fetchTest = async () => {
            if (!student || !student.course || !appId) return;
            setLoading(true);
            try {
                // Construct the full path to the 'tests' collection.
                const testsCollectionRef = collection(db, "artifacts", appId, "public", "data", "tests");
                // Query for tests that match the student's enrolled course.
                const q = query(testsCollectionRef, where("course", "==", student.course));
                const querySnapshot = await getDocs(q);
                if (!querySnapshot.empty) {
                    // Load the first test found for the course.
                    const testData = querySnapshot.docs[0].data();
                    setTest(testData);
                } else {
                    setTest({ error: "No test found for your course." });
                }
            } catch (error) {
                console.error("Error fetching test:", error);
                setTest({ error: "Failed to load the test." });
            } finally {
                setLoading(false);
            }
        };
        fetchTest();
    }, [student, appId]); // Rerun effect if student or appId changes.
    
    useEffect(() => {
        // Only start the timer if the test has loaded successfully.
        if (!loading && test && !test.error) {
            const timer = setInterval(() => {
                setTimeLeft(prevTime => {
                    if (prevTime <= 1) {
                        clearInterval(timer);
                        handleSubmit(); // Auto-submit when time runs out.
                        return 0;
                    }
                    return prevTime - 1;
                });
            }, 1000);
            return () => clearInterval(timer); // Cleanup timer on component unmount.
        }
    }, [loading, test]);


    const handleAnswerSelect = (questionIndex, option) => {
        setAnswers(prev => ({ ...prev, [questionIndex]: option }));
    };

    const handleSubmit = () => {
        let correctAnswers = 0;
        if(test && test.questions) {
            test.questions.forEach((q, index) => {
                if (answers[index] === q.a) {
                    correctAnswers++;
                }
            });
            setScore({
                total: test.questions.length,
                correct: correctAnswers
            });
        } else {
            setScore({
                total: 0,
                correct: 0
            });
        }
        setPage('results');
    };

    if (loading) return <div className="flex-grow flex items-center justify-center p-4"><div className="text-center p-10">Loading Test...</div></div>;
    if (test?.error) return <div className="flex-grow flex items-center justify-center p-4"><div className="text-center p-10 text-red-500">{test.error}</div></div>;
    if (!test) return <div className="flex-grow flex items-center justify-center p-4"><div className="text-center p-10">No test available.</div></div>;

    const currentQuestion = test.questions[currentQuestionIndex];
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;

    return (
        <div className="container mx-auto px-4 py-8 flex-grow">
            <div className="max-w-3xl mx-auto bg-white p-6 md:p-8 rounded-xl shadow-2xl">
                <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
                    <h2 className="text-xl md:text-2xl font-bold text-indigo-700 text-center sm:text-left">{test.testName}</h2>
                    <div className="text-lg font-semibold bg-red-100 text-red-700 px-4 py-2 rounded-lg shrink-0">
                        Time Left: {minutes}:{seconds < 10 ? `0${seconds}` : seconds}
                    </div>
                </div>

                <div className="mb-8">
                    <p className="text-lg font-semibold mb-4">Question {currentQuestionIndex + 1} of {test.questions.length}</p>
                    <p className="text-xl text-gray-800">{currentQuestion.q}</p>
                </div>

                <div className="space-y-4 mb-8">
                    {currentQuestion.o.map((option, index) => (
                        <button
                            key={index}
                            onClick={() => handleAnswerSelect(currentQuestionIndex, option)}
                            className={`w-full text-left p-4 rounded-lg border-2 transition-all duration-200 ${
                                answers[currentQuestionIndex] === option
                                    ? 'bg-indigo-500 border-indigo-500 text-white'
                                    : 'bg-white border-gray-300 hover:border-indigo-400'
                            }`}
                        >
                            {option}
                        </button>
                    ))}
                </div>

                <div className="flex justify-between items-center">
                    <button
                        onClick={() => setCurrentQuestionIndex(i => i - 1)}
                        disabled={currentQuestionIndex === 0}
                        className="px-6 py-2 font-semibold text-white bg-gray-500 rounded-lg disabled:bg-gray-300"
                    >
                        Previous
                    </button>
                    {currentQuestionIndex === test.questions.length - 1 ? (
                        <button
                            onClick={handleSubmit}
                            className="px-6 py-2 font-semibold text-white bg-green-600 rounded-lg hover:bg-green-700"
                        >
                            Submit Test
                        </button>
                    ) : (
                        <button
                            onClick={() => setCurrentQuestionIndex(i => i + 1)}
                            className="px-6 py-2 font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700"
                        >
                            Next
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};


const ResultsPage = ({ student, score, setPage }) => {
    if (!score) return <div className="flex-grow flex items-center justify-center p-4"><div className="text-center p-10">No results to display.</div></div>;
    const percentage = score.total > 0 ? ((score.correct / score.total) * 100).toFixed(2) : 0;
    
    return (
        <div className="flex-grow flex items-center justify-center bg-gray-100 p-4">
            <div className="w-full max-w-2xl p-8 space-y-6 bg-white rounded-xl shadow-lg text-center m-4">
                <h2 className="text-3xl font-bold text-gray-800">Test Results</h2>
                <p className="text-lg">Well done, <span className="font-bold text-indigo-600">{student.name}</span>!</p>
                <div className="bg-indigo-50 p-6 rounded-lg">
                    <p className="text-xl font-semibold">You scored:</p>
                    <p className="text-5xl md:text-6xl font-bold text-indigo-600 my-4">{score.correct} / {score.total}</p>
                    <p className="text-2xl font-semibold text-gray-700">({percentage}%)</p>
                </div>
                <button
                    onClick={() => setPage('home')}
                    className="w-full py-3 font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700"
                >
                    Back to Home
                </button>
            </div>
        </div>
    );
};


export default function App() {
    const [page, setPage] = useState('home');
    const [student, setStudent] = useState(null);
    const [score, setScore] = useState(null);
    const [isAuthReady, setIsAuthReady] = useState(false);
    // Get the app ID from the global environment variable.
    const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';

    useEffect(() => {
        // This function handles the initial authentication.
        const authAndSetup = async () => {
            try {
                // Use the provided custom token if available, otherwise sign in anonymously.
                if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
                    await signInWithCustomToken(auth, __initial_auth_token);
                } else {
                    await signInAnonymously(auth);
                }
            } catch (error) {
                console.error("Authentication Error:", error);
            }
        };

        // Listen for changes in authentication state.
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                console.log("User is signed in:", user.uid);
                setIsAuthReady(true); // App is ready to go once user is authenticated.
            } else {
                console.log("User is signed out.");
                setIsAuthReady(false);
            }
        });
        
        authAndSetup();
        
        // Uncomment the line below ONLY for the first time to populate your Firestore DB.
        // Make sure to comment it out again after one run to avoid duplicate data.
        // addMockData();

        return () => unsubscribe(); // Cleanup the listener on component unmount.
    }, []);
    
    // This function routes the user to the correct page component.
    const renderPage = () => {
        switch (page) {
            case 'home':
                return <HomePage setPage={setPage} />;
            case 'courses':
                return <CoursesPage />;
            case 'about':
                return <AboutPage />;
            case 'contact':
                return <ContactPage />;
            case 'login':
                return <LoginPage setStudent={setStudent} setPage={setPage} appId={appId} />;
            case 'test':
                return <TestPage student={student} setPage={setPage} setScore={setScore} appId={appId} />;
            case 'results':
                return <ResultsPage student={student} score={score} setPage={setPage} />;
            default:
                return <HomePage setPage={setPage} />;
        }
    };

    // Show a loading indicator until Firebase auth is ready.
    if (!isAuthReady) {
        return (
            <div className="flex items-center justify-center h-screen bg-gray-100">
                <div className="text-xl font-semibold text-center p-4">Initializing Institute Portal...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col bg-gray-50 font-sans">
            <Header setPage={setPage} />
            <main className="flex-grow flex flex-col">
                {renderPage()}
            </main>
            <Footer />
        </div>
    );
}
