import trophy from "../../../assets/trophy.svg"
import chicken from "../../../assets/chicken.png"
import { useEffect } from "react"
import { useQuery } from "@tanstack/react-query"
import axios from "axios"

interface RankingEntry {
  rank: number;
  username: string;
  score: number;
}

// const mockRankingData: RankingEntry[] = [
//   { rank: 1, username: 'Una', score: 114514 },
//   { rank: 2, username: 'TadokoroKouji', score: 1919 },
//   { rank: 3, username: 'Username', score: 810 },
//   { rank: 4, username: 'GitPushNightmare', score: 514 },
//   { rank: 5, username: 'GitDestroyer', score: 114 },
//   { rank: 6, username: 'DockerFanz', score: 100 },
//   { rank: 7, username: 'GitMergeBoom', score: 87 },
//   { rank: 8, username: 'XmasEveCoding', score: 69 },
//   { rank: 8, username: 'NoOne', score: 69 },
//   { rank: 10, username: 'SomeOne', score: 42 },
//   { rank: 11, username: 'RickAstley', score: 0 },
// ];

const Ranking = () => {
  interface ApiRankingEntry {
    user_name: string;
    rank: number;
    score: number;
  }

  const getStoredToken = (): string | null => {
    return localStorage.getItem("token") || sessionStorage.getItem("token");
  };

  const { data, isLoading, isError, error } = useQuery<RankingEntry[]>({
    queryKey: ["globalRanking"],
    queryFn: async () => {
      //const token = getStoredToken();
      const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoiYWNjZXNzIiwiZXhwIjoxNzY2MzIwMjEwLCJpYXQiOjE3NjYzMTMwMTAsImp0aSI6IjQyZmY4M2VhNjNiZjQ2YzBhYTA1MDBjMzRjMDBkOGVjIiwidXNlcklEIjoiMDY1OWJiYjEtYWFjNS00NzNkLTg3ZDUtNzFhYmQxNGQzNGY0In0.2GG-J9VqxX9YBxPfCQyUjs-SgQ9-u7ZWCDTWIWNul7o"
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const response = await axios.get<ApiRankingEntry[]>(
        "http://localhost:8000/api/accounts/rank/",
        { headers }
      );

      const apiData = response.data ?? [];
      return apiData.map<RankingEntry>((item) => ({
        rank: item.rank,
        username: item.user_name,
        score: item.score,
      }));
    },
    staleTime: 60_000,
  });

  useEffect(() => {
    if (isLoading) {
      console.log("Fetching global ranking...");
    } else if (isError) {
      console.error("Error fetching global ranking", error);
    } else if (data) {
      console.log("Global ranking data:", data);
    }
  }, [data, isLoading, isError, error]);

  return (
    <div className="max-w-screen flex flex-col justify-center relative overflow-hidden">
      <h2 className="flex justify-center text-center text-5xl font-bold mb-8 mt-16">
        <img src={trophy} alt="" className="w-16" />
        <span>Welcome to Leaderboard!</span>
      </h2>
      <p className="text-center text-xl font-semibold mb-6 text-[#cccccc]">See how you stack up against other developers.</p>
      <ul
        id="target"
        className="w-[45%] mx-auto rounded-lg shadow divide-y-2 divide-[#000]"
      >
        <li className="flex items-center px-8 py-6 bg-[#1c1c1c]">
          <div className="flex flex-1  items-center gap-3">
            <span className="text-2xl text-[#fff41d] font-bold mr-8 w-1/12">Rank</span>
            <span className="text-2xl font-bold">User</span>
          </div>
          <span className="ml-4 font-mono text-right text-2xl min-w-[4rem] font-bold">Score</span>
        </li>
        {(data ?? []).map((entry) => {
          const rankColor =
            entry.rank === 1
              ? '#fff41d'
              : entry.rank === 2
              ? '#929292'
              : entry.rank === 3
              ? '#886035'
              : undefined

          return (
            <li
              key={`${entry.rank}-${entry.username}`}
              className="flex items-center px-8 py-6 text-sm bg-[#3f3f3f]"
            >
              <div className="flex flex-1 items-center gap-3">
                <span
                  className="font-semibold text-2xl mr-8 w-1/12"
                  style={rankColor ? { color: rankColor } : undefined}
                >
                  {entry.rank}
                </span>
                <span className="truncate text-2xl">{entry.username}</span>
              </div>
              <span className="ml-4 font-mono font-semibold text-right text-2xl min-w-[4rem]">
                {entry.score}
              </span>
            </li>
          )
        })}
      </ul>
      <img
        src={chicken}
        alt=""
        className="pointer-events-none select-none fixed bottom-4 right-4 w-64 opacity-40 z-10"
      />
    </div>
  )
}

export default Ranking