import { useNavigate } from "react-router-dom";

export const Landing = () => {
  const navigate = useNavigate();

  const handleSignIn = () => {
    const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:8080";
    window.location.href = `${backendUrl}/auth/google`;
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <h1 className="text-4xl text-white font-bold mb-8">Welcome to MyChess</h1>
      <div className="flex items-center justify-center w-full max-w-4xl bg-white rounded-lg shadow-md p-6">
        <img
          src="/chessboard.jpg"
          alt="Chess Board"
          className="w-1/2 h-auto rounded-lg"
        />
        <div className="w-1/2 p-6">
          <p className="text-gray-600 mb-4 text-4xl">
            Play chess online with your friends. Join a game and start playing
            immediately!!
          </p>
          <div className="flex flex-col gap-4">
            <button
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              onClick={handleSignIn}
            >
              Sign in with Google
            </button>
            <button
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
              onClick={() => navigate("/game")}
            >
              Play as Guest
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
