import { lazy, Suspense } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './store/authStore'
import Loading from './components/Loading'

// Lazy load all pages
const MainLayout = lazy(() => import('./layouts/MainLayout'))
const LoginPage = lazy(() => import('./pages/LoginPage'))
const DashboardPage = lazy(() => import('./pages/DashboardPage'))
const AboutPage = lazy(() => import('./pages/AboutPage'))
const ProjectsPage = lazy(() => import('./pages/ProjectsPage'))
const SkillsPage = lazy(() => import('./pages/SkillsPage'))
const ServicesPage = lazy(() => import('./pages/ServicesPage'))
const CategoriesPage = lazy(() => import('./pages/CategoriesPage'))
const TagsPage = lazy(() => import('./pages/TagsPage'))
const BlogPostsPage = lazy(() => import('./pages/BlogPostsPage'))
const BlogCommentsPage = lazy(() => import('./pages/BlogCommentsPage'))
const NewsPage = lazy(() => import('./pages/NewsPage'))
const ExperiencesPage = lazy(() => import('./pages/ExperiencesPage'))
const EducationPage = lazy(() => import('./pages/EducationPage'))

const ProfilePage = lazy(() => import('./pages/ProfilePage'))
const TestimonialsPage = lazy(() => import('./pages/TestimonialsPage'))
const FaqsPage = lazy(() => import('./pages/FaqsPage'))
const PartnersPage = lazy(() => import('./pages/PartnersPage'))
const ConsultationsPage = lazy(() => import('./pages/ConsultationsPage'))
const AchievementsPage = lazy(() => import('./pages/AchievementsPage'))
const ContactsPage = lazy(() => import('./pages/ContactsPage'))

const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
    const { isAuthenticated } = useAuthStore()
    return isAuthenticated ? <>{children}</> : <Navigate to="/login" />
}

const LazyPage = ({ children }: { children: React.ReactNode }) => (
    <Suspense fallback={<Loading />}>
        {children}
    </Suspense>
)

function App() {
    return (
        <Routes>
            <Route path="/login" element={<LazyPage><LoginPage /></LazyPage>} />
            <Route
                path="/"
                element={
                    <PrivateRoute>
                        <LazyPage>
                            <MainLayout />
                        </LazyPage>
                    </PrivateRoute>
                }
            >
                <Route index element={<LazyPage><DashboardPage /></LazyPage>} />
                <Route path="about" element={<LazyPage><AboutPage /></LazyPage>} />
                <Route path="projects" element={<LazyPage><ProjectsPage /></LazyPage>} />
                <Route path="skills" element={<LazyPage><SkillsPage /></LazyPage>} />
                <Route path="services" element={<LazyPage><ServicesPage /></LazyPage>} />
                <Route path="categories" element={<LazyPage><CategoriesPage /></LazyPage>} />
                <Route path="tags" element={<LazyPage><TagsPage /></LazyPage>} />
                <Route path="blog-posts" element={<LazyPage><BlogPostsPage /></LazyPage>} />
                <Route path="blog-comments" element={<LazyPage><BlogCommentsPage /></LazyPage>} />
                <Route path="news" element={<LazyPage><NewsPage /></LazyPage>} />
                <Route path="experiences" element={<LazyPage><ExperiencesPage /></LazyPage>} />
                <Route path="education" element={<LazyPage><EducationPage /></LazyPage>} />
                <Route path="testimonials" element={<LazyPage><TestimonialsPage /></LazyPage>} />
                <Route path="faqs" element={<LazyPage><FaqsPage /></LazyPage>} />
                <Route path="partners" element={<LazyPage><PartnersPage /></LazyPage>} />
                <Route path="consultations" element={<LazyPage><ConsultationsPage /></LazyPage>} />
                <Route path="achievements" element={<LazyPage><AchievementsPage /></LazyPage>} />
                <Route path="contacts" element={<LazyPage><ContactsPage /></LazyPage>} />
                <Route path="profile" element={<LazyPage><ProfilePage /></LazyPage>} />
                <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
        </Routes>
    )
}

export default App
