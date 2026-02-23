import { createBrowserRouter } from 'react-router';

import LoadingPage from './pages/LoadingPage';
import LoginPage from './pages/LoginPage';
import SignUpPage from './pages/SignUpPage';
import HomePage from './pages/HomePage';
import EventsPage from './pages/EventsPage';
import QRPage from './pages/QRPage';
import MyPage from './pages/MyPage';
import SettingsPage from './pages/SettingsPage';
import AdminLayout from './pages/admin/AdminLayout';
import AdminHomePage from './pages/admin/AdminHomePage';
import AdminEventsPage from './pages/admin/AdminEventsPage';
import AdminEventFormPage from './pages/admin/AdminEventFormPage';
import AdminMembersPage from './pages/admin/AdminMembersPage';

export const router = createBrowserRouter([
  { path: '/', Component: LoadingPage },
  { path: '/login', Component: LoginPage },
  { path: '/signup', Component: SignUpPage },
  { path: '/home', Component: HomePage },
  { path: '/events', Component: EventsPage },
  { path: '/qr', Component: QRPage },
  { path: '/mypage', Component: MyPage },
  { path: '/settings', Component: SettingsPage },
  {
    path: '/admin',
    Component: AdminLayout,
    children: [
      { index: true, Component: AdminHomePage },
      { path: 'events', Component: AdminEventsPage },
      { path: 'events/new', Component: AdminEventFormPage },
      { path: 'events/edit/:id', Component: AdminEventFormPage },
      { path: 'members', Component: AdminMembersPage },
    ],
  },
]);
