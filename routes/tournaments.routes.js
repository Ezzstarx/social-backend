const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const Event = require("../models/Event");
const TournamentBracket = require("../models/TournamentBracket");
const TournamentMatch = require("../models/TournamentMatch");
const User = require("../models/User");
const requireAuth = require("../middleware/requireAuth");
const xpEngine = require("../services/xpEngine");
const rewardEngine = require("../services/rewardEngine");

const shuffle = (array) => {
  let currentIndex = array.length, randomIndex;
  while (currentIndex !== 0) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex], array[currentIndex]];
  }
  return array;
};

// POST /api/events/:id/bracket/generate
router.post("/events/:id/bracket/generate", requireAuth, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ error: "Event not found" });

    // Enforce that only event host or admin can generate bracket
    if (event.createdBy !== req.user._id.toString() && req.user.role !== "admin") {
      return res.status(403).json({ error: "Only event host or admin can generate bracket" });
    }

    const checkedIn = event.participants.filter(p => p.status === "CHECKED_IN" || p.status === undefined);
    if (checkedIn.length < 2) {
      return res.status(400).json({ error: "Not enough participants checked in (minimum 2)" });
    }

    // Shuffle and construct round 1
    const list = shuffle([...checkedIn]);
    const r1Matches = [];
    for (let i = 0; i < list.length; i += 2) {
      const p1 = list[i];
      const p2 = list[i + 1] || null;
      r1Matches.push({
        matchId: new mongoose.Types.ObjectId().toString(),
        p1: p1 ? { userId: p1.userId, name: p1.name } : null,
        p2: p2 ? { userId: p2.userId, name: p2.name } : null,
        winnerId: p2 === null ? p1.userId : null,
        status: p2 === null ? "COMPLETED" : "PENDING",
      });
    }

    // Determine how many rounds are needed
    const roundsCount = Math.ceil(Math.log2(list.length));
    const rounds = [{ roundNumber: 1, matches: r1Matches }];

    // Pre-initialize empty slots for subsequent rounds
    let currentRoundMatchesCount = r1Matches.length;
    for (let r = 2; r <= roundsCount; r++) {
      currentRoundMatchesCount = Math.ceil(currentRoundMatchesCount / 2);
      const rMatches = [];
      for (let m = 0; m < currentRoundMatchesCount; m++) {
        rMatches.push({
          matchId: new mongoose.Types.ObjectId().toString(),
          p1: null,
          p2: null,
          winnerId: null,
          status: "PENDING",
        });
      }
      rounds.push({ roundNumber: r, matches: rMatches });
    }

    const bracket = await TournamentBracket.findOneAndUpdate(
      { eventId: event._id },
      { rounds },
      { upsert: true, new: true }
    );

    // Clear any old matches
    await TournamentMatch.deleteMany({ eventId: event._id });

    // Create TournamentMatch records for active Round 1 matches
    for (const m of r1Matches) {
      if (m.p1 && m.p2) {
        await TournamentMatch.create({
          bracketId: bracket._id,
          eventId: event._id,
          round: 1,
          participant1Id: m.p1.userId,
          participant2Id: m.p2.userId,
          status: "PENDING",
        });
      }
    }

    return res.status(201).json({ success: true, bracket });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// GET /api/events/:id/bracket
router.get("/events/:id/bracket", async (req, res) => {
  try {
    const bracket = await TournamentBracket.findOne({ eventId: req.params.id });
    if (!bracket) return res.status(404).json({ error: "Bracket not generated yet" });
    return res.status(200).json({ success: true, bracket });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// POST /api/events/:id/matches/:matchId/result
router.post("/events/:id/matches/:matchId/result", requireAuth, async (req, res) => {
  try {
    const match = await TournamentMatch.findById(req.params.matchId);
    if (!match) return res.status(404).json({ error: "Match not found" });

    // Enforce participant authorization
    const isP1 = match.participant1Id?.toString() === req.user._id.toString();
    const isP2 = match.participant2Id?.toString() === req.user._id.toString();
    if (!isP1 && !isP2) {
      return res.status(403).json({ error: "Only match participants can submit results" });
    }

    match.result = req.body.result;
    await match.save();

    return res.status(200).json({ success: true, match });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// POST /api/events/:id/matches/:matchId/verify
router.post("/events/:id/matches/:matchId/verify", requireAuth, async (req, res) => {
  try {
    const { winnerId } = req.body;
    if (!winnerId) return res.status(400).json({ error: "Winner ID is required" });

    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ error: "Event not found" });

    // Validate permission
    if (event.createdBy !== req.user._id.toString() && req.user.role !== "admin") {
      return res.status(403).json({ error: "Only event hosts or admins can verify matches" });
    }

    const match = await TournamentMatch.findById(req.params.matchId);
    if (!match) return res.status(404).json({ error: "Match not found" });

    match.status = "COMPLETED";
    match.winnerId = winnerId;
    await match.save();

    // Load and update TournamentBracket state
    const bracket = await TournamentBracket.findOne({ eventId: event._id });
    if (bracket) {
      const roundIdx = match.round - 1;
      const roundMatches = bracket.rounds[roundIdx].matches;
      const matchIdx = roundMatches.findIndex(m =>
        (m.p1?.userId?.toString() === match.participant1Id?.toString() &&
         m.p2?.userId?.toString() === match.participant2Id?.toString()) ||
        (m.p1?.userId?.toString() === match.participant2Id?.toString() &&
         m.p2?.userId?.toString() === match.participant1Id?.toString())
      );

      if (matchIdx !== -1) {
        roundMatches[matchIdx].winnerId = winnerId;
        roundMatches[matchIdx].status = "COMPLETED";

        // Progress winner to next round if eligible
        const nextRoundIdx = match.round;
        if (nextRoundIdx < bracket.rounds.length) {
          const nextMatchIdx = Math.floor(matchIdx / 2);
          const nextMatch = bracket.rounds[nextRoundIdx].matches[nextMatchIdx];

          const pDetails = event.participants.find(p => p.userId === winnerId);
          const winnerObj = { userId: winnerId, name: pDetails?.name || "Winner" };

          if (matchIdx % 2 === 0) {
            nextMatch.p1 = winnerObj;
          } else {
            nextMatch.p2 = winnerObj;
          }

          // If both slots populated, auto-create match document
          if (nextMatch.p1 && nextMatch.p2) {
            await TournamentMatch.create({
              bracketId: bracket._id,
              eventId: event._id,
              round: nextRoundIdx + 1,
              participant1Id: nextMatch.p1.userId,
              participant2Id: nextMatch.p2.userId,
              status: "PENDING",
            });
          }
        }
        bracket.markModified("rounds");
        await bracket.save();
      }
    }

    // Award match participants XP
    if (match.participant1Id) await xpEngine.awardXP(match.participant1Id, "TOURNAMENT_MATCH", match._id.toString());
    if (match.participant2Id) await xpEngine.awardXP(match.participant2Id, "TOURNAMENT_MATCH", match._id.toString());

    return res.status(200).json({ success: true, match });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// POST /api/events/:id/complete
router.post("/events/:id/complete", requireAuth, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ error: "Event not found" });

    if (event.createdBy !== req.user._id.toString() && req.user.role !== "admin") {
      return res.status(403).json({ error: "Only event hosts can complete events" });
    }

    event.status = "COMPLETED";

    // Determine placements
    const bracket = await TournamentBracket.findOne({ eventId: event._id });
    const placements = [];
    let winnerId = null;

    if (bracket && bracket.rounds.length > 0) {
      const finalRoundMatches = bracket.rounds[bracket.rounds.length - 1].matches;
      if (finalRoundMatches.length > 0 && finalRoundMatches[0].status === "COMPLETED") {
        winnerId = finalRoundMatches[0].winnerId;
        const finalMatch = finalRoundMatches[0];
        const runnerUpId = finalMatch.p1.userId === winnerId ? finalMatch.p2.userId : finalMatch.p1.userId;
        placements.push({ userId: winnerId, placement: 1 });
        placements.push({ userId: runnerUpId, placement: 2 });

        // Grab semi-final losers for shared 3rd
        if (bracket.rounds.length > 1) {
          const semiMatches = bracket.rounds[bracket.rounds.length - 2].matches;
          for (const m of semiMatches) {
            const loserId = m.p1.userId === m.winnerId ? m.p2.userId : m.p1.userId;
            placements.push({ userId: loserId, placement: 3 });
          }
        }
      }
    }

    let distributions = [];
    if (placements.length > 0) {
      distributions = await rewardEngine.processEventPrizeDistribution(event._id, placements);
      
      if (winnerId) {
        event.winner = {
          userId: winnerId,
          name: event.participants.find(p => p.userId === winnerId)?.name || "Winner",
        };
        await xpEngine.awardXP(winnerId, "TOURNAMENT_WIN", event._id.toString());
      }
    }

    await event.save();
    
    // Award Host XP
    const hostId = event.createdBy;
    if (mongoose.Types.ObjectId.isValid(hostId)) {
      await xpEngine.awardXP(hostId, "HOST_EVENT", event._id.toString());
    }

    return res.status(200).json({ success: true, event, distributions });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

module.exports = router;
