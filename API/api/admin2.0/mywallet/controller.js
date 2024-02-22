const mongoose = require("mongoose");
var ObjectId = require('mongodb').ObjectID;
const User = require('../userManagementnew/ModelUsers.js');
const globalVariable = require("../../../nodemonConfig.js");
const Orders = require('../orders/model.js');
const Wallets = require('./model.js');


exports.getWallet = (req, res, next) => {
	const user_id = req.params.user_id;
	Wallets
		.findOne({ user_id: ObjectId(user_id) })
		.then(wallet => {
			if (wallet) {
				res.status(200).json({
					success: true,
					wallet: wallet
				})
				return
			}
			res.status(200).json({
				success: false,
				message: 'Wallet not found'
			})


		})
		.catch(err => res.status(500).json({
			success: false,
			message: err.message
		}))

}

exports.upsertWallet = (req, res, next) => {
	const { user_id } = req.body;

	Wallets
		.updateOne(
			{ user_id: ObjectId(user_id) },
			{
				_id: new new mongoose.Types.ObjectId(),
				createdAt: Date.now(),
				...req.body
			},
			{ upsert: true, new: true })
		.then(wallet => res.status(200).json({
			success: true,
			wallet: wallet

		}))
		.catch(err => res.status(500).json({
			success: false,
			message: err.message
		}))
}