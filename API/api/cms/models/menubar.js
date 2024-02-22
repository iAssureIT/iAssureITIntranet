const mongoose = require('mongoose');

const menubarSchema = mongoose.Schema({
	_id					: mongoose.Schema.Types.ObjectId,
    menubarName 		: String,
    menu  : [
        {
            _id					: mongoose.Schema.Types.ObjectId,
            menuLevel           : Number,
            menuRank 	        : Number,
            parentMenuItem      : String,
            menuItemName        : String,
            menuLink            : String,
        }
    ],
	
    createdBy   		: { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
    createdAt   		: Date,
    updateLog           : [{}, {}, {}],
});

module.exports = mongoose.model('menubar',menubarSchema);
