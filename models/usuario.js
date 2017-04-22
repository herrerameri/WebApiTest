'use strict'

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UsuarioSchema = Schema({
	self: String,
	name : String,
	surname: String,
	alias: { type: String, required: true},
	age: Number,
	id: { type: Number, required: true},
	phone: Number,
	group:{
					type: mongoose.Schema.Types.ObjectId,
	        ref: 'Grupo'
			},
	photo: String,
});

module.exports = mongoose.model('Usuario', UsuarioSchema);
