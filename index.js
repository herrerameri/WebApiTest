'use strict'

const express = require('express');
const bodyparser = require('body-parser');
const mongoose = require('mongoose');
const app = express();
const port = process.env.PORT || 3001;
const Usuario = require('./models/usuario');

app.use(bodyparser.urlencoded({extended: false}));
app.use(bodyparser.json());

app.get('/rest/usuario', (req, res) => {
	Usuario.find({},  (err,usuarios) => {
		if(err)	return res.status(500).send({message: `Error al buscar los usuarios: ${err}`});
		if(usuarios.length == 0) return res.status(404).send({message: `Aún no hay usuarios en la BD.`});
		res.status(200).send({usuarios});
	});
});

app.get('/rest/usuario/:id', (req, res) => {
	let usuarioId = req.params.id;
	Usuario.find({id : usuarioId}, (err,usuario) => {
		if(err)	return res.status(500).send({message: `Error al buscar el usuario: ${err}`});
		if(usuario.length == 0) return res.status(404).send({message: `El usuario con id ${usuarioId} no existe`});
		res.status(200).send({usuario});
	});
});

app.post('/rest/usuario', (req, res) => {
	console.log('POST /rest/usuario');
	if(!req.body.name || !req.body.alias || !req.body.surname){
		return res.status(400).send({message: `Los campos nombre, apellido y alias son obligatorios`});
	}

	Usuario.find({ alias: req.body.alias }, (err, usuarioExistente) => {
		if(err)	return res.status(500).send({message: `Error al buscar el usuario: ${err}`});
		if(usuarioExistente.length > 0) return res.status(400).send({message: `Ya existe un usuario con ese alias`, usuarioExistente});
		var newId = 1;

		Usuario.findOne({}).sort({id: -1}).exec( function(err, userMaxId) {
				console.log(parseInt(userMaxId.id) + 1);
	     	newId = parseInt(userMaxId.id) + 1;

			 	let usuario = new Usuario();
		 		usuario.name = req.body.name;
		 		usuario.alias = req.body.alias;
		 		usuario.surname = req.body.surname;
		 		usuario.age = req.body.age;
		 		usuario.phone = req.body.phone;
		 		usuario.photo = req.body.photo;
		 		usuario.id = newId;
		 		usuario.self = '/rest/usuario/' + newId;
		 		console.log(usuario);

		 		usuario.save((err, usuarioCreado) => {
		 			if(err)	res.status(500).send({message: `Error al guardar el usuario: ${err}`});
		 			res.status(201).send({usuario: usuarioCreado});
		 		});
		 });
	});
});

app.put('/rest/usuario/:id', (req, res) => {
});

app.delete('/rest/usuario/:id', (req, res) => {
	let usuarioId = req.params.id;
	Usuario.find({id : usuarioId}, (err,usuario) => {
		if(err)	return res.status(500).send({message: `Error al buscar el usuario: ${err}`});
		console.log(usuario);
		if(usuario.length == 0) return res.status(404).send({message: `El usuario con id ${usuarioId} no existe`});
	}).remove((err) => {
		if(err) return res.status(500).send({message: `Error al eliminar el usuario: ${err}`});
	  return res.status(201).send({message: `El usuario se eliminó exitosamente`});
	});
});

app.get('/rest/grupo', (req, res) => {
});

mongoose.connect('mongodb://localhost:27017/usuarios', (err,res) => {
	if(err)	return console.log(`Error al conectar con la BD, detalles: ${err}.`);
	console.log('Conexión a BD establecida.');

	app.listen(port, () => {
		console.log(`API corriendo en http://localhost:${port}`);
	})
});
