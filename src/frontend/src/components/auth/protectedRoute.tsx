import { Navigate, Outlet } from "react-router";
import { useAuthStore } from "../../stores/useAuthStore";
import { useEffect, useState, useCallback } from "react";

const ProtectedRoute = () => {
    const { accessToken, loading, refresh, fetchMe } = useAuthStore();
    const [starting, setStarting] = useState(true);

    const init = useCallback(async () => {
        try {
            if (!accessToken) {
                await refresh();
            }
            if (useAuthStore.getState().accessToken && !useAuthStore.getState().user) {
                await fetchMe();
            }
            console.log("Auth initialization success");
        } catch (error) {
            console.error("Auth initialization failed:", error);
        } finally {
            setStarting(false);
        }
    }, []);

    useEffect(() => {
        let isMounted = true;
        const performInit = async () => {
            await init();
            if (isMounted) {
                setStarting(false);
            }
        }
        performInit();
        return () => {
            isMounted = false;
        }
    }, []);

    if (starting || loading) {
        return <div className="flex h-screen items-center justify-center">Loading....</div>
    }
    
    if (!accessToken) {
        return(
            <Navigate to="/signin" replace/>
        )
    }

    return(
        <Outlet></Outlet>
    )
}

export default ProtectedRoute;