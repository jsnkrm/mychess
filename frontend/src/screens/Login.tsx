
export const Login = () => {
    const handleLogin = () => {
        const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:8080";
        window.location.href = `${backendUrl}/auth/google`;
    };

    return (
        <div className="flex justify-center items-center h-screen bg-slate-900">
            <div className="bg-slate-800 p-8 rounded-lg shadow-lg text-center">
                <h1 className="text-3xl font-bold text-white mb-8">Login to Play Chess</h1>
                <button
                    onClick={handleLogin}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        handleLogin();
                      }
                    }}
                    className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-lg text-lg transition duration-300 flex items-center justify-center gap-2 mx-auto focus-visible:ring-2 focus-visible:ring-blue-300 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-800"
                >
                    Sign in with Google
                </button>
            </div>
        </div>
    );
};
