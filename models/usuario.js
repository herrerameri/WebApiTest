'use strict'

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UsuarioSchema = Schema({
	self: String,
	name : String,
	surname: String,
	alias: { type: String, required: true},
	age: Number,
	id: Number,
	phone: Number,
	group:  {
		self: String,
		name: String
	},
	photo: String,
});

module.exports = mongoose.model('Usuario', UsuarioSchema);
