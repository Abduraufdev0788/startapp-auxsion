import { createBrowserRouter } from 'react-router-dom';
import App from '../App';
import { HomePage } from '../pages/HomePage';
import { AuctionsPage } from '../pages/AuctionsPage';
import { AuctionDetailsPage } from '../pages/AuctionDetailsPage';
import { LoginPage } from '../pages/LoginPage';
import { RegisterPage } from '../pages/RegisterPage';
import { DashboardPage } from '../pages/DashboardPage';
import { CategoriesPage } from '../pages/CategoriesPage';
import { AdminPage } from '../pages/AdminPage';
import { HowItWorksPage } from '../pages/HowItWorksPage';
import { TermsPage } from '../pages/TermsPage';
import { PrivacyPage } from '../pages/PrivacyPage';
import { ContactPage } from '../pages/ContactPage';
import { ForgotPasswordPage } from '../pages/ForgotPasswordPage';
import { NotFoundPage } from '../pages/NotFoundPage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    errorElement: <NotFoundPage />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'auctions', element: <AuctionsPage /> },
      { path: 'auctions/:id', element: <AuctionDetailsPage /> },
      { path: 'categories', element: <CategoriesPage /> },
      { path: 'login', element: <LoginPage /> },
      { path: 'register', element: <RegisterPage /> },
      { path: 'forgot-password', element: <ForgotPasswordPage /> },
      { path: 'dashboard', element: <DashboardPage /> },
      { path: 'admin', element: <AdminPage /> },
      { path: 'how-it-works', element: <HowItWorksPage /> },
      { path: 'terms', element: <TermsPage /> },
      { path: 'privacy', element: <PrivacyPage /> },
      { path: 'contact', element: <ContactPage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
]);
