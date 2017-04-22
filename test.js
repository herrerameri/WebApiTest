var should = require('should');
var assert = require('assert');
var request = require('supertest');
var mongoose = require('mongoose');
var winston = require('winston');

describe('WebApiTest-DEDAM', function() {
  var url = 'http://localhost:3001';
  before(function(done) {
    done();
  });

  describe('Usuario', function()
  {
    it(' - no permitir grabar un usuario sin alias', function(done) {
      var user  = {
        name: 'meri',
        surname: 'herrera'
      };
    request(url)
	   .post('/rest/usuario')
	    .send(user)
      .expect(400)
  	  .end(function(err, res) {
            if (err) {
              throw err;
            }
            done();
          });
      });

    it(' - permitir grabar un usuario con nombre, alias y apellido', function(done){
        var user  = {
          name: 'meri',
          surname: 'herrera',
          alias: 'meritest10'
        };
  	request(url)
  		.post('/rest/usuario')
  		.send(user)
  		.expect('Content-Type', /json/)
  		.expect(201) //Status code
  		.end(function(err,res) {
  			if (err) {
  				throw err;
  			}
        res.body.usuario.name.should.equal(user.name);
        res.body.usuario.alias.should.equal(user.alias);
        res.body.usuario.surname.should.equal(user.surname);
  			done();
  		});
    });
    it(' - no permitir grabar un usuario con age no numérico', function(done) {
     var user  = {
       name: 'meri',
       age: 'dos',
       alias: 'agenonumerico',
       surname: 'herrera'
     };
   request(url)
	   .post('/rest/usuario')
	    .send(user)
     .expect(400)
 	   .end(function(err, res) {
           if (err) {
             throw err;
           }
           done();
         });
     });
     it(' - agregar un grupo', function(done) {
      var grupo  = {
        name: 'Superadmin'
      };
     request(url)
      .post('/rest/grupo')
       .send(grupo)
      .expect(201)
      .end(function(err, res) {
            if (err) {
              throw err;
            }
            done();
          });
      });
     it(' - no permitir colocar un grupo que no existe', function(done) {
     request(url)
 	    .put('/rest/usuario/1/group').expect('Content-Type', /json/)
 	    .send({ group: 'Cliente' })
      .expect(400)
   	  .end(function(err, res) {
             if (err) {
               throw err;
             }
             done();
           });
      });
   });
 });
