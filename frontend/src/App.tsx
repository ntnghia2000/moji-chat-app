import { BrowserRouter, Route, Routes } from 'react-router';
import SignInPage from './pages/signInPage';
import SignUpPage from './pages/signUpPage';
import ChatAppPage from './pages/chatAppPage';
import { Toaster } from 'sonner';
import ProtectedRoute from './components/auth/protectedRoute';
import { useThemeStore } from './stores/useThemeStore';
import { useEffect } from 'react';
import { useAuthStore } from './stores/useAuthStore';
import { useSocketStore } from './stores/useSocketStore';

function App() {
	const { isDark, setTheme } = useThemeStore();
	const { accessToken } = useAuthStore();
	const { connectSocket, disconnectSocket } = useSocketStore();

	useEffect(() => {
		setTheme(isDark);
	}, [isDark]);

	useEffect(() => {
		if (accessToken) {
			connectSocket();
		}
		return () => disconnectSocket();
	}, [accessToken]);
	
	return <>
		<Toaster richColors/>
		<BrowserRouter>
		<Routes>
			<Route path='/signin' element={<SignInPage/>}/>
			<Route path='/signup' element={<SignUpPage/>}/>

			<Route element={<ProtectedRoute/>}>
			<Route path='/' element={<ChatAppPage/>}/>
			</Route>
		</Routes>
		</BrowserRouter>
	</>;
}

export default App
