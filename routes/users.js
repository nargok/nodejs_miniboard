var express = require('express');
var router = express.Router();

var knex = require('knex')({
  dialect: 'sqlite3',
  connection: {
    filename: 'board_data.sqlite3'
  },
  useNullAsDefault: true
});

var Bookshelf = require('bookshelf')(knex);
var User = Bookshelf.Model.extend({
  tableName: 'users'
});

router.get('/add', function(req, res, next) {
  var data = {
    title: 'Users/Add',
    form: {name: '', password: '', comment: ''},
    content: '※登録する名前、パスワード、コメントを入力ください。'
  }
  res.render('users/add', data);
});

router.post('/add', (req, res, next) => {
  var request = req;
  var response = res;
  req.check('name', 'NAMEは必ず入力してください。').notEmpty();
  req.check('password', 'PASSWORDは必ず入力してください').notEmpty();
  req.getValidationResult().then((result) => {
    if (!result.isEmpty()) {
      var content = '<ul class="error">'
      var result_arr = result.array();
      for(var n in result_arr) {
        content += '<li>' + result_arr[n].msg + '</li>'
      }
      content += '</li>';
      var data = {
        title: 'Users/Add',
        content: content,
        form: req.body
      }
      response.render('users/add', data);
    } else {
      request.session.login = null;
      new User(req.body).save().then((model) => {
        response.redirect('/');
      });
    }
  });
});

router.get('/', (req, res, next) => {
  var data = {
    title: 'Users/Login',
    form: {name: '', password: ''},
    content: '名前とパスワードを入力ください'
  }
  res.render('users/login', data);
});

router.post('/', (req, res, next) => {
  var request = req;
  var response = res;
  req.check('name', 'NAMEは必ず入力してください').notEmpty();
  req.check('password', 'PASSWRODは必ず入力してください').notEmpty();
  req.getValidationResult().then((result) => {
    if (!result.isEmpty()) {
      var content = '<ul class="error">';
      var result_arr = result.array();
      for(var n in result_arr) {
        content += '<li>' + result_arr[n].msg + '</li>'
      }
      content += '</ul>'
      var data = {
        title: 'Users/Login',
        content: content,
        form: req.body
      }
      response.render('users/login', data);
    } else {
      var nm = req.body.name;
      var pw = req.body.password;
      User.query({where: {name: nm}, andWhere: {password: pw}})
        .fetcn()
        .then((model) => {
          if (model == null) {
            var data = {
              title: '再入力',
              content: '<p class="error">名前またはパスワードが違います</p>',
              form: req.body
            }
            response.render('users/login', data);
          } else {
            request.session.login = model.attributes;
            var data = {
              title: 'Users/Login',
              content: '<p>ログインしました！<br>トップページに戻ってメッセージを送信ください</p>',
              from: req.body
            };
            response.render('uses/login', data);
          }
        });
    }
  });
});

module.exports = router;
