const AbuseFlag = require("../models/AbuseFlag");
const Wallet = require("../models/Wallet");
const WalletTransaction = require("../models/WalletTransaction");

const userViewFrequency = new Map();
const ipViewFrequency = new Map();
const deviceViewFrequency = new Map();
const commentFrequency = new Map();

function checkViewAbuse(viewerUserId, contentOwnerId, ipHash, deviceHash, contentType, contentId) {
  if (viewerUserId && contentOwnerId && viewerUserId.toString() === contentOwnerId.toString()) {
    return { isAbuse: true, reason: "Self-view abuse" };
  }

  const now = Date.now();

  if (viewerUserId) {
    const key = `${viewerUserId}:${contentType}:${contentId}`;
    let list = userViewFrequency.get(key) || [];
    list = list.filter((ts) => now - ts < 10 * 60 * 1000);
    if (list.length >= 3) {
      return { isAbuse: true, reason: "Refresh farming (more than 3 views in 10 minutes)" };
    }
    list.push(now);
    userViewFrequency.set(key, list);
  }

  if (ipHash) {
    let list = ipViewFrequency.get(ipHash) || [];
    list = list.filter((ts) => now - ts < 60 * 60 * 1000);
    if (list.length >= 10) {
      return { isAbuse: true, reason: "IP farming (more than 10 views in 1 hour)" };
    }
    list.push(now);
    ipViewFrequency.set(ipHash, list);
  }

  if (deviceHash) {
    let list = deviceViewFrequency.get(deviceHash) || [];
    list = list.filter((ts) => now - ts < 60 * 60 * 1000);
    if (list.length >= 10) {
      return { isAbuse: true, reason: "Device farming (more than 10 views in 1 hour)" };
    }
    list.push(now);
    deviceViewFrequency.set(deviceHash, list);
  }

  return { isAbuse: false };
}

function checkCommentAbuse(userId, body) {
  if (!body || body.trim().length < 5) {
    return { isAbuse: true, reason: "Comment too short (spam)" };
  }

  const now = Date.now();
  const key = userId.toString();
  let list = commentFrequency.get(key) || [];
  list = list.filter((ts) => now - ts < 60 * 1000);
  if (list.length >= 5) {
    return { isAbuse: true, reason: "Spam comment rate exceeded (more than 5 per minute)" };
  }
  list.push(now);
  commentFrequency.set(key, list);

  return { isAbuse: false };
}

async function flagSuspiciousReward(userId, type, referenceId, amount) {
  let wallet = await Wallet.findOne({ userId });
  if (!wallet) {
    wallet = await Wallet.create({ userId });
  }

  const tx = await WalletTransaction.create({
    walletId: wallet._id,
    userId,
    type,
    amount,
    direction: "CREDIT",
    status: "LOCKED",
    referenceId,
    referenceType: "AbuseFlag",
    note: `Locked due to potential abuse detection`,
  });

  const flag = await AbuseFlag.create({
    userId,
    flagType: type,
    referenceId: tx._id.toString(),
    referenceType: "WalletTransaction",
    status: "PENDING",
    adminNote: `Locked reward transaction of amount ${amount}`,
  });

  return flag._id;
}

module.exports = {
  checkViewAbuse,
  checkCommentAbuse,
  flagSuspiciousReward,
};
