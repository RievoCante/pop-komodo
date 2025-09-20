// tests for PopKomodo
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { network } from "hardhat";

describe("PopKomodo", async function () {
  const { viem } = await network.connect();
  const [account] = await viem.getWalletClients();

  it("allows choosing team once", async () => {
    const pop = await viem.deployContract("PopKomodo");

    await pop.write.chooseTeam([0]);
    const res = await pop.read.getTeam([account.account.address]);
    const [chosen, team] = res as unknown as readonly [boolean, number];
    assert.equal(chosen, true);
    assert.equal(team, 0);

    await assert.rejects(() => pop.write.chooseTeam([1]));
  });

  it("increments score on pop and requires team", async () => {
    const pop = await viem.deployContract("PopKomodo");

    await assert.rejects(() => pop.write.pop());
    await pop.write.chooseTeam([2]);
    await pop.write.pop();

    const scores = await pop.read.getScores();
    const monadScore = (
      scores as unknown as readonly [bigint, bigint, bigint]
    )[2];
    assert.equal(Number(monadScore), 1);

    const teamScore = await pop.read.getScore([2]);
    assert.equal(Number(teamScore as unknown as bigint), 1);
  });

  it("allows batched popBy within MAX_BURST and rejects zero", async () => {
    const pop = await viem.deployContract("PopKomodo");
    await pop.write.chooseTeam([0]);

    await assert.rejects(() => pop.write.popBy([0]));
    await pop.write.popBy([5]);
    const scores = await pop.read.getScores();
    const ethScore = (
      scores as unknown as readonly [bigint, bigint, bigint]
    )[0];
    assert.equal(Number(ethScore), 5);
  });
});
