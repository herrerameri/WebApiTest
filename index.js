'use strict'

const express = require('express');
const bodyparser = require('body-parser');
const mongoose = require('mongoose');
const app = express();
const port = process.env.PORT || 3001;
const Usuario = require('./models/usuario');
const Grupo = require('./models/grupo');

app.use(bodyparser.urlencoded({extended: false}));
app.use(bodyparser.json());

// REST/USUARIO
app.get('/rest/usuario', (req, res) => {
	Usuario.find({},  (err,usuarios) => {
		if(err)	return res.status(500).send({message: `Error al buscar los usuarios: ${err}`});
		if(usuarios.length == 0) return res.status(404).send({message: `Aún no hay usuarios en la BD`});
		res.status(200).send({usuarios});
	}).populate('group');
});

app.post('/rest/usuario', (req, res) => {
	console.log('POST /rest/usuario');
	if(!req.body.name || !req.body.alias || !req.body.surname){
		return res.status(400).send({message: `Los campos name, surname y alias son obligatorios`});
	}

	if(req.body.age != undefined && parseInt(Number(req.body.age)) != req.body.age){
		return res.status(400).send({message: `El campo age debe ser un número`});
	}

	Usuario.find({ alias: req.body.alias }, (err, usuarioExistente) => {
		if(err)	return res.status(500).send({message: `Error al buscar el usuario: ${err}`});
		if(usuarioExistente.length > 0) return res.status(400).send({message: `Ya existe un usuario con ese alias`, usuarioExistente});

		var nameGroup = req.body.group;
		if(nameGroup) {
			Grupo.find({ name: nameGroup }, (err, grupo) => {
				if(err)	return res.status(500).send({message: `Error al buscar el grupo: ${err}`});
				if(grupo.length == 0) return res.status(400).send({message: `No existe un grupo con el name ${nameGroup}` });
				return createUser(req.body, grupo[0], req, res);
			});
		}
		else {
			return createUser(req.body, null, req, res);
		}
	});
});

function createUser(datosUsuario, datosGrupo, req, res) {
	var newId = 1;
	var groupId = undefined;
	Usuario.findOne({}).sort({id: -1}).exec( function(err, userMaxId) {
		if(userMaxId) {
			newId = parseInt(userMaxId.id) + 1;
		}
		if(datosGrupo) {
			groupId = datosGrupo._id;
		}
		let usuario = new Usuario({
			name : datosUsuario.name,
			alias : datosUsuario.alias,
			surname : datosUsuario.surname,
			age : datosUsuario.age,
			phone : datosUsuario.phone,
			photo : datosUsuario.photo,
			id : newId,
			self : req.url  + newId,
			group : groupId
		});

		usuario.save((err, usuarioCreado) => {
			if(err)	res.status(500).send({message: `Error al guardar el usuario: ${err}`});
			res.status(201).send({usuario: usuarioCreado});
		});
 });
}

app.get('/rest/usuario/:id', (req, res) => {
	let usuarioId = req.params.id;
	Usuario.find({id : usuarioId}, (err,usuario) => {
		if(err)	return res.status(500).send({message: `Error al buscar el usuario: ${err}`});
		if(usuario.length == 0) return res.status(404).send({message: `El usuario con id ${usuarioId} no existe`});
		res.status(200).send({usuario});
	}).populate('group');
});

app.delete('/rest/usuario/:id', (req, res) => {
	let usuarioId = req.params.id;
	Usuario.remove({id : usuarioId}, (err,usuario) => {
		if(err)	return res.status(500).send({message: `Error al buscar el usuario: ${err}`});
		if(usuario.length == 0) return res.status(404).send({message: `El usuario con id ${usuarioId} no existe`});
	  return res.status(200).send({message: `El usuario se eliminó exitosamente`});
	});
});

app.get('/rest/usuario/:id/:property', (req, res) => {
		let usuarioId = req.params.id;
		let property = req.params.property;

		Usuario.find({ id: usuarioId }, (err, usuarios) => {
			if(err)	return res.status(500).send({message: `Error al buscar el usuario: ${err}`});
			if(usuarios.length == 0) return res.status(404).send({message: `El usuario con id ${usuarioId} no existe`});

			var usuario = usuarios[0];
			var propertyValue = usuario[`${property}`];
			if(propertyValue == undefined)
				return res.status(404).send({message: `La propiedad ${property} no existe para el usuario`});

			return res.status(200).send({ self: req.url, [`${property}`]: propertyValue });
		});
});

app.put('/rest/usuario/:id/:property', (req, res) => {
	let usuarioId = req.params.id;
	let property = req.params.property;
  let value = req.body[`${property}`];

	if(property == 'id')
	{
			return res.status(500).send({message: 'La propiedad id no se puede modificar'});
	}

	if(value == undefined){
		return res.status(400).send({message: `Debe definir en el body la misma propiedad que envía como parámetro en la URL y su valor (la key debe ser '${property}')`});
	}

	if(property == 'age' && value != undefined && parseInt(Number(value)) != value){
		return res.status(400).send({message: `El campo age debe ser un número`});
	}

	Usuario.find({ id: usuarioId }, (err, usuarios) => {
		if(err)	return res.status(500).send({message: `Error al buscar el usuario: ${err}`});
		if(usuarios.length == 0) return res.status(404).send({message: `El usuario con id ${usuarioId} no existe`});

		var usuario = usuarios[0];

		if(property == 'alias')	{
			Usuario.find({ alias: value, id: { $ne: usuarioId } }, (err, usuariosMismoAlias) => {
	 	 		if(err)	return res.status(500).send({message: `Error al buscar el usuario: ${err}`});
	 	 		if(usuariosMismoAlias.length > 0) return res.status(400).send({message: `Ya existe un usuario con ese alias`, usuariosMismoAlias});

				usuario[`${property}`] = value;
				usuario.save(function(err) {
					if(err) return res.status(500).send({message: `Error al actualizar la propiedad: ${err}`});
					return res.status(200).send({usuario});
				});
			});
		}
		else if(property == 'group') {
				Grupo.find({ name: value }, (err, grupo) => {
					if(err)	return res.status(500).send({message: `Error al buscar el grupo: ${err}`});
					if(grupo.length == 0) return res.status(400).send({message: `No existe un grupo con el name ${value}` });
					usuario[`${property}`] = grupo[0]._id;
					usuario.save(function(err) {
						if(err) return res.status(500).send({message: `Error al actualizar la propiedad: ${err}`});
						return res.status(200).send({usuario});
					});
				});
		}
		else {
			usuario[`${property}`] = value;
			usuario.save(function(err) {
				if(err) return res.status(500).send({message: `Error al actualizar la propiedad: ${err}`});
				return res.status(201).send({usuario});
			});
		}
	});
});

app.delete('/rest/usuario/:id/:property', (req, res) => {
	let usuarioId = req.params.id;
	let property = req.params.property;

	Usuario.find({ id: usuarioId }, (err, usuarios) => {
		if(err)	return res.status(500).send({message: `Error al buscar el usuario: ${err}`});
		if(usuarios.length == 0) return res.status(404).send({message: `El usuario con id ${usuarioId} no existe`});
		var usuario = usuarios[0];

		var propertyValue = usuario[`${property}`];
		if(propertyValue == undefined)
			return res.status(404).send({message: `La propiedad ${property} no existe para el usuario`});

		usuario[`${property}`] = undefined;
		usuario.save(function(err) {
			if(err) return res.status(500).send({message: `Error al eliminar la propiedad: ${err}`});
		 	res.status(201).send({ message: `Se ha eliminado la propiedad ${property}` });
		});
	});
});


// REST/GRUPO
app.get('/rest/grupo', (req, res) => {
	Grupo.find({},  (err,grupos) => {
		if(err)	return res.status(500).send({message: `Error al buscar los grupos: ${err}`});
		if(grupos.length == 0) return res.status(404).send({message: `Aún no hay grupos en la BD`});
		res.status(200).send({grupos});
	});
});

app.post('/rest/grupo', (req, res) => {
	console.log('POST /rest/grupo');
	if(!req.body.name){
		return res.status(400).send({message: `El campo nombre es obligatorio`});
	}

	Grupo.find({ name: req.body.name }, (err, grupoExistente) => {
		if(err)	return res.status(500).send({message: `Error al buscar el grupo: ${err}`});
		if(grupoExistente.length > 0) return res.status(400).send({message: `Ya existe un grupo con ese nombre`, grupoExistente});

	 	let grupo = new Grupo();
 		grupo.name = req.body.name;
 		grupo.self = req.url + req.body.name;
 		console.log(grupo);

 		grupo.save((err, grupoCreado) => {
 			if(err)	res.status(500).send({message: `Error al guardar el grupo: ${err}`});
 			res.status(201).send({grupo: grupoCreado});
 		});
	});
});

mongoose.connect('mongodb://'+process.env.MONGO_URL+':27017/usuarios', (err,res) => {
	if(err)	return console.log(`Error al conectar con la BD, detalles: ${err}.`);
	console.log('Conexión a BD establecida.');

	app.listen(port, () => {
		console.log(`API corriendo en http://localhost:${port}`);
	})
});
