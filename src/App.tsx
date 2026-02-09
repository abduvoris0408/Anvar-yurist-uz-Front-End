import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './store/authStore'
import MainLayout from './layouts/MainLayout'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import ProjectsPage from './pages/ProjectsPage'
import SkillsPage from './pages/SkillsPage'
import CategoriesPage from './pages/CategoriesPage'
import ExperiencesPage from './pages/ExperiencesPage'
import EducationPage from './pages/EducationPage'
import MessagesPage from './pages/MessagesPage'
import ProfilePage from './pages/ProfilePage'

const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
    const { isAuthenticated } = useAuthStore()
    return isAuthenticated ? <>{children}</> : <Navigate to="/login" />
}

function App() {
    return (
        <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route
                path="/"
                element={
                    <PrivateRoute>
                        <MainLayout />
                    </PrivateRoute>
                }
            >
                <Route index element={<DashboardPage />} />
                <Route path="projects" element={<ProjectsPage />} />
                <Route path="skills" element={<SkillsPage />} />
                <Route path="categories" element={<CategoriesPage />} />
                <Route path="experiences" element={<ExperiencesPage />} />
                <Route path="education" element={<EducationPage />} />
                <Route path="messages" element={<MessagesPage />} />
                <Route path="profile" element={<ProfilePage />} />
            </Route>
        </Routes>
    )
}

export default App
