import { useMemo, useState } from "react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import {
  useAccount,
  usePublicClient,
  useReadContract,
  useWriteContract,
} from "wagmi";
import { popKomodo } from "./lib/contract";

function App() {
  const { address, isConnected } = useAccount();
  const { writeContractAsync, isPending } = useWriteContract();
  const publicClient = usePublicClient();
  const [isSending, setIsSending] = useState(false);
  const [isChoosing, setIsChoosing] = useState(false);
  const [localClicks, setLocalClicks] = useState(0);

  const getTeamArgs = useMemo(
    () => (address ? ([address] as const) : undefined),
    [address]
  );
  const teamQuery = useReadContract({
    address: popKomodo.address as `0x${string}` | undefined,
    // cast to readonly unknown[] to avoid any while keeping structural typing
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

  function registerClick() {
    setLocalClicks((v) => Math.min(v + 1, 200));
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

  return (
    <div className="min-h-screen w-full text-white bg-[#0b0b0b]">
      <div className="max-w-xl mx-auto p-4">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-semibold">Pop Komodo</h1>
          <ConnectButton />
        </div>

        {!popKomodo.address ? (
          <div className="text-sm text-red-400">
            Set VITE_POPKOMODO_ADDRESS and reload.
          </div>
        ) : (
          <div className="space-y-4">
            <div className="rounded border border-gray-700 p-4 space-y-3">
              <div className="text-sm text-gray-400">
                1) Choose team (one-time)
              </div>
              <div className="flex gap-2">
                <button
                  className="px-3 py-2 rounded bg-gray-800 disabled:opacity-50"
                  disabled={!isConnected || chosen || isChoosing}
                  onClick={() => chooseTeam(0)}
                >
                  Ethereum
                </button>
                <button
                  className="px-3 py-2 rounded bg-gray-800 disabled:opacity-50"
                  disabled={!isConnected || chosen || isChoosing}
                  onClick={() => chooseTeam(1)}
                >
                  Bitcoin
                </button>
                <button
                  className="px-3 py-2 rounded bg-gray-800 disabled:opacity-50"
                  disabled={!isConnected || chosen || isChoosing}
                  onClick={() => chooseTeam(2)}
                >
                  Monad
                </button>
              </div>
              {isConnected && (
                <div className="text-xs text-gray-400">
                  {isChoosing
                    ? "Waiting for confirmation..."
                    : chosen
                    ? `Your team: ${
                        team === 0
                          ? "Ethereum"
                          : team === 1
                          ? "Bitcoin"
                          : "Monad"
                      }`
                    : "No team yet."}
                </div>
              )}
            </div>

            <div className="rounded border border-gray-700 p-4 space-y-3">
              <div className="text-sm text-gray-400">2) Tap to build pops</div>
              <div className="flex items-center gap-3">
                <button
                  className="px-4 py-2 rounded bg-gray-800 disabled:opacity-50"
                  disabled={!isConnected || !chosen}
                  onClick={registerClick}
                >
                  Pop
                </button>
                <div className="text-sm text-gray-300">
                  Pending pops: {localClicks}
                </div>
                <button
                  className="px-4 py-2 rounded bg-indigo-600 disabled:opacity-50"
                  disabled={
                    !isConnected ||
                    !chosen ||
                    isPending ||
                    isSending ||
                    localClicks === 0
                  }
                  onClick={sendPops}
                >
                  {isSending ? "Sending…" : "Send Pops"}
                </button>
              </div>
            </div>

            <div className="rounded border border-gray-700 p-4">
              <div className="text-sm text-gray-400 mb-2">Leaderboard</div>
              <div className="space-y-1 text-sm">
                <div>
                  Ethereum:{" "}
                  {(scoresQuery.data as unknown as [bigint, bigint, bigint])
                    ? Number(
                        (
                          scoresQuery.data as unknown as [
                            bigint,
                            bigint,
                            bigint
                          ]
                        )[0]
                      )
                    : "-"}
                </div>
                <div>
                  Bitcoin:{" "}
                  {(scoresQuery.data as unknown as [bigint, bigint, bigint])
                    ? Number(
                        (
                          scoresQuery.data as unknown as [
                            bigint,
                            bigint,
                            bigint
                          ]
                        )[1]
                      )
                    : "-"}
                </div>
                <div>
                  Monad:{" "}
                  {(scoresQuery.data as unknown as [bigint, bigint, bigint])
                    ? Number(
                        (
                          scoresQuery.data as unknown as [
                            bigint,
                            bigint,
                            bigint
                          ]
                        )[2]
                      )
                    : "-"}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
