import { useMemo, useState, useEffect, useRef } from "react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import {
  useAccount,
  usePublicClient,
  useReadContract,
  useWriteContract,
} from "wagmi";
import { popKomodo } from "./lib/contract";
import komodoIdle from "./assets/image1.png";
import komodoActive from "./assets/image2.png";

// Click effect interface
interface ClickEffect {
  id: string;
  x: number;
  y: number;
}

function App() {
  const { address, isConnected } = useAccount();
  const { writeContractAsync, isPending } = useWriteContract();
  const publicClient = usePublicClient();
  const [isSending, setIsSending] = useState(false);
  const [isChoosing, setIsChoosing] = useState(false);
  const [localClicks, setLocalClicks] = useState(0);
  const [gamePhase, setGamePhase] = useState<
    "landing" | "teamSelect" | "playing"
  >("landing");
  const [clickEffects, setClickEffects] = useState<ClickEffect[]>([]);
  const [isPressed, setIsPressed] = useState(false);
  const popButtonRef = useRef<HTMLButtonElement>(null);

  const getTeamArgs = useMemo(
    () => (address ? ([address] as const) : undefined),
    [address]
  );

  const teamQuery = useReadContract({
    address: popKomodo.address as `0x${string}` | undefined,
    abi: popKomodo.abi as unknown as readonly unknown[],
    functionName: "getTeam",
    args: getTeamArgs,
    query: {
      enabled: Boolean(getTeamArgs && isConnected && popKomodo.address),
    },
  });

  const scoresQuery = useReadContract({
    address: popKomodo.address as `0x${string}` | undefined,
    abi: popKomodo.abi as unknown as readonly unknown[],
    functionName: "getScores",
    query: {
      enabled: Boolean(isConnected && popKomodo.address),
      refetchInterval: 1500,
    },
  });

  const chosen = Boolean(
    teamQuery.data && (teamQuery.data as unknown as [boolean, number])[0]
  );
  const team = teamQuery.data
    ? Number((teamQuery.data as unknown as [boolean, number])[1])
    : undefined;

  // Auto-transition between game phases
  useEffect(() => {
    if (isConnected && gamePhase === "landing") {
      setGamePhase("teamSelect");
    }
    if (chosen && gamePhase === "teamSelect") {
      setGamePhase("playing");
    }
  }, [isConnected, chosen, gamePhase]);

  async function chooseTeam(t: 0 | 1 | 2) {
    if (!popKomodo.address) return;
    try {
      setIsChoosing(true);
      const hash = await writeContractAsync({
        address: popKomodo.address,
        abi: popKomodo.abi,
        functionName: "chooseTeam",
        args: [t],
      });
      if (publicClient && hash) {
        await publicClient.waitForTransactionReceipt({ hash });
      }
      await teamQuery.refetch();
      scoresQuery.refetch();
    } finally {
      setIsChoosing(false);
    }
  }

  function createClickEffect(e: React.MouseEvent) {
    if (!popButtonRef.current) return;

    const rect = popButtonRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const effect: ClickEffect = {
      id: Date.now().toString(),
      x,
      y,
    };

    setClickEffects((prev) => [...prev, effect]);

    // Remove effect after animation
    setTimeout(() => {
      setClickEffects((prev) => prev.filter((ef) => ef.id !== effect.id));
    }, 1000);
  }

  function registerClick(e: React.MouseEvent) {
    setLocalClicks((v) => Math.min(v + 1, 200));
    createClickEffect(e);

    // Show pressed state animation
    setIsPressed(true);
    setTimeout(() => setIsPressed(false), 100);
  }

  async function sendPops() {
    if (!popKomodo.address || localClicks <= 0) return;
    const amount = Math.min(localClicks, 200);
    try {
      setIsSending(true);
      const hash = await writeContractAsync({
        address: popKomodo.address as `0x${string}`,
        abi: popKomodo.abi,
        functionName: "popBy",
        args: [amount],
      });
      if (publicClient && hash) {
        await publicClient.waitForTransactionReceipt({ hash });
      }
      setLocalClicks((v) => Math.max(v - amount, 0));
      scoresQuery.refetch();
    } finally {
      setIsSending(false);
    }
  }

  // Get scores data safely
  const scores = (scoresQuery.data as unknown as [bigint, bigint, bigint]) || [
    0n,
    0n,
    0n,
  ];
  const ethereumScore = Number(scores[0]);
  const bitcoinScore = Number(scores[1]);
  const monadScore = Number(scores[2]);

  // Generate floating particles
  const particles = Array.from({ length: 15 }, (_, i) => (
    <div
      key={i}
      className="particle"
      style={{
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
        width: `${Math.random() * 6 + 2}px`,
        height: `${Math.random() * 6 + 2}px`,
        animationDelay: `${Math.random() * 6}s`,
        animationDuration: `${Math.random() * 3 + 4}s`,
      }}
    />
  ));

  // Landing Screen
  if (gamePhase === "landing") {
    return (
      <div className="min-h-screen animated-bg flex items-center justify-center relative overflow-hidden">
        <div className="particles">{particles}</div>

        <div className="text-center space-y-8 fade-in-up z-10 px-4">
          <div className="space-y-4">
            <h1 className="text-6xl md:text-8xl font-black neon-text bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">
              POP KOMODO
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 font-light max-w-2xl mx-auto">
              The ultimate blockchain battle royale! Choose your team and pop
              your way to victory! 🚀
            </p>
          </div>

          <div className="space-y-6">
            <div className="glass-card max-w-md mx-auto">
              <h2 className="text-2xl font-bold mb-4 text-center">
                Ready to Battle?
              </h2>
              <p className="text-gray-300 text-center mb-6">
                Connect your wallet to join the epic Pop Komodo competition and
                represent your favorite blockchain!
              </p>
              <div className="flex justify-center">
                <ConnectButton />
              </div>
            </div>

            <div className="text-sm text-gray-400">
              🎮 Mobile & Desktop Ready • ⚡ Lightning Fast • 🔥 Epic Battles
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Team Selection Screen
  if (gamePhase === "teamSelect" && !chosen) {
    return (
      <div className="min-h-screen animated-bg flex items-center justify-center relative overflow-hidden">
        <div className="particles">{particles}</div>

        <div className="max-w-6xl mx-auto px-4 py-8 fade-in-up z-10">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-6xl font-black neon-text mb-4">
              Choose Your Alliance
            </h1>
            <p className="text-xl text-gray-300 mb-8">
              Pick your blockchain team and fight for supremacy! This choice is
              permanent.
            </p>
            <div className="flex justify-center mb-8">
              <ConnectButton />
            </div>
          </div>

          {!popKomodo.address ? (
            <div className="glass-card text-center max-w-md mx-auto">
              <div className="text-red-400 text-lg font-semibold">
                ⚠️ Contract Not Available
              </div>
              <p className="text-gray-300 mt-2">
                Set VITE_POPKOMODO_ADDRESS and reload to start playing.
              </p>
            </div>
          ) : (
            <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              {/* Ethereum Team */}
              <div className="glass-card text-center transform hover:scale-105 transition-all duration-300">
                <div className="text-6xl mb-4">⟠</div>
                <h3 className="text-2xl font-bold mb-2 text-blue-400">
                  Ethereum
                </h3>
                <p className="text-gray-300 mb-6 text-sm">
                  The pioneer of smart contracts and DeFi innovation. Join the
                  decentralized revolution!
                </p>
                <button
                  className="btn-ethereum w-full disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={!isConnected || isChoosing}
                  onClick={() => chooseTeam(0)}
                >
                  {isChoosing ? "Joining..." : "JOIN ETHEREUM"}
                </button>
              </div>

              {/* Bitcoin Team */}
              <div className="glass-card text-center transform hover:scale-105 transition-all duration-300">
                <div className="text-6xl mb-4">₿</div>
                <h3 className="text-2xl font-bold mb-2 text-orange-400">
                  Bitcoin
                </h3>
                <p className="text-gray-300 mb-6 text-sm">
                  The original cryptocurrency and digital gold. Be part of the
                  movement that started it all!
                </p>
                <button
                  className="btn-bitcoin w-full disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={!isConnected || isChoosing}
                  onClick={() => chooseTeam(1)}
                >
                  {isChoosing ? "Joining..." : "JOIN BITCOIN"}
                </button>
              </div>

              {/* Monad Team */}
              <div className="glass-card text-center transform hover:scale-105 transition-all duration-300">
                <div className="text-6xl mb-4">Μ</div>
                <h3 className="text-2xl font-bold mb-2 text-green-400">
                  Monad
                </h3>
                <p className="text-gray-300 mb-6 text-sm">
                  The high-performance blockchain of the future. Join the next
                  generation of Web3!
                </p>
                <button
                  className="btn-monad w-full disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={!isConnected || isChoosing}
                  onClick={() => chooseTeam(2)}
                >
                  {isChoosing ? "Joining..." : "JOIN MONAD"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Game Playing Screen
  if (gamePhase === "playing" && chosen) {
    const teamName = team === 0 ? "Ethereum" : team === 1 ? "Bitcoin" : "Monad";
    const teamColor =
      team === 0
        ? "text-blue-400"
        : team === 1
        ? "text-orange-400"
        : "text-green-400";

    return (
      <div className="min-h-screen animated-bg relative overflow-hidden">
        <div className="particles">{particles}</div>

        {/* Header */}
        <div className="relative z-10 p-4 md:p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl md:text-3xl font-black neon-text">
                POP KOMODO
              </h1>
              <div
                className={`text-sm md:text-base font-semibold ${teamColor}`}
              >
                Team {teamName}
              </div>
            </div>
            <ConnectButton />
          </div>

          {/* Leaderboard */}
          <div className="glass-card mb-8">
            <h2 className="text-xl font-bold mb-4 text-center">
              🏆 Live Leaderboard
            </h2>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="space-y-2">
                <div className="text-blue-400 font-semibold">⟠ Ethereum</div>
                <div className="score-counter text-blue-400">
                  {ethereumScore.toLocaleString()}
                </div>
              </div>
              <div className="space-y-2">
                <div className="text-orange-400 font-semibold">₿ Bitcoin</div>
                <div className="score-counter text-orange-400">
                  {bitcoinScore.toLocaleString()}
                </div>
              </div>
              <div className="space-y-2">
                <div className="text-green-400 font-semibold">Μ Monad</div>
                <div className="score-counter text-green-400">
                  {monadScore.toLocaleString()}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Game Area */}
        <div className="flex-1 flex flex-col items-center justify-center px-4 relative z-10">
          <div className="glass-card text-center max-w-md w-full mb-8">
            <h2 className="text-2xl font-bold mb-4">Pop for Victory!</h2>
            <p className="text-gray-300 mb-6">
              Tap the button to collect pops, then send them to boost your
              team's score!
            </p>

            {/* Pop Button */}
            <div className="relative mb-6">
              <button
                ref={popButtonRef}
                className="pop-button-image w-80 h-80 mx-auto relative disabled:opacity-50"
                disabled={!isConnected}
                onClick={registerClick}
                style={{
                  background: "none",
                  border: "none",
                  padding: 0,
                }}
              >
                <img
                  src={isPressed ? komodoActive : komodoIdle}
                  alt="Pop the Komodo!"
                  className="w-full h-full object-contain pointer-events-none select-none"
                  draggable={false}
                  style={{
                    filter: "drop-shadow(0 0 20px rgba(168, 85, 247, 0.6))",
                    transition: "all 0.1s ease",
                  }}
                />
                {/* Click effects */}
                {clickEffects.map((effect) => (
                  <div
                    key={effect.id}
                    className="click-effect"
                    style={{
                      left: effect.x,
                      top: effect.y,
                    }}
                  >
                    +1
                  </div>
                ))}
              </button>
            </div>

            {/* Stats */}
            <div className="space-y-4">
              <div className="text-2xl font-bold">
                💥 Pending Pops:{" "}
                <span className="neon-text">{localClicks}</span>
              </div>

              <button
                className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-500 hover:to-green-600 
                         text-white font-bold py-4 px-6 rounded-2xl transform transition-all duration-200 
                         hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed
                         shadow-[0_0_30px_rgba(34,197,94,0.3)] hover:shadow-[0_0_50px_rgba(34,197,94,0.6)]"
                disabled={
                  !isConnected || isPending || isSending || localClicks === 0
                }
                onClick={sendPops}
              >
                {isSending ? "🚀 Sending..." : `🎯 Send ${localClicks} Pops`}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}

export default App;
