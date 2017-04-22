'use strict'

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const GrupoSchema = Schema({
	self: String,
	name : String,
});

module.exports = mongoose.model('Grupo', GrupoSchema);
